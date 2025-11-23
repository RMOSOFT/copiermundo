// =============================
// SELECCIÓN / DESELECCIÓN DEL PRODUCTO
// + efecto shake + toast profesional
// =============================

document.addEventListener("click", function (e) {
    const btn = e.target.closest(".seleccionar-btn");
    if (!btn) return;

    const card = btn.closest(".consumible-card");

    // Si ya está seleccionado → desmarcar
    if (btn.classList.contains("btn-selected")) {
        btn.classList.remove("btn-selected");
        btn.textContent = "Seleccionar";

        card.classList.remove("card-selected");
        return;
    }

    // Paso 1: desmarcar todos los botones seleccionados
    document.querySelectorAll(".seleccionar-btn.btn-selected").forEach(boton => {
        boton.classList.remove("btn-selected");
        boton.textContent = "Seleccionar";   // vuelve al estado original
    });

    document.querySelectorAll(".consumible-card.card-selected").forEach(c => {
        c.classList.remove("card-selected");
    });

    // MARCAR EL ACTUAL
    btn.classList.add("btn-selected");
    btn.innerHTML = `<i class="fas fa-check"></i> Seleccionado`;

    card.classList.add("card-selected");

    // EFECTO DE TEMBLOR
    card.classList.add("card-shake");
    setTimeout(() => card.classList.remove("card-shake"), 450);

    // MOSTRAR TOAST
    showToastSeleccion("Producto seleccionado correctamente");

    // ENVIAR AL FORMULARIO (si tu sistema ya lo hace, no duplicamos)
    const nombre = card.querySelector("h6").textContent;
    const input = document.getElementById("ConsumibleBuscado");
    if (input) input.value = nombre;

    
});

// ===============================
//  FUNCIÓN TOAST PROFESIONAL
// ===============================

function showToastSeleccion(msg) {
    const toast = document.getElementById("toastPro");
    toast.textContent = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}