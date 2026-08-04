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
// 💬 DISQUS AUTOMATIC COMMENTS INJECTION (Final Fix)
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
    
    var currentPath = window.location.pathname.toLowerCase();
    
    // १. मुख्य पेजेसवर कमेंट्स नकोत म्हणून फिल्टर
    var isMainPage = currentPath.endsWith("/") || 
                     currentPath.endsWith("index.html") || 
                     currentPath.indexOf("privacy-policy") !== -1 || 
                     currentPath.indexOf("terms") !== -1 || 
                     currentPath.indexOf("disclaimer") !== -1 || 
                     currentPath.indexOf("contact") !== -1;

    if (isMainPage) {
        return; // मुख्य पेजेसवर ब्लॉक होईल
    }

    // २. जिथे कमेंट बॉक्स बसवायचा आहे तो Div कंटेनर बनवणे
    var commentsWrapper = document.createElement("div");
    commentsWrapper.id = "santvani-comments-block";
    commentsWrapper.style.cssText = "max-width: 900px; margin: 50px auto 20px auto; padding: 25px; background: #181818; border: 1px solid rgba(255, 183, 3, 0.3); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";

    commentsWrapper.innerHTML = `
        <h3 style="font-family: 'Rozha One', serif; font-size: 24px; color: #ffb703; margin-top: 0; margin-bottom: 20px;">
            💬 प्रतिक्रिया व अभिप्राय (Comments)
        </h3>
        <div id="disqus_thread"></div>
    `;

    // ३. Footer च्या आधी कमेंट बॉक्स जोडणे
    var footer = document.querySelector("footer");
    if (footer) {
        footer.insertAdjacentElement('beforebegin', commentsWrapper);
    } else {
        document.body.appendChild(commentsWrapper);
    }

    // ४. Disqus स्क्रिप्ट लोड करणे
    window.disqus_config = function () {
        this.page.url = window.location.href;
        this.page.identifier = window.location.pathname;
    };

    (function () {
        var d = document, s = d.createElement('script');
        s.src = 'https://santvani.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
});
