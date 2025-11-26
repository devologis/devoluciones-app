<!-- Firebase App -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>

<!-- Firebase Database -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

<script>
  // ✅ Configuración de tu proyecto
  const firebaseConfig = {
    apiKey: "AIzaSyBCaLDorhe06_7mAy8wQC57ZJQR1Z5h5xA",
    authDomain: "inventariopda-b0d5b.firebaseapp.com",
    databaseURL: "https://inventariopda-b0d5b-default-rtdb.firebaseio.com",
    projectId: "inventariopda-b0d5b",
    storageBucket: "inventariopda-b0d5b.appspot.com",
    messagingSenderId: "464585978088",
    appId: "1:464585978088:web:f902eabdd8765648af995d"
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
</script>
