// =========================================================
// 🔥 SHARE BUTTONS + FIREBASE COMMENTS SYSTEM (Rozha One Theme)
// =========================================================

(function () {
    var currentPath = window.location.pathname.toLowerCase();
    
    // १. ज्या पेजेसवर शेअर आणि कमेंट बॉक्स नको आहे त्यांची यादी
    var excludedPages = [
        "index.html",
        "about.html",
        "contact.html",
        "privacy-policy.html",
        "terms.html",
        "disclaimer.html",
        "abhang-gatha.html",
        "bharude-gavlani.html",
        "granth-sampada.html",
        "kabir-doha.html",
        "santache-prasang.html",
        "sant-sahitya.html",
        "sant-subhashite.html",
        "san-utsav.html",
        "sarth-haripath.html",
        "vangmay-sangrah.html",
        "eknath-gatha.html",
        "muktabai-gatha.html",
        "namdev-gatha.html",
        "nilobaray-gatha.html",
        "tukaram-gatha.html",
        "artya-sangrah.html",
        "ekadashi-vrat.html",
        "dnyaneshwari.html",
        "eknathi-bhagvat.html"
    ];

    var isExcluded = currentPath === "/" || currentPath.endsWith("/") || excludedPages.some(function(page) {
        return currentPath.indexOf(page) !== -1;
    });

    if (isExcluded) return;

    // २. Firebase Scripts डाऊनलोड करणे
    var script1 = document.createElement("script");
    script1.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
    document.head.appendChild(script1);

    var script2 = document.createElement("script");
    script2.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js";
    document.head.appendChild(script2);

    script2.onload = function () {
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

        initSantvaniShareAndComments();
    };
})();

function initSantvaniShareAndComments() {
    var db = firebase.database();
    var pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
    var pageUrl = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(document.title || "संतवाणी - विचार आणि साहित्य");

    // ३. मुख्य कंटेनर (Share + Comments)
    var container = document.createElement("div");
    container.id = "santvani-interactive-block";
    container.style.cssText = "max-width: 850px; margin: 50px auto 30px auto; font-family: 'Poppins', sans-serif; color: #fff;";

    container.innerHTML = `
        <!-- 📢 SHARE BUTTONS SECTION -->
        <div style="background: #121212; border: 1px solid rgba(255, 183, 3, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h4 style="font-family: 'Rozha One', serif; font-size: 20px; color: #ffb703; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                🔗 हा लेख शेअर करा (Share Article)
            </h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}" target="_blank" style="padding: 8px 16px; background: #25D366; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px;">WhatsApp</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" style="padding: 8px 16px; background: #1877F2; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">Facebook</a>
                <a href="https://telegram.me/share/url?url=${pageUrl}&text=${pageTitle}" target="_blank" style="padding: 8px 16px; background: #0088cc; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">Telegram</a>
                <a href="https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageUrl}" target="_blank" style="padding: 8px 16px; background: #1DA1F2; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">X (Twitter)</a>
                <button id="copy-link-btn" style="padding: 8px 16px; background: #333; color: #ffb703; border: 1px solid #ffb703; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.3s;">📋 लिंक कॉपी करा</button>
            </div>
        </div>

        <!-- 💬 FIREBASE COMMENTS SECTION -->
        <div style="background: #121212; border: 1px solid rgba(255, 183, 3, 0.3); border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h3 style="font-family: 'Rozha One', serif; font-size: 22px; color: #ffb703; margin-top: 0; margin-bottom: 20px;">
                💬 प्रतिक्रिया व अभिप्राय (Comments)
            </h3>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px;">
                <input type="text" id="fb-comment-name" placeholder="तुमचे नाव *" style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#ffb703'" onblur="this.style.borderColor='#333'">
                <textarea id="fb-comment-text" rows="3" placeholder="आपली प्रतिक्रिया किंवा विचार लिहा..." style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none; resize: vertical;" onfocus="this.style.borderColor='#ffb703'" onblur="this.style.borderColor='#333'"></textarea>
                <button id="fb-comment-btn" style="align-self: flex-start; padding: 10px 24px; background: #ffb703; color: #000; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.3s;">प्रतिक्रिया पाठवा</button>
            </div>

            <div id="fb-comments-list" style="display: flex; flex-direction: column; gap: 15px;"></div>
        </div>
    `;

    var footer = document.querySelector("footer");
    if (footer) {
        footer.insertAdjacentElement('beforebegin', container);
    } else {
        document.body.appendChild(container);
    }

    // 📋 कॉपी लिंक बटणाची कार्यपद्धती
    document.getElementById("copy-link-btn").addEventListener("click", function() {
        navigator.clipboard.writeText(window.location.href).then(function() {
            var btn = document.getElementById("copy-link-btn");
            btn.innerText = "✅ लिंक कॉपी झाली!";
            setTimeout(function() {
                btn.innerText = "📋 लिंक कॉपी करा";
            }, 2000);
        });
    });

    // 💬 कमेंट सेव्ह करणे
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

    // 💬 रिअल-टाईम कमेंट्स लोड करणे
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
