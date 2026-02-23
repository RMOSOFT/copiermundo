let cart = JSON.parse(localStorage.getItem("carrito")) || [];

  function saveCart() {
    localStorage.setItem("carrito", JSON.stringify(cart));
  }

  // Renderizar carrito en carrito.html 🗑️
  function renderCarritoPage() {
    const container = document.getElementById("carritoPage");
    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartPageTotal");

    if (!container || !subtotalEl || !totalEl) return;

    if (cart.length === 0) {
      container.innerHTML = "<p class='text-gray-600'>Tu carrito está vacío 🛒</p>";
      subtotalEl.textContent = "S/ 0.00";
      totalEl.textContent = "S/ 0.00";
      return;
    }

    let total = 0;
    container.innerHTML = "";

    cart.forEach((item, index) => {
      const sub = item.precio * item.qty;
      total += sub;

      const div = document.createElement("div");
      div.className = "flex items-center gap-4 border rounded-xl bg-white p-4 mb-4 shadow-sm";

      div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="w-24 h-24 object-cover rounded mr-4">
        <div class="flex-1">
            <h3 class="font-medium">${item.nombre}</h3>
            <p class="text-sm text-gray-500">S/ ${item.precio.toFixed(2)}</p>
            <div class="flex items-center mt-2">
                <button onclick="updateQty(${index}, -1)" class="px-2 border">-</button>
                <span class="px-4">${item.qty}</span>
                <button onclick="updateQty(${index}, 1)" class="px-2 border">+</button>
            </div>
        </div>
        <div class="flex flex-col items-end">
            <p class="font-semibold">S/ ${sub.toFixed(2)}</p>
            <button onclick="removeItem(${index})" class="text-red-600 mt-2">
                <i class="fas fa-trash"></i>
            </button>
        </div>
      `;

      container.appendChild(div);
    });

    subtotalEl.textContent = `S/ ${total.toFixed(2)}`;
    totalEl.textContent = `S/ ${total.toFixed(2)}`;
  }

  function updateQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) removeItem(index);
    saveCart();
    renderCarritoPage();
  }

  function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCarritoPage();
  }

  // Extras: promo y nota
  function togglePromo() {
    document.getElementById("promoBox").classList.toggle("hidden");
  }

  function applyPromo() {
    const code = document.getElementById("promoInput").value.trim();
    if (!code) return alert("Ingrese un código promocional");
    alert("✅ Código aplicado: " + code);
  }

  function toggleNota() {
    document.getElementById("notaBox").classList.toggle("hidden");
  }

  function openCheckout() {
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

  document.addEventListener("DOMContentLoaded", renderCarritoPage);

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

    try {
      const resp = await fetch("/api/enviar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (resp.ok) {
        const result = await resp.json();
        alert("✅ Pedido enviado correctamente");

        // limpiar carrito
        cart = [];
        saveCart();
        renderCarritoPage();
        closeCheckout();
      } else {
        const errorText = await resp.text();
        alert("❌ Error al enviar pedido: " + errorText);
      }
    } catch (err) {
      console.error("❌ Error conexión:", err);
      alert("❌ No se pudo conectar con el servidor.");
    }
  });