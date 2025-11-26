import { 
    getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

// ✅ Verificar rol antes de permitir acceso
document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol");

    if (rol !== "admin") {
        alert("Acceso denegado. Solo administradores.");
        window.location.href = "index.html";
        return;
    }

    cargarUsuarios();
});

// ✅ Agregar usuario con clave asignada manualmente
const agregarUsuario = async (usuario, nombre, clave, rol) => {
    try {
        const usuarioRef = doc(db, "usuarios", usuario);

        // Verificar si ya existe
        const existe = await getDoc(usuarioRef);
        if (existe.exists()) {
            alert("El usuario ya existe");
            return;
        }

        // Guardar usuario
        await setDoc(usuarioRef, {
            usuario,
            nombre,
            clave,
            rol
        });

        alert("✅ Usuario creado correctamente");

        // Limpiar campos
        document.getElementById("usuario").value = "";
        document.getElementById("nombre").value = "";
        document.getElementById("clave").value = "";
        document.getElementById("rol").value = "normal";

    } catch (error) {
        console.error("Error al agregar usuario:", error);
        alert("❌ Error al agregar usuario");
    }
};

// ✅ Cargar usuarios en tiempo real
const cargarUsuarios = () => {
    const usuariosRef = collection(db, "usuarios");

    onSnapshot(usuariosRef, (snapshot) => {
        const lista = document.getElementById("listaUsuarios");
        lista.innerHTML = "";

        snapshot.forEach(docu => {
            const data = docu.data();
            lista.innerHTML += `
                <tr>
                    <td>${data.usuario}</td>
                    <td>${data.nombre}</td>
                    <td>${data.rol}</td>
                    <td>
                        <button class="btnEliminar" data-user="${data.usuario}">
                            🗑 Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        // ✅ Activar botones eliminar
        document.querySelectorAll(".btnEliminar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                eliminarUsuario(e.target.dataset.user);
            });
        });
    });
};

// ✅ Eliminar usuario (solo admin)
const eliminarUsuario = async (usuario) => {
    if (!confirm("¿Eliminar este usuario?")) return;

    try {
        await deleteDoc(doc(db, "usuarios", usuario));
        alert("✅ Usuario eliminado");
    } catch (error) {
        console.error("Error eliminando usuario:", error);
        alert("❌ Error al eliminar usuario");
    }
};

// ✅ Botón agregar usuario
document.getElementById("btnAgregar").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const rol = document.getElementById("rol").value;

    if (!usuario || !nombre || !clave) {
        alert("Complete todos los campos");
        return;
    }

    await agregarUsuario(usuario, nombre, clave, rol);
});
