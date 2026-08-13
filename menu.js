document.addEventListener("DOMContentLoaded", function () {
    // =========================================================
    // 🍔 १. हॅम्बर्गर मेनू आणि नेव्हिगेशन लॉजिक (Fixed)
    // =========================================================
    function initNavigation() {
        const navContainer = document.querySelector(".nav-container");
        const navLinks = document.querySelector(".nav-links");

        if (navContainer && navLinks) {
            let overlay = document.querySelector(".menu-overlay");
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.className = "menu-overlay";
                document.body.appendChild(overlay);
            }

            let hamburgerBtn = document.querySelector(".hamburger-toggle");
            if (!hamburgerBtn) {
                hamburgerBtn = document.createElement("button");
                hamburgerBtn.className = "hamburger-toggle";
                hamburgerBtn.setAttribute("aria-label", "Toggle Menu");
                hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                navContainer.appendChild(hamburgerBtn);
            }

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

            hamburgerBtn.onclick = toggleMenu;
            overlay.onclick = toggleMenu;

            const dropdown = document.querySelector(".dropdown");
            const dropdownToggle = document.querySelector(".dropdown-toggle");

            if (dropdownToggle && dropdown) {
                dropdownToggle.onclick = function (e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        dropdown.classList.toggle("open");
                        dropdown.classList.toggle("active");
                    }
                };
            }

            if (window.innerWidth <= 768 && !document.querySelector(".bottom-nav-bar")) {
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
    }

    initNavigation();

    // =========================================================
    // 🔥 2. SHARE BUTTONS + ADVANCED FIREBASE COMMENTS SYSTEM
    // =========================================================
    var currentPath = window.location.pathname.toLowerCase();
    
    var excludedPages = [
        "index.html", "about.html", "contact.html", "privacy-policy.html",
        "terms.html", "disclaimer.html", "abhang-gatha.html", "bharude-gavlani.html",
        "granth-sampada.html", "kabir-doha.html", "santache-prasang.html", "sant-sahitya.html",
        "sant-subhashite.html", "san-utsav.html", "sarth-haripath.html", "vangmay-sangrah.html",
        "eknath-gatha.html", "muktabai-gatha.html", "namdev-gatha.html", "nilobaray-gatha.html",
        "tukaram-gatha.html", "artya-sangrah.html", "ekadashi-vrat.html", "dnyaneshwari.html",
        "eknathi-bhagvat.html", "nitya-pathan-stotra.html"
    ];

    var isExcluded = currentPath === "/" || currentPath.endsWith("/") || excludedPages.some(function(page) {
        return currentPath.indexOf(page) !== -1;
    });

    if (!isExcluded) {
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
    }
});

function initSantvaniShareAndComments() {
    var db = firebase.database();
    var pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
    var pageUrl = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(document.title || "संतवाणी");

    var container = document.createElement("div");
    container.id = "santvani-interactive-block";
    container.style.cssText = "max-width: 850px; margin: 50px auto 30px auto; font-family: 'Plus Jakarta Sans', 'Poppins', sans-serif; color: #fff;";

    container.innerHTML = `
        <!-- SHARE BUTTONS SECTION -->
        <div style="background: #121212; border: 1px solid rgba(255, 183, 3, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h4 style="font-family: 'Rozha One', serif; font-size: 20px; color: #ffb703; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                🔗 हा लेख शेअर करा (Share Article)
            </h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}" target="_blank" style="padding: 8px 16px; background: #25D366; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">WhatsApp</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" style="padding: 8px 16px; background: #1877F2; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">Facebook</a>
                <a href="https://telegram.me/share/url?url=${pageUrl}&text=${pageTitle}" target="_blank" style="padding: 8px 16px; background: #0088cc; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">Telegram</a>
                <a href="https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageUrl}" target="_blank" style="padding: 8px 16px; background: #1DA1F2; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">X (Twitter)</a>
                <button id="copy-link-btn" style="padding: 8px 16px; background: #333; color: #ffb703; border: 1px solid #ffb703; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">📋 लिंक कॉपी करा</button>
            </div>
        </div>

        <!-- FIREBASE COMMENTS SECTION (PREMIUM LOOK) -->
        <div style="background: #121212; border: 1px solid rgba(255, 183, 3, 0.3); border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h3 style="font-family: 'Rozha One', serif; font-size: 22px; color: #ffb703; margin-top: 0; margin-bottom: 20px;">
                💬 प्रतिक्रिया व अभिप्राय (<span id="total-comments-count">0</span>)
            </h3>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px;">
                <input type="text" id="fb-comment-name" placeholder="तुमचे नाव *" style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#ffb703'" onblur="this.style.borderColor='#333'">
                <textarea id="fb-comment-text" rows="3" placeholder="आपली प्रतिक्रिया किंवा विचार लिहा..." style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none; resize: vertical;" onfocus="this.style.borderColor='#ffb703'" onblur="this.style.borderColor='#333'"></textarea>
                <button id="fb-comment-btn" style="align-self: flex-start; padding: 10px 24px; background: #ffb703; color: #000; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">प्रतिक्रिया पाठवा</button>
            </div>

            <div id="fb-comments-list" style="display: flex; flex-direction: column; gap: 20px;"></div>
        </div>
    `;

    var footer = document.querySelector("footer");
    if (footer) {
        footer.insertAdjacentElement('beforebegin', container);
    } else {
        document.body.appendChild(container);
    }

    document.getElementById("copy-link-btn").onclick = function() {
        navigator.clipboard.writeText(window.location.href).then(function() {
            var btn = document.getElementById("copy-link-btn");
            btn.innerText = "✅ लिंक कॉपी झाली!";
            setTimeout(function() { btn.innerText = "📋 लिंक कॉपी करा"; }, 2000);
        });
    };

    // 🔔 कमेंट करताना पुश नोटिफिकेशनची परवानगी मागणे
    function requestPushPrompt() {
        if (window.OneSignalDeferred) {
            OneSignalDeferred.push(function(OneSignal) {
                OneSignal.Notifications.requestPermission();
            });
        }
    }

    document.getElementById("fb-comment-btn").onclick = function () {
        var nameInput = document.getElementById("fb-comment-name");
        var textInput = document.getElementById("fb-comment-text");
        var name = nameInput.value.trim();
        var text = textInput.value.trim();

        if (!name || !text) {
            alert("कृपया नाव आणि तुमची प्रतिक्रिया दोन्ही प्रविष्ट करा.");
            return;
        }

        // ऑटो नोटिफिकेशन प्रॉम्ट मागणे
        requestPushPrompt();

        var commentsRef = db.ref("comments/" + pageId);
        commentsRef.push({
            name: name,
            text: text,
            likes: 0,
            dislikes: 0,
            timestamp: new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        nameInput.value = "";
        textInput.value = "";
    };

    var commentsRef = db.ref("comments/" + pageId);
    commentsRef.on("value", function (snapshot) {
        var listContainer = document.getElementById("fb-comments-list");
        var countHeader = document.getElementById("total-comments-count");
        listContainer.innerHTML = "";

        if (!snapshot.exists()) {
            listContainer.innerHTML = "<p style='color: #777; font-size: 14px; margin: 0;'>पहिली प्रतिक्रिया देऊन सुरुवात करा!</p>";
            if(countHeader) countHeader.innerText = "0";
            return;
        }

        var totalCount = 0;

        snapshot.forEach(function (childSnapshot) {
            totalCount++;
            var commentKey = childSnapshot.key;
            var data = childSnapshot.val();
            var firstChar = data.name ? data.name.charAt(0).toUpperCase() : 'U';

            var replyCount = 0;
            var repliesHtml = "";

            if (data.replies) {
                var replyKeys = Object.keys(data.replies);
                replyCount = replyKeys.length;

                replyKeys.forEach(function (rKey) {
                    var reply = data.replies[rKey];
                    var isAdmin = reply.name && (reply.name.includes("Admin") || reply.name.includes("संतवाणी"));
                    var replyChar = reply.name ? reply.name.charAt(0).toUpperCase() : 'A';

                    repliesHtml += `
                        <div style="margin-top: 12px; display: flex; gap: 10px; align-items: flex-start;">
                            <div style="width: 32px; height: 32px; background: ${isAdmin ? '#0284c7' : '#333'}; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; border: 1px solid #444;">
                                ${isAdmin ? '<i class="fa-solid fa-check"></i>' : replyChar}
                            </div>
                            <div style="flex: 1; background: #1a1a1a; padding: 10px 14px; border-radius: 8px; border-left: 3px solid ${isAdmin ? '#38bdf8' : '#ffb703'};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <strong style="color: ${isAdmin ? '#38bdf8' : '#ffb703'}; font-size: 13px; font-weight: 600;">
                                        ${isAdmin ? '<span style="background:#0284c7; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; margin-right:4px;">ADMIN</span>' : ''} ${reply.name}
                                    </strong>
                                    <span style="color: #666; font-size: 11px;">${reply.timestamp || ''}</span>
                                </div>
                                <div style="margin: 0; color: #e0e0e0; font-size: 13px; line-height: 1.5;">${reply.text}</div>
                                
                                <div style="display: flex; gap: 12px; margin-top: 6px;">
                                    <button onclick="window.toggleReplyBox('${commentKey}', '${reply.name}')" style="background:none; border:none; color:#38bdf8; cursor:pointer; font-size:11px; padding:0; font-weight:600;">
                                        <i class="fa-regular fa-comment"></i> उत्तर द्या
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            var commentBox = document.createElement("div");
            commentBox.style.cssText = "display: flex; gap: 12px; align-items: flex-start; padding: 14px; background: #181818; border-left: 4px solid #ffb703; border-radius: 8px;";
            
            var toggleRepliesBtn = "";
            if (replyCount > 0) {
                toggleRepliesBtn = `
                    <button onclick="window.toggleRepliesContainer('${commentKey}')" style="background:none; border:none; color:#38bdf8; font-size:12px; font-weight:700; cursor:pointer; margin-top:10px; display:flex; align-items:center; gap:5px; padding:0;">
                        <i class="fa-solid fa-caret-down"></i> <span id="toggle-text-${commentKey}">▼ ${replyCount} उत्तरे पाहा</span>
                    </button>
                `;
            }

            commentBox.innerHTML = `
                <div style="width: 38px; height: 38px; background: #262626; color: #ffb703; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; border: 1px solid #333;">
                    ${firstChar}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong style="color: #ffb703; font-size: 14px; font-weight: 600;">${data.name}</strong>
                        <span style="color: #666; font-size: 12px;">${data.timestamp}</span>
                    </div>
                    <div style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.text}</div>
                    
                    <div style="display: flex; align-items: center; gap: 18px; margin-top: 8px; font-size: 12px; color: #888;">
                        <button onclick="window.likeComment('${commentKey}', ${data.likes || 0})" style="background:none; border:none; color:#aaa; cursor:pointer; display:flex; align-items:center; gap:5px; font-size:12px; padding:0;">
                            <i class="fa-regular fa-thumbs-up"></i> <span>${data.likes || 0}</span>
                        </button>
                        <button onclick="window.dislikeComment('${commentKey}', ${data.dislikes || 0})" style="background:none; border:none; color:#aaa; cursor:pointer; display:flex; align-items:center; gap:5px; font-size:12px; padding:0;">
                            <i class="fa-regular fa-thumbs-down"></i> <span>${data.dislikes || 0}</span>
                        </button>
                        <button onclick="window.toggleReplyBox('${commentKey}', '${data.name}')" style="background:none; border:none; color:#38bdf8; cursor:pointer; font-weight:600; font-size:12px; padding:0; display:flex; align-items:center; gap:4px;">
                            <i class="fa-regular fa-comment"></i> उत्तर द्या
                        </button>
                    </div>

                    <div id="reply-input-box-${commentKey}" style="display: none; margin-top: 12px; background: #222; padding: 12px; border-radius: 8px; border: 1px solid #333;">
                        <input type="text" id="reply-name-input-${commentKey}" placeholder="तुमचे नाव *" style="width: 100%; padding: 8px 10px; background: #111; border: 1px solid #444; border-radius: 6px; color: #fff; font-size: 12px; margin-bottom: 8px; outline: none;">
                        <textarea id="reply-text-input-${commentKey}" rows="2" placeholder="उत्तर लिहा..." style="width: 100%; padding: 8px 10px; background: #111; border: 1px solid #444; border-radius: 6px; color: #fff; font-size: 12px; outline: none; resize: vertical;"></textarea>
                        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
                            <button onclick="window.toggleReplyBox('${commentKey}')" style="padding: 5px 12px; background: #444; color: #ccc; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">रद्द करा</button>
                            <button onclick="window.submitUserReply('${commentKey}')" style="padding: 5px 14px; background: #ffb703; color: #000; border: none; border-radius: 4px; font-weight: 700; font-size: 11px; cursor: pointer;">उत्तर पाठवा</button>
                        </div>
                    </div>

                    ${toggleRepliesBtn}

                    <div id="replies-list-${commentKey}" style="display: none; padding-left: 10px; border-left: 2px solid #333; margin-top: 6px;">
                        ${repliesHtml}
                    </div>
                </div>
            `;
            listContainer.prepend(commentBox);
        });

        if(countHeader) countHeader.innerText = totalCount;
    });

    window.likeComment = function(key, currentLikes) {
        db.ref("comments/" + pageId + "/" + key).update({
            likes: currentLikes + 1
        });
    };

    window.dislikeComment = function(key, currentDislikes) {
        db.ref("comments/" + pageId + "/" + key).update({
            dislikes: currentDislikes + 1
        });
    };

    window.toggleReplyBox = function(key, tagUser) {
        var box = document.getElementById("reply-input-box-" + key);
        var textInput = document.getElementById("reply-text-input-" + key);
        if (box) {
            if (box.style.display === "none" || box.style.display === "") {
                box.style.display = "block";
                if (tagUser && textInput) {
                    textInput.value = "@" + tagUser + " ";
                    textInput.focus();
                }
            } else {
                box.style.display = "none";
            }
        }
    };

    window.toggleRepliesContainer = function(key) {
        var container = document.getElementById("replies-list-" + key);
        var textSpan = document.getElementById("toggle-text-" + key);
        if (container) {
            if (container.style.display === "none" || container.style.display === "") {
                container.style.display = "block";
                if (textSpan) textSpan.innerText = "▲ उत्तरे लपवा";
            } else {
                container.style.display = "none";
                if (textSpan) textSpan.innerText = "▼ उत्तरे पाहा";
            }
        }
    };

    window.submitUserReply = function(commentKey) {
        var nameInp = document.getElementById("reply-name-input-" + commentKey);
        var textInp = document.getElementById("reply-text-input-" + commentKey);
        var name = nameInp.value.trim();
        var text = textInp.value.trim();

        if (!name || !text) {
            alert("कृपया तुमचे नाव आणि उत्तर दोन्ही प्रविष्ट करा.");
            return;
        }

        // रिप्लाय देतानासुद्धा नोटिफिकेशन प्रॉम्ट कॉल करणे
        requestPushPrompt();

        var replyData = {
            name: name,
            text: text,
            timestamp: new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        };

        db.ref("comments/" + pageId + "/" + commentKey + "/replies").push(replyData, function(error) {
            if (!error) {
                nameInp.value = "";
                textInp.value = "";
                
                var box = document.getElementById("reply-input-box-" + commentKey);
                if (box) box.style.display = "none";

                var container = document.getElementById("replies-list-" + commentKey);
                var textSpan = document.getElementById("toggle-text-" + commentKey);
                if (container) {
                    container.style.display = "block";
                    if (textSpan) textSpan.innerText = "▲ उत्तरे लपवा";
                }
            }
        });
    };
}

(function() {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon';
    favicon.href = '/favicon.ico';
    document.head.appendChild(favicon);
})();

(function() {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-YEN0M3VBYE';
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', 'G-YEN0M3VBYE');
})();

// =========================================================
// 🔔 ONESIGNAL WEB PUSH NOTIFICATION SYSTEM
// =========================================================
(function() {
    var osScript = document.createElement('script');
    osScript.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    osScript.defer = true;
    document.head.appendChild(osScript);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
            appId: "55c5b921-8a05-48af-8d99-517f57cd3d45",
            safari_web_id: "web.onesignal.auto.55c5b921-8a05-48af-8d99-517f57cd3d45",
            notifyButton: {
                enable: true,
            },
        });
    });
})();
