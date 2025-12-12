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
            const url = new URL(WEBAPP_URL);
            url.searchParams.set("factura", factura);
            if (codigo) url.searchParams.set("codigo", codigo);

            const res = await fetch(url.toString());
            const data = await res.json();

            if (!Array.isArray(data)) {
                results.innerHTML = "<div class='small'>No se encontraron registros.</div>";
                return;
            }

            renderTable(data);
        } catch (err) {
            results.innerHTML = `<div class="small">Error: ${err}</div>`;
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
                    <th>Total Recibo</th>
                    <th>Usuario</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>`;

        rows.forEach(r => {
            html += `
            <tr data-row="${r.row}">
                <td>${r.row}</td>
                <td>${escapeHtml(r.factura)}</td>
                <td><input data-field="codigo" value="${escapeAttr(r.codigo)}"></td>
                <td><input data-field="lote" value="${escapeAttr(r.lote)}"></td>
                <td><input data-field="fecha_vto" value="${escapeAttr(r.fecha_vto)}" placeholder="YYYY-MM-DD"></td>
                <td><input data-field="buen_estado" type="number" value="${escapeAttr(r.buen_estado)}"></td>
                <td><input data-field="averias" type="number" value="${escapeAttr(r.averias)}"></td>
                <td><input data-field="total_recibo" type="number" value="${escapeAttr(r.total_recibo)}"></td>
                <td>${escapeHtml(r.usuario)}</td>
                <td><button class="saveBtn" data-row="${r.row}">Guardar</button></td>
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
            alert("Formato de fecha inválido (YYYY-MM-DD).");
            return;
        }

        const fechaV = new Date(fecha_vto);
        const hoy = new Date();
        const minimo = new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate());
        if (fechaV < minimo) {
            alert("Fecha de vencimiento debe ser mínimo 3 meses mayor a hoy.");
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
            const res = await fetch(WEBAPP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const resp = await res.text();

            if (resp.includes("OK_UPDATE")) {
                alert("Actualizado correctamente.");
            } else {
                alert("Error: " + resp);
            }
        } catch (err) {
            alert("Error de conexión: " + err);
        } finally {
            btn.disabled = false;
            btn.textContent = txt;
        }
    }

    function escapeHtml(s) {
        if (!s) return "";
        return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
    }

    function escapeAttr(s) {
        return escapeHtml(s || "").replace(/"/g, "&quot;");
    }
});
