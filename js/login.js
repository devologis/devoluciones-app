import { app } from "./js/firebase.js";
import { getFirestore, collection, query, where, getDocs }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore(app);

document.getElementById("btnLogin").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();

    if (!usuario || !clave) {
        alert("Por favor complete todos los campos");
        return;
    }

    try {
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("usuario", "==", usuario), where("clave", "==", clave));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("Usuario o clave incorrectos");
            return;
        }

        const data = snapshot.docs[0].data();

        // Guardar el rol
        localStorage.setItem("rol", data.rol);

        // Redirigir según rol
        if (data.rol === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error("Error en login:", error);
        alert("Hubo un problema al iniciar sesión");
    }
});
