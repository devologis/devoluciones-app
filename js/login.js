import { app } from "./firebase.js";
import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore(app);

window.login = async function () {
    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();

    // Validar campos
    if (usuario === "" || clave === "") {
        alert("Ingrese usuario y clave.");
        return;
    }

    // Validar que el usuario sea numérico
    if (!/^\d+$/.test(usuario)) {
        alert("El usuario debe ser numérico.");
        return;
    }

    try {
        // Buscar usuario por ID
        const docRef = doc(db, "usuarios", usuario);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert("Usuario no encontrado.");
            return;
        }

        const data = docSnap.data();

        // Validar clave
        if (data.clave !== clave) {
            alert("Clave incorrecta.");
            return;
        }

        // Guardar sesión
        localStorage.setItem("usuario", usuario);
        localStorage.setItem("nombre", data.nombre || "");
        localStorage.setItem("rol", data.rol || "normal");

        // Redirigir por rol
        if (data.rol === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (err) {
        console.error(err);
        alert("Error al conectar con el servidor.");
    }
};
