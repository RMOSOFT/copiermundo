
/* ======================================================
   📌 FUNCIONES PARA CONSUMIBLES
   - Buscador de tabla
   - Buscador de cards
   - Seleccionar consumible (tabla + cards)
   - Rellenar formulario
   - Filtro de categorías (redirección)
====================================================== */

/* ------------------------------------------------------
   🔍 FILTRO BUSCADOR – TABLA
------------------------------------------------------ */
const buscadorTabla = document.getElementById('buscador');
if (buscadorTabla) {
    buscadorTabla.addEventListener('keyup', () => {
        const filtro = buscadorTabla.value.toLowerCase();
        document.querySelectorAll('#tablaConsumibles tr').forEach(fila => {
            fila.style.display = fila.textContent.toLowerCase().includes(filtro) ? '' : 'none';
        });
    });
}

/* ------------------------------------------------------
   ✏️ SELECCIONAR DESDE TABLA
------------------------------------------------------ */
document.querySelectorAll('#tablaConsumibles .seleccionar-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const fila = this.closest('tr');
        if (!fila) return;

        const nombre = fila.children[1].textContent.trim();
        rellenarFormulario(nombre);
    });
});

/* ------------------------------------------------------
   🔍 FILTRAR CARDS
------------------------------------------------------ */
const buscadorCards = document.getElementById('buscadorCards');
if (buscadorCards) {
    buscadorCards.addEventListener('keyup', () => {
        const filtro = buscadorCards.value.toLowerCase();
        document.querySelectorAll('#contenedorConsumibles .producto-item').forEach(card => {
            card.style.display = card.textContent.toLowerCase().includes(filtro) ? '' : 'none';
        });
    });
}

/* ------------------------------------------------------
   🟩 SELECCIONAR DESDE CARDS
------------------------------------------------------ */
document.querySelectorAll('#contenedorConsumibles .seleccionar-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const card = this.closest('.producto-item');
        const nombre = card.querySelector('h6').textContent.trim();
        rellenarFormulario(nombre);
    });
});

/* ------------------------------------------------------
   📝 FUNCIÓN PARA RELLENAR FORMULARIO
------------------------------------------------------ */
function rellenarFormulario(nombreConsumible) {
    const inputConsumible = document.querySelector('input[name="consumible"]');
    const inputCantidad = document.querySelector('input[name="cantidad"]');

    if (inputConsumible && inputCantidad) {
        inputConsumible.value = nombreConsumible;
        inputCantidad.focus();

        // ANIMACIÓN VISUAL
        inputConsumible.classList.add('border-success');
        setTimeout(() => inputConsumible.classList.remove('border-success'), 900);
    }
}

/* ------------------------------------------------------
   📂 FILTRO POR CATEGORÍA (REDIRECCIÓN)
------------------------------------------------------ */
const filtroCategoria = document.getElementById("filtroCategoria");

if (filtroCategoria) {
    filtroCategoria.addEventListener("change", function () {
        const categoria = this.value;

        if (categoria === "") {
            window.location.href = "/consumibles";
        } else {
            window.location.href = `/consumibles/${categoria}`;
        }
    });

    // Selección automática según URL
    const url = window.location.pathname;
    filtroCategoria.value =
        url.includes("tonercartuchocompatiblekonica") ? "tonercartuchocompatiblekonica" :
        url.includes("tonercartuchocompatiblekyocera") ? "tonercartuchocompatiblekyocera" :
        url.includes("recargacompatible") ? "recargacompatible" :
        url.includes("papelimpresion") ? "papelimpresion" : "";
}