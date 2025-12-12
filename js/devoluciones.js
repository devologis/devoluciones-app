// ===============================
// 🔐 VALIDAR SESIÓN
// ===============================
if (!localStorage.getItem("usuario")) {
    window.location.href = "index.html";
}

const usuarioActual = localStorage.getItem("usuario");

// ===============================
// URL DEL WEBAPP GOOGLE APPS SCRIPT
// ===============================
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxFP6Hs6McxeihaVPL7uvT4ycmV37ejlqT3ImdM8RLqhcfqwfURhOPMTOvS2p8yL5SQ/exec";

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // CAMPOS
    // ===============================
    const facturaInput = document.getElementById("factura");
    const codigoInput = document.getElementById("codigo");
    const loteInput = document.getElementById("lote");
    const vencInput = document.getElementById("fecha_vto");
    const buenInput = document.getElementById("cant_buen");
    const averiasInput = document.getElementById("averias");
    const totalInput = document.getElementById("total");

    const btnSiguiente = document.getElementById("btn_siguiente");
    const btnFinalizar = document.getElementById("btn_finalizar");

    // ===============================
    // VALIDACIÓN FECHA MM/AAAA
    // ===============================
    vencInput.addEventListener("blur", () => {
        let valor = vencInput.value.trim();
        const regex = /^([0-1][0-9])[-/]([0-9]{4})$/;

        if (!regex.test(valor)) {
            alert("Formato inválido. Use MM/AAAA");
            vencInput.value = "";
            return;
        }

        let [mes, año] = valor.split(/[-/]/).map(Number);

        // Último día del mes
        const ultimoDia = new Date(año, mes, 0).getDate();
        const fechaCompleta = `${año}-${String(mes).padStart(2, '0')}-${ultimoDia}`;
        const fechaVenc = new Date(fechaCompleta);

        // Validar +3 meses
        const hoy = new Date();
        const fechaMinima = new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate());

        if (fechaVenc < fechaMinima) {
            alert("La fecha de vencimiento debe ser al menos 3 meses superior.");
            vencInput.value = "";
            return;
        }

        vencInput.value = fechaCompleta;
    });

    // ===============================
    // ENTER → SIGUIENTE CAMPO
    // ===============================
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();

                if (input === buenInput || input === averiasInput) {
                    actualizarTotal();
                }

                if (inputs[index + 1]) inputs[index + 1].focus();
            }
        });
    });

    // ===============================
    // SUMA AUTOMÁTICA
    // ===============================
    function actualizarTotal() {
        let b = parseInt(buenInput.value) || 0;
        let a = parseInt(averiasInput.value) || 0;
        totalInput.value = b + a;
    }

    buenInput.addEventListener("input", actualizarTotal);
    averiasInput.addEventListener("input", actualizarTotal);

    // ===============================
    // GUARDAR UN CÓDIGO
    // ===============================
    async function guardarCodigo() {

        let factura = facturaInput.value.trim();
        let codigo = codigoInput.value.trim();
        let lote = loteInput.value.trim();
        let fecha_vto = vencInput.value.trim();
        let cant_buen = Number(buenInput.value);
        let averias = Number(averiasInput.value);
        let total = cant_buen + averias;

        if (!factura || !codigo || !lote || !fecha_vto) {
            alert("Complete todos los campos obligatorios.");
            return false;
        }

        const payload = {
            tipo: "codigo",
            factura,
            codigo,
            lote,
            fecha_vto,
            buen_estado: cant_buen,
            averias,
            total,
            usuario: usuarioActual
        };

        try {
            const res = await fetch(WEBAPP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const texto = await res.text();

            if (texto.includes("OK_CODIGO")) {
                return true;
            } else {
                alert("Error al guardar: " + texto);
                return false;
            }

        } catch (err) {
            alert("Error de conexión.");
            return false;
        }
    }

    // ===============================
    // SIGUIENTE CÓDIGO (con bloqueo)
    // ===============================
    btnSiguiente.addEventListener("click", async () => {

        btnSiguiente.disabled = true;
        btnSiguiente.innerText = "Guardando...";

        let ok = await guardarCodigo();

        if (!ok) {
            btnSiguiente.disabled = false;
            btnSiguiente.innerText = "Siguiente código";
            return;
        }

        alert("Código guardado. Ingrese el siguiente.");

        facturaInput.setAttribute("readonly", true);

        codigoInput.value = "";
        loteInput.value = "";
        vencInput.value = "";
        buenInput.value = "";
        averiasInput.value = "";
        totalInput.value = "";

        btnSiguiente.disabled = false;
        btnSiguiente.innerText = "Siguiente código";

        codigoInput.focus();
    });

    // ===============================
    // FINALIZAR FACTURA (permite finalizar sin más códigos)
    // ===============================
    btnFinalizar.addEventListener("click", async () => {

        btnFinalizar.disabled = true;
        btnFinalizar.innerText = "Guardando...";

        // Detectar si hay datos de un código pendientes
        const hayDatosPendientes =
            codigoInput.value.trim() ||
            loteInput.value.trim() ||
            vencInput.value.trim() ||
            buenInput.value.trim() ||
            averiasInput.value.trim();

        let ok = true;

        // Si hay datos → intenta guardar ese último código
        if (hayDatosPendientes) {
            ok = await guardarCodigo();
        }

        if (!ok) {
            btnFinalizar.disabled = false;
            btnFinalizar.innerText = "Finalizar factura";
            return;
        }

        let cajas = prompt("Ingrese cantidad TOTAL de cajas del pedido:");

        if (!cajas || isNaN(cajas)) {
            alert("Debe ingresar un número válido.");
            btnFinalizar.disabled = false;
            btnFinalizar.innerText = "Finalizar factura";
            return;
        }

        const payload = {
            tipo: "factura",
            factura: facturaInput.value.trim(),
            cajas: Number(cajas),
            usuario: usuarioActual
        };

        const res = await fetch(WEBAPP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        let texto = await res.text();

        if (!texto.includes("OK_FACTURA")) {
            alert("Error al guardar factura: " + texto);
        } else {
            alert("Factura finalizada correctamente.");
            document.getElementById("formDev").reset();
            facturaInput.removeAttribute("readonly");
        }

        btnFinalizar.disabled = false;
        btnFinalizar.innerText = "Finalizar factura";
    });

    // ===============================
    // CERRAR SESIÓN
    // ===============================
    document.getElementById("btn_cerrar").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

});