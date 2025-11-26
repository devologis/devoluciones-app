 ===============================
  SEGURIDAD SESIÓN Y TIEMPO INACTIVO
 ===============================

 Tiempo máximo (10 minutos = 600.000 ms)
const MAX_INACTIVIDAD = 10  60  1000;

 Guarda el último tiempo activo
function setUltimaActividad() {
    localStorage.setItem(ultimaActividad, Date.now());
}

 Verifica si la sesión expiró
function validarInactividad() {
    const ultima = parseInt(localStorage.getItem(ultimaActividad)  0);
    const ahora = Date.now();

    if (ahora - ultima  MAX_INACTIVIDAD) {
        cerrarSesion(Sesión cerrada por inactividad.);
    }
}

 Cerrar sesión seguro
function cerrarSesion(mensaje = Sesión finalizada.) {
    localStorage.removeItem(usuario);
    localStorage.removeItem(esAdmin);
    localStorage.removeItem(admin);
    localStorage.removeItem(usuario_admin);
    localStorage.removeItem(ultimaActividad);

    alert(mensaje);

    window.location.href = index.html;
}

 Detectar actividad del usuario
function activarListenersActividad() {
    const eventos = [click, keydown, mousemove, scroll, touchstart];
    eventos.forEach(e = document.addEventListener(e, setUltimaActividad));
}

 Validar si existe sesión activa al cargar PAGINAS PROTEGIDAS
export function validarSesionActiva() {
    const usuario = localStorage.getItem(usuario);

    if (!usuario) {
        cerrarSesion(Sesión no iniciada o inválida.);
        return;
    }

     Primera vez o ya existe tiempo previo
    setUltimaActividad();

     Revisar cada 20s si pasó el límite
    setInterval(validarInactividad, 20000);

    activarListenersActividad();
}

 Cierre manual botón Cerrar Sesión
export function logoutManual() {
    cerrarSesion(Has cerrado sesión correctamente.);
}
