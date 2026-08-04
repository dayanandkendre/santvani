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


// =========================================================
// 💬 GISCUS MINIMAL & PREMIUM COMMENTS SECTION
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
    
    var currentPath = window.location.pathname.toLowerCase();
    
    // १. मुख्य आणि पॉलिसी पेजेसवर कमेंट बॉक्स दाखवायचा नाही
    var isMainPage = currentPath.endsWith("/") || 
                     currentPath.endsWith("index.html") || 
                     currentPath.indexOf("privacy-policy") !== -1 || 
                     currentPath.indexOf("terms") !== -1 || 
                     currentPath.indexOf("disclaimer") !== -1 || 
                     currentPath.indexOf("contact") !== -1;

    if (isMainPage) {
        return;
    }

    // २. कस्टम प्रीमियम कंटेनर
    var commentsWrapper = document.createElement("div");
    commentsWrapper.id = "santvani-comments-block";
    commentsWrapper.style.cssText = "max-width: 800px; margin: 50px auto 30px auto; padding: 25px; background: #181818; border: 1px solid rgba(255, 183, 3, 0.3); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.6); font-family: 'Poppins', sans-serif;";

    commentsWrapper.innerHTML = `
        <h3 style="font-family: 'Rozha One', serif; font-size: 22px; color: #ffb703; margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-comments"></i> प्रतिक्रिया व अभिप्राय (Comments)
        </h3>
        <div class="giscus"></div>
    `;

    // ३. Footer च्या वर जोडणे
    var footer = document.querySelector("footer");
    if (footer) {
        footer.insertAdjacentElement('beforebegin', commentsWrapper);
    } else {
        document.body.appendChild(commentsWrapper);
    }

    // ४. Giscus डार्क थीम स्क्रिप्ट लोड करणे
    var script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "dayanandkendre/santvani"); // तुझा GitHub Username/Repo Name
    script.setAttribute("data-repo-id", "R_kgDO..."); // giscus.app वरून मिळणारा ID (किंवा सामान्यपणे चालतो)
    script.setAttribute("data-category", "General");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "dark_dimmed"); // परफेक्ट डार्क थीम
    script.setAttribute("data-lang", "mr"); // मराठी भाषा सपोर्ट
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    document.body.appendChild(script);
});
