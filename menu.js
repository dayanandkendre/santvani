console.log("Menu.js यशस्वीरित्या लोड झाली आहे!");
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
// 💬 DISQUS AUTOMATIC COMMENTS SECTION (Filtered Pages)
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
    
    // १. ज्या पेजेसवर कमेंट बॉक्स नको आहे त्यांची यादी (URL चे भाग)
    var currentPath = window.location.pathname.toLowerCase();
    
    var excludedPages = [
        "/",                     // Homepage
        "index.html",            // Home Page
        "sant-sahitya",          // संत साहित्य ग्रिड
        "san-utsav",             // सण आणि उत्सव ग्रिड
        "contact",               // संपर्क पेज
        "about",                 // आमच्याबद्दल
        "privacy-policy",        // प्रायव्हसी पॉलिसी
        "terms",                 // नियम व अटी
        "disclaimer"             // डिस्क्लेमर
    ];

    // २. जर सध्याचे पेज अपवादात्मक यादीत असेल तर कमेंट बॉक्स जोडणार नाही
    var shouldExclude = excludedPages.some(function(page) {
        return currentPath.endsWith(page) || currentPath.indexOf(page) !== -1;
    });

    if (shouldExclude) {
        return; // इथेच कोड थांबेल, कमेंट बॉक्स लोड होणार नाही
    }

    // ३. फक्त मुख्य लेखांसाठीच कमेंट्स कंटेनर बनवणे
    var commentsContainer = document.createElement("div");
    commentsContainer.id = "santvani-comments-wrapper";
    commentsContainer.style.cssText = "max-width: 800px; margin: 40px auto 20px auto; padding: 25px; background-color: #181818; border: 1px solid rgba(255,183,3,0.3); border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.6); font-family: 'Poppins', sans-serif;";

    commentsContainer.innerHTML = `
        <h3 style="font-family: 'Rozha One', serif; font-size: 24px; color: #ffb703; margin-top: 0; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-comments"></i> प्रतिक्रिया व अभिप्राय (Comments)
        </h3>
        <div id="disqus_thread"></div>
    `;

    // ४. फुटरच्या आधी सेफली जोडणे
    var footer = document.querySelector("footer");
    if (footer) {
        footer.parentNode.insertBefore(commentsContainer, footer);
    } else {
        document.body.appendChild(commentsContainer);
    }

    // ५. Disqus स्क्रिप्ट लोड करणे
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
