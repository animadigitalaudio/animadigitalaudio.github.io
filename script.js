/* =====================================================================
   Anima Digital Audio — site behaviour (Easy Wizard: index.html, ADA Dissolve: dissolve.html, ADA ALLOY: alloy.html)
   EDIT THE SETTINGS BELOW before publishing.
   ===================================================================== */

const SITE = {
  // Creem: Products → Easy Wizard → Share → copy the payment link and paste it here
  // (looks like https://www.creem.io/payment/prod_...). Empty = Buy buttons scroll to the pricing card.
  checkoutUrl: "https://www.creem.io/payment/prod_50AVJ7uVJwtvuwPqLZERGb",

  // Pricing card: current price, old (crossed-out) price and the discount badge.
  // Set oldPrice to "" when the sale ends (the crossed-out price and the badge disappear).
  price: "$29.99",
  oldPrice: "$49.99",

  // Direct download links for the free demo (60 minutes of play; same installers as the full version).
  downloadWindows: "downloads/EasyWizard-1.0.0-Windows-Setup.exe",   // e.g. link to EasyWizard-1.0.0-Windows-Setup.exe
  downloadMac: "downloads/EasyWizard-1.0.0-macOS.zip",       // e.g. link to EasyWizard-1.0.0-macOS.zip

  // License activation server (Cloudflare Worker), used by activate.html.
  activateUrl: "https://ewf-activate.pinqsnake.workers.dev",

  // Support / contact address (footer link and the legal pages).
  supportEmail: "support@animadigitalaudio.com",

  // Name shown as the seller in the Terms and Privacy pages (legal name of a sole proprietor).
  legalName: "Anima Digital Audio",

  // ADA Dissolve (dissolve.html) - its own checkout, price and downloads. Empty values:
  // checkoutUrl "" -> Buy buttons say "coming soon", price "" -> "Coming soon", downloads "" -> "coming soon".
  dissolve: {
    // Creem: Products -> ADA Dissolve -> Share -> payment link (https://www.creem.io/payment/prod_...)
    checkoutUrl: "https://www.creem.io/payment/prod_5SiVbdrITi9Vqr2mFnhYOk",
    price: "$24.99",
    oldPrice: "$39.99",
    downloadWindows: "",   // e.g. downloads/ADA-Dissolve-0.2.0-Windows-Setup.exe
    downloadMac: ""        // e.g. downloads/ADA-Dissolve-0.2.0-macOS.zip
  },

  // ADA ALLOY (alloy.html) - its own checkout, price and downloads (same rules as above)
  alloy: {
    // Creem: Products -> ADA ALLOY -> Share -> payment link (https://www.creem.io/payment/prod_...)
    checkoutUrl: "",
    price: "",
    oldPrice: "",
    downloadWindows: "",   // downloads/ADA-ALLOY-1.0.0-Windows-Setup.exe
    downloadMac: ""        // downloads/ADA-ALLOY-1.0.0-macOS.zip
  }
};

// the settings of the product this page is about
const PAGE_PRODUCT = document.body ? document.body.getAttribute("data-product") : "";
const PRODUCT = PAGE_PRODUCT === "dissolve" ? Object.assign({}, SITE, SITE.dissolve, { key: "dissolve" })
              : PAGE_PRODUCT === "alloy"    ? Object.assign({}, SITE, SITE.alloy, { key: "alloy" })
              : Object.assign({}, SITE, { key: "easywizard" });

document.documentElement.classList.remove("no-js");

/* ---------- configuration → page ---------- */
(function applyConfig () {
  // Buy buttons → Creem checkout page (or scroll to the pricing card while no link is set)
  document.querySelectorAll("[data-checkout]").forEach(function (a) {
    if (PRODUCT.checkoutUrl) {
      a.href = PRODUCT.checkoutUrl;
      a.rel = "noopener";
    } else if (PRODUCT.key === "dissolve" || PRODUCT.key === "alloy") {
      a.addEventListener("click", function (e) {
        if (!a.closest(".nav") && !a.closest(".hero")) e.preventDefault();   // the card's own button
        toast("Checkout opens soon — write to " + SITE.supportEmail + " to reserve your license");
      });
    }
  });

  var price = document.querySelector("[data-price]");
  var oldPrice = document.querySelector("[data-price-old]");
  var badge = document.querySelector("[data-price-badge]");
  var note = document.querySelector(".price__note");
  if (price && PRODUCT.price) price.textContent = PRODUCT.price;
  var now = parseFloat(String(PRODUCT.price).replace(/[^0-9.]/g, ""));
  var was = parseFloat(String(PRODUCT.oldPrice).replace(/[^0-9.]/g, ""));
  if (PRODUCT.oldPrice && was > now) {
    if (oldPrice) oldPrice.innerHTML = "<s>" + PRODUCT.oldPrice + "</s>";
    if (badge) badge.textContent = "\u2212" + Math.round((1 - now / was) * 100) + "%";
  } else {
    [oldPrice, badge, note].forEach(function (el) { if (el) el.remove(); });
  }

  var downloads = { win: PRODUCT.downloadWindows, mac: PRODUCT.downloadMac };
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
  }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
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

/* ---------- activation page ---------- */
(function activation () {
  var form = document.getElementById("act");
  if (!form) return;
  var msg = form.querySelector(".act__msg");
  var btn = form.querySelector("button[type=submit]");
  var done = document.getElementById("act-done");
  var again = document.getElementById("act-again");
  var blobUrl = "";

  // ?key=... pre-fills the key, ?product=dissolve / ?product=alloy picks that plug-in
  var q = new URLSearchParams(location.search);
  if (q.get("key")) form.key.value = q.get("key");
  var TEXT = {
    easywizard: {
      name: "Easy Wizard",
      sub: "One license unlocks Easy Wizard (Synth) and Easy Wizard (Fx) on one computer.",
      hwid: "In the plug-in: click the <strong>TRIAL MODE</strong> badge → <strong>COPY</strong>. Use the Hardware ID of the computer you make music on — one license activates one computer.",
      next: "Now open Easy Wizard, click <strong>TRIAL MODE</strong> → <strong>LOAD LICENSE FILE</strong> and select <code>license.lic</code> (usually in your Downloads folder). Done — both plug-ins are unlocked."
    },
    dissolve: {
      name: "ADA Dissolve",
      sub: "One license unlocks ADA Dissolve on one computer. With internet on that computer you can also activate right in the plug-in: TRIAL → name + key → ACTIVATE.",
      hwid: "In the plug-in: click <strong>TRIAL</strong> at the top → <strong>COPY</strong> next to the Hardware ID. Use the Hardware ID of the computer you make music on — one license activates one computer.",
      next: "Now open ADA Dissolve, click <strong>TRIAL</strong> → <strong>LOAD LICENSE FILE</strong> and select <code>license.lic</code> (usually in your Downloads folder). Done — it unlocks at once."
    },
    alloy: {
      name: "ADA ALLOY",
      sub: "One license unlocks ADA ALLOY on one computer. With internet on that computer you can also activate right in the plug-in: TRIAL → name + key → ACTIVATE.",
      hwid: "In the plug-in: click <strong>TRIAL</strong> at the top → <strong>COPY</strong> next to the Hardware ID. Use the Hardware ID of the computer you make music on — one license activates one computer.",
      next: "Now open ADA ALLOY, click <strong>TRIAL</strong> → <strong>LOAD LICENSE FILE...</strong> and select <code>license.lic</code> (usually in your Downloads folder). Done — it unlocks at once."
    }
  };
  function product () { var r = form.querySelector("input[name=product]:checked"); return r ? r.value : "easywizard"; }
  function showProduct () {
    var t = TEXT[product()];
    document.querySelectorAll("[data-act-product]").forEach(function (el) { el.textContent = t.name; });
    [["[data-act-sub]", "sub"], ["[data-act-hwid]", "hwid"], ["[data-act-next]", "next"]].forEach(function (x) {
      var el = document.querySelector(x[0]); if (el) el.innerHTML = t[x[1]];
    });
    document.documentElement.classList.toggle("theme-dissolve", product() === "dissolve");
    document.documentElement.classList.toggle("theme-alloy", product() === "alloy");
  }
  if (q.get("product") === "dissolve") form.querySelector("input[value=dissolve]").checked = true;
  if (q.get("product") === "alloy") form.querySelector("input[value=alloy]").checked = true;
  form.querySelectorAll("input[name=product]").forEach(function (r) { r.addEventListener("change", showProduct); });
  showProduct();

  function say (text, kind) {
    msg.textContent = text;
    msg.className = "act__msg" + (kind ? " is-" + kind : "");
  }
  function save () {
    var a = document.createElement("a");
    a.href = blobUrl;
    a.download = "license.lic";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  again.addEventListener("click", function (e) { e.preventDefault(); if (blobUrl) save(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var key = form.key.value.trim(), hwid = form.hwid.value.trim(), name = form.name.value.trim();
    var hex = hwid.replace(/[^0-9a-fA-F]/g, "");
    if (!key) return say("Please enter your license key.", "error");
    if (hex.length !== 20) return say("The Hardware ID must look like 1A2B-3C4D-5E6F-7A8B-9C0D — click COPY in the plug-in.", "error");
    if (!name) return say("Please enter your name.", "error");
    if (!SITE.activateUrl) return say("Online activation is being set up — please e-mail " + SITE.supportEmail + " with your order number and Hardware ID.", "error");

    btn.disabled = true;
    say("Activating…");
    fetch(SITE.activateUrl.replace(/\/$/, "") + "/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key, hwid: hwid, name: name, product: product() === "easywizard" ? "" : product() })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) throw new Error(j.error || "Activation failed.");
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = URL.createObjectURL(new Blob([j.license], { type: "application/octet-stream" }));
      save();
      say("Activated for " + j.hwid + ".", "ok");
      done.classList.add("is-on");
      done.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }).catch(function (err) {
      say(err && err.message && err.message !== "Failed to fetch" ? err.message
          : "Could not reach the activation server. Please check your connection and try again.", "error");
    }).then(function () { btn.disabled = false; });
  });
})();
