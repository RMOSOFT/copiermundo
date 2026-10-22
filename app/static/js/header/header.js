/* COPIER MUNDO | MENÚ RESPONSIVE Y DESPLEGABLES */
(() => {
  "use strict";
  const header = document.querySelector(".cm-pro-header");
  if (!header) return;

  const button = header.querySelector(".cm-pro-menu-toggle");
  const nav = header.querySelector("#cm-pro-navigation");
  const dropdowns = Array.from(header.querySelectorAll(".cm-pro-dropdown"));
  if (!button || !nav) return;

  const mobile = window.matchMedia("(max-width: 1180px)");
  const closeDropdowns = (except = null) => {
    dropdowns.forEach((item) => {
      if (item !== except) item.open = false;
    });
  };

  function setMenuOpen(open) {
    const expanded = !mobile.matches || open;
    nav.classList.toggle("cm-pro-is-collapsed", !expanded);
    button.setAttribute("aria-expanded", String(mobile.matches && expanded));
    button.setAttribute("aria-label", mobile.matches && expanded ? "Cerrar menú" : "Abrir menú");
  }

  function syncViewport() {
    closeDropdowns();
    setMenuOpen(false);
  }

  button.hidden = false;
  syncViewport();

  button.addEventListener("click", () => {
    const currentlyOpen = button.getAttribute("aria-expanded") === "true";
    setMenuOpen(!currentlyOpen);
    if (currentlyOpen) closeDropdowns();
  });

  if (mobile.addEventListener) mobile.addEventListener("change", syncViewport);
  else mobile.addListener(syncViewport); // navegadores antiguos

  dropdowns.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) closeDropdowns(item);
    });
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeDropdowns();
      if (mobile.matches) setMenuOpen(false);
    }
  });

  header.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const opened = dropdowns.find((item) => item.open);
    if (opened) {
      opened.open = false;
      opened.querySelector("summary")?.focus();
    } else if (mobile.matches) {
      setMenuOpen(false);
      button.focus();
    }
  });
})();
