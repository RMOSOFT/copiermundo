
// ===============================
// Productos vistos (GLOBAL PRO)
// ===============================
const MAX_VISTOS_DEFAULT = 5;

// ✅ Key dinámica por página (si no hay, usa global
function getStorageKeyVistos() {
  const el = document.getElementById("pageConfig");
  return el?.dataset?.vistosKey || document.body?.dataset?.vistosKey || "copiermundo_vistos_global";
}

// ✅ Puedes cambiar MAX por página si quieres:
// <body data-vistos-max="7">
function getMaxVistos() {
  const raw = document.body?.dataset?.vistosMax;
  const n = parseInt(raw || "", 10);
  return Number.isFinite(n) && n > 0 ? n : MAX_VISTOS_DEFAULT;
}

function obtenerVistos() {
  const key = getStorageKeyVistos();
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function guardarVistos(lista) {
  const key = getStorageKeyVistos();
  localStorage.setItem(key, JSON.stringify(lista));
}

// ✅ API pública: la usas desde tus botones
window.agregarProductoVisto = function(producto) {
  if (!producto || !producto.id) return;

  const max = getMaxVistos();
  const vistos = obtenerVistos();

  // quitar duplicado (para mover arriba)
  const sinDuplicado = vistos.filter(p => p.id !== producto.id);

  // normalizar rutas (si vienen sin /static por error)
  const normalizado = {
    id: producto.id,
    nombre: producto.nombre || "",
    descripcion: producto.descripcion || "",
    img: producto.img || "",
    precio: producto.precio || "",
    pdf: producto.pdf || ""
  };

  sinDuplicado.unshift(normalizado);

  const limitado = sinDuplicado.slice(0, max);
  guardarVistos(limitado);

  renderProductosVistos();
};

function renderProductosVistos() {
  const ul = document.getElementById("productosVistosList");
  if (!ul) return;

  const vistos = obtenerVistos();

  // ✅ Fallback: si no hay vistos, no reemplaza el HTML por defecto
  if (vistos.length === 0) return;

  ul.innerHTML = vistos.map(p => `
    <li class="flex gap-2">
      <img src="${escapeHtml(p.img)}"
           alt="${escapeHtml(p.nombre)}"
           class="w-12 h-12 object-contain"
           width="48" height="48"/>
      <div>
        <p class="leading-snug font-semibold text-gray-800 break-words">
          ${escapeHtml(p.nombre)}
        </p>
        <p class="text-blue-700 mt-1">${escapeHtml(p.precio)}</p>
      </div>
    </li>
  `).join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ Pinta al cargar si ya había historial
document.addEventListener("DOMContentLoaded", () => {
  renderProductosVistos();
});

// ✅ Limpieza por página (según key)
window.limpiarProductosVistos = function() {
  const key = getStorageKeyVistos();
  localStorage.removeItem(key);
  location.reload();
};