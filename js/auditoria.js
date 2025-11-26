// auditoria.js
// Permite a usuarios con rol "auditor" buscar y corregir registros

import {
    db,
    auth,
    signOut,
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc
} from "./firebase.js";

// =============================
// BLOQUEAR SI NO ES AUDITOR
// =============================
auth.onAuthStateChanged(async user => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const q = query(collection(db, "usuarios"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
        alert("Usuario sin datos válidos.");
        window.location.href = "login.html";
        return;
    }

    const userData = snap.docs[0].data();

    if (!userData.auditor) {
        alert("Acceso restringido: solo para AUDITORES.");
        window.location.href = "dashboard.html";
        return;
    }
});

// =============================
// REFERENCIAS A ELEMENTOS
// =============================
const facturaInput = document.getElementById("factura");
const codigoInput = document.getElementById("codigo");

const cantBuena = document.getElementById("cantBuena");
const cantAveriada = document.getElementById("cantAveriada");

const btnBuscar = document.getElementById("btnBuscar");
const btnGuardar = document.getElementById("btnGuardar");

const resultadoDiv = document.getElementById("resultado");

let documentoId = null;

// =============================
// BUSCAR REGISTRO
// =============================
btnBuscar.addEventListener("click", async () => {
    const factura = facturaInput.value.trim();
    const codigo = codigoInput.value.trim();

    if (!factura || !codigo) {
        alert("Ingrese número de factura y código.");
        return;
    }

    const col = collection(db, "devoluciones");
    const q = query(
        col,
        where("factura", "==", factura),
        where("codigo", "==", codigo)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
        alert("No se encontró registro con esos datos.");
        resultadoDiv.style.display = "none";
        return;
    }

    const docSnap = snap.docs[0];
    const data = docSnap.data();

    documentoId = docSnap.id;

    // Mostrar datos
    cantBuena.value = data.cant_buen;
    cantAveriada.value = data.averias;

    resultadoDiv.style.display = "block";
});

// =============================
// GUARDAR CAMBIOS
// =============================
btnGuardar.addEventListener("click", async () => {
    if (!documentoId) {
        alert("Primero busque un registro.");
        return;
    }

    const nuevaBuena = Number(cantBuena.value);
    const nuevaAveriada = Number(cantAveriada.value);

    if (nuevaBuena < 0 || nuevaAveriada < 0) {
        alert("Las cantidades no pueden ser negativas.");
        return;
    }

    const ref = doc(db, "devoluciones", documentoId);

    await updateDoc(ref, {
        cant_buen: nuevaBuena,
        averias: nuevaAveriada,
        total: nuevaBuena + nuevaAveriada,
        modificado_por_auditor: new Date()
    });

    alert("Registro actualizado correctamente.");
});
