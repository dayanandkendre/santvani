document.addEventListener("DOMContentLoaded", function () {
    const navContainer = document.querySelector(".nav-container");
    const navLinks = document.querySelector(".nav-links");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdown = document.querySelector(".dropdown");

    if (navContainer && navLinks) {
        // १. हॅम्बर्गर बटण आपोआप तयार होऊन नवबारमध्ये जोडले जाईल
        const hamburgerBtn = document.createElement("button");
        hamburgerBtn.className = "hamburger-toggle";
        hamburgerBtn.setAttribute("aria-label", "Toggle Menu");
        hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        
        navContainer.appendChild(hamburgerBtn);

        // २. हॅम्बर्गरवर क्लिक केल्यावर मेनू उघडणे / बंद होणे
        hamburgerBtn.addEventListener("click", function () {
            navLinks.classList.toggle("active");
            
            // Icon आयकॉन बदलणे (bars vs xmark)
            const icon = hamburgerBtn.querySelector("i");
            if (navLinks.classList.contains("active")) {
                icon.className = "fa-solid fa-xmark";
            } else {
                icon.className = "fa-solid fa-bars";
            }
        });

        // ३. मोबाईलवर 'इतर' ड्रॉपडाऊनवर क्लिक केल्यावर सब-मेनू उघडणे
        if (dropdownToggle && dropdown) {
            dropdownToggle.addEventListener("click", function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle("active");
                }
            });
        }
    }
});
