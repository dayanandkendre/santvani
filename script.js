/* ==========================================================================
   संतवाणी गाथा - १००% वर्किंग क्लीन script.js फाईल
   ========================================================================== */

// १. अभंग आणि भावार्थ टॉगल फंक्शन (नवीन CSS ला परफेक्ट सपोर्ट करणारे)
function toggleAbhangView(id) {
    var abhangElement = document.getElementById("abhang-text-" + id);
    var bhavarthElement = document.getElementById("bhavarth-text-" + id);
    var btnElement = document.getElementById("toggle-btn-" + id);
    var badgeElement = document.getElementById("badge-" + id);

    if (abhangElement && bhavarthElement) {
        // जर अभंग दिसत असेल (म्हणजे तो none नसेल)
        if (abhangElement.style.display !== 'none') {
            // अभंग लपवा आणि भावार्थ दाखवा
            abhangElement.style.setProperty('display', 'none', 'important');
            bhavarthElement.style.setProperty('display', 'block', 'important');
            
            if (btnElement) {
                btnElement.innerHTML = '<i class="fa-solid fa-book-open"></i> <span>अभंग पहा</span>';
            }
            if (badgeElement) {
                badgeElement.innerText = 'भावार्थ/अर्थ';
                badgeElement.style.setProperty('color', '#ffcc00', 'important');
            }
        } else {
            // उलट स्थिती: अभंग दाखवा आणि भावार्थ लपवा
            abhangElement.style.setProperty('display', 'block', 'important');
            bhavarthElement.style.setProperty('display', 'none', 'important');
            
            if (btnElement) {
                btnElement.innerHTML = '<i class="fa-solid fa-eye"></i> <span>भावार्थ पहा</span>';
            }
            if (badgeElement) {
                badgeElement.innerText = 'अभंग रचना';
                badgeElement.style.setProperty('color', '#ff7300', 'important');
            }
        }
    }
}

// २. मजकूर कॉपी करणे (सुबक फॉरमॅटसह)
function copyAbhangText(id) {
    var abhangElem = document.getElementById("abhang-text-" + id);
    var bhavarthElem = document.getElementById("bhavarth-text-" + id);
    
    if (abhangElem && bhavarthElem) {
        var fullText = "॥ अभंग " + id + " ॥\n\n" + abhangElem.innerText.trim() + "\n\nअर्थ:\n" + bhavarthElem.innerText.trim();
        
        navigator.clipboard.writeText(fullText)
            .then(function() {
                showToastNotification("🚀 अभंग आणि अर्थ कॉपी केला!");
            })
            .catch(function() {
                showToastNotification("❌ कॉपी करता आले नाही.");
            });
    }
}

// ३. सोशल शेअरिंग (व्हॉट्सॲप आणि सिस्टीम शेअर)
function shareAbhang(id) {
    var abhangElem = document.getElementById("abhang-text-" + id);
    if (abhangElem) {
        var shareText = "॥ अभंग " + id + " ॥\n\n" + abhangElem.innerText.trim() + "\n\nअधिक अभंगांसाठी भेट द्या: " + window.location.href;
        
        if (navigator.share) {
            navigator.share({ 
                title: "अभंग " + id, 
                text: shareText
            }).catch(function(err) { console.log("Sharing cancelled"); });
        } else {
            var whatsappUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(shareText);
            window.open(whatsappUrl, '_blank');
        }
    }
}

// ४. ९:१६ कडक सार्थ इमेज जनरेटर (Rozha One फॉन्ट आणि वर्ड-रॅपसह)
function saveAbhangAsImage(id) {
    var abhangTextElem = document.getElementById("abhang-text-" + id);
    var bhavarthTextElem = document.getElementById("bhavarth-text-" + id);
    
    if (!abhangTextElem || !bhavarthTextElem) return;

    var abhangText = abhangTextElem.innerText.trim();
    var bhavarthText = bhavarthTextElem.innerText.trim();
    
    var canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1600;
    var ctx = canvas.getContext('2d');

    // बॅकग्राउंड ग्रेडियंट
    var gradient = ctx.createLinearGradient(0, 0, 0, 1600);
    gradient.addColorStop(0, '#0f0a05');
    gradient.addColorStop(0.5, '#1f1207');
    gradient.addColorStop(1, '#080503');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 900, 1600);

    // सोनेरी बॉर्डर्स
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 820, 1520);
    ctx.strokeStyle = 'rgba(255, 210, 127, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, 790, 1490);

    // हेडर टायटल
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ सार्थ संतवाणी गाथा ॥', 450, 140);

    // अभंग क्रमांक
    ctx.fillStyle = '#ff7300';
    ctx.font = 'bold 42px "Rozha One", serif';
    ctx.fillText("|| अभंग " + id + " ||", 450, 230);

    // भावार्थासाठी ऑटो-रॅपिंग फंक्शन
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';
        var currentY = y;
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var testWidth = context.measureText(testLine).width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line.trim(), x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line.trim(), x, currentY);
        return currentY;
    }

    var totalLength = abhangText.length + bhavarthText.length;
    var abhangFontSize = 42;
    var bhavarthFontSize = 30;
    var abhangLineHeight = 85;
    var bhavarthLineHeight = 55;

    if (totalLength > 320) {
        abhangFontSize = 36;
        bhavarthFontSize = 26;
        abhangLineHeight = 75;
        bhavarthLineHeight = 48;
    }

    // अभंग प्रिंट करणे
    ctx.fillStyle = '#fffdfa';
    ctx.font = 'normal ' + abhangFontSize + 'px "Rozha One", serif';
    var abhangLines = abhangText.split('\n');
    var startY = 420;
    
    abhangLines.forEach(function(line) {
        if(line.trim() !== "") {
            ctx.fillText(line.trim(), 450, startY);
            startY += abhangLineHeight;
        }
    });

    // डिव्हाइडेर लाइन
    var dividerY = startY + 20;
    ctx.strokeStyle = 'rgba(255, 204, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); 
    ctx.moveTo(250, dividerY); 
    ctx.lineTo(650, dividerY); 
    ctx.stroke();

    // भावार्थ प्रिंट करणे
    ctx.fillStyle = '#ffd27f';
    ctx.font = 'normal ' + bhavarthFontSize + 'px sans-serif';
    var bhavarthStartY = dividerY + 80;
    wrapText(ctx, "अर्थ: " + bhavarthText, 450, bhavarthStartY, 720, bhavarthLineHeight);

    // वॉटरमार्क
    ctx.fillStyle = 'rgba(194, 180, 166, 0.3)';
    ctx.font = '26px sans-serif';
    ctx.fillText('www.santvani.co.in', 450, 1510);

    // डाऊनलोड ट्रिगर
    var imageURL = canvas.toDataURL('image/png');
    var downloadLink = document.createElement('a');
    downloadLink.href = imageURL;
    downloadLink.download = "sarth-abhang-" + id + ".png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// सुंदर आणि कडक टोस्ट नोटिफिकेशन
function showToastNotification(msg) {
    var toast = document.getElementById("toast-notif");
    if(!toast) {
        toast = document.createElement('div');
        toast.id = "toast-notif";
        toast.style = "position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: #ffcc00; border: 2px solid #ff7300; color: #0f0a05; padding: 12px 35px; border-radius: 30px; font-size: 1rem; font-weight: bold; z-index: 10000; transition: all 0.3s; box-shadow: 0 8px 25px rgba(0,0,0,0.6); font-family: sans-serif;";
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.display = "block";
    setTimeout(function() { 
        toast.style.display = "none"; 
    }, 2500);
}