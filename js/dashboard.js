// ============================
//   SEGURIDAD Y SESIÓN
// ============================

// Tiempo máximo sin actividad: 10 minutos
const TIEMPO_MAX_INACTIVIDAD = 10 * 60 * 1000; // 10 minutos en ms
let temporizadorInactividad;

// Verifica si hay sesión activa
function validarSesion() {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
        alert("Sesión expirada o no iniciada.");
        cerrarSesion();
    }
}

// Cierra sesión correctamente
function cerrarSesion() {
    localStorage.clear();
    window.location.href = "index.html";
}

// Reinicia el temporizador cada vez que hay interacción
function reiniciarInactividad() {
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(() => {
        alert("Sesión cerrada por inactividad.");
        cerrarSesion();
    }, TIEMPO_MAX_INACTIVIDAD);
}

// Detectar actividad del usuario
["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evento => {
    document.addEventListener(evento, reiniciarInactividad);
});

// Acción del botón cerrar sesión
document.getElementById("btnCerrar").addEventListener("click", cerrarSesion);

// Al cargar la página:
validarSesion();
reiniciarInactividad();

import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const data = snap.data();

        // Mostrar botón solo si es auditor
        if (data.auditor === true) {
            document.getElementById("btnAuditoria").style.display = "block";
        }
    }
});
