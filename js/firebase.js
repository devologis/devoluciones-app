// ✅ Importar Firebase Modular (v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Configuración del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBcLa0rhe06_7MaY8wQC5ZZJRQ1Z5h5xA",
  authDomain: "inventariopda-b0d5b.firebaseapp.com",
  projectId: "inventariopda-b0d5b",
  storageBucket: "inventariopda-b0d5b.appspot.com",
  messagingSenderId: "464585970888",
  appId: "1:464585970888:web:f902eabdd8765648af905d"
};

// ✅ Inicializar Firebase
const app = initializeApp(firebaseConfig);

// ✅ Inicializar Firestore
const db = getFirestore(app);

// ✅ Crear admin inicial si no existe (usuario 1234 / clave 9999)
async function crearAdminInicial() {
  const adminRef = doc(db, "usuarios", "1234");
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    await setDoc(adminRef, {
      usuario: "1234",
      clave: "9999",
      nombre: "Administrador",
      rol: "admin",
      admin: true
    });
    console.log("✅ Usuario admin inicial creado");
  } else {
    console.log("✅ Admin inicial ya existe");
  }
}

// ✅ Ejecutar
crearAdminInicial();

// ✅ Exportar app y db para otros archivos
export { app, db };
