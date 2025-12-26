
      document.addEventListener("DOMContentLoaded", () => {
        const card = document.getElementById("socialFloatCard");
        if (!card) return;

        const showAfter = 220; // px: cuando baje más de esto, aparece
        let lastScrollY = window.scrollY;
        let isShown = false;

        function showCard() {
          if (isShown) return;
          isShown = true;
          card.classList.remove("social-float-hidden");
          card.classList.add("social-float-show");

          // Entrada escalonada (pro): iconos aparecen uno por uno
          const icons = card.querySelectorAll(".social-icon");
          icons.forEach((icon, i) => {
            icon.style.opacity = "0";
            icon.style.transform = "translateX(-6px) scale(0.96)";
            icon.style.transition = "opacity .22s ease, transform .22s ease";
            setTimeout(() => {
              icon.style.opacity = "1";
              icon.style.transform = "translateX(0) scale(1)";
            }, 60 * i); // escalonado
          });
        }

        function hideCard() {
          if (!isShown) return;
          isShown = false;
          card.classList.remove("social-float-show");
          card.classList.add("social-float-hidden");
        }

        window.addEventListener("scroll", () => {
          const y = window.scrollY;
          const goingDown = y > lastScrollY;

          // ✅ Solo aparece si bajó un poco y está bajando
          if (y > showAfter && goingDown) showCard();

          // ✅ Se oculta si regresa cerca arriba
          if (y < 120) hideCard();

          lastScrollY = y;
        }, { passive: true });

        // Al cargar: si ya está abajo (por anchor/refresh), decide
        if (window.scrollY > showAfter) showCard();
      });
