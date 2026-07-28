document.addEventListener("DOMContentLoaded", function () {
    const navContainer = document.querySelector(".nav-container");
    const navLinks = document.querySelector(".nav-links");
    
    if (navContainer && navLinks) {
        // Overlay Element तयार करणे (ब्लर बॅकग्राउंडसाठी)
        const overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        document.body.appendChild(overlay);

        // Hamburger Button तयार करणे
        let hamburgerBtn = document.querySelector(".hamburger-toggle");
        if (!hamburgerBtn) {
            hamburgerBtn = document.createElement("button");
            hamburgerBtn.className = "hamburger-toggle";
            hamburgerBtn.setAttribute("aria-label", "Toggle Menu");
            hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            navContainer.appendChild(hamburgerBtn);
        }

        // Hamburger Toggle Function
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

        // 'इतर' Dropdown Toggle Fix
        const dropdown = document.querySelector(".dropdown");
        const dropdownToggle = document.querySelector(".dropdown-toggle");

        if (dropdownToggle && dropdown) {
            dropdownToggle.addEventListener("click", function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle("open");
                }
            });
        }
    }
});
