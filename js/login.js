window.login = async function () {
    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();

    // Validar campos
    if (usuario === "" || clave === "") {
        alert("Ingrese usuario y clave.");
        return;
    }

    // Validar que el usuario sea numérico (se mantiene tu regla)
    if (!/^\d+$/.test(usuario)) {
        alert("El usuario debe ser numérico.");
        return;
    }

    try {
        const response = await fetch("/api/auth/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuario,
                password: clave
            })
        });

        const data = await response.json();

        if (!data.ok) {
            alert(data.error || "Credenciales inválidas.");
            return;
        }

        // Guardar sesión (equivalente a lo que hacías con Firebase)
        localStorage.setItem("usuario", data.usuario);
        localStorage.setItem("rol", data.rol);

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