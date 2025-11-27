// ===============================
// 🔐 VALIDAR SESIÓN
// ===============================
if (!localStorage.getItem("usuario")) {
    window.location.href = "index.html";
}

const usuarioActual = localStorage.getItem("usuario");

import { db } from "../js/firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ENTER PASA AL SIGUIENTE CAMPO
    // ===============================
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (inputs[index + 1]) inputs[index + 1].focus();
            }
        });
    });

    const facturaInput = document.getElementById("factura");
    const codigoInput = document.getElementById("codigo");
    const loteInput = document.getElementById("lote");
    const vencInput = document.getElementById("fecha_vto");
    const buenInput = document.getElementById("cant_buen");
    const averiasInput = document.getElementById("averias");
    const totalInput = document.getElementById("total");

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
    // VALIDAR FECHA MENSUAL (MM/YYYY)
    // ===============================
    vencInput.addEventListener("blur", () => {

        let texto = vencInput.value.trim();
        const regex = /^(\d{1,2})-(\d{4})$/;
        const match = texto.match(regex);

        if (!match) {
            alert("Formato inválido. Use: mes-año (ej: 10-2026)");
            vencInput.value = "";
            return;
        }

        let mes = parseInt(match[1]);
        let year = parseInt(match[2]);

        if (mes < 1 || mes > 12) {
            alert("Mes inválido. Debe ser entre 1 y 12.");
            vencInput.value = "";
            return;
        }

        // Último día del mes
        const lastDay = new Date(year, mes, 0);
        const dia = lastDay.getDate().toString().padStart(2, "0");

        // Validación 6 meses
        const hoy = new Date();
        const seisMesesDespues = new Date();
        seisMesesDespues.setMonth(hoy.getMonth() + 6);

        if (lastDay < seisMesesDespues) {
            alert("Vencimiento mínimo de 6 meses: NO CUMPLE.");
            vencInput.value = "";
            return;
        }

        const mesesInv = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        const mesAbrev = mesesInv[mes - 1];

        vencInput.value = `${dia}-${mesAbrev}-${year}`;
        vencInput.dataset.iso = `${year}-${String(mes).padStart(2, "0")}-${dia}`;
    });


    // ===============================
    // FUNCIÓN PARA GUARDAR UN CÓDIGO
    // ===============================
    async function guardarCodigo() {

        let factura = facturaInput.value.trim();
        let codigo  = codigoInput.value.trim();
        let lote    = loteInput.value.trim();
        let fecha_vto = vencInput.value.trim();
        let fecha_iso = vencInput.dataset.iso || "";
        let cant_buen = Number(buenInput.value);
        let averias = Number(averiasInput.value);
        let total = cant_buen + averias;

        if (!factura || !codigo || !lote || !fecha_vto) {
            alert("Complete todos los campos obligatorios.");
            return false;
        }

        await addDoc(collection(db, "devoluciones"), {
            factura,
            codigo,
            lote,
            fecha_vto,
            fecha_iso,
            cant_buen,
            averias,
            total,
            usuario_registra: usuarioActual,
            fecha_registro: new Date()
        });

        return true;
    }


    // ===============================
    // SIGUIENTE CÓDIGO
    // ===============================
    document.getElementById("btn_siguiente").addEventListener("click", async () => {

        let ok = await guardarCodigo();
        if (!ok) return;

        alert("Código guardado. Ingrese el siguiente.");

        // 🔒 Bloquear número de factura
        facturaInput.setAttribute("readonly", true);

        // Limpiar campos de código
        codigoInput.value = "";
        loteInput.value = "";
        vencInput.value = "";
        delete vencInput.dataset.iso;
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

        let cajas = prompt("Ingrese cantidad total de cajas del pedido:");

        if (!cajas || isNaN(cajas)) {
            alert("Debe ingresar un número válido.");
            return;
        }

        await addDoc(collection(db, "facturas"), {
            factura: facturaInput.value.trim(),
            cajas: Number(cajas),
            usuario_registra: usuarioActual,
            fecha_registro: new Date()
        });

        alert("Factura finalizada correctamente.");

        // Reset total
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
