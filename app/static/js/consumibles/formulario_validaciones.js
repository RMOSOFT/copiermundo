/* ============================
   VALIDACIÓN DEL FORMULARIO
============================ */
function validarFormulario() {
    const nombre = document.querySelector('input[name="nombre"]').value.trim();
    const empresa = document.querySelector('input[name="empresa"]').value.trim();
    const telefono = document.querySelector('input[name="telefono"]').value.trim();
    const correo = document.querySelector('input[name="correo"]').value.trim();
    const consumible = document.querySelector('input[name="consumible"]').value.trim();
    const cantidad = document.querySelector('input[name="cantidad"]').value.trim();

    if (!nombre || !empresa || !telefono || !correo || !consumible || !cantidad) {
        mostrarToast("⚠ Debe completar todos los campos obligatorios.", "danger");
        return false;
    }
    return true;
}

/* ============================
   FUNCIÓN PARA ENVIAR SOLICITUD
============================ */
function enviarSolicitud(tipo) {
    const form = document.getElementById("solicitudForm");
    const data = Object.fromEntries(new FormData(form).entries());
    data.tipo_solicitud = tipo;

    fetch('/api/solicitar-consumible', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(json => {
        if (json.status === "ok") {
            mostrarToast("✅ Solicitud enviada correctamente.", "success");
            if (tipo !== "cotización") form.reset();
        } else {
            mostrarToast("❌ No se pudo procesar la solicitud.", "danger");
        }
    })
    .catch(err => {
        mostrarToast("❌ Error de conexión con el servidor.", "danger");
    });
}

/* ============================
   TOAST GENERAL
============================ */
function mostrarToast(mensaje, tipo = "success") {
    const toastEl = document.getElementById('toastNotificacion');
    const toastBody = document.getElementById('toastMensaje');

    toastBody.textContent = mensaje;

    toastEl.classList.remove("text-bg-success", "text-bg-danger");
    toastEl.classList.add(tipo === "success" ? "text-bg-success" : "text-bg-danger");

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

/* ============================
   BOTONERA (ENVIAR - COTIZAR - BORRAR)
============================ */
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("solicitudForm");
    const btnEnviar = document.getElementById("btnEnviar");
    const btnCotizar = document.getElementById("btnCotizar");
    const btnBorrar = document.getElementById("btnBorrar");

    /* ---------------------------
       BOTÓN ENVIAR (Solo backend)
    ---------------------------- */
    if (btnEnviar) {
        btnEnviar.addEventListener("click", (e) => {
            e.preventDefault();
            if (!validarFormulario()) return;

            enviarSolicitud("Solicitud").then(() => form.reset());
        });
    }

    /* -----------------------------------------
       BOTÓN COTIZAR (Backend + WhatsApp)
    ----------------------------------------- */
    if (btnCotizar) {
        btnCotizar.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!validarFormulario()) return;

            // 1️⃣ Enviar al servidor
            await enviarSolicitud("Cotización");

            // 2️⃣ Abrir WhatsApp
            const nombre = form.nombre.value.trim();
            const empresa = form.empresa.value.trim();
            const telefono = form.telefono.value.trim();
            const correo = form.correo.value.trim();
            const consumible = form.consumible.value.trim();
            const cantidad = form.cantidad.value.trim();
            const obs = form.observaciones.value.trim();

            const mensaje = 
`¡Hola Copier Mundo! 👋  
Quiero solicitar información sobre un consumible.

📄 *Datos del cliente*  
• Nombre: ${nombre}  
• Empresa: ${empresa}  
• Teléfono: ${telefono}  
• Correo: ${correo}

🛒 *Solicitud de consumible*  
• Consumible: ${consumible}  
• Cantidad: ${cantidad}

📌 Observaciones: ${obs || "Sin observaciones"}`;

            const url = "https://api.whatsapp.com/send?phone=51940414440&text=" + encodeURIComponent(mensaje);

            window.open(url, "_blank");
        });
    }

    /* ---------------------------
       BOTÓN BORRAR
    ---------------------------- */
    if (btnBorrar) {
        btnBorrar.addEventListener("click", () => {
            form.reset();
            mostrarToast("🧹 Formulario borrado.", "success");
        });
    }
});

