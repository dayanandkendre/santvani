/* ==========================================================================
   dashboard.js — आजचा डॅशबोर्ड (पंचांग + पावन अभंग + वार्ता फलक)
   ► हा कोड सहसा बदलावा लागत नाही. मासिक बदल फक्त data/ फोल्डरमधील तीन CSV शीट्समध्ये करा:
        data/panchang.csv   — दैनिक पंचांग (तिथी, नक्षत्र, विशेष)
        data/vartha.csv     — वार्ता फलकाचा मजकूर
        data/abhang.csv     — कोणत्या महिन्यात/वारी/तारखेला कोणता अभंग
   ► Google Sheet वापरायचे असल्यास खालील CONFIG मधील तीन पाथ बदलून
     "Publish to web → CSV" च्या लिंक्स टाका.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------- CONFIG (फक्त हे बदला) ------------------------- */
  var CONFIG = {
    panchang: 'data/panchang.csv',
    vartha:   'data/vartha.csv',
    abhang:   'data/abhang.csv',
    showAutoUpcoming: true,                 // वार्ता फलकात "पुढील एकादशी / सोहळे" आपोआप दाखवा (true/false)
    siteUrl: 'https://santvani.co.in/'
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function safeHref(u) { u = String(u || '').trim(); return /^(https?:\/\/|\/|[a-z0-9_\-\.\/#?=&]+$)/i.test(u) && !/^javascript:/i.test(u) ? u : ''; }

  /*ENGINE-START*/
  /* ------------------------------------------------------------------
   * पंचांग गणित (Meeus सूर्य/चंद्र रेखांश + लाहिरी अयनांश) — CSV मध्ये माहिती नसल्यास हे वापरले जाते.
   * तिथी = (चंद्र − सूर्य)/१२°, नक्षत्र = निरयन चंद्र/१३°२०′, सूर्योदय ≈ ०६:३० IST
   * ------------------------------------------------------------------ */
  var DIG = '०१२३४५६७८९';
  function mr(n) { return String(n).replace(/\d/g, function (d) { return DIG.charAt(+d); }); }
  function asciiDigits(s) { return String(s).replace(/[०-९]/g, function (c) { return DIG.indexOf(c); }); }
  var WEEK = ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];
  var WEEK_S = ['रवि','सोम','मंगळ','बुध','गुरु','शुक्र','शनि'];
  var GMONTH = ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'];
  var LMONTH = ['चैत्र','वैशाख','ज्येष्ठ','आषाढ','श्रावण','भाद्रपद','अश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'];
  var TITHI = ['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी'];
  var NAK = ['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशीर्ष','आर्द्रा','पुनर्वसू','पुष्य','आश्लेषा','मघा','पूर्वा फाल्गुनी','उत्तरा फाल्गुनी','हस्त','चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूळ','पूर्वाषाढा','उत्तराषाढा','श्रवण','धनिष्ठा','शततारका','पूर्वा भाद्रपदा','उत्तरा भाद्रपदा','रेवती'];
  var MOONS = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];

  function rad(x) { return x * Math.PI / 180; }
  function norm(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function sunLon(T) {
    var L0 = 280.46646 + 36000.76983 * T, M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T) * Math.sin(rad(M)) + (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M)) + 0.000289 * Math.sin(rad(3 * M));
    return norm(L0 + C - 0.00569);
  }
  function moonLon(T) {
    var Lp = 218.3164477 + 481267.88123421 * T, D = 297.8501921 + 445267.1114034 * T,
        M = 357.5291092 + 35999.0502909 * T, Mp = 134.9633964 + 477198.8675055 * T, F = 93.272095 + 483202.0175233 * T;
    var s = function (a) { return Math.sin(rad(a)); };
    return norm(Lp + 6.288774 * s(Mp) + 1.274027 * s(2 * D - Mp) + 0.658314 * s(2 * D) + 0.213618 * s(2 * Mp)
      - 0.185116 * s(M) - 0.114332 * s(2 * F) + 0.058793 * s(2 * D - 2 * Mp) + 0.057066 * s(2 * D - M - Mp)
      + 0.053322 * s(2 * D + Mp) + 0.045758 * s(2 * D - M) - 0.040923 * s(M - Mp) - 0.034720 * s(D) - 0.030383 * s(M + Mp));
  }
  function tOf(ms) { return (ms / 86400000 + 2440587.5 - 2451545) / 36525; }
  function ayanamsa(T) { return 23.85306 + 1.3966 * T; }
  function elong(ms) { var T = tOf(ms); return norm(moonLon(T) - sunLon(T)); }
  function lunarMonth(ms, el) {
    var t = ms - (el / 12.19) * 86400000, i, d;
    for (i = 0; i < 5; i++) { d = elong(t); if (d > 180) d -= 360; t -= (d / 12.19) * 86400000; }
    var T = tOf(t), rashi = Math.floor(norm(sunLon(T) - ayanamsa(T)) / 30);
    return (rashi + 1) % 12;
  }
  function dayInfo(y, m, d) {
    var ms = Date.UTC(y, m, d, 1, 0, 0);
    var T = tOf(ms), el = elong(ms), t = Math.floor(el / 12) + 1, lm = lunarMonth(ms, el);
    return { y: y, m: m, d: d, t: t, el: el, lm: lm,
      nak: Math.floor(norm(moonLon(T) - ayanamsa(T)) / (360 / 27)),
      shaka: (m <= 2 && lm >= 8) ? y - 79 : y - 78,
      dow: new Date(Date.UTC(y, m, d)).getUTCDay() };
  }
  function tithiName(t) { if (t === 15) return 'पौर्णिमा'; if (t === 30) return 'अमावस्या'; return TITHI[(t - 1) % 15]; }
  function pakshaShort(t) { return t <= 15 ? 'शुद्ध' : 'वद्य'; }
  function dkey(o) { return o.y + '-' + ('0' + (o.m + 1)).slice(-2) + '-' + ('0' + o.d).slice(-2); }
  function fmtDate(o) { return mr(o.d) + ' ' + GMONTH[o.m] + ' ' + mr(o.y); }
  function inDays(n) { return n === 0 ? 'आज' : n === 1 ? 'उद्या' : mr(n) + ' दिवसांनी'; }

  /* प्रमुख संत-उत्सव / यात्रा : की = मराठी महिना-क्रमांक*100 + तिथी (चैत्र=०, कार्तिक=७; वद्य तिथी = १५ + क्रमांक) */
  var OBS = {
    11:   'चैत्री एकादशी — पंढरपूर यात्रा',
    311:  'आषाढी एकादशी — पंढरपूर वारी सोहळा',
    315:  'गुरुपौर्णिमा — सद्गुरू पूजन',
    328:  'संत नामदेव महाराज पुण्यतिथी — पंढरपूर',
    423:  'श्रीकृष्ण जन्माष्टमी व संत ज्ञानेश्वर जयंती',
    711:  'कार्तिकी एकादशी — पंढरपूर यात्रा',
    728:  'संत ज्ञानेश्वर महाराज संजीवन समाधी सोहळा — आळंदी',
    1011: 'माघी एकादशी — पंढरपूर यात्रा',
    1024: 'दासनवमी — समर्थ रामदास स्वामी पुण्यतिथी',
    1117: 'तुकाराम बीज — संत तुकाराम महाराज वैकुंठगमन, देहू',
    1121: 'नाथषष्ठी — संत एकनाथ महाराज समाधी सोहळा, पैठण'
  };
  function specialsFor(t, lm) {
    var out = [], k = lm * 100 + t;
    if (OBS[k]) out.push(OBS[k]);
    if ((t === 11 || t === 26) && !OBS[k]) out.push(pakshaShort(t) + ' एकादशी — उपवास व पांडुरंग उपासना');
    if (t === 19) out.push('संकष्टी चतुर्थी — गणेश उपासना');
    if (t === 15 && !OBS[k]) out.push('पौर्णिमा');
    if (t === 30) out.push('अमावस्या');
    return out;
  }
  function buildDays(y, m, d, n) {                       // [0]=काल, [1]=आज, …
    var arr = [], i, dt;
    for (i = -1; i <= n + 1; i++) { dt = new Date(Date.UTC(y, m, d + i)); arr.push(dayInfo(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())); }
    return arr;
  }
  function eventsOnDay(days, k) {
    var a = days[k], p = days[k - 1], n = days[k + 1], ts = [], ev = [];
    if (a.t !== p.t) ts.push({ t: a.t, lm: a.lm });
    if ((n.t - a.t + 30) % 30 === 2) { var s = a.t % 30 + 1; ts.push({ t: s, lm: s === 1 ? n.lm : a.lm }); }
    ts.forEach(function (x) {
      var major = OBS[x.lm * 100 + x.t];
      specialsFor(x.t, x.lm).forEach(function (nm) { ev.push({ name: nm, t: x.t, major: major === nm }); });
    });
    return ev;
  }
  /*ENGINE-END*/

  /* ------------------------------------------------------------------
   * CSV वाचक  (Excel / Google Sheet मधून "CSV UTF-8" म्हणून सेव्ह केलेली फाईल)
   * ------------------------------------------------------------------ */
  function parseCSV(t) {
    if (t.charCodeAt(0) === 0xFEFF) t = t.slice(1);
    var rows = [], row = [], f = '', q = false, i, c;
    for (i = 0; i < t.length; i++) {
      c = t.charAt(i);
      if (q) { if (c === '"') { if (t.charAt(i + 1) === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t.charAt(i + 1) === '\n') i++; row.push(f); f = ''; rows.push(row); row = []; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    if (!rows.length) return [];
    var head = rows.shift().map(function (h) { return h.trim().toLowerCase(); });
    return rows.filter(function (r) {
      return r.some(function (x) { return x.trim() !== ''; }) && r[0].trim().charAt(0) !== '#';    // '#' ने सुरू होणारी ओळ = टिप्पणी
    }).map(function (r) { var o = {}; head.forEach(function (h, k) { o[h] = (r[k] || '').trim(); }); return o; });
  }
  function normDate(s) {                                  // 2026-11-01 / 01-11-2026 / 1/11/2026 / देवनागरी अंक → YYYY-MM-DD
    s = asciiDigits(s || '').trim(); var m;
    if ((m = s.match(/^(\d{4})[\-\/.](\d{1,2})[\-\/.](\d{1,2})/))) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
    if ((m = s.match(/^(\d{1,2})[\-\/.](\d{1,2})[\-\/.](\d{4})/))) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    return '';
  }
  function load(url) {
    var u = url + (url.indexOf('?') > -1 ? '&' : '?') + 'v=' + todayKey.replace(/-/g, '');   // रोज नवी प्रत
    return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(parseCSV)
      .catch(function () { return null; });
  }

  /* ------------------------------------------------------------------ */
  var now = new Date(), Y = now.getFullYear(), M = now.getMonth(), D = now.getDate();
  var todayKey = Y + '-' + ('0' + (M + 1)).slice(-2) + '-' + ('0' + D).slice(-2);
  var HORIZON = 430;
  var days = buildDays(Y, M, D, HORIZON), td = days[1];
  var DEFAULT_DEITY = ['सूर्यनारायण','महादेव शंकर','श्री गणेश','श्री विठ्ठल-रखुमाई','दत्तगुरू व सद्गुरू','जगदंबा आई','श्री मारुतीराया'];

  var toastEl = $('#svToast'), toastT;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200); }

  Promise.all([load(CONFIG.panchang), load(CONFIG.vartha), load(CONFIG.abhang)]).then(function (r) {
    var pmap = {}; (r[0] || []).forEach(function (o) { var k = normDate(o.date); if (k) pmap[k] = o; });
    renderAll(pmap, r[1] || [], r[2]);
  });

  /* ---------------- अभंग निवड : तारीख > महिना+वार > फक्त वार ---------------- */
  function parseWd(s) {
    s = asciiDigits(s || '').trim().toLowerCase(); if (!s) return -1;
    if (/^\d$/.test(s)) return +s % 7;
    var i, ml = ['रवि','सोम','मंगळ','बुध','गुर','शुक्र','शनि'], en = ['sun','mon','tue','wed','thu','fri','sat'];
    for (i = 0; i < 7; i++) if (s.indexOf(ml[i]) === 0 || s.indexOf(en[i]) === 0) return i;
    return -1;
  }
  function monthMatch(cell, gm, lmName) {
    if (!cell) return false;
    var EN = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    return cell.split(/[;\/]/).some(function (p) {
      p = asciiDigits(p).trim(); if (!p) return false;
      if (/^\d{1,2}$/.test(p)) return +p === gm + 1;
      if (GMONTH.indexOf(p) > -1) return GMONTH.indexOf(p) === gm;
      if (EN.indexOf(p.toLowerCase().slice(0, 3)) > -1) return EN.indexOf(p.toLowerCase().slice(0, 3)) === gm;
      return p === lmName;                                          // मराठी (चांद्र) महिना : श्रावण, कार्तिक …
    });
  }
  function pickAbhang(rows, wd, gm, lmName, dateKey) {
    var i, o, best = null;
    if (dateKey) for (i = 0; i < rows.length; i++) if (normDate(rows[i].date) === dateKey) return rows[i];
    for (i = 0; i < rows.length; i++) { o = rows[i]; if (!normDate(o.date) && o.month && parseWd(o.weekday) === wd && monthMatch(o.month, gm, lmName)) return o; }
    for (i = 0; i < rows.length; i++) { o = rows[i]; if (!normDate(o.date) && !o.month && parseWd(o.weekday) === wd) { best = o; break; } }
    return best;
  }

  function renderAll(pmap, vrows, arows) {
    var prow = pmap[todayKey] || {};
    var lmName = LMONTH[td.lm];
    if (prow.marathi_date) LMONTH.forEach(function (n) { if (prow.marathi_date.indexOf(n) === 0) lmName = n; });

    /* ===== अभंग ===== */
    var tabRows = [], i, card = $('#svAbhang');
    if (arows) {
      for (i = 0; i < 7; i++) tabRows[i] = pickAbhang(arows, i, M, lmName, null);
      tabRows[td.dow] = pickAbhang(arows, td.dow, M, lmName, todayKey) || tabRows[td.dow];
    }
    var tabsEl = $('#svTabs'), panel = $('#svAbPanel');
    function renderAbhang(idx) {
      $$('.sv-tab', tabsEl).forEach(function (b, k) { var on = k === idx; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
      var a = tabRows[idx];
      if (!a) { panel.innerHTML = '<p class="sv-note">या दिवसाचा अभंग लवकरच प्रकाशित होईल.</p>'; return; }
      var verse = (a.verse || '').split('|').map(function (st) { return st.trim(); }).filter(Boolean).map(function (st) {
        var parts = st.split(' । ');
        return '<p>' + parts.map(function (x, j) { return '<span>' + esc(x) + (j < parts.length - 1 ? ' ।' : '') + '</span>'; }).join('') + '</p>';
      }).join('');
      var deity = a.deity || DEFAULT_DEITY[idx];
      var href = safeHref(a.link);
      panel.innerHTML =
        '<div class="sv-chips"><span class="sv-chip hot">' + esc(WEEK[idx]) + ' · ' + esc(deity) + '</span>' +
          (a.saint ? '<span class="sv-chip">' + esc(a.saint) + '</span>' : '') + (a.form ? '<span class="sv-chip">' + esc(a.form) + '</span>' : '') + '</div>' +
        '<blockquote class="sv-verse" lang="mr">' + verse + '</blockquote>' +
        (a.meaning ? '<div class="sv-mean"><h3>सार्थ भावार्थ' + (a.theme ? ' — ' + esc(a.theme) : '') + '</h3><p>' + esc(a.meaning) + '</p></div>' : '') +
        (a.source ? '<p class="sv-src">— ' + esc(a.source) + '</p>' : '') +
        '<div class="sv-actions">' +
          '<a class="btn-card sv-wa" id="svWa" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i> WhatsApp वर पाठवा</a>' +
          '<button type="button" class="btn-card btn-charitra" id="svCopy"><i class="fa-regular fa-copy"></i> कॉपी करा</button>' +
          (href ? '<a class="btn-kshetra" href="' + esc(href) + '"><i class="fa-solid fa-book-open"></i> ' + esc(a.link_text || 'पूर्ण वाचा') + '</a>' : '') +
        '</div>';
      var txt = '🙏 आजचा पावन अभंग — ' + WEEK[idx] + ' (' + deity + ')\n\n' +
        (a.verse || '').split('|').map(function (s) { return s.trim().split(' । ').join('\n'); }).join('\n\n') +
        (a.source ? '\n\n— ' + a.source : '') + (a.meaning ? '\n\nभावार्थ: ' + a.meaning : '') + '\n\n॥ रामकृष्ण हरी ॥\nसंतवाणी: ' + CONFIG.siteUrl;
      $('#svWa').href = 'https://wa.me/?text=' + encodeURIComponent(txt);
      $('#svCopy').addEventListener('click', function () {
        var done = function () { toast('✔ अभंग कॉपी झाला — आता कुठेही पेस्ट करा'); };
        var fail = function () { toast('कॉपी करता आले नाही; कृपया मजकूर निवडून कॉपी करा'); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fail);
        else { var ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? done() : fail(); } catch (e) { fail(); } document.body.removeChild(ta); }
      });
    }
    WEEK_S.forEach(function (w, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sv-tab' + (k === td.dow ? ' today' : ''); b.id = 'svTab' + k; b.setAttribute('role', 'tab'); b.textContent = w;
      if (!tabRows[k]) b.disabled = true;
      b.addEventListener('click', function () { renderAbhang(k); });
      b.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? (k + 1) % 7 : e.key === 'ArrowLeft' ? (k + 6) % 7 : -1;
        if (n > -1 && !tabRows[n]) n = -1;
        if (n > -1) { e.preventDefault(); renderAbhang(n); $('#svTab' + n).focus(); }
      });
      tabsEl.appendChild(b);
    });
    renderAbhang(td.dow);

    /* ===== पंचांग ===== */
    var todayAb = tabRows[td.dow];
    var autoMarathi = LMONTH[td.lm] + ' ' + pakshaShort(td.t) + ' ' + tithiName(td.t) + ', शके ' + mr(td.shaka);
    var autoTithi = pakshaShort(td.t) + ' ' + tithiName(td.t);
    var frac = (td.el % 12) / 12, manualTithi = !!prow.tithi;
    $('#svPnDate').textContent = WEEK[td.dow] + ', ' + fmtDate(td);
    $('#svPnMarathi').textContent = prow.marathi_date || autoMarathi;
    $('#svPnVar').textContent = WEEK[td.dow];
    $('#svPnTithi').textContent = prow.tithi || (autoTithi + ' (' + mr(Math.round(frac * 100)) + '% पूर्ण)');
    $('#svPnNak').textContent = prow.nakshatra || NAK[td.nak];
    $('#svPnSmaran').textContent = prow.smaran || ((todayAb && todayAb.deity) || DEFAULT_DEITY[td.dow]) + (todayAb && todayAb.saint ? ' · ' + todayAb.saint : '');
    $('#svMoon').textContent = MOONS[Math.floor(((td.el + 22.5) % 360) / 45)];
    if (manualTithi) $('#svBarWrap').classList.add('sv-hidden');
    else requestAnimationFrame(function () { $('#svBar').style.width = Math.round(frac * 100) + '%'; });
    var todaySp = prow.vishesh ? [prow.vishesh] : eventsOnDay(days, 1).map(function (e) { return e.name; });
    if (todaySp.length) { var sp = $('#svSpecial'); sp.textContent = '🪔 आजचे विशेष: ' + todaySp.join(' · '); sp.classList.add('on'); }
    $('#svPnNote').textContent = (prow.tithi || prow.nakshatra || prow.marathi_date)
      ? '* पंचांग माहिती संतवाणी संपादकाने दिलेली.'
      : '* सूर्योदयकालीन (सु. ६:३० IST) खगोलीय गणिताने काढलेली अंदाजे माहिती. अधिकमास/क्षयतिथी व स्थानपरत्वे फरक संभवतो; व्रत-मुहूर्तासाठी स्थानिक पंचांग पाहा.';

    /* आगामी एकादशी / सण / यात्रा (शीटमधील "विशेष" ओळी प्राधान्याने) */
    var ups = [], seen = {}, ekDone = false, k, dk, man;
    for (k = 1; k <= HORIZON && ups.length < 8; k++) {
      dk = dkey(days[k]); man = pmap[dk] && pmap[dk].vishesh;
      if (man) { ups.push({ k: k, name: man }); continue; }
      eventsOnDay(days, k).forEach(function (e) {
        var nm = e.name.split(' — ')[0];
        if (!ekDone && (e.t === 11 || e.t === 26)) { ekDone = true; ups.push({ k: k, name: nm }); }
        else if (e.major && !seen[e.name]) { seen[e.name] = 1; ups.push({ k: k, name: nm }); }
      });
    }
    $('#svNext').innerHTML = ups.slice(0, 4).map(function (u) {
      return '<li><span>' + esc(u.name) + '</span><em>' + fmtDate(days[u.k]) + ' · ' + inDays(u.k - 1) + '</em></li>';
    }).join('');

    /* ===== वार्ता फलक ===== */
    var items = [];
    if (CONFIG.showAutoUpcoming) {
      items.push('<b>आज</b> — ' + WEEK[td.dow] + ', ' + esc(prow.marathi_date || autoMarathi));
      ups.slice(0, 3).forEach(function (u) { items.push('<b>' + esc(u.name) + '</b> — ' + fmtDate(days[u.k]) + ' (' + inDays(u.k - 1) + ')'); });
    }
    vrows.forEach(function (o) {
      var f = normDate(o.from), t = normDate(o.to);
      if ((f && todayKey < f) || (t && todayKey > t) || !o.text) return;
      var href = safeHref(o.link), txt = href ? '<a href="' + esc(href) + '">' + esc(o.text) + '</a>' : esc(o.text);
      items.push((o.tag ? '<b>' + esc(o.tag) + '</b> — ' : '') + txt);
    });
    if (!items.length) items.push('॥ जय जय विठ्ठल रखुमाई ॥');
    var group = items.map(function (h) { return '<span class="sv-tk-item">' + h + '</span><span class="sv-tk-sep" aria-hidden="true">✦</span>'; }).join('');
    var track = $('#svTkTrack');
    track.innerHTML = '<div class="sv-tk-group">' + group + '</div><div class="sv-tk-group" aria-hidden="true">' + group + '</div>';
    var w = track.firstChild.getBoundingClientRect().width || 2000;
    track.style.setProperty('--tk-dur', Math.max(35, Math.round(w / 55)) + 's');
    var tk = $('#svTicker'), btn = $('#svTkBtn');
    btn.addEventListener('click', function () {
      var p = tk.classList.toggle('paused'); btn.setAttribute('aria-pressed', p);
      btn.innerHTML = p ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
    });
  }
})();
