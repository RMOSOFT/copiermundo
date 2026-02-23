
function showDialog(title, msg) {
    const overlay = document.getElementById("dialogOverlay");
    document.getElementById("dialogTitle").textContent = title;
    document.getElementById("dialogMsg").textContent = msg;
    overlay.classList.remove("hidden");
}

(function initDialog(){
    const overlay = document.getElementById("dialogOverlay");
    const btn = document.getElementById("dialogBtn");
    if (!overlay || !btn) return;

    const close = () => overlay.classList.add("hidden");
    btn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
