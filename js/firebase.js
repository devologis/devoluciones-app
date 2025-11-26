// ✅ Configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBcLa0rhe06_7MaY8wQC5ZZJRQ1Z5h5xA",
  authDomain: "inventariopda-b0d5b.firebaseapp.com",
  projectId: "inventariopda-b0d5b",
  storageBucket: "inventariopda-b0d5b.appspot.com",
  messagingSenderId: "464585970888",
  appId: "1:464585970888:web:f902eabdd8765648af905d"
};

// ✅ Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Inicializar Firestore
const db = firebase.firestore();

// ✅ Crear admin inicial si no existe (usuario 1234 / clave 9999)
function crearAdminInicial() {
  const adminRef = db.collection("usuarios").doc("1234");

  adminRef.get().then((doc) => {
    if (!doc.exists) {
      adminRef.set({
        usuario: "1234",
        clave: "9999",
        nombre: "administrador",
        rol: "admin",
        admin: true
      }).then(() => {
        console.log("✅ Usuario admin inicial creado");
      });
    } else {
      console.log("✅ Admin inicial ya existe");
    }
  }).catch(err => {
    console.error("❌ Error creando admin:", err);
  });
}

// ✅ Ejecutar al cargar firebase.js
crearAdminInicial();
