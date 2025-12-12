// auditoria.js
if (!localStorage.getItem("usuario")) {
    window.location.href = "index.html";
}
const usuarioActual = localStorage.getItem("usuario");

// Pon aquí tu URL del WebApp (la que nos diste ya)
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxFP6Hs6McxeihaVPL7uvT4ycmV37ejlqT3ImdM8RLqhcfqwfURhOPMTOvS2p8yL5SQ/exec";

document.addEventListener("DOMContentLoaded", () => {
    const facturaInput = document.getElementById("factura");
    const codigoInput = document.getElementById("codigo");
    const btnBuscar = document.getElementById("btnBuscar");
    const results = document.getElementById("results");

    btnBuscar.addEventListener("click", buscar);

    async function buscar() {
        const factura = facturaInput.value.trim();
        const codigo = codigoInput.value.trim();

        if (!factura) {
            alert("Ingrese número de factura para buscar.");
            return;
        }

        results.innerHTML = "<p class='small'>Buscando...</p>";

        try {
            const url = new URL(WEBAPP_URL);
            url.searchParams.set("action", "get");
            url.searchParams.set("factura", factura);
            if (codigo) url.searchParams.set("codigo", codigo);

            const res = await fetch(url.toString(), { method: "GET" });
            const data = await res.json();

            if (data.error) {
                results.innerHTML = `<div class="small">Error: ${data.error}</div>`;
                return;
            }

            renderTable(data.rows || []);
        } catch (err) {
            results.innerHTML = `<div class="small">Error de conexión: ${err}</div>`;
        }
    }

    function renderTable(rows) {
        if (!rows.length) {
            results.innerHTML = "<div class='small'>No se encontraron registros.</div>";
            return;
        }

        let html = `<table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Factura</th>
                    <th>Código</th>
                    <th>Lote</th>
                    <th>Fecha Vto</th>
                    <th>Buen Estado</th>
                    <th>Averías</th>
                    <th>Total</th>
                    <th>Usuario</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>`;

        rows.forEach(r => {
            const rowNum = r.rowNumber;
            html += `<tr data-row="${rowNum}">
                <td>${rowNum}</td>
                <td>${escapeHtml(r.factura)}</td>
                <td><input data-field="codigo" value="${escapeAttr(r.codigo)}" /></td>
                <td><input data-field="lote" value="${escapeAttr(r.lote)}" /></td>
                <td><input data-field="fecha_vto" value="${escapeAttr(r.fecha_vto)}" placeholder="YYYY-MM-DD" /></td>
                <td><input data-field="buen_estado" type="number" value="${escapeAttr(r.buen_estado)}" /></td>
                <td><input data-field="averias" type="number" value="${escapeAttr(r.averias)}" /></td>
                <td><input data-field="total" type="number" value="${escapeAttr(r.total)}" /></td>
                <td>${escapeHtml(r.usuario || "")}</td>
                <td><button class="saveBtn" data-row="${rowNum}">Guardar</button></td>
            </tr>`;
        });

        html += `</tbody></table>`;
        results.innerHTML = html;

        // attach save handlers
        document.querySelectorAll(".saveBtn").forEach(btn => {
            btn.addEventListener("click", onSaveRow);
        });
    }

    // guarda fila editada
    async function onSaveRow(e) {
        const row = Number(e.currentTarget.dataset.row);
        const tr = document.querySelector(`tr[data-row="${row}"]`);
        if (!tr) return alert("Fila no encontrada.");

        const codigo = tr.querySelector('input[data-field="codigo"]').value.trim();
        const lote = tr.querySelector('input[data-field="lote"]').value.trim();
        let fecha_vto = tr.querySelector('input[data-field="fecha_vto"]').value.trim();
        const buen_estado = Number(tr.querySelector('input[data-field="buen_estado"]').value) || 0;
        const averias = Number(tr.querySelector('input[data-field="averias"]').value) || 0;
        const total = Number(tr.querySelector('input[data-field="total"]').value) || (buen_estado + averias);

        // validaciones: campos obligatorios
        if (!codigo || !lote || !fecha_vto) {
            alert("Completa código, lote y fecha de vencimiento (YYYY-MM-DD).");
            return;
        }

        // validar formato de fecha (aceptamos YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_vto)) {
            alert("Fecha inválida. Debe estar en formato YYYY-MM-DD.");
            return;
        }

        // Validación vencimiento mínimo 3 meses desde hoy
        const fechaV = new Date(fecha_vto);
        const hoy = new Date();
        const minimo = new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate());
        if (fechaV < minimo) {
            alert("La fecha de vencimiento debe ser al menos 3 meses superior a la fecha actual.");
            return;
        }

        // payload update
        const payload = {
            tipo: "update",
            row: row,
            codigo,
            lote,
            fecha_vto,
            buen_estado,
            averias,
            total,
            usuario: usuarioActual
        };

        // bloquear botón y dar feedback
        e.currentTarget.disabled = true;
        const oldText = e.currentTarget.innerText;
        e.currentTarget.innerText = "Guardando...";

        try {
            const res = await fetch(WEBAPP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const texto = await res.text();
            if (texto && texto.indexOf("OK_UPDATE") !== -1) {
                alert("Registro actualizado correctamente.");
            } else {
                alert("Error actualizando: " + texto);
            }
        } catch (err) {
            alert("Error de conexión: " + err);
        } finally {
            e.currentTarget.disabled = false;
            e.currentTarget.innerText = oldText;
        }
    }

    // small helpers
    function escapeHtml(s) {
        if (s === null || typeof s === "undefined") return "";
        return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
    }
    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, "&quot;");
    }
});
