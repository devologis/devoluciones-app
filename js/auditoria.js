// auditoria.js JSONP Version
if (!localStorage.getItem("usuario")) {
    window.location.href = "index.html";
}
const usuarioActual = localStorage.getItem("usuario");

// URL del WebApp
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxFP6Hs6McxeihaVPL7uvT4ycmV37ejlqT3ImdM8RLqhcfqwfURhOPMTOvS2p8yL5SQ/exec";

// ===============================
// Helper JSONP
// ===============================
function jsonp(url) {
    return new Promise((resolve, reject) => {
        const callback = "cb_" + Math.random().toString(36).substring(2);
        url += (url.includes("?") ? "&" : "?") + "callback=" + callback;

        window[callback] = (data) => {
            resolve(data);
            delete window[callback];
            script.remove();
        };

        const script = document.createElement("script");
        script.src = url;
        script.onerror = () => {
            reject("Error al cargar JSONP");
            delete window[callback];
        };
        document.body.appendChild(script);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const facturaInput = document.getElementById("factura");
    const codigoInput = document.getElementById("codigo");
    const btnBuscar = document.getElementById("btnBuscar");
    const results = document.getElementById("results");

    addBackButton();

    btnBuscar.addEventListener("click", buscar);

    async function buscar() {
        const factura = facturaInput.value.trim();
        const codigo = codigoInput.value.trim();

        if (!factura) {
            alert("Ingrese número de factura.");
            return;
        }

        results.innerHTML = "<p class='small'>Buscando...</p>";

        const url = `${WEBAPP_URL}?action=get&factura=${encodeURIComponent(factura)}${
            codigo ? "&codigo=" + encodeURIComponent(codigo) : ""
        }`;

        try {
            const data = await jsonp(url);

            if (data.error) {
                results.innerHTML = `<div class="small">Error: ${escapeHtml(data.error)}</div>`;
                return;
            }

            const rows = data.rows || [];

            renderTable(rows);

        } catch (err) {
            results.innerHTML = `<div class="small">Error: ${escapeHtml(String(err))}</div>`;
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
            const rowIndex = r.rowNumber;

            html += `
            <tr data-row="${rowIndex}">
                <td>${rowIndex}</td>
                <td>${escapeHtml(r.factura)}</td>
                <td><input data-field="codigo" value="${escapeAttr(r.codigo)}"></td>
                <td><input data-field="lote" value="${escapeAttr(r.lote)}"></td>
                <td><input data-field="fecha_vto" value="${escapeAttr(r.fecha_vto)}" placeholder="YYYY-MM-DD"></td>
                <td><input data-field="buen_estado" type="number" value="${escapeAttr(r.buen_estado)}"></td>
                <td><input data-field="averias" type="number" value="${escapeAttr(r.averias)}"></td>
                <td><input data-field="total" type="number" value="${escapeAttr(r.total)}" disabled></td>
                <td>${escapeHtml(r.usuario)}</td>
                <td><button class="saveBtn" data-row="${rowIndex}">Guardar</button></td>
            </tr>`;
        });

        html += `</tbody></table>`;
        results.innerHTML = html;

        document.querySelectorAll('input[data-field="buen_estado"], input[data-field="averias"]').forEach(inp => {
            inp.addEventListener("input", recalcTotals);
        });

        document.querySelectorAll(".saveBtn").forEach(btn => {
            btn.addEventListener("click", onSaveRow);
        });
    }

    function recalcTotals() {
        const tr = this.closest("tr");
        const be = Number(tr.querySelector('input[data-field="buen_estado"]').value) || 0;
        const av = Number(tr.querySelector('input[data-field="averias"]').value) || 0;
        tr.querySelector('input[data-field="total"]').value = be + av;
    }

    async function onSaveRow(e) {
        const row = Number(e.currentTarget.dataset.row);
        const tr = document.querySelector(`tr[data-row="${row}"]`);

        const codigo = tr.querySelector('input[data-field="codigo"]').value.trim();
        const lote = tr.querySelector('input[data-field="lote"]').value.trim();
        let fecha_vto = tr.querySelector('input[data-field="fecha_vto"]').value.trim();
        const buen_estado = Number(tr.querySelector('input[data-field="buen_estado"]').value) || 0;
        const averias = Number(tr.querySelector('input[data-field="averias"]').value) || 0;
        const total = buen_estado + averias;

        if (!codigo || !lote || !fecha_vto) {
            alert("Complete código, lote y fecha de vencimiento.");
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_vto)) {
            alert("Formato fecha inválido (YYYY-MM-DD).");
            return;
        }

        // fecha mínima 3 meses
        const minDate = new Date();
        minDate.setMonth(minDate.getMonth() + 3);
        if (new Date(fecha_vto) < minDate) {
            alert("La fecha de vencimiento debe ser al menos 3 meses después de hoy.");
            return;
        }

        const url = `${WEBAPP_URL}?action=update&row=${row}` +
            `&codigo=${encodeURIComponent(codigo)}` +
            `&lote=${encodeURIComponent(lote)}` +
            `&fecha_vto=${encodeURIComponent(fecha_vto)}` +
            `&buen_estado=${buen_estado}` +
            `&averias=${averias}` +
            `&total=${total}` +
            `&usuario=${encodeURIComponent(usuarioActual)}`;

        const btn = e.currentTarget;
        const old = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Guardando...";

        try {
            const data = await jsonp(url);

            if (data.ok) {
                alert("Registro actualizado correctamente.");
            } else {
                alert("Error: " + JSON.stringify(data));
            }

        } catch (err) {
            alert("Error: " + err);
        } finally {
            btn.disabled = false;
            btn.textContent = old;
        }
    }

    function escapeHtml(s) {
        return String(s || "").replace(/[&<>"]/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
        })[c]);
    }

    function escapeAttr(s) {
        return escapeHtml(s || "");
    }

    function addBackButton() {
        const btn = document.createElement("button");
        btn.textContent = "⬅ Volver";
        btn.style.marginBottom = "15px";
        btn.style.background = "#444";
        btn.style.color = "white";
        btn.style.padding = "10px 14px";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });

        document.querySelector(".card").prepend(btn);
    }
});

