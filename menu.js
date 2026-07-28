document.addEventListener("DOMContentLoaded", function () {
    const navContainer = document.querySelector(".nav-container");
    const navLinks = document.querySelector(".nav-links");

    if (navContainer && navLinks) {
        // १. मागील ब्लर पडदा (Overlay) तयार करणे
        let overlay = document.querySelector(".menu-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "menu-overlay";
            document.body.appendChild(overlay);
        }

        // २. हॅम्बर्गर बटण तयार करणे / शोधणे
        let hamburgerBtn = document.querySelector(".hamburger-toggle");
        if (!hamburgerBtn) {
            hamburgerBtn = document.createElement("button");
            hamburgerBtn.className = "hamburger-toggle";
            hamburgerBtn.setAttribute("aria-label", "Toggle Menu");
            hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            navContainer.appendChild(hamburgerBtn);
        }

        // ३. मुख्य मेनू उघडणे / बंद करणे (Toggle Menu)
        function toggleMenu() {
            hamburgerBtn.classList.toggle("active");
            navLinks.classList.toggle("active");
            overlay.classList.toggle("active");

            const icon = hamburgerBtn.querySelector("i");
            if (navLinks.classList.contains("active")) {
                icon.className = "fa-solid fa-xmark";
            } else {
                icon.className = "fa-solid fa-bars";
            }
        }

        hamburgerBtn.addEventListener("click", toggleMenu);
        overlay.addEventListener("click", toggleMenu);

        // ४. 'इतर' ड्रॉपडाऊन टोगल (Open / Close फिक्स)
        const dropdown = document.querySelector(".dropdown");
        const dropdownToggle = document.querySelector(".dropdown-toggle");

        if (dropdownToggle && dropdown) {
            dropdownToggle.addEventListener("click", function (e) {
                // मोबाईल व्ह्यूमध्ये लिंक भरकटू नये म्हणून
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();

                    // 'open' आणि 'active' दोन्ही क्लासेस एकाच वेळी टोगल करा
                    dropdown.classList.toggle("open");
                    dropdown.classList.toggle("active");
                }
            });
        }
    }
});
