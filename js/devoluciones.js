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
const WEBAPP_URL =
    "https://script.google.com/macros/s/AKfycbxFP6Hs6McxeihaVPL7uvT4ycmV37ejlqT3ImdM8RLqhcfqwfURhOPMTOvS2p8yL5SQ/exec";

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

    // ===============================
    // VALIDACIÓN FECHA MM/AAAA
    // ===============================
    vencInput.addEventListener("blur", () => {
        let valor = vencInput.value.trim();  // Ejemplo: 02/2026

        // Permite MM/AAAA o MM-AAAA
        const regex = /^([0][1-9]|1[0-2])[-/]([0-9]{4})$/;

        if (!regex.test(valor)) {
            alert("Formato inválido. Use MM/AAAA");
            vencInput.value = "";
            return;
        }

        // Extraer mes y año
        let [mes, año] = valor.split(/[-/]/).map(Number);

        // ===============================
        // OBTENER ÚLTIMO DÍA DEL MES
        // ===============================
        const ultimoDia = new Date(año, mes, 0).getDate();

        // Construir fecha final en formato completo
        const fechaCompleta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
        const fechaVenc = new Date(fechaCompleta);

        // ===============================
        // VALIDAR QUE FALTEN AL MENOS 3 MESES
        // ===============================
        const hoy = new Date();
        const fechaMinima = new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate());

        if (fechaVenc < fechaMinima) {
            alert("La fecha de vencimiento debe ser mínimo 3 meses superior a la fecha actual.");
            vencInput.value = "";
            return;
        }

        // Guardar fecha corregida YYYY-MM-DD
        vencInput.value = fechaCompleta;
    });

    // ===============================
    // ENTER PASA AL SIGUIENTE INPUT
    // ===============================
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();

                // Actualizar total si corresponde
                if (input === buenInput || input === averiasInput) {
                    actualizarTotal();
                }

                if (inputs[index + 1]) inputs[index + 1].focus();
            }
        });
    });

    // ===============================
    // CALCULAR TOTAL
    // ===============================
    function actualizarTotal() {
        let b = parseInt(buenInput.value) || 0;
        let a = parseInt(averiasInput.value) || 0;
        totalInput.value = b + a;
    }

    buenInput.addEventListener("input", actualizarTotal);
    averiasInput.addEventListener("input", actualizarTotal);

    // ===============================
    // GUARDAR CÓDIGO
    // ===============================
    async function guardarCodigo() {
        let factura = facturaInput.value.trim();
        let codigo = codigoInput.value.trim();
        let lote = loteInput.value.trim();
        let fecha_vto = vencInput.value.trim();
        let cant_buen = Number(buenInput.value);
        let averias = Number(averiasInput.value);

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
            total: cant_buen + averias,
            usuario: usuarioActual
        };

        try {
            const res = await fetch(WEBAPP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const texto = await res.text();

            return texto.includes("OK_CODIGO");
        } catch (err) {
            alert("Error de conexión.");
            return false;
        }
    }

    // ===============================
    // BOTÓN SIGUIENTE CÓDIGO
    // ===============================
    document.getElementById("btn_siguiente").addEventListener("click", async () => {
        let ok = await guardarCodigo();
        if (!ok) return;

        alert("Código guardado. Ingrese el siguiente.");

        facturaInput.setAttribute("readonly", true);

        codigoInput.value = "";
        loteInput.value = "";
        vencInput.value = "";
        buenInput.value = "";
        averiasInput.value = "";
        totalInput.value = "";

        codigoInput.focus();
    });

    // ===============================
    // FINALIZAR FACTURA
    // ===============================
    document.getElementById("btn_finalizar").addEventListener("click", async () => {
        let ok = await guardarCodigo();
        if (!ok) return;

        let cajas = prompt("Ingrese cantidad TOTAL de cajas del pedido:");

        if (!cajas || isNaN(cajas)) {
            alert("Debe ingresar un número válido.");
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
            return;
        }

        alert("Factura finalizada correctamente.");
        document.getElementById("formDev").reset();
        facturaInput.removeAttribute("readonly");
    });

    // ===============================
    // CERRAR SESIÓN
    // ===============================
    document.getElementById("btn_cerrar").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
});