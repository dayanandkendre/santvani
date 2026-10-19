(function () {
  const STORAGE_KEY = "sv_affiliate_closed";
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  // Book / Product डेटा मिळवणे
  let book = null;
  if (typeof getRandomAffiliateBook === "function") {
    book = getRandomAffiliateBook();
  }

  if (!book) return;

  // कॅटेगरीनुसार सुसंगत आयकॉन
  let icon = "📖";
  if (book.category && book.category.includes("फोटो")) icon = "🖼️";
  else if (book.category && book.category.includes("अभंग")) icon = "📿";
  else if (book.category && book.category.includes("संदर्भ")) icon = "📜";

  // CSS स्टाइल (कोणतीही इमेज नाही, पूर्णपणे क्लीन कार्ड)
  const style = document.createElement("style");
  style.innerHTML = `
    .sv-affiliate-card {
      position: fixed;
      bottom: -160px;
      right: 20px;
      width: 310px;
      max-width: calc(100vw - 40px);
      background: #ffffff;
      border: 1px solid #fed7aa;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      padding: 14px 16px;
      gap: 14px;
      z-index: 99999;
      transition: bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .sv-affiliate-card.visible {
      bottom: 20px;
    }
    .sv-card-icon {
      font-size: 26px;
      background: #fff7ed;
      border: 1px solid #fdba74;
      border-radius: 10px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sv-details {
      flex: 1;
      min-width: 0;
    }
    .sv-tagline {
      font-size: 11px;
      color: #ea580c;
      font-weight: 700;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sv-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .sv-btn {
      display: inline-block;
      background: #ea580c;
      color: #ffffff !important;
      text-decoration: none !important;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 14px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(234, 88, 12, 0.25);
      transition: background 0.2s ease;
    }
    .sv-btn:hover {
      background: #c2410c;
    }
    .sv-close-btn {
      position: absolute;
      top: 6px;
      right: 8px;
      background: transparent;
      border: none;
      font-size: 18px;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
    }
    .sv-close-btn:hover {
      color: #475569;
    }
    .sv-disclaimer {
      font-size: 9px;
      color: #94a3b8;
      margin-top: 4px;
    }
  `;
  document.head.appendChild(style);

  // कार्ड HTML (इमेज टॅग पूर्णपणे काढला आहे)
  const card = document.createElement("div");
  card.className = "sv-affiliate-card";
  card.innerHTML = `
    <button class="sv-close-btn" aria-label="Close">&times;</button>
    <div class="sv-card-icon">${icon}</div>
    <div class="sv-details">
      <div class="sv-tagline">${book.category || "ग्रंथ व साहित्य"}</div>
      <div class="sv-title" title="${book.title}">${book.title}</div>
      <a href="${book.link}" target="_blank" rel="noopener sponsored" class="sv-btn">किंमत पहा</a>
      <div class="sv-disclaimer">*Amazon वर उपलब्ध</div>
    </div>
  `;
  document.body.appendChild(card);

  // Close Logic
  card.querySelector(".sv-close-btn").addEventListener("click", () => {
    card.classList.remove("visible");
    sessionStorage.setItem(STORAGE_KEY, "true");
  });

  // Trigger Logic: Scroll वर किंवा ४ सेकंदांनी
  let hasTriggered = false;
  function triggerCard() {
    if (hasTriggered) return;
    card.classList.add("visible");
    hasTriggered = true;
  }

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    if (scrollPos / totalHeight >= 0.3) triggerCard();
  });

  setTimeout(() => triggerCard(), 4000);
})();