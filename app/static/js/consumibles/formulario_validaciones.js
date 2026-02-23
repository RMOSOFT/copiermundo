/* ============================
   VALIDACIÓN DEL FORMULARIO
============================*/

function validarFormulario(form) {
  const nombre = form.elements["nombre"]?.value.trim();
  const empresa = form.elements["empresa"]?.value.trim();
  const telefono = form.elements["telefono"]?.value.trim();
  const correo = form.elements["correo"]?.value.trim();
  const consumible = form.elements["consumible"]?.value.trim();
  const cantidad = form.elements["cantidad"]?.value.trim();

  if (!nombre || !empresa || !telefono || !correo || !consumible || !cantidad) {
    mostrarToast("⚠ Debe completar todos los campos obligatorios.", "danger");
    return false;
  }
  return true;
}

/* ============================
   FUNCIÓN PARA ENVIAR SOLICITUD
============================*/
function enviarSolicitud(tipo, { resetForm = true } = {}) {
  const form = document.getElementById("solicitudForm");
  const data = Object.fromEntries(new FormData(form).entries());
  data.tipo_solicitud = tipo;

  return fetch("/api/solicitar-consumible", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(resp => resp.json())
  .then(json => {
    if (json.status === "ok") {
      mostrarToast("✅ Solicitud enviada correctamente.", "success");
      if (resetForm) form.reset();     // ✅ ahora sí
    } else {
      mostrarToast("❌ " + (json.mensaje || "No se pudo procesar la solicitud."), "danger");
    }
    return json;
  })
  .catch(err => {
    mostrarToast("❌ Error de conexión con el servidor.", "danger");
    throw err;
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
    ----------------------------*/
    if (btnEnviar) {
      btnEnviar.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!validarFormulario(form)) return;

        await enviarSolicitud("Solicitud", { resetForm: true }); // ✅ ya resetea aquí
      });
    }

    /* -----------------------------------------
       BOTÓN COTIZAR (Backend + WhatsApp)
    -----------------------------------------*/

    if (btnCotizar) {
      btnCotizar.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!validarFormulario(form)) return;

        // 1) enviar al backend sin borrar
        await enviarSolicitud("Cotización", { resetForm: false });

        // 2) leer datos (del form real)
        const nombre = form.elements["nombre"].value.trim();
        const empresa = form.elements["empresa"].value.trim();
        const telefono = form.elements["telefono"].value.trim();
        const correo = form.elements["correo"].value.trim();
        const consumible = form.elements["consumible"].value.trim();
        const cantidad = form.elements["cantidad"].value.trim();
        const obs = form.elements["observaciones"].value.trim();

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

        // ✅ borrar al final (como pediste)
        form.reset();
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


    // Funcion para que el carrito pueda validar la compra desde el formulario
    function getSelectedConsumibleCard() {
      return document.querySelector('.consumible-card[data-selected="true"]')
          || document.querySelector(".consumible-card.card-selected");
    }

    function getSelectedProductData() {
      const card = getSelectedConsumibleCard();
      if (!card) return null;

      // OJO: el nombre sale del h6 (como tú ya haces)
      const nombre = card.querySelector("h6")?.textContent?.trim() || "";

      // Precio: en tus cards se ve como “S/ 124.00”
      const precioTxt = card.querySelector(".precio")?.textContent?.trim() || "";
      const imagen = card.querySelector("img")?.getAttribute("src") || "";

      // ID estable
      const id = card.dataset.id || nombre;

      return { id, nombre, precio: precioTxt, imagen };
    }

    // Variable de iniciacion para el boton
    const btnComprar = document.getElementById("btnComprar");
    

    function addToCartFromForm() {
      // ✅ toma datos del form
      const consumible = form.consumible.value.trim();
      const cantidad = parseInt(form.cantidad.value || "1", 10);

      // ⚠️ aquí no tienes precio/imagen en el formulario.
      // Recomendación: al "Seleccionar" un producto, guardamos su info en window.selectedProduct
      const p = window.selectedProduct;

      // Si no se seleccionó una card, al menos mete algo básico
      const item = p ? {
        id: p.id || consumible,
        nombre: p.nombre || consumible,
        tipo: p.tipo || "",
        precio: Number(p.precio || 0),
        imagen: p.imagen || "",
        cantidad
      } : {
        id: consumible,
        nombre: consumible,
        tipo: "",
        precio: 0,
        imagen: "",
        cantidad
      };

      // ✅ carrito en localStorage
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const idx = cart.findIndex(x => x.id === item.id);
      if (idx >= 0) cart[idx].cantidad += item.cantidad;
      else cart.push(item);

      localStorage.setItem("cart", JSON.stringify(cart));

      mostrarToast("🛒 Agregado al carrito.", "success");
    }

    if (btnComprar) {
        btnComprar.addEventListener("click", (e) => {
          e.preventDefault();
          if (!validarFormulario()) return;

          const p = getSelectedProductData();
          if (!p) {
            showToast("⚠️ Primero selecciona un producto.", "warning");
            return;
          }

          addToCartFromServer({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            imagen: p.imagen
          });

          // cantidad del formulario -> qty del carrito
          const cantidad = parseInt(document.querySelector('[name="cantidad"]').value || "1", 10);
          if (cantidad > 1) {
            const cart = JSON.parse(localStorage.getItem("carrito") || "[]");
            const item = cart.find(x => x.id === p.id);
            if (item) item.qty = cantidad;
            localStorage.setItem("carrito", JSON.stringify(cart));
            renderCart();
          }

          openSideCart(); // abre el sidebar del carrito :contentReference[oaicite:0]{index=0}
        });
    }
});

