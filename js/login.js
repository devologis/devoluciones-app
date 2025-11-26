function login() {
  const usuario = document.getElementById("usuario").value.trim();
  const clave = document.getElementById("clave").value.trim();

  // Validar campos vacíos
  if (usuario === "" || clave === "") {
    alert("Ingrese usuario y clave.");
    return;
  }

  // Validar que el usuario sea numérico
  if (!/^\d+$/.test(usuario)) {
    alert("El usuario debe ser numérico.");
    return;
  }

  const db = firebase.firestore();

  // Buscar usuario en colección "usuarios"
  db.collection("usuarios")
    .doc(usuario)
    .get()
    .then(doc => {
      if (!doc.exists) {
        alert("Usuario no encontrado.");
        return;
      }

      const data = doc.data();

      // Validar clave
      if (data.clave !== clave) {
        alert("Clave incorrecta.");
        return;
      }

      // Guardar datos en localStorage
      localStorage.setItem("usuario", usuario);
      localStorage.setItem("nombre", data.nombre || "");
      localStorage.setItem("rol", data.rol || "normal");
      localStorage.setItem("admin", data.admin ? "true" : "false");

      // Redirigir
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      console.error(err);
      alert("Error al conectar con el servidor.");
    });
}
