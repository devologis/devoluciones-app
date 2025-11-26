// ===============================
//  IMPORTAR FIREBASE
// ===============================
import { db } from "./firebase.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ===============================
//   ELEMENTOS DEL HTML
// ===============================
const btnExcel = document.getElementById("btnDescargar");
const desdeInput = document.getElementById("desde");
const hastaInput = document.getElementById("hasta");

// ===============================
//   FUNCIÓN PRINCIPAL
// ===============================
btnExcel.addEventListener("click", async () => {

    const desde = desdeInput.value;
    const hasta = hastaInput.value;

    if (!desde || !hasta) {
        alert("Debe seleccionar ambas fechas.");
        return;
    }

    if (desde > hasta) {
        alert("La fecha DESDE no puede ser mayor que HASTA.");
        return;
    }

    try {
        // ===============================
        //   CONSULTAR FIRESTORE
        // ===============================
        const ref = collection(db, "devoluciones");

        const q = query(
            ref,
            where("fechaISO", ">=", desde),
            where("fechaISO", "<=", hasta),
            orderBy("fechaISO", "asc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("No hay registros dentro del rango seleccionado.");
            return;
        }

        // ===============================
        //  ARMAR LOS DATOS PARA EXCEL
        // ===============================
        const filas = [
            ["Factura", "Código", "Lote", "Vencimiento", "Buen Estado", "Averías", "Total", "Fecha Registro"]
        ];

        snapshot.forEach(doc => {
            const d = doc.data();
            filas.push([
                d.factura,
                d.codigo,
                d.lote,
                d.vencimiento,
                d.buen,
                d.averias,
                d.total,
                d.fechaISO
            ]);
        });

        // ===============================
        //  GENERAR EXCEL
        // ===============================
        generarExcel(filas);

    } catch (error) {
        console.error("Error generando reporte:", error);
        alert("Ocurrió un error generando el reporte.");
    }
});


// ===============================
//  FUNCIÓN PARA CREAR EXCEL
// ===============================
function generarExcel(filas) {

    // Crear hoja
    const hoja = XLSX.utils.aoa_to_sheet(filas);

    // Crear libro
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");

    // Descargar
    XLSX.writeFile(libro, "reporte_devoluciones.xlsx");

    alert("Archivo Excel generado con éxito.");
}
