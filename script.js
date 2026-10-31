/* =====================================================================
   Easy Wizard — site behaviour
   EDIT THE SETTINGS BELOW before publishing.
   ===================================================================== */

const SITE = {
  // Creem: Products → Easy Wizard → Share → copy the payment link and paste it here
  // (looks like https://www.creem.io/payment/prod_...). Empty = Buy buttons scroll to the pricing card.
  checkoutUrl: "",

  // Pricing card: current price, old (crossed-out) price and the discount badge.
  // Set oldPrice to "" when the sale ends (the crossed-out price and the badge disappear).
  price: "$29.99",
  oldPrice: "$49.99",

  // Direct download links for the free 14-day demo (same installers as the full version).
  downloadWindows: "",   // e.g. link to EasyWizard-1.0.0-Windows-Setup.exe
  downloadMac: "",       // e.g. link to EasyWizard-1.0.0-macOS.zip

  // Support / contact address (footer link and the legal pages).
  supportEmail: "support@animadigitalaudio.com",

  // Name shown as the seller in the Terms and Privacy pages (legal name of a sole proprietor).
  legalName: "Anima Digital Audio"
};

document.documentElement.classList.remove("no-js");

/* ---------- configuration → page ---------- */
(function applyConfig () {
  // Buy buttons → Creem checkout page (or scroll to the pricing card while no link is set)
  if (SITE.checkoutUrl) {
    document.querySelectorAll("[data-checkout]").forEach(function (a) {
      a.href = SITE.checkoutUrl;
      a.rel = "noopener";
    });
  }

  var price = document.querySelector("[data-price]");
  var oldPrice = document.querySelector("[data-price-old]");
  var badge = document.querySelector("[data-price-badge]");
  var note = document.querySelector(".price__note");
  if (price && SITE.price) price.textContent = SITE.price;
  var now = parseFloat(String(SITE.price).replace(/[^0-9.]/g, ""));
  var was = parseFloat(String(SITE.oldPrice).replace(/[^0-9.]/g, ""));
  if (SITE.oldPrice && was > now) {
    if (oldPrice) oldPrice.innerHTML = "<s>" + SITE.oldPrice + "</s>";
    if (badge) badge.textContent = "\u2212" + Math.round((1 - now / was) * 100) + "%";
  } else {
    [oldPrice, badge, note].forEach(function (el) { if (el) el.remove(); });
  }

  var downloads = { win: SITE.downloadWindows, mac: SITE.downloadMac };
  document.querySelectorAll("[data-download]").forEach(function (a) {
    var url = downloads[a.getAttribute("data-download")];
    if (url) {
      a.href = url;
      a.setAttribute("download", "");
    } else {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        toast("Download coming soon");
      });
    }
  });

  document.querySelectorAll("[data-support]").forEach(function (a) {
    if (SITE.supportEmail) a.href = "mailto:" + SITE.supportEmail;
    else a.href = (document.getElementById("activation") ? "" : "index.html") + "#activation";
  });
  // legal pages: e-mail and seller name in one place
  document.querySelectorAll("[data-email]").forEach(function (el) {
    if (!SITE.supportEmail) return;
    el.textContent = SITE.supportEmail;
    if (el.tagName === "A") el.href = "mailto:" + SITE.supportEmail;
  });
  document.querySelectorAll("[data-legal-name]").forEach(function (el) { el.textContent = SITE.legalName; });
  // "by <legal name>" is only shown when it differs from the brand
  document.querySelectorAll("[data-legal-wrap]").forEach(function (el) {
    if (SITE.legalName === "Anima Digital Audio") el.remove();
  });
})();

/* ---------- header: background on scroll + mobile menu ---------- */
(function nav () {
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (!nav) return;

  function onScroll () { nav.classList.toggle("is-scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setOpen (open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
  nav.querySelectorAll(".nav__links a").forEach(function (a) {
    a.addEventListener("click", function () { setOpen(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

  // highlight the section in view
  var links = Array.prototype.slice.call(nav.querySelectorAll('.nav__links a[href^="#"]:not(.btn)'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a, i) { a.classList.toggle("is-current", sections[i] === en.target); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }
})();

/* ---------- hero screenshot switch (Synth / Fx) ---------- */
(function shots () {
  var tabs = document.querySelectorAll(".shot-switch [data-shot]");
  var imgs = document.querySelectorAll(".shot-frame .shot");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-shot");
      tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t === tab)); });
      imgs.forEach(function (img) { img.classList.toggle("is-active", img.getAttribute("data-shot") === key); });
    });
  });
})();

/* ---------- Wizard Chaos cube: click = roll ---------- */
(function cube () {
  var btn = document.querySelector(".wcube");
  if (!btn) return;
  var body = btn.querySelector(".wcube__body");
  var x = 0, y = 0;
  btn.addEventListener("click", function () {
    // 2-3 full turns plus a random face, like a real throw
    x += 360 * (2 + Math.floor(Math.random() * 2)) + 90 * Math.floor(Math.random() * 4);
    y += 360 * (2 + Math.floor(Math.random() * 2)) + 90 * Math.floor(Math.random() * 4);
    body.style.transform = "rotateX(" + x + "deg) rotateY(" + y + "deg)";
  });
})();

/* ---------- reveal on scroll ---------- */
(function reveal () {
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 70 + "ms";
    io.observe(el);
  });
})();

/* ---------- copy buttons ---------- */
(function copy () {
  document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-copy-target"));
      if (!el) return;
      var text = el.innerText.trim();
      write(text).then(function () {
        btn.classList.add("is-done");
        btn.textContent = "Copied";
        toast("Copied — paste it into Terminal");
        setTimeout(function () { btn.classList.remove("is-done"); btn.textContent = "Copy"; }, 1800);
      }, function () {
        selectText(el);
        toast("Press Ctrl/⌘ + C to copy");
      });
    });
  });

  function write (text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  function selectText (el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
})();

/* ---------- toast ---------- */
var toastTimer;
function toast (msg) {
  var t = document.querySelector(".toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2200);
}
