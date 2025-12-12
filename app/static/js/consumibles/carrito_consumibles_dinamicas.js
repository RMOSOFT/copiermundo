// Estado global
let cart = JSON.parse(localStorage.getItem("carrito")) || [];

// Utilidades
function saveCart() {
  localStorage.setItem("carrito", JSON.stringify(cart));
}

function showToast(msg, callback) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");

  // Ocultar después de 2 segundos
  setTimeout(() => {
    toast.classList.add("hidden");
    if (callback) callback();
  }, 2000);
}

function parsePrice(precioStr) {
  if (!precioStr) return 0;
  return parseFloat(precioStr.replace(/[^\d,\.]/g, '').replace(',', '.')) || 0;
}

// Lógica de carrito
function addToCartFromServer(p) {
  console.log("Agregando producto:", p);

  const product = {
    id: p.id || '',
    nombre: p.nombre || p.titulo || '',
    precio: parsePrice(p.precio || ""),
    imagen: p.imagen || "",
    qty: 1
  };

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(product);
  }

  saveCart();
  renderCart();

  showToast(`🛒 ${product.nombre} agregado al carrito.`, () => {
    openSideCart();
  });
}

function renderCart() {
  const itemsContainer = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsContainer) return;

  itemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.precio * (item.qty || 1);
    total += subtotal;

    const div = document.createElement('div');
    div.className = "flex items-center space-x-4 border-b pb-2";
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="w-16 h-16 object-cover">
      <div class="flex-1">
        <p class="font-medium">${item.nombre}</p>
        <p class="text-sm text-gray-500">S/ ${item.precio.toFixed(2)}</p>
        <div class="flex items-center mt-1">
          <button onclick="updateQty(${index}, -1)" class="px-2 border">-</button>
          <span class="px-2">${item.qty}</span>
          <button onclick="updateQty(${index}, 1)" class="px-2 border">+</button>
        </div>
      </div>
      <p class="font-semibold">S/ ${subtotal.toFixed(2)}</p>
    `;
    itemsContainer.appendChild(div);
  });

  countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
  totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
}

function openSideCart() {
  const modal = document.getElementById("cartModal");
  if (modal) modal.style.transform = "translateX(0%)";
}

function closeSideCart() {
  const modal = document.getElementById("cartModal");
  console.log("CERRANDO CARRITO:", modal);
  if (modal) modal.style.transform = "translateX(100%)";
}

function openCheckout() {
  closeSideCart();
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeCheckout() {
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Envío de pedido
document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const data = {
    cliente: {
      nombre: formData.get("nombre"),
      correo: formData.get("correo"),
      telefono: formData.get("telefono"),
      empresa: formData.get("empresa"),
      direccion: formData.get("direccion"),
      notas: formData.get("notas"),
    },
    carrito: cart.map(item => ({
      id: String(item.id || ""),
      nombre: item.nombre || "",
      precio: item.precio || 0,
      imagen: item.imagen || "",
      qty: item.qty || 1
    }))
  };

  console.log("📦 Pedido a enviar:", data);

  try {
    const resp = await fetch("/api/enviar-pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (resp.ok) {
      const result = await resp.json();
      alert("✅ Pedido enviado correctamente");
      console.log("📥 Respuesta del servidor:", result);

      cart = [];
      renderCart();
      closeCheckout();
      localStorage.removeItem("carrito");
    } else {
      const errorText = await resp.text();
      console.error("❌ Error del servidor:", errorText);
      alert("❌ Error al enviar el pedido: " + errorText);
    }
  } catch (err) {
    console.error("❌ Error de conexión:", err);
    alert("❌ Error de conexión con el servidor");
  }
});