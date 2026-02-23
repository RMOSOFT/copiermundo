
function updateCartBadges() {
  let count = 0;
  try {
    const cart = JSON.parse(localStorage.getItem("carrito") || "[]");
    count = cart.reduce((acc, item) => acc + (parseInt(item.qty || 1, 10)), 0);
  } catch(e){}

  const b = document.getElementById("cartBadgeHeader");
  if (!b) return;

  b.textContent = count;
  b.classList.toggle("d-none", count <= 0);
}

document.addEventListener("DOMContentLoaded", updateCartBadges);
window.addEventListener("storage", updateCartBadges);
document.addEventListener("cart:updated", updateCartBadges);