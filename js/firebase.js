// ✅ Configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBcLa0rhe06_7MaY8wQC5ZZJRQ1Z5h5xA",
  authDomain: "inventariopda-b0d5b.firebaseapp.com",
  databaseURL: "https://inventariopda-b0d5b-default-rtdb.firebaseio.com",
  projectId: "inventariopda-b0d5b",
  storageBucket: "inventariopda-b0d5b.appspot.com",
  messagingSenderId: "464585970888",
  appId: "1:464585970888:web:f902eabdd8765648af905d"
};

// ✅ Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Crear admin inicial si no existe
function crearAdminInicial() {
  const db = firebase.database();
  db.ref("usuarios/99999").once("value").then(snap => {
    if (!snap.exists()) {
      db.ref("usuarios/99999").set({
        nombre: "Administrador",
        clave: "admin123",
        rol: "admin"
      }).then(() => {
        console.log("✅ Usuario admin inicial creado");
      });
    } else {
      console.log("✅ Admin inicial ya existe");
    }
  });
}

// ✅ Ejecutar al cargar firebase.js
crearAdminInicial();
