import { getFirestore, collection, query, where, getDocs, addDoc, onSnapshot, deleteDoc, doc } 
    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

// Función para agregar un nuevo usuario
const agregarUsuario = async (usuario, nombre, clave, rol) => {
    try {
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("usuario", "==", usuario));

        // Verificar si ya existe el usuario
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            alert("El usuario ya existe");
            return;
        }

        await addDoc(usuariosRef, {
            usuario,
            nombre,
            clave,
            rol
        });

        alert("Usuario agregado correctamente");
    } catch (error) {
        console.error("Error al agregar el usuario: ", error);
        alert("Hubo un error al agregar el usuario.");
    }
};

// Escuchar cambios en la base de datos (usuarios en tiempo real)
const cargarUsuarios = async () => {
    const usuariosRef = collection(db, "usuarios");
    onSnapshot(usuariosRef, (snapshot) => {
        const listaUsuarios = document.getElementById("listaUsuarios");
        listaUsuarios.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            listaUsuarios.innerHTML += `
                <tr>
                    <td>${data.usuario}</td>
                    <td>${data.nombre}</td>
                    <td>${data.rol}</td>
                    <td>
                        <button onclick="eliminarUsuario('${doc.id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    });
};

// Función para eliminar un usuario
const eliminarUsuario = async (id) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
        try {
            await deleteDoc(doc(db, "usuarios", id));
            alert("Usuario eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar el usuario: ", error);
            alert("Hubo un error al eliminar el usuario.");
        }
    }
};

// Asignar eventos a los botones
document.getElementById("btnAgregar").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const rol = document.getElementById("rol").value;

    if (!usuario || !nombre || !clave) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    await agregarUsuario(usuario, nombre, clave, rol);
    cargarUsuarios();
});

// Cargar la lista de usuarios cuando la página se cargue
document.addEventListener("DOMContentLoaded", cargarUsuarios);
