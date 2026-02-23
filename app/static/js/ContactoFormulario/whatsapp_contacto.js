document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-presupuesto");
  const btn = document.getElementById("btnWhatsappContacto");
  if (!form || !btn) return; // ✅ solo en /contacto

  btn.addEventListener("click", () => {
    const fd = new FormData(form);

    const nombre = (fd.get("nombre") || "").toString().trim();
    const empresa = (fd.get("empresa") || "").toString().trim();
    const correo = (fd.get("correo") || "").toString().trim();
    const telefono = (fd.get("telefono") || "").toString().trim();
    const asunto = (fd.get("asunto") || "").toString().trim();
    const mensaje = (fd.get("mensaje") || "").toString().trim();

    // ✅ mensaje PRO para contacto/cotización
    const texto =
`¡Hola Copier Mundo! 👋
Quiero solicitar una cotización / información.

📄 *Datos del cliente*
• Nombre: ${nombre || "-"}
• Empresa: ${empresa || "-"}
• Teléfono: ${telefono || "-"}
• Correo: ${correo || "-"}

📝 *Asunto*
• ${asunto || "-"}

📌 *Mensaje*
${mensaje || "-"}

Gracias.`;

    const phone = "51940414440"; // ✅ tu WhatsApp empresa
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank");

    // ❌ NO reseteamos el formulario (así lo quieres)

    // ✅ borrar formulario también al WhatsApp (como pediste)
    form.reset();

    // ✅ opcional: marcar checkbox privacidad como desmarcado (reset ya lo hace)
  });
});