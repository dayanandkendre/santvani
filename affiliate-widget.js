(function () {
  // Pratyek page open kelyavar popup disnyasathi session check kadhla ahe
  let book = null;
  if (typeof getRandomAffiliateBook === "function") {
    book = getRandomAffiliateBook();
  }

  if (!book) return;

  // Category nusaar icon
  let icon = "📖";
  if (book.category && book.category.includes("फोटो")) icon = "🖼️";
  else if (book.category && book.category.includes("अभंग")) icon = "📿";
  else if (book.category && book.category.includes("संदर्भ")) icon = "📜";

  // Responsive CSS Styles
  const style = document.createElement("style");
  style.innerHTML = `
    .sv-affiliate-card {
      position: fixed;
      background: #ffffff;
      border: 1px solid #fed7aa;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      padding: 12px 14px;
      gap: 12px;
      z-index: 99999;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
      opacity: 0;
      pointer-events: none;
    }

    /* Desktop View: Center Right Slider */
    @media (min-width: 768px) {
      .sv-affiliate-card {
        top: 50%;
        right: 0;
        width: 300px;
        transform: translate(110%, -50%); /* Right side baher thevne */
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
      }
      .sv-affiliate-card.visible {
        transform: translate(0, -50%); /* Slide inside from right */
        opacity: 1;
        pointer-events: auto;
      }
    }

    /* Mobile View: OneSignal bell la adthala na karta */
    @media (max-width: 767px) {
      .sv-affiliate-card {
        bottom: 80px; /* OneSignal bell chya varti thevle */
        right: 15px;
        left: 15px;
        max-width: calc(100vw - 30px);
        transform: translateY(140%);
      }
      .sv-affiliate-card.visible {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }
    }

    .sv-card-icon {
      font-size: 26px;
      background: #fff7ed;
      border: 1px solid #fdba74;
      border-radius: 10px;
      width: 46px;
      height: 46px;
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
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sv-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
      line-height: 1.3;
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
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(234, 88, 12, 0.25);
    }
    .sv-btn:hover {
      background: #c2410c;
    }
    .sv-close-btn {
      position: absolute;
      top: 4px;
      right: 6px;
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
      font-size: 8px;
      color: #94a3b8;
      margin-top: 3px;
    }
  `;
  document.head.appendChild(style);

  // Card HTML
  const card = document.createElement("div");
  card.className = "sv-affiliate-card";
  card.innerHTML = `
    <button class="sv-close-btn" aria-label="Close">&times;</button>
    <div class="sv-card-icon">${icon}</div>
    <div class="sv-details">
      <div class="sv-tagline">${book.category || "ग्रंथ व साहित्य"}</div>
      <div class="sv-title" title="${book.title}">${book.title}</div>
      <a href="${book.link}" target="_blank" rel="noopener sponsored" class="sv-btn">किंमत पहा</a>
      <div class="sv-disclaimer">*Amazon Affiliate</div>
    </div>
  `;
  document.body.appendChild(card);

  // Close Button Action
  card.querySelector(".sv-close-btn").addEventListener("click", () => {
    card.classList.remove("visible");
  });

  // Trigger Logic: Page load zalyaver 3 secondani kiva scroll kelyavar popup slider yeto
  let hasTriggered = false;
  function triggerCard() {
    if (hasTriggered) return;
    card.classList.add("visible");
    hasTriggered = true;
  }

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    if (scrollPos / totalHeight >= 0.25) triggerCard();
  });

  setTimeout(() => triggerCard(), 3000);
})();
