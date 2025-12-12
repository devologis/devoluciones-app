// auditoria.js 
if (!localStorage.getItem("usuario")) {
    window.location.href = "index.html";
}
const usuarioActual = localStorage.getItem("usuario");

// URL del WebApp
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
            alert("Ingrese número de factura.");
            return;
        }

        results.innerHTML = "<p class='small'>Buscando...</p>";

        try {
            // Construir URL con action=get para compatibilidad
            const url = new URL(WEBAPP_URL);
            url.searchParams.set("action", "get");    // <- importante si tu doGet lo exige
            url.searchParams.set("factura", factura);
            if (codigo) url.searchParams.set("codigo", codigo);

            console.log("Auditoría: llamando a URL:", url.toString());

            const res = await fetch(url.toString(), { method: "GET" });
            const text = await res.text();
            console.log("Auditoría: respuesta cruda:", text);

            // Intentar parsear JSON robustamente
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                // si no es JSON, mostrar error
                results.innerHTML = `<div class="small">Respuesta inválida del servidor (no JSON): ${escapeHtml(text)}</div>`;
                console.error("No JSON:", err);
                return;
            }

            // 3 formatos comunes que podrías recibir:
            // 1) un array directo: [ {row:..., factura:..., ...}, ... ]
            // 2) un objeto { ok:true, rows:[ ... ] }
            // 3) un objeto { error: "..." }
            let rows = [];
            if (Array.isArray(data)) {
                rows = data;
            } else if (data && Array.isArray(data.rows)) {
                rows = data.rows;
            } else if (data && data.error) {
                results.innerHTML = `<div class="small">Error del servidor: ${escapeHtml(data.error)}</div>`;
                return;
            } else {
                // no tuvimos nada reconocible
                results.innerHTML = `<div class="small">Respuesta inesperada del servidor: ${escapeHtml(JSON.stringify(data))}</div>`;
                return;
            }

            renderTable(rows);
        } catch (err) {
            results.innerHTML = `<div class="small">Error de conexión: ${escapeHtml(String(err))}</div>`;
            console.error(err);
        }
    }

    function renderTable(rows) {
        if (!rows || !rows.length) {
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
                    <th>Total Recibo</th>
                    <th>Usuario</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>`;

        rows.forEach(r => {
            // compatibilidad: algunos scripts usan "row" o "rowNumber"
            const rowIndex = r.row || r.rowNumber || r.rowIndex;
            html += `
            <tr data-row="${rowIndex}">
                <td>${rowIndex}</td>
                <td>${escapeHtml(r.factura)}</td>
                <td><input data-field="codigo" value="${escapeAttr(r.codigo)}"></td>
                <td><input data-field="lote" value="${escapeAttr(r.lote)}"></td>
                <td><input data-field="fecha_vto" value="${escapeAttr(r.fecha_vto)}" placeholder="YYYY-MM-DD"></td>
                <td><input data-field="buen_estado" type="number" value="${escapeAttr(r.buen_estado)}"></td>
                <td><input data-field="averias" type="number" value="${escapeAttr(r.averias)}"></td>
                <td><input data-field="total_recibo" type="number" value="${escapeAttr(r.total_recibo || r.total)}"></td>
                <td>${escapeHtml(r.usuario)}</td>
                <td><button class="saveBtn" data-row="${rowIndex}">Guardar</button></td>
            </tr>`;
        });

        html += `</tbody></table>`;
        results.innerHTML = html;

        document.querySelectorAll(".saveBtn").forEach(btn => {
            btn.addEventListener("click", onSaveRow);
        });
    }

    async function onSaveRow(e) {
        const row = Number(e.currentTarget.dataset.row);
        const tr = document.querySelector(`tr[data-row="${row}"]`);
        if (!tr) return alert("Fila no encontrada.");

        const codigo = tr.querySelector('input[data-field="codigo"]').value.trim();
        const lote = tr.querySelector('input[data-field="lote"]').value.trim();
        let fecha_vto = tr.querySelector('input[data-field="fecha_vto"]').value.trim();
        const buen_estado = Number(tr.querySelector('input[data-field="buen_estado"]').value) || 0;
        const averias = Number(tr.querySelector('input[data-field="averias"]').value) || 0;
        const total_recibo = Number(tr.querySelector('input[data-field="total_recibo"]').value) || (buen_estado + averias);

        if (!codigo || !lote || !fecha_vto) {
            alert("Completa código, lote y fecha de vencimiento.");
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_vto)) {
            alert("Formato fecha inválido (YYYY-MM-DD).");
            return;
        }

        const fechaV = new Date(fecha_vto);
        const hoy = new Date();
        const minimo = new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate());
        if (fechaV < minimo) {
            alert("Fecha de vencimiento debe ser al menos 3 meses mayor a hoy.");
            return;
        }

        const payload = {
            tipo: "update",
            row,
            codigo,
            lote,
            fecha_vto,
            buen_estado,
            averias,
            total_recibo,
            usuario: usuarioActual
        };

        const btn = e.currentTarget;
        const txt = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Guardando...";

        try {
            console.log("Auditoría: enviando payload update:", payload);
            const res = await fetch(WEBAPP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            console.log("Auditoría: respuesta update raw:", text);
            if (text && text.indexOf("OK_UPDATE") !== -1) {
                alert("Registro actualizado correctamente.");
            } else {
                alert("Error actualizando: " + text);
            }
        } catch (err) {
            alert("Error de conexión: " + err);
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.textContent = txt;
        }
    }

    function escapeHtml(s) {
        if (!s && s !== 0) return "";
        return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
    }

    function escapeAttr(s) {
        return escapeHtml(s || "").replace(/"/g, "&quot;");
    }
});
