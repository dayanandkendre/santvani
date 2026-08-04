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
// 🔥 FIREBASE CUSTOM PREMIUM COMMENTS SYSTEM (Rozha One Theme)
// =========================================================

(function () {
    var currentPath = window.location.pathname.toLowerCase();
    
    // १. मुख्य आणि पॉलिसी पेजेसवर कमेंट बॉक्स दाखवायचा नाही
    var isMainPage = currentPath.endsWith("/") || 
                     currentPath.endsWith("index.html") || 
                     currentPath.indexOf("privacy-policy") !== -1 || 
                     currentPath.indexOf("terms") !== -1 || 
                     currentPath.indexOf("disclaimer") !== -1 || 
                     currentPath.indexOf("contact") !== -1;

    if (isMainPage) return;

    // २. Firebase JS SDK डाऊनलोड करणे
    var script1 = document.createElement("script");
    script1.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
    document.head.appendChild(script1);

    var script2 = document.createElement("script");
    script2.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js";
    document.head.appendChild(script2);

    script2.onload = function () {
        // तुझा ओरिजिनल Firebase Credentials Config
        const firebaseConfig = {
            apiKey: "AIzaSyBQTDVzvz5tFktEEsnPZQ6G_ADoxGL0ZW4",
            authDomain: "santvani-48d18.firebaseapp.com",
            databaseURL: "https://santvani-48d18-default-rtdb.firebaseio.com",
            projectId: "santvani-48d18",
            storageBucket: "santvani-48d18.firebasestorage.app",
            messagingSenderId: "769467907364",
            appId: "1:769467907364:web:4fe85b182eb43359f707b1",
            measurementId: "G-D5XSFWVWTP"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        initSantvaniComments();
    };
})();

function initSantvaniComments() {
    var db = firebase.database();
    // प्रत्येक आर्टिकलसाठी युनिक आयडी तयार करणे
    var pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");

    // ३. संतवाणी कस्टम डार्क-गोल्ड HTML लेआउट
    var commentsWrapper = document.createElement("div");
    commentsWrapper.id = "santvani-comments-wrapper";
    commentsWrapper.style.cssText = "max-width: 850px; margin: 50px auto 30px auto; padding: 25px; background: #121212; border: 1px solid rgba(255, 183, 3, 0.3); border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.6); font-family: 'Poppins', sans-serif; color: #fff;";

    commentsWrapper.innerHTML = `
        <h3 style="font-family: 'Rozha One', serif; font-size: 24px; color: #ffb703; margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            💬 प्रतिक्रिया व अभिप्राय (Comments)
        </h3>

        <!-- इनपुट फॉर्म -->
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;">
            <input type="text" id="fb-comment-name" placeholder="तुमचे नाव *" style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='#ffb703'" onblur="this.style.borderColor='#333'">
            <textarea id="fb-comment-text" rows="3" placeholder="आपली प्रतिक्रिया किंवा विचार लिहा..." style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none; resize: vertical; transition: 0.3s;" onfocus="this.style.borderColor='#ffb703'" onblur="this.style.borderColor='#333'"></textarea>
            <button id="fb-comment-btn" style="align-self: flex-start; padding: 10px 24px; background: #ffb703; color: #000; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.3s;">प्रतिक्रिया पाठवा</button>
        </div>

        <!-- कमेंट्स लिस्ट -->
        <div id="fb-comments-list" style="display: flex; flex-direction: column; gap: 15px;"></div>
    `;

    var footer = document.querySelector("footer");
    if (footer) {
        footer.insertAdjacentElement('beforebegin', commentsWrapper);
    } else {
        document.body.appendChild(commentsWrapper);
    }

    // ४. नवीन कमेंट जोडणे
    document.getElementById("fb-comment-btn").addEventListener("click", function () {
        var nameInput = document.getElementById("fb-comment-name");
        var textInput = document.getElementById("fb-comment-text");
        var name = nameInput.value.trim();
        var text = textInput.value.trim();

        if (!name || !text) {
            alert("कृपया नाव आणि तुमची प्रतिक्रिया दोन्ही प्रविष्ट करा.");
            return;
        }

        var commentsRef = db.ref("comments/" + pageId);
        commentsRef.push({
            name: name,
            text: text,
            timestamp: new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        nameInput.value = "";
        textInput.value = "";
    });

    // ५. Realtime कमेंट्स लोड करणे
    var commentsRef = db.ref("comments/" + pageId);
    commentsRef.on("value", function (snapshot) {
        var listContainer = document.getElementById("fb-comments-list");
        listContainer.innerHTML = "";

        if (!snapshot.exists()) {
            listContainer.innerHTML = "<p style='color: #777; font-size: 14px; margin: 0;'>पहिली प्रतिक्रिया देऊन सुरुवात करा!</p>";
            return;
        }

        snapshot.forEach(function (childSnapshot) {
            var data = childSnapshot.val();
            var commentBox = document.createElement("div");
            commentBox.style.cssText = "padding: 16px; background: #181818; border-left: 4px solid #ffb703; border-radius: 8px;";
            commentBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #ffb703; font-size: 15px; font-weight: 600;">${data.name}</strong>
                    <span style="color: #666; font-size: 12px;">${data.timestamp}</span>
                </div>
                <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.text}</p>
            `;
            listContainer.prepend(commentBox);
        });
    });
}
