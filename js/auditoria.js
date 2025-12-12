// auditoria.js
if (!localStorage.getItem("usuario")) {
  window.location.href = "index.html";
}
const usuarioActual = localStorage.getItem("usuario");

const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxFP6Hs6McxeihaVPL7uvT4ycmV37ejlqT3ImdM8RLqhcfqwfURhOPMTOvS2p8yL5SQ/exec";

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

      const totalCalc = Number(r.buen_estado) + Number(r.averias);

      div.innerHTML = `
        <label>Código</label>
        <input data-f="codigo" value="${r.codigo}">

        <label>Lote</label>
        <input data-f="lote" value="${r.lote}">

        <label>Fecha vencimiento</label>
        <input type="date" data-f="fecha_vto" value="${r.fecha_vto}">

        <label>Buen estado</label>
        <input type="number" data-f="buen_estado" value="${r.buen_estado}">

        <label>Averías</label>
        <input type="number" data-f="averias" value="${r.averias}">

        <label>Total recibido</label>
        <input data-f="total_recibo" value="${totalCalc}" disabled>

        <button>Guardar cambios</button>
      `;

      // recalcular total automáticamente
      const be = div.querySelector('[data-f="buen_estado"]');
      const av = div.querySelector('[data-f="averias"]');
      const totalInp = div.querySelector('[data-f="total_recibo"]');

      [be, av].forEach(i => {
        i.addEventListener("input", () => {
          totalInp.value =
            (Number(be.value) || 0) + (Number(av.value) || 0);
        });
      });

      // guardar
      div.querySelector("button").addEventListener("click", async () => {

        const payload = {
          tipo: "update",
          row: r.rowNumber,

          // 👇 NOMBRES IGUALES A LOS ENCABEZADOS
          codigo: div.querySelector('[data-f="codigo"]').value.trim(),
          lote: div.querySelector('[data-f="lote"]').value.trim(),
          fecha_vto: div.querySelector('[data-f="fecha_vto"]').value,
          buen_estado: Number(be.value) || 0,
          averias: Number(av.value) || 0,
          total_recibo: Number(totalInp.value) || 0,
          usuario: usuarioActual
        };

        const btn = div.querySelector("button");
        btn.disabled = true;
        btn.textContent = "Guardando...";

        const res = await fetch(WEBAPP_URL, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const text = await res.text();
        alert(text.includes("OK_UPDATE")
          ? "Registro actualizado correctamente"
          : text);

        btn.disabled = false;
        btn.textContent = "Guardar cambios";
      });

      results.appendChild(div);
    });
  }
});