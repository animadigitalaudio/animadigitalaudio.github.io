/* =====================================================================
   Anima Digital Audio — site behaviour
   EDIT THE SETTINGS BELOW: prices, checkout links and downloads live here only.
   Pages: index.html (studio + line-up), easy-wizard.html, dissolve.html, alloy.html,
   activate.html, terms / privacy / refund.html
   ===================================================================== */

const SITE = {
  // License activation server (Cloudflare Worker), used by activate.html.
  activateUrl: "https://ewf-activate.pinqsnake.workers.dev",

  // Support / contact address (header, footer, legal pages).
  supportEmail: "support@animadigitalaudio.com",

  // Name shown as the seller in the Terms and Privacy pages (legal name of a sole proprietor).
  legalName: "Anima Digital Audio",

  // One entry per plug-in.
  //   checkoutUrl  Creem: Products -> <product> -> Share -> payment link. "" = buttons say "Coming soon".
  //   price        current price. oldPrice = crossed-out price ("" = no sale shown).
  //   downloadWindows / downloadMac  free-trial installers (same files as the full version). "" = "coming soon".
  products: {
    easywizard: {
      checkoutUrl: "https://www.creem.io/payment/prod_50AVJ7uVJwtvuwPqLZERGb",
      price: "$29.99",
      oldPrice: "$49.99",
      downloadWindows: "downloads/EasyWizard-1.0.0-Windows-Setup.exe",
      downloadMac: "downloads/EasyWizard-1.0.0-macOS.zip"
    },
    dissolve: {
      checkoutUrl: "https://www.creem.io/payment/prod_5SiVbdrITi9Vqr2mFnhYOk",
      price: "$24.99",
      oldPrice: "$39.99",
      downloadWindows: "",   // e.g. downloads/ADA-Dissolve-0.2.0-Windows-Setup.exe
      downloadMac: ""        // e.g. downloads/ADA-Dissolve-0.2.0-macOS.zip
    },
    alloy: {
      checkoutUrl: "https://www.creem.io/payment/prod_6RmcYrAlz7F8Z1ict4s4ue",
      price: "$24.99",
      oldPrice: "",
      downloadWindows: "downloads/ADA-ALLOY-1.0.0-Windows-Setup.exe",
      downloadMac: "downloads/ADA-ALLOY-1.0.0-macOS.zip"
    }
  }
};

// the plug-in this page is about (body data-product); elements can name another one with data-of="..."
const PAGE_PRODUCT = (document.body && document.body.getAttribute("data-product")) || "";
function productOf (el) {
  var o = el.closest("[data-of]");
  return SITE.products[(o && o.getAttribute("data-of")) || PAGE_PRODUCT] || null;
}

document.documentElement.classList.remove("no-js");

/* ---------- configuration -> page ---------- */
(function applyConfig () {
  document.querySelectorAll("[data-checkout]").forEach(function (a) {
    var p = productOf(a);
    if (!p) return;
    if (p.checkoutUrl) {
      a.href = p.checkoutUrl;
      a.rel = "noopener";
    } else {
      a.classList.add("is-soon");
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      var label = a.querySelector("[data-label]") || a;
      label.textContent = "Coming soon";
    }
  });

  document.querySelectorAll("[data-price]").forEach(function (el) {
    var p = productOf(el); if (p && p.price) el.textContent = p.price;
  });
  document.querySelectorAll("[data-price-old]").forEach(function (el) {
    var p = productOf(el); if (!p) return;
    var now = parseFloat(String(p.price).replace(/[^0-9.]/g, ""));
    var was = parseFloat(String(p.oldPrice).replace(/[^0-9.]/g, ""));
    if (p.oldPrice && was > now) el.innerHTML = "<s>" + p.oldPrice + "</s>";
    else el.remove();
  });
  document.querySelectorAll("[data-price-note]").forEach(function (el) {
    var p = productOf(el); if (!p) return;
    var now = parseFloat(String(p.price).replace(/[^0-9.]/g, ""));
    var was = parseFloat(String(p.oldPrice).replace(/[^0-9.]/g, ""));
    if (p.oldPrice && was > now) el.textContent = "Launch price, " + Math.round((1 - now / was) * 100) + "% off the regular " + p.oldPrice + ".";
    else el.remove();
  });

  document.querySelectorAll("[data-download]").forEach(function (a) {
    var p = productOf(a); if (!p) return;
    var url = a.getAttribute("data-download") === "mac" ? p.downloadMac : p.downloadWindows;
    if (url) {
      a.href = url;
      a.setAttribute("download", "");
    } else {
      a.classList.add("is-soon");
      a.removeAttribute("href");
      var em = a.querySelector("em"); if (em) em.textContent = "Coming soon";
    }
  });

  document.querySelectorAll("[data-email]").forEach(function (el) {
    el.textContent = SITE.supportEmail;
    if (el.tagName === "A") el.href = "mailto:" + SITE.supportEmail;
  });
  document.querySelectorAll("[data-legal-name]").forEach(function (el) { el.textContent = SITE.legalName; });
})();

/* ---------- mobile menu ---------- */
(function menu () {
  var top = document.querySelector(".top");
  var toggle = document.querySelector(".menu-toggle");
  if (!top || !toggle) return;
  function setOpen (open) {
    top.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  }
  toggle.addEventListener("click", function () { setOpen(!top.classList.contains("is-open")); });
  top.querySelectorAll(".menu a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
})();

/* ---------- home: the line-up switcher ---------- */
(function lineup () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".plate-tab"));
  if (!tabs.length) return;
  var colours = { easywizard: "var(--ew)", dissolve: "var(--dissolve)", alloy: "var(--alloy)" };
  function select (tab, focus) {
    var key = tab.getAttribute("data-key");
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".stage__frame img").forEach(function (img) { img.classList.toggle("is-on", img.getAttribute("data-key") === key); });
    document.querySelectorAll(".stage__panel").forEach(function (p) { p.hidden = p.getAttribute("data-of") !== key; });
    document.body.style.setProperty("--accent", colours[key]);
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var d = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : (e.key === "ArrowUp" || e.key === "ArrowLeft") ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
  select(tabs[0]);
})();

/* ---------- product page: Synth / Fx screenshot switch ---------- */
(function shots () {
  var tabs = document.querySelectorAll(".shot-switch [data-shot]");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-shot");
      tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t === tab)); });
      document.querySelectorAll(".frame .shot").forEach(function (img) { img.classList.toggle("is-active", img.getAttribute("data-shot") === key); });
    });
  });
})();

/* ---------- copy buttons (Mac commands) ---------- */
(function copy () {
  document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-copy-target"));
      if (!el) return;
      var text = el.innerText.trim();
      var done = function () { btn.textContent = "Copied"; toast("Copied. Paste it into Terminal."); setTimeout(function () { btn.textContent = "Copy"; }, 1800); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
      function fallback () {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        toast("Press Ctrl/⌘ + C to copy");
      }
    });
  });
})();

/* ---------- toast ---------- */
var toastTimer;
function toast (msg) {
  var t = document.querySelector(".toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2400);
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
      name: "Easy Wizard", colour: "var(--ew)",
      sub: "One license unlocks Easy Wizard (Synth) and Easy Wizard (Fx) on one computer.",
      hwid: "In the plug-in, click the <strong>TRIAL MODE</strong> badge, then <strong>COPY</strong>. Use the Hardware ID of the computer you make music on: one license activates one computer.",
      next: "Open Easy Wizard, click <strong>TRIAL MODE</strong> → <strong>LOAD LICENSE FILE</strong> and choose <code>license.lic</code> (usually in your Downloads folder). Both plug-ins are now unlocked."
    },
    dissolve: {
      name: "ADA Dissolve", colour: "var(--dissolve)",
      sub: "One license unlocks ADA Dissolve on one computer. If that computer is online, you can also activate inside the plug-in: TRIAL → name and key → ACTIVATE.",
      hwid: "In the plug-in, click <strong>TRIAL</strong> at the top, then <strong>COPY</strong> next to the Hardware ID. Use the Hardware ID of the computer you make music on: one license activates one computer.",
      next: "Open ADA Dissolve, click <strong>TRIAL</strong> → <strong>LOAD LICENSE FILE</strong> and choose <code>license.lic</code> (usually in your Downloads folder). It unlocks at once."
    },
    alloy: {
      name: "ADA ALLOY", colour: "var(--alloy)",
      sub: "One license unlocks ADA ALLOY on one computer. If that computer is online, you can also activate inside the plug-in: TRIAL → name and key → ACTIVATE.",
      hwid: "In the plug-in, click <strong>TRIAL</strong> at the top, then <strong>COPY</strong> next to the Hardware ID. Use the Hardware ID of the computer you make music on: one license activates one computer.",
      next: "Open ADA ALLOY, click <strong>TRIAL</strong> → <strong>LOAD LICENSE FILE...</strong> and choose <code>license.lic</code> (usually in your Downloads folder). It unlocks at once."
    }
  };
  function product () { var r = form.querySelector("input[name=product]:checked"); return r ? r.value : "easywizard"; }
  function showProduct () {
    var t = TEXT[product()];
    document.querySelectorAll("[data-act-product]").forEach(function (el) { el.textContent = t.name; });
    [["[data-act-sub]", "sub"], ["[data-act-hwid]", "hwid"], ["[data-act-next]", "next"]].forEach(function (x) {
      var el = document.querySelector(x[0]); if (el) el.innerHTML = t[x[1]];
    });
    document.body.style.setProperty("--accent", t.colour);
  }
  ["dissolve", "alloy", "easywizard"].forEach(function (k) {
    if (q.get("product") === k) form.querySelector("input[value=" + k + "]").checked = true;
  });
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
    if (!key) return say("Enter the license key from your purchase e-mail.", "error");
    if (hex.length !== 20) return say("The Hardware ID looks like 1A2B-3C4D-5E6F-7A8B-9C0D. Click COPY in the plug-in and paste it here.", "error");
    if (!name) return say("Enter your name: it is shown in the plug-in as “Licensed to”.", "error");

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
          : "The activation server didn't answer. Check your internet connection and try again.", "error");
    }).then(function () { btn.disabled = false; });
  });
})();
