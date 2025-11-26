import { firebaseConfig } from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();

    if (!usuario || !clave) {
        alert("Ingrese usuario y clave");
        return;
    }

    const docRef = doc(db, "usuarios", usuario);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("Usuario no existe");
        return;
    }

    const data = docSnap.data();

    if (data.clave !== clave) {
        alert("Clave incorrecta");
        return;
    }

    // Guardamos info en localStorage
    localStorage.setItem("usuarioID", usuario);
    localStorage.setItem("esAdmin", data.administrador ? "1" : "0");

    window.location.href = "dashboard.html";
}

document.getElementById("btnIngresar").addEventListener("click", login);
