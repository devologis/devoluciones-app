// auditoria.js
if (!localStorage.getItem("usuario")) {
  window.location.href = "index.html";
}
const usuarioActual = localStorage.getItem("usuario");

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
      alert("Ingrese número de factura");
      return;
    }

    results.innerHTML = "<p>Buscando...</p>";

    const url = new URL(WEBAPP_URL);
    url.searchParams.set("action", "get");
    url.searchParams.set("factura", factura);
    if (codigo) url.searchParams.set("codigo", codigo);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!data.rows || !data.rows.length) {
      results.innerHTML = "<p>No se encontraron registros.</p>";
      return;
    }

    renderCards(data.rows);
  }

  function renderCards(rows) {
    results.innerHTML = "";

    rows.forEach(r => {
      const div = document.createElement("div");
      div.className = "result-card";

      div.innerHTML = `
        <label>Código</label>
        <input value="${r.codigo}" data-f="codigo">

        <label>Lote</label>
        <input value="${r.lote}" data-f="lote">

        <label>Fecha vencimiento</label>
        <input type="date" value="${r.fecha_vto}" data-f="fecha_vto">

        <label>Buen estado</label>
        <input type="number" value="${r.buen_estado}" data-f="buen">

        <label>Averías</label>
        <input type="number" value="${r.averias}" data-f="averias">

        <label>Total recibido</label>
        <input class="total" value="${Number(r.buen_estado) + Number(r.averias)}" disabled>

        <button>Guardar cambios</button>
      `;

      const inputs = div.querySelectorAll("input[data-f='buen'], input[data-f='averias']");
      inputs.forEach(i => i.addEventListener("input", () => {
        const b = Number(div.querySelector("[data-f='buen']").value) || 0;
        const a = Number(div.querySelector("[data-f='averias']").value) || 0;
        div.querySelector(".total").value = b + a;
      }));

      div.querySelector("button").addEventListener("click", async () => {
        const payload = {
          tipo: "update",
          row: r.rowNumber,
          codigo: div.querySelector("[data-f='codigo']").value.trim(),
          lote: div.querySelector("[data-f='lote']").value.trim(),
          fecha_vto: div.querySelector("[data-f='fecha_vto']").value,
          buen_estado: Number(div.querySelector("[data-f='buen']").value) || 0,
          averias: Number(div.querySelector("[data-f='averias']").value) || 0,
          total: Number(div.querySelector(".total").value),
          usuario: usuarioActual
        };

        const res = await fetch(WEBAPP_URL, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const text = await res.text();
        alert(text.includes("OK_UPDATE") ? "Registro actualizado" : text);
      });

      results.appendChild(div);
    });
  }
});