
// ==========================================
//  SISTEMA PROFESIONAL: FICHA TÉCNICA DINÁMICA
//  Compatible con: Móviles, Tablets y Desktop
//  Entrada: Slide + Rebote + Blur
// ==========================================

document.addEventListener("click", async function (e) {
    const btn = e.target.closest(".ver-ficha-btn");
    if (!btn) return;

    // 1. Obtener datos del botón
    const categoria = btn.dataset.categoria;
    const archivo = btn.dataset.archivo;

    // 2. Construir ruta dinámica
    const rutaFicha = `/static/data/fichas_tecnicas/${categoria}/${archivo}`;

    console.log("📄 Cargando ficha técnica desde:", rutaFicha);

    // 3. Cargar JSON de la ficha técnica
    let ficha = await fetch(rutaFicha)
        .then(res => res.json())
        .catch(err => {
            console.error("❌ Error cargando ficha técnica:", err);
            return null;
        });

    if (!ficha) return;

    // 4. Título del modal
    document.getElementById("fichaTitulo").textContent =
        `Ficha Técnica - ${ficha.producto}`;

    // 5. Construcción del contenido
    let html = `
    <div class="ficha-slide-in">

        <div class="row">

            <!-- Imagen -->
            <div class="col-12 col-md-4 text-center ficha-img-box">
                <img src="${ficha.imagen}"
                     class="img-fluid ficha-img"
                     alt="${ficha.producto}">
            </div>

            <!-- Información principal -->
            <div class="col-12 col-md-8">

                <h3 class="ficha-title">${ficha.producto}</h3>

                <div class="ficha-info">
                    <p><strong>Marca:</strong> ${ficha.marca}</p>
                    <p><strong>Modelo:</strong> ${ficha.modelo}</p>
                    <p><strong>Categoría:</strong> ${ficha.categoria}</p>
                </div>

                <!-- PRECIO PREMIUM -->
                <div class="precio-badge">
                    <span class="precio-text">S/ ${ficha.precio || "0.00"}</span>
                </div>

                <!-- BOTÓN WHATSAPP -->
                <a href="https://wa.me/51940414440?text=Hola%20quiero%20cotizar%20${encodeURIComponent(ficha.producto)}"
                   target="_blank"
                   class="btn-wsp">
                   <i class="fab fa-whatsapp"></i> Cotizar por WhatsApp
                </a>

            </div>
        </div>

        <hr>

        <!-- DESCRIPCIÓN -->
        <h5 class="section-title">Descripción del Producto</h5>
        <p class="ficha-descripcion">${ficha.descripcion}</p>

        <hr>

        <!-- ESPECIFICACIONES -->
        <h5 class="section-title">Especificaciones Técnicas</h5>
        <ul class="ficha-list">
            ${Object.entries(ficha.especificaciones)
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `
                            <li>
                                <strong>${key}:</strong>
                                <ul class="sub-list">
                                    ${value.map(v => `<li>${v}</li>`).join("")}
                                </ul>
                            </li>
                        `;
                    }
                    return `<li><strong>${key}:</strong> ${value}</li>`;
                })
                .join("")}
        </ul>

    </div>
    `;

    // 6. Insertar contenido en el modal
    const contenedor = document.getElementById("fichaContenido");
    contenedor.innerHTML = html;

    // 7. Activar animación después de insertar
    setTimeout(() => {
        document.querySelector(".ficha-slide-in").classList.add("active");
    }, 20);

    // 8. Mostrar modal
    let modal = new bootstrap.Modal(document.getElementById("fichaTecnicaModal"));
    modal.show();
});