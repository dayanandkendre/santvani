document.addEventListener("DOMContentLoaded", function () {
    const navContainer = document.querySelector(".nav-container");
    const navLinks = document.querySelector(".nav-links");

    if (navContainer && navLinks) {
        // १. मागील ब्लर पडदा (Overlay)
        let overlay = document.querySelector(".menu-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "menu-overlay";
            document.body.appendChild(overlay);
        }

        // २. हॅम्बर्गर बटण तयार करणे
        let hamburgerBtn = document.querySelector(".hamburger-toggle");
        if (!hamburgerBtn) {
            hamburgerBtn = document.createElement("button");
            hamburgerBtn.className = "hamburger-toggle";
            hamburgerBtn.setAttribute("aria-label", "Toggle Menu");
            hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            navContainer.appendChild(hamburgerBtn);
        }

        // ३. मुख्य मेनू टोगल
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

        // ४. 'इतर' ड्रॉपडाऊन टोगल (Open/Close Fix)
        const dropdown = document.querySelector(".dropdown");
        const dropdownToggle = document.querySelector(".dropdown-toggle");

        if (dropdownToggle && dropdown) {
            dropdownToggle.addEventListener("click", function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle("open");
                    dropdown.classList.toggle("active");
                }
            });
        }

        // ५. मोबाईलसाठी Bottom Navigation Bar डायनामिकली जोडणे
        if (window.innerWidth <= 768) {
            const bottomNav = document.createElement("div");
            bottomNav.className = "bottom-nav-bar";
            bottomNav.innerHTML = `
                <a href="/index.html" class="bottom-nav-item">
                    <i class="fa-solid fa-house"></i>
                    <span>मुख्य पृष्ठ</span>
                </a>
                <a href="/sarth-haripath.html" class="bottom-nav-item">
                    <i class="fa-solid fa-book-open"></i>
                    <span>हरिपाठ</span>
                </a>
                <a href="/sant-sahitya.html" class="bottom-nav-item">
                    <i class="fa-solid fa-layer-group"></i>
                    <span>संत साहित्य</span>
                </a>
            `;
            document.body.appendChild(bottomNav);
        }
    }
});

