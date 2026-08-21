// santvani Interactive Actions Script - Final Smooth Version

// 1. Tab Switcher
function toggleCardTab(button, tabType) {
    const card = button.closest('.aarti-premium-card');
    
    card.querySelectorAll('.card-tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const lyricsBlock = card.querySelector('.lyrics-text');
    const arthBlock = card.querySelector('.arth-text');

    if (tabType === 'lyrics') {
        lyricsBlock.classList.add('active');
        arthBlock.classList.remove('active');
    } else {
        lyricsBlock.classList.remove('active');
        arthBlock.classList.add('active');
    }
}

// 2. Clipboard Copy Engine
function copyAartiText(cardId) {
    const card = document.getElementById(`aarti-card-${cardId}`);
    const lyrics = card.querySelector('.lyrics-text').innerText;
    
    navigator.clipboard.writeText(lyrics).then(() => {
        alert("📋 आरती यशस्वीरीत्या कॉपी केली आहे!");
    });
}

// 3. Web Share Hub
function shareAarti(cardId) {
    const card = document.getElementById(`aarti-card-${cardId}`);
    const title = card.querySelector('.card-header h3').innerText;
    const text = card.querySelector('.lyrics-text').innerText;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: text + "\n\nसौजन्य: www.santvani.co.in",
            url: window.location.href
        }).catch(err => console.log(err));
    } else {
        // Fallback for desktop/unsupported browsers
        navigator.clipboard.writeText(text + "\n\nसौजन्य: www.santvani.co.in");
        alert("🔗 शेअर उपलब्ध नाही, पण लिंक आणि मजकूर कॉपी झाला आहे! तुम्ही थेट पेस्ट करू शकता.");
    }
}

// 4. HTML2Canvas Image Poster Exporter - Fixed Ultra Smooth & Silent Download
function downloadAartiCard(cardId, fileName) {
    const poster = document.getElementById(`poster-${cardId}`);
    
    if (!poster) return;

    // फोटो काढण्यापूर्वी बॅकग्राउंडला सायलेंटली जिवंत करणे (रिफ्लेक्शन टाळण्यासाठी CSS पोझिशन न बदलता)
    poster.style.setProperty("visibility", "visible", "important");
    poster.style.setProperty("opacity", "1", "important");

    html2canvas(poster, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0d0a07',
        scale: 2.5, // हाय-क्वालिटी ४K प्रतिमेसाठी
        logging: false
    }).then(canvas => {
        // फोटो निघताच पुन्हा पूर्णपणे सायलेंटली अदृश्य करणे
        poster.style.setProperty("visibility", "hidden", "important");
        poster.style.setProperty("opacity", "0", "important");

        // फाईल डाऊनलोड ट्रिगर करणे
        const link = document.createElement('a');
        link.download = fileName + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(error => {
        console.error("डाऊनलोड करताना त्रुटी आली:", error);
        // त्रुटी आल्यास सुरक्षिततेसाठी पुन्हा अदृश्य करणे
        poster.style.setProperty("visibility", "hidden", "important");
        poster.style.setProperty("opacity", "0", "important");
    });
}

// Aarti Category Filter Engine
function filterAarti(category) {
    // १. सर्व फिल्टर बटन्सवरून active क्लास काढणे आणि क्लिक केलेल्या बटणला देणे
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // २. कॅटेगरीनुसार कार्ड्स दाखवणे किंवा लपवणे
    const cards = document.querySelectorAll('.aarti-premium-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex'; // दाखवा
        } else {
            card.style.display = 'none'; // लपवा
        }
    });
}