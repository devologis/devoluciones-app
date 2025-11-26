document.addEventListener("DOMContentLoaded", () => {

    // ===== ENTER PASA AL SIGUIENTE CAMPO =====
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (inputs[index + 1]) {
                    inputs[index + 1].focus();
                }
            }
        });
    });

    const buenInput = document.getElementById("cant_buen");
    const averiasInput = document.getElementById("averias");
    const totalInput = document.getElementById("total");
    const vencInput = document.getElementById("fecha_vto");

    // ===== SUMA AUTOMÁTICA =====
    function actualizarTotal() {
        let b = parseInt(buenInput.value) || 0;
        let a = parseInt(averiasInput.value) || 0;
        totalInput.value = b + a;
    }

    buenInput.addEventListener("input", actualizarTotal);
    averiasInput.addEventListener("input", actualizarTotal);

    // ===== VALIDAR FECHA MENSUAL (MM-YYYY) =====
    vencInput.addEventListener("blur", () => {

        let texto = vencInput.value.trim();

        // formatos aceptados: M-YYYY, MM-YYYY
        const regex = /^(\d{1,2})-(\d{4})$/;
        const match = texto.match(regex);

        if (!match) {
            alert("Formato inválido. Use: mes-año (ej: 10-2026)");
            vencInput.value = "";
            return;
        }

        let mes = parseInt(match[1]);
        let year = parseInt(match[2]);

        // validar mes entre 1 y 12
        if (mes < 1 || mes > 12) {
            alert("Mes inválido. Debe ser un número entre 1 y 12.");
            vencInput.value = "";
            return;
        }

        // último día del mes
        const lastDay = new Date(year, mes, 0);
        const dia = lastDay.getDate().toString().padStart(2, "0");

        // nombres de meses
        const mesesInv = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        const mesAbrev = mesesInv[mes - 1];

        // validar 6 meses mínimo
        const hoy = new Date();
        const seisMesesDespues = new Date();
        seisMesesDespues.setMonth(hoy.getMonth() + 6);

        if (lastDay < seisMesesDespues) {
            alert("Vencimiento mínimo de 6 meses: NO CUMPLE.");
            vencInput.value = "";
            return;
        }

        // convertir a formato DD-MMM-YYYY
        vencInput.value = `${dia}-${mesAbrev}-${year}`;

        // guardar fecha en ISO (para base de datos)
        vencInput.dataset.iso =
            `${year}-${String(mes).padStart(2, "0")}-${dia}`;
    });

});
