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

    // 🔙 Botón volver
    crearBotonVolver();

    btnBuscar.addEventListener("click", buscar);

    // =========================
    // BUSCAR
    // =========================
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

    // =========================
    // RENDER TABLA
    // =========================
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
            const fechaVto = (r.fecha_vto || "").substring(0, 10); // fecha limpia

            html += `<tr data-row="${rowNum}">
                <td>${rowNum}</td>
                <td>${escapeHtml(r.factura)}</td>

                <td><input data-field="codigo" value="${escapeAttr(r.codigo)}" /></td>
                <td><input data-field="lote" value="${escapeAttr(r.lote)}" /></td>

                <td>
                    <input data-field="fecha_vto" type="date" value="${escapeAttr(fechaVto)}" />
                </td>

                <td><input data-field="buen_estado" type="number" min="0" value="${r.buen_estado}" /></td>
                <td><input data-field="averias" type="number" min="0" value="${r.averias}" /></td>

                <td>
                    <input data-field="total" 
                           type="number" 
                           value="${Number(r.buen_estado) + Number(r.averias)}"
                           disabled
                           style="background:#eee;" />
                </td>

                <td>${escapeHtml(r.usuario || "")}</td>

                <td><button class="saveBtn" data-row="${rowNum}">Guardar</button></td>
            </tr>`;
        });

        html += `</tbody></table>`;
        results.innerHTML = html;

        // recalcular total automáticamente
        document.querySelectorAll(
            "input[data-field='buen_estado'], input[data-field='averias']"
        ).forEach(input => input.addEventListener("input", recalcularTotal));

        // botones guardar
        document.querySelectorAll(".saveBtn").forEach(btn => {
            btn.addEventListener("click", guardarFila);
        });
    }

    // =========================
    // RECALCULAR TOTAL
    // =========================
    function recalcularTotal(e) {
        const tr = e.target.closest("tr");
        const buen = Number(tr.querySelector("[data-field='buen_estado']").value) || 0;
        const ave = Number(tr.querySelector("[data-field='averias']").value) || 0;
        tr.querySelector("[data-field='total']").value = buen + ave;
    }

    // =========================
    // GUARDAR FILA
    // =========================
    async function guardarFila(e) {
        const btn = e.currentTarget;
        const row = Number(btn.dataset.row);
        const tr = btn.closest("tr");

        const codigo = tr.querySelector("[data-field='codigo']").value.trim();
        const lote = tr.querySelector("[data-field='lote']").value.trim();
        const fecha_vto = tr.querySelector("[data-field='fecha_vto']").value.trim();
        const buen_estado = Number(tr.querySelector("[data-field='buen_estado']").value) || 0;
        const averias = Number(tr.querySelector("[data-field='averias']").value) || 0;
        const total = buen_estado + averias;

        if (!codigo || !lote || !fecha_vto) {
            alert("Complete código, lote y fecha.");
            return;
        }

        // validar fecha
        const fechaV = new Date(fecha_vto);
        const min = new Date();
        min.setMonth(min.getMonth() + 3);

        if (fechaV < min) {
            alert("La fecha de vencimiento debe ser mínimo 3 meses mayor a hoy.");
            return;
        }

        const payload = {
            tipo: "update",
            row,
            codigo,     // texto
            lote,       // texto
            fecha_vto,
            buen_estado,
            averias,
            total,
            usuario: usuarioActual
        };

        btn.disabled = true;
        const old = btn.textContent;
        btn.textContent = "Guardando...";

        try {
            const res = await fetch(WEBAPP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const text = await res.text();

            if (text.includes("OK_UPDATE")) {
                alert("Registro actualizado correctamente.");
            } else {
                alert("Error al guardar: " + text);
            }
        } catch (err) {
            alert("Error de conexión: " + err);
        } finally {
            btn.disabled = false;
            btn.textContent = old;
        }
    }

    // =========================
    // BOTÓN VOLVER
    // =========================
    function crearBotonVolver() {
        const btn = document.createElement("button");
        btn.textContent = "⬅ Volver";
        btn.style.marginBottom = "15px";
        btn.style.background = "#444";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.padding = "10px 14px";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";

        btn.onclick = () => window.location.href = "dashboard.html";
        document.querySelector(".card").prepend(btn);
    }

    // =========================
    // HELPERS
    // =========================
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
});