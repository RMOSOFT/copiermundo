
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-presupuesto");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const resp = await fetch("/api/solicitar-presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await resp.json();

      if (result.status === "ok") {
        if (typeof showDialog === "function") {
          showDialog(
            "✅ Solicitud enviada",
            "Gracias por contactarnos. Un asesor de Copier Mundo te responderá en breve por correo o WhatsApp."
          );
        }
        form.reset();
      } else {
        if (typeof showDialog === "function") {
          showDialog("⚠️ No se pudo enviar", result.mensaje || "Intenta nuevamente en unos minutos.");
        }
      }
    } catch (err) {
      if (typeof showDialog === "function") {
        showDialog("❌ Error de conexión", "No se pudo conectar con el servidor. Revisa tu internet e inténtalo otra vez.");
      }
    }
  });
});
