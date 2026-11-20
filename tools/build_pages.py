#!/usr/bin/env python3
"""Builds the static pages of animadigitalaudio.com from one template.
Run from the repo root:  python3 tools/build_pages.py
Prices, checkout links and downloads are NOT here: they live in script.js (SITE)."""

import html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape

PRODUCTS = [
    ("easywizard", "Easy Wizard", "easy-wizard.html", "assets/ada-easy-wizard.png", "--ew"),
    ("dissolve", "ADA Dissolve", "dissolve.html", "assets/ada-dissolve.png", "--dissolve"),
    ("alloy", "ADA ALLOY", "alloy.html", "assets/ada-alloy.png", "--alloy"),
]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">')


def head(title, desc, favicon="assets/favicon-studio.png", touch="assets/apple-touch-icon-studio.png",
         og_image="https://animadigitalaudio.com/assets/covers/easy-wizard-cover-wide.jpg", url="https://animadigitalaudio.com/",
         robots=""):
    return f"""<!doctype html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{E(title)}</title>
  <meta name="description" content="{E(desc)}">
  <meta name="theme-color" content="#1c1b1f">{robots}
  <meta property="og:type" content="website">
  <meta property="og:title" content="{E(title)}">
  <meta property="og:description" content="{E(desc)}">
  <meta property="og:image" content="{og_image}">
  <meta property="og:url" content="{url}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="{favicon}">
  <link rel="apple-touch-icon" href="{touch}">
  {FONTS}
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
"""


def header(current=""):
    links = []
    for key, name, href, _, var in PRODUCTS:
        cur = ' aria-current="page"' if current == key else ""
        links.append(f'<a class="plugin-link" href="{href}" style="--c: var({var})"{cur}><i></i>{name}</a>')
    act = ' aria-current="page"' if current == "activate" else ""
    return f"""<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap top__in">
    <a class="brand" href="index.html"><img src="assets/ada-studio.png" alt="" width="34" height="34"><span>Anima Digital Audio</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav class="menu" id="menu" aria-label="Main">
      {' '.join(links)}
      <a href="activate.html"{act}>Activate</a>
      <a href="index.html#support">Support</a>
    </nav>
  </div>
</header>
"""


def footer():
    plugs = "".join(f'<li><a href="{h}">{n}</a></li>' for _, n, h, _, _ in PRODUCTS)
    return f"""<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <a class="brand" href="index.html"><img src="assets/ada-studio.png" alt="" width="34" height="34" loading="lazy"><span style="color: var(--bone)">Anima Digital Audio</span></a>
        <p style="margin-top: 14px; max-width: 26em">Independent audio plug-ins for Windows and macOS. Try each one for an hour of play before you buy.</p>
      </div>
      <div><h4>Plug-ins</h4><ul>{plugs}</ul></div>
      <div><h4>Help</h4><ul><li><a href="activate.html">Activate a license</a></li><li><a data-email href="mailto:support@animadigitalaudio.com">support@animadigitalaudio.com</a></li></ul></div>
      <div><h4>Legal</h4><ul><li><a href="terms.html">Terms</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="refund.html">Refunds</a></li></ul></div>
    </div>
    <div class="foot__legal">
      <p style="margin:0">© 2026 Anima Digital Audio. Orders are processed by Creem, our reseller and merchant of record.</p>
      <p style="margin:0">VST is a trademark of Steinberg Media Technologies GmbH. Audio Units, macOS and Logic Pro are trademarks of Apple Inc.</p>
    </div>
  </div>
</footer>
<div class="toast" role="status" aria-live="polite"></div>
</body>
</html>
"""


def support_section(text="Installation, activation, moving a license to a new computer, refunds: write to us and we answer by e-mail, usually within a day."):
    return f"""<section class="section" id="support">
  <div class="wrap support">
    <div>
      <h2 class="h-l" style="margin-bottom: 16px">Questions?</h2>
      <p class="lede">{text}</p>
    </div>
    <a class="mail" data-email href="mailto:support@animadigitalaudio.com">support@animadigitalaudio.com</a>
  </div>
</section>
"""


def write(name, content):
    with open(os.path.join(ROOT, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print("wrote", name)


# =====================================================================
# HOME
# =====================================================================
def home():
    stage_imgs = (
        '<img data-key="easywizard" src="assets/ui-synth.jpg" alt="Easy Wizard (Synth) interface" width="1240" height="1000">'
        '<img data-key="dissolve" src="assets/ui-dissolve.jpg" alt="ADA Dissolve interface" width="1100" height="720" loading="lazy">'
        '<img data-key="alloy" src="assets/ui-alloy.jpg" alt="ADA ALLOY interface" width="1600" height="800" loading="lazy">')
    tabs = [
        ("easywizard", "Easy Wizard", "Sampler-synth and FX", "assets/ada-easy-wizard.png", "--ew"),
        ("dissolve", "ADA Dissolve", "Vintage hardware rack", "assets/ada-dissolve.png", "--dissolve"),
        ("alloy", "ADA ALLOY", "Analog console strip", "assets/ada-alloy.png", "--alloy"),
    ]
    tab_html = "".join(
        f'<button class="plate-tab" type="button" role="tab" data-key="{k}" style="--c: var({v})" aria-controls="stage">'
        f'<img src="{img}" alt="" width="52" height="52"><span><b>{n}</b><small>{s}</small></span></button>'
        for k, n, s, img, v in tabs)
    panels = [
        ("easywizard", "Easy Wizard", "Turn any sample into a moving instrument, or any track into a glitch.", "easy-wizard.html"),
        ("dissolve", "ADA Dissolve", "Valve preamp, bucket-brigade echo, spring tank and opto tremolo.", "dissolve.html"),
        ("alloy", "ADA ALLOY", "Six console modules that make a track denser and finished, not louder.", "alloy.html"),
    ]
    panel_html = "".join(f"""
        <div class="stage__panel" data-of="{k}" hidden>
          <div class="stage__bar">
            <div><div class="stage__name">{n}</div><p class="stage__line">{line}</p></div>
            <div class="actions">
              <a class="btn btn--buy" data-checkout href="{href}"><span data-label>Buy</span> <span class="price-tag" data-price></span></a>
              <a class="btn btn--line" href="{href}">Explore {n}</a>
            </div>
          </div>
        </div>""" for k, n, line, href in panels)

    rows = [
        ("easywizard", "Easy Wizard", "assets/ada-easy-wizard.png", "--ew", "easy-wizard.html", "assets/ui-fx.jpg", 1240, 1000,
         "A sampler-synth and a multi-effect on one engine",
         "Load a sample and play it through fifteen rhythm, texture and space modules, or put the Fx version on any track. Three drawable LFOs move any knob, and the Chaos orb rolls a whole new sound with one click.",
         "VST3 and AU, plus a Windows standalone", "Synth and Fx in one license"),
        ("dissolve", "ADA Dissolve", "assets/ada-dissolve.png", "--dissolve", "dissolve.html", "assets/ui-dissolve.jpg", 1100, 720,
         "Four pieces of vintage hardware in one rack",
         "A dual-triode preamp, a bucket-brigade delay whose repeats darken, a spring tank that crashes when you hit it, and a photocell tremolo. Six macros, 280 presets, every change glides.",
         "VST3, AU and a standalone app", "280 presets"),
        ("alloy", "ADA ALLOY", "assets/ada-alloy.png", "--alloy", "alloy.html", "assets/ui-alloy.jpg", 1600, 800,
         "The finishing stage of a big analog desk",
         "Preamp, glue compressor, saturator, stereo dimension, air band and a small room, in any order. One MAGNITUDE knob scales the whole strip, and GAIN MATCH keeps the level honest.",
         "VST3 and AU", "39 presets"),
    ]
    row_html = "".join(f"""
    <article class="plugin-row" data-of="{k}" style="--c: var({v})">
      <div class="plugin-row__text">
        <div class="plugin-row__name"><img src="{icon}" alt="" width="56" height="56"><h3>{n}</h3></div>
        <p class="plugin-row__kind">{kind}</p>
        <p class="muted measure">{text}</p>
        <dl class="facts">
          <dt>Formats</dt><dd>{fmt}, Windows and macOS</dd>
          <dt>Inside</dt><dd>{inside}</dd>
          <dt>Trial</dt><dd>60 minutes of play, full version</dd>
          <dt>Price</dt><dd><span data-price></span> <span class="muted" data-price-old></span></dd>
        </dl>
        <div class="actions" style="--accent: var({v})">
          <a class="btn btn--buy" data-checkout href="{href}"><span data-label>Buy</span></a>
          <a class="btn btn--line" href="{href}">More about {n}</a>
        </div>
      </div>
      <a href="{href}" tabindex="-1" aria-hidden="true"><img class="shot" src="{shot}" alt="" width="{w}" height="{h}" loading="lazy"></a>
    </article>""" for k, n, icon, v, href, shot, w, h, kind, text, fmt, inside in rows)

    body = f"""<body>
{header()}
<main id="main">
  <section class="home-hero">
    <div class="wrap">
      <h1 class="h-xl home-hero__title">Plug-ins with a sound of their own.</h1>
      <p class="lede home-hero__intro">Anima Digital Audio is a small independent studio making VST3 and AU plug-ins for Windows and macOS. Each one is a complete instrument for one job, comes with a free hour of play, and activates without an account or iLok.</p>

      <div class="lineup">
        <div class="lineup__tabs" role="tablist" aria-label="Plug-ins">{tab_html}</div>
        <div class="stage" id="stage" role="tabpanel">
          <div class="stage__frame">{stage_imgs}</div>
          {panel_html}
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="plugins">
    <div class="wrap">
      <div class="section__head">
        <h2 class="h-l">The plug-ins</h2>
        <p class="lede">Three instruments, three different jobs. Every download is the full version: play it for an hour, then decide.</p>
      </div>
      {row_html}
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head">
        <h2 class="h-l">On the bench</h2>
        <p class="lede">Plug-ins we're building now. They will appear here with a free trial when they're ready.</p>
      </div>
      <div class="bench">
        <div class="bench__item" style="--c: var(--vocal)">
          <img src="assets/ada-vocal-channel.png" alt="" width="72" height="72">
          <div><h3>A.D.A. Vocal Channel</h3><p>A fixed vocal channel with zero latency for recording: input, de-harsh and peak reduction, seven console faders from MAIN to MASTER, a lamp-lit VU meter and presets for different voices.</p><span class="bench__state">In development</span></div>
        </div>
        <div class="bench__item" style="--c: var(--muse)">
          <img src="assets/ada-muse.png" alt="" width="72" height="72">
          <div><h3>muse</h3><p>A MIDI generator that writes chord progressions and melodies by mood and genre and plays them live through your own synth. Lock the part you like and roll the other.</p><span class="bench__state">In development</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head">
        <h2 class="h-l">How buying works</h2>
      </div>
      <ol class="steps" style="--accent: var(--bone)">
        <li><h3>Try it</h3><p>Download the full plug-in. Only the time sound runs through it counts toward the free hour.</p></li>
        <li><h3>Buy through Creem</h3><p>Our reseller handles payment and VAT. Your license key appears right away and arrives by e-mail.</p></li>
        <li><h3>Activate</h3><p>Paste the key into the plug-in, or use the <a href="activate.html">activation page</a> for a computer without internet.</p></li>
        <li><h3>Make music</h3><p>From then on the plug-in works offline. Your trial projects open exactly as you left them.</p></li>
      </ol>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="promises">
        <div><h3 class="h-s">No account, no iLok</h3><p>A license is a small file bound to your computer. Nothing to log in to, no dongle, no background app.</p></div>
        <div><h3 class="h-s">One license, one computer</h3><p>New machine? Write to us with your order number and we move the license.</p></div>
        <div><h3 class="h-s">An honest trial</h3><p>The trial is the complete plug-in: no noise bursts, no locked presets, no export limits.</p></div>
        <div><h3 class="h-s">Windows and Mac</h3><p>64-bit VST3 on Windows. VST3 and Audio Units on macOS, native on Apple Silicon and Intel.</p></div>
        <div><h3 class="h-s">Clean by design</h3><p>Every knob, preset and switch is smoothed in the audio engine, so changes never click.</p></div>
        <div><h3 class="h-s">14-day refund</h3><p>If a plug-in doesn't run on your system and we can't fix it, you get your money back.</p></div>
      </div>
    </div>
  </section>

  {support_section()}
</main>
{footer()}"""
    write("index.html", head("Anima Digital Audio — independent audio plug-ins",
                             "Easy Wizard, ADA Dissolve and ADA ALLOY: VST3 and AU plug-ins for Windows and macOS. Free 60-minute trial, no account, no iLok.") + body)


# =====================================================================
# PRODUCT PAGES
# =====================================================================
def mac_guide(name, intro, bundles_cmd, manual):
    return f"""<details class="mac">
        <summary><b class="h-s">Installing on a Mac<span>macOS may call a downloaded plug-in “damaged”. Here's the one-time fix.</span></b></summary>
        <div class="mac__body">
          <p class="measure">{intro}</p>
          <ol>
            <li>Unzip the download and double-click <strong>Install {name}.command</strong>. If macOS blocks it, right-click it, choose <strong>Open</strong>, then <strong>Open</strong> again.</li>
            <li>Enter your Mac password when asked. Nothing is shown while you type.</li>
            <li>{manual}</li>
            <li>Restart your DAW or rescan plug-ins. {name} is listed under Anima Digital Audio.</li>
          </ol>
          <div class="cmd"><pre id="mac-cmd">{bundles_cmd}</pre><button class="btn btn--line btn--small" type="button" data-copy-target="mac-cmd">Copy</button></div>
          <p class="small muted">Keep the quotes: the file names contain spaces.</p>
        </div>
      </details>"""


def product_page(p):
    key, name = p["key"], p["name"]
    others = [x for x in PRODUCTS if x[0] != key]
    other_lines = {"easywizard": "Sampler-synth and multi-effect with the Chaos orb.",
                   "dissolve": "Valve, bucket-brigade echo, spring tank and opto tremolo.",
                   "alloy": "Six-module analog console strip for glue, colour and space."}
    others_html = "".join(f'<a class="other" href="{h}" style="--c: var({v})"><img src="{i}" alt="" width="56" height="56"><div><b>{n}</b><span>{other_lines[k]}</span></div></a>'
                          for k, n, h, i, v in others)
    uses = "".join(f"<li><b>{a}</b><span>{b}</span></li>" for a, b in p["uses"])
    parts = "".join(f"""
        <div class="part"><h3>{t}{('<small>' + s + '</small>') if s else ''}</h3><div><p>{d}</p>{('<ul>' + ''.join('<li>' + x + '</li>' for x in l) + '</ul>') if l else ''}</div></div>"""
                    for t, s, d, l in p["parts"])
    included = "".join(f"<li>{x}</li>" for x in p["included"])
    steps = "".join(f"<li><h3>{a}</h3><p>{b}</p></li>" for a, b in p["steps"])
    shot = p["shot_html"]

    body = f"""<body class="p-{key}" data-product="{key}">
{header(key)}
<main id="main">
  <section class="p-hero">
    <div class="wrap">
      <div class="p-hero__head">
        <div>
          <div class="p-hero__kicker"><img src="{p['icon']}" alt="" width="44" height="44"><span>{p['kind']}</span></div>
          <h1 class="p-hero__name">{p['title_html']}</h1>
          <p class="lede p-hero__lede">{p['lede']}</p>
        </div>
        <div class="p-hero__buy">
          <a class="btn btn--buy" data-checkout href="#price"><span data-label>Buy</span> <span class="price-tag" data-price></span></a>
          <a class="btn btn--line" href="#trial">Download free trial</a>
          <p class="small muted">{p['formats_short']}</p>
        </div>
      </div>
      <div class="p-hero__shot">{shot}</div>
    </div>
  </section>

  <section class="section" id="what">
    <div class="wrap split">
      <div>
        <h2 class="h-l" style="margin-bottom: 20px">{p['for_title']}</h2>
        {''.join('<p>' + x + '</p>' for x in p['for_text'])}
      </div>
      <ul class="uses">{uses}</ul>
    </div>
  </section>

  <section class="section" id="inside">
    <div class="wrap">
      <div class="section__head"><h2 class="h-l">{p['inside_title']}</h2><p class="lede">{p['inside_lede']}</p></div>
      <div class="parts">{parts}</div>
    </div>
  </section>

  <section class="section" id="trial">
    <div class="wrap deal">
      <div class="deal__box">
        <h3 class="h-m">Play it for an hour, free</h3>
        <p>{p['trial_text']}</p>
        <div class="dl">
          <a data-download="win" href="#"><b>Windows</b><span>{p['dl_win']}</span><em>Download</em></a>
          <a data-download="mac" href="#"><b>macOS</b><span>{p['dl_mac']}</span><em>Download</em></a>
        </div>
        <p class="fineprint">On a Mac, see the one-time install step below.</p>
      </div>
      <div class="deal__box deal__box--price" id="price">
        <h3 class="h-m">{p['price_title']}</h3>
        <div class="price"><span class="price__now" data-price></span><span class="price__was" data-price-old></span></div>
        <p class="price__note" data-price-note></p>
        <ul class="included">{included}</ul>
        <a class="btn btn--buy" data-checkout href="#"><span data-label>Buy {name}</span></a>
        <p class="fineprint">Secure checkout by Creem, our merchant of record. VAT is included where it applies. 14-day refund if it doesn't run on your system.</p>
      </div>
    </div>
  </section>

  <section class="section" id="activation">
    <div class="wrap">
      <div class="section__head"><h2 class="h-l">Activating your license</h2><p class="lede">{p['act_lede']}</p></div>
      <ol class="steps">{steps}</ol>
      <div id="mac">{p['mac']}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head"><h2 class="h-m">Also from Anima Digital Audio</h2></div>
      <div class="others">{others_html}</div>
    </div>
  </section>

  {support_section()}
</main>
{footer()}"""
    write(p["file"], head(p["page_title"], p["desc"], favicon=p["favicon"], touch=p["touch"],
                          og_image="https://animadigitalaudio.com/" + p["og"], url="https://animadigitalaudio.com/" + p["file"]) + body)


STEPS_INPLUGIN = lambda name, buy: [
    ("Buy", f"Check out through Creem{buy}. The license key is shown right after payment and sent by e-mail."),
    ("Open TRIAL", "Click TRIAL at the top of the plug-in, then enter your name and paste the key."),
    ("Press ACTIVATE", f"{name} unlocks at once, no restart. From then on it works offline."),
    ("No internet there?", 'Click COPY next to the Hardware ID, use the <a href="activate.html?product=PRODUCT">activation page</a> on any device, then LOAD LICENSE FILE.'),
]

EW = dict(
    key="easywizard", name="Easy Wizard", file="easy-wizard.html", icon="assets/ada-easy-wizard.png",
    favicon="assets/favicon.png", touch="assets/apple-touch-icon.png", og="assets/covers/easy-wizard-cover-wide.jpg",
    page_title="Easy Wizard — sampler-synth and multi-effect plug-in | Anima Digital Audio",
    desc="Easy Wizard (Synth) and Easy Wizard (Fx): 15 rhythm, texture and space modules, three drawable LFOs and the Chaos orb. VST3 and AU for Windows and macOS. Free 60-minute trial.",
    kind="Sampler-synth and multi-effect", title_html="Easy Wizard",
    lede="Two plug-ins on one engine. Easy Wizard (Synth) plays any sample from your keyboard; Easy Wizard (Fx) processes any track. Both run the same fifteen modules, three LFOs and the Chaos orb, and one license unlocks both.",
    formats_short="VST3 and AU, Windows standalone. Windows and macOS.",
    shot_html="""<div class="shot-switch" role="tablist" aria-label="Version"><button type="button" role="tab" data-shot="synth" aria-selected="true">Synth</button><button type="button" role="tab" data-shot="fx" aria-selected="false">Fx</button></div>
      <div class="frame"><img class="shot is-active" data-shot="synth" src="assets/ui-synth.jpg" alt="Easy Wizard (Synth) interface" width="1240" height="1000"><img class="shot" data-shot="fx" src="assets/ui-fx.jpg" alt="Easy Wizard (Fx) interface" width="1240" height="1000" loading="lazy"></div>""",
    for_title="Built for moving sound",
    for_text=["Easy Wizard is for producers who want sound that doesn't sit still: chopped, pitched, stretched into space and pulled back again.",
              "Everything is smoothed inside the audio engine, so you can turn knobs, switch modules and jump between presets while it plays. An automatic gain stage keeps every preset at the level of the dry sound."],
    uses=[("Sound design", "Load a sample and turn it into a playable, evolving instrument."),
          ("Beats", "Stutter, reverse, half-time and a tempo-synced gate on drums or loops."),
          ("Transitions", "Pitch dives, washes and chaos rolls on a bus or a single track."),
          ("Live play", "Click-free changes, so you can perform with it.")],
    inside_title="What's inside", inside_lede="Fifteen modules in three groups, with modulation that you draw and drag.",
    parts=[("Rhythm", "Stutter · Reverse · Pitch · Half-Time · Duck", "Cut, flip and pitch the sound in time with your DAW. Pitch moves ±12 semitones with a clean, exact shift; Duck listens to a sidechain input.", []),
           ("Texture", "Granular · Comb · Freq Shift · Gate · Crush", "Grain clouds, metallic combs, frequency shifting, a tempo-synced gate from 1/4 to 1/32 and bit crushing.", []),
           ("Space", "Wow · Filter · Delay · Reverb · Dimension", "Tape wow, a resonant filter, delay, reverb and stereo dimension to place the result in a room.", []),
           ("Wizard Chaos orb", "", "One click on the orb rolls a new combination of modules and settings. Chaos sets how wild it gets, Interplay how the modules work together. Keep what you like with Save As.", []),
           ("Three LFOs, envelope follower and macros", "", "Draw LFO shapes point by point and bend the curves. Drag an LFO onto any knob to modulate it; each LFO has its own colour, and the knobs it moves light up in that colour.", []),
           ("Synth and Fx", "", "The Synth version loads a sample, previews files in the browser and lets you drag START and END right on the waveform. The Fx version sits on any track with a live waveform and a sidechain input.", [])],
    trial_text="The trial is the full plug-in, Synth and Fx, with every module and preset. Only the time sound runs through it counts. When the hour is used up, the output fades to silence until you activate.",
    dl_win="Installer · VST3 and standalone · 64-bit", dl_mac="VST3 and AU · Apple Silicon and Intel",
    price_title="One license, both plug-ins",
    included=["Easy Wizard (Synth) and Easy Wizard (Fx)", "VST3 and AU, plus a Windows standalone app", "Native on Apple Silicon and Intel Macs",
              "Offline activation, no account or iLok", "One license activates one computer"],
    act_lede="Easy Wizard activates with a small license file. It takes a minute, and the plug-in then works without internet.",
    steps=[("Buy", "Check out through Creem. The license key is shown right after payment and sent by e-mail."),
           ("Copy your Hardware ID", "In the plug-in, click the TRIAL MODE badge and press COPY next to the Hardware ID."),
           ("Get the license file", 'Open the <a href="activate.html">activation page</a>, paste the key and the Hardware ID. license.lic downloads at once.'),
           ("Load it", "Click LOAD LICENSE FILE and choose license.lic. Synth and Fx are both unlocked on this computer.")],
)
EW["mac"] = mac_guide("Easy Wizard",
                      "Easy Wizard is distributed outside the Mac App Store, so macOS quarantines the download and may say the plug-in “is damaged” or “can't be verified”. The files are fine: the install script removes the quarantine flag.",
                      'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/VST3/Easy Wizard (Synth).vst3"\n'
                      'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/VST3/Easy Wizard (Fx).vst3"\n'
                      'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/Components/Easy Wizard (Synth).component"\n'
                      'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/Components/Easy Wizard (Fx).component"\n'
                      'killall -9 AudioComponentRegistrar',
                      "Installing by hand instead? Copy the .vst3 files to <code>/Library/Audio/Plug-Ins/VST3/</code> and the .component files to <code>/Library/Audio/Plug-Ins/Components/</code>, then run the command below in Terminal.")

DISSOLVE = dict(
    key="dissolve", name="ADA Dissolve", file="dissolve.html", icon="assets/ada-dissolve.png",
    favicon="assets/favicon-dissolve.png", touch="assets/apple-touch-icon-dissolve.png", og="assets/covers/ada-dissolve-cover-wide.jpg",
    page_title="ADA Dissolve — vintage hardware FX plug-in | Anima Digital Audio",
    desc="ADA Dissolve: tube preamp, bucket-brigade delay, spring tank and opto tremolo in one plug-in. 280 presets, six macros. VST3 and AU for Windows and macOS. Free 60-minute trial.",
    kind="Vintage hardware rack", title_html="ADA Dissolve",
    lede="Four old studio machines in one rack: a valve preamp that warms and breaks up, a bucket-brigade delay whose every repeat gets darker, a spring tank you can kick, and a photocell tremolo that breathes.",
    formats_short="VST3, AU and standalone. Windows and macOS.",
    shot_html='<div class="frame"><img src="assets/ui-dissolve.jpg" alt="ADA Dissolve interface" width="1100" height="720"></div>',
    for_title="Old circuits, clean signal",
    for_text=["Each block is modelled as a circuit rather than borrowed from a generic effect. Switch blocks on and off, set each one's mix with the fader on its card, and change their order.",
              "It is made for guitars, keys, synths and vocals that need age and air, without hiss in the pauses or digital grit on top."],
    uses=[("Guitars", "Valve break-up, spring splash and amp-style tremolo."),
          ("Keys and synths", "Chorus from the bucket-brigade chip and slow, dark echoes."),
          ("Vocals", "Warmth and short slap echoes that sit behind the voice."),
          ("Sound design", "Feedback at the edge of oscillation, and a tank that crashes.")],
    inside_title="The rack", inside_lede="Four blocks in one signal path. Turn a knob and the sound glides; it never clicks.",
    parts=[("Tube Preamp", "Dual triode, 4× oversampled", "Clean headroom at low drive, warm thickening in the middle, honest break-up at the top. Asymmetry adds the even harmonics of a real valve, Tone rounds the top end, and the input stays tight so the bass doesn't turn to mud.", []),
           ("BBD Delay / Chorus", "4096-stage bucket brigade", "A compander, clock noise and filters inside the feedback loop, so every repeat comes back darker. From 5 ms chorus to 900 ms echoes; turning Time bends the pitch like the real chip.", []),
           ("Spring Tank", "With crash", "Real spring drip, and when you hit the strings hard the tank crashes: crack, thump and rattle, like kicking an old amp. It never triggers on a sustained note.", []),
           ("Opto Tremolo", "Lamp and photocell", "Fast attack, a slower release that lingers in the dark, up to −24 dB deep. Free-running or locked to your DAW's tempo.", []),
           ("Six macros", "", "Tone, Drive, Echo, Spring, Tremolo and Mix move the right parameters of every block at once. Open EDIT for every knob of the chain.", []),
           ("280 presets", "", "24 hand-made sounds and eight families of 32, from Clear Glass to Edge of Feedback, all levelled to the same loudness. Randomize builds a fresh variation of any preset.", [])],
    trial_text="The trial is the complete plug-in with every block and preset. Only the time sound runs through it counts. When the hour is used up, ADA Dissolve bypasses itself, so your mix never goes silent.",
    dl_win="Installer · VST3 and standalone · 64-bit", dl_mac="VST3, AU and app · Apple Silicon and Intel",
    price_title="One license, the whole rack",
    included=["Tube Preamp, BBD Delay / Chorus, Spring Tank, Opto Tremolo", "280 presets, six macros, full EDIT page", "VST3, AU and a standalone app",
              "Activation inside the plug-in, no account or iLok", "One license activates one computer"],
    act_lede="ADA Dissolve activates inside the plug-in in a few seconds, then works offline.",
    steps=[(a, b.replace("PRODUCT", "dissolve")) for a, b in STEPS_INPLUGIN("ADA Dissolve", ", or click BUY in the plug-in")],
)
DISSOLVE["mac"] = mac_guide("ADA Dissolve",
                            "ADA Dissolve is distributed outside the Mac App Store, so macOS quarantines the download and may say the plug-in “is damaged” or “can't be verified”. The files are fine: the install script removes the quarantine flag.",
                            'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/VST3/ADA Dissolve.vst3"\n'
                            'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/Components/ADA Dissolve.component"\n'
                            'sudo xattr -rd com.apple.quarantine "/Applications/ADA Dissolve.app"\n'
                            'killall -9 AudioComponentRegistrar',
                            "Installing by hand instead? Copy <code>ADA Dissolve.vst3</code> to <code>/Library/Audio/Plug-Ins/VST3/</code>, <code>ADA Dissolve.component</code> to <code>/Library/Audio/Plug-Ins/Components/</code> and the app to <code>/Applications</code>, then run the command below in Terminal.")

ALLOY = dict(
    key="alloy", name="ADA ALLOY", file="alloy.html", icon="assets/ada-alloy.png",
    favicon="assets/favicon-alloy.png", touch="assets/apple-touch-icon-alloy.png", og="assets/covers/ada-alloy-cover-wide.jpg",
    page_title="ADA ALLOY — analog console strip plug-in | Anima Digital Audio",
    desc="ADA ALLOY: preamp, glue compressor, saturator, stereo dimension, air band and room in one analog console strip. VST3 and AU for Windows and macOS. Free 60-minute trial.",
    kind="Analog console strip", title_html="ADA ALLOY",
    lede="The finishing stage of a big analog desk in one plug-in. Six modules make a vocal, a guitar, a drum bus or a whole mix denser, wider and more finished, without damaging it.",
    formats_short="VST3 and AU. Windows and macOS.",
    shot_html='<div class="frame"><img src="assets/ui-alloy.jpg" alt="ADA ALLOY interface" width="1600" height="800"></div>',
    for_title="Glue, colour and space",
    for_text=["A track straight out of the DAW often sounds correct but small and dry. On a real console it would pass through a preamp, a bus compressor, some tape or valve colour, a lift at the top and a room, and come back thicker.",
              "ADA ALLOY is that path. Turn MAGNITUDE and the sound gets denser and more glued while staying clean. GAIN MATCH keeps the loudness equal, so you hear the character, not just “louder”."],
    uses=[("Vocals", "Presence, density and a short room that seats the voice."),
          ("Guitars and keys", "Valve warmth, width and air without a harsh top."),
          ("Bass and drums", "Glue and punch, with the low end kept mono and tight."),
          ("Mix bus and master", "The finishing touch in one knob, loudness-matched.")],
    inside_title="The strip", inside_lede="Six modules in any order. Drag them to re-order, switch them on and off, and give each one its own frequency band.",
    parts=[("Preamp", "Console · Tube · Tape", "A console or valve input stage with Drive up to +14 dB, Warmth and Trim. A smooth soft-knee curve with gentle even harmonics, 4× oversampled: it thickens and warms, it never fuzzes.", []),
           ("Glue", "Bus compressor", "Squeeze, Punch and Mix on a musical 3:1 with soft knee and auto release, and a 90 Hz sidechain filter so the bass never pumps it.", []),
           ("Saturator", "2nd · 3rd · Soft", "Warm harmonic density with even, odd or peak-only character. 4× oversampled with pre- and de-emphasis: dense, not muddy.", []),
           ("Dimension", "Four stereo modes", "Width and Depth on the sides only, so the mono sum stays exactly as it was. Safe on vocals, bass and masters.", []),
           ("Air", "10 · 15 · 20 · 30 kHz", "A broad, silky high shelf. A dynamic de-harsh keeps the 5 kHz region smooth while you lift the top.", []),
           ("Room", "Size · Decay · Ducking", "True-stereo early reflections before a dense tail. The room steps back while the source plays, and is filtered so it reads as space, never as boom.", []),
           ("Master", "MAGNITUDE · LOW KEEP · GAIN MATCH", "MAGNITUDE scales the whole strip. LOW KEEP sends the lows past the modules and keeps them mono. Width, input and output trims, 39 presets, undo and redo.", [])],
    trial_text="The trial is the complete plug-in with every module and preset. Only the time sound runs through it counts. When the hour is used up, ADA ALLOY bypasses itself, so your mix never goes silent.",
    dl_win="Installer · VST3 · 64-bit", dl_mac="VST3 and AU · Apple Silicon and Intel",
    price_title="One license, the whole strip",
    included=["Preamp, Glue, Saturator, Dimension, Air, Room", "MAGNITUDE, LOW KEEP, WIDTH and GAIN MATCH", "39 presets, undo and redo",
              "Activation inside the plug-in, no account or iLok", "One license activates one computer"],
    act_lede="ADA ALLOY activates inside the plug-in in a few seconds, then works offline.",
    steps=[(a, b.replace("PRODUCT", "alloy")) for a, b in STEPS_INPLUGIN("ADA ALLOY", ", or click TRIAL → BUY ADA ALLOY in the plug-in")],
)
ALLOY["mac"] = mac_guide("ADA ALLOY",
                         "ADA ALLOY is distributed outside the Mac App Store, so macOS quarantines the download and may say the plug-in “is damaged” or “can't be verified”. The files are fine: the install script removes the quarantine flag.",
                         'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/VST3/ADA ALLOY.vst3"\n'
                         'sudo xattr -rd com.apple.quarantine "/Library/Audio/Plug-Ins/Components/ADA ALLOY.component"\n'
                         'killall -9 AudioComponentRegistrar',
                         "Installing by hand instead? Copy <code>ADA ALLOY.vst3</code> to <code>/Library/Audio/Plug-Ins/VST3/</code> and <code>ADA ALLOY.component</code> to <code>/Library/Audio/Plug-Ins/Components/</code>, then run the command below in Terminal.")


# =====================================================================
# ACTIVATION + LEGAL
# =====================================================================
def activate():
    picks = "".join(f'<label class="act__pick" style="--c: var({v})"><input type="radio" name="product" value="{k}"{" checked" if k == "easywizard" else ""}><img src="{i}" alt="" width="44" height="44">{n}</label>'
                    for k, n, h, i, v in PRODUCTS)
    body = f"""<body data-product="">
{header("activate")}
<main id="main" class="doc">
  <div class="wrap doc__in">
    <h1>Activate <span data-act-product>Easy Wizard</span></h1>
    <p class="lede" data-act-sub>One license unlocks Easy Wizard (Synth) and Easy Wizard (Fx) on one computer.</p>
    <form class="act" id="act" novalidate>
      <fieldset><legend>Plug-in</legend>{picks}</fieldset>
      <label class="field">License key
        <input name="key" autocomplete="off" spellcheck="false" placeholder="From your purchase e-mail" required>
        <small>Shown after payment and in your Creem receipt e-mail.</small>
      </label>
      <label class="field">Hardware ID
        <input name="hwid" autocomplete="off" spellcheck="false" placeholder="1A2B-3C4D-5E6F-7A8B-9C0D" required>
        <small data-act-hwid></small>
      </label>
      <label class="field">Your name
        <input name="name" autocomplete="name" maxlength="80" placeholder="Alex Smith" required>
        <small>Shown in the plug-in as “Licensed to”.</small>
      </label>
      <div><button class="btn btn--buy" type="submit">Get license file</button></div>
      <p class="act__msg" role="status" aria-live="polite"></p>
    </form>
    <div class="act__done" id="act-done">
      <p><strong>Your license file is ready.</strong> If the download didn't start, <a id="act-again" href="#">download it again</a>.</p>
      <p data-act-next style="margin:0"></p>
    </div>
    <h2>Need help?</h2>
    <p>New computer, lost key or anything else: write to <a data-email href="mailto:support@animadigitalaudio.com">support@animadigitalaudio.com</a> with your order number.</p>
  </div>
</main>
{footer()}"""
    write("activate.html", head("Activate your license — Anima Digital Audio",
                                "Activate Easy Wizard, ADA Dissolve or ADA ALLOY: enter your license key and Hardware ID to get license.lic.",
                                robots='\n  <meta name="robots" content="noindex">') + body)


def legal(file, title, date, sections):
    secs = "".join(f"<h2>{h}</h2>" + "".join(f"<p>{p}</p>" for p in ps) for h, ps in sections)
    body = f"""<body>
{header()}
<main id="main" class="doc">
  <div class="wrap doc__in">
    <h1>{title}</h1>
    <p class="date">Last updated: {date}</p>
    {secs}
  </div>
</main>
{footer()}"""
    write(file, head(f"{title} — Anima Digital Audio", f"{title} of Anima Digital Audio.") + body)


MAIL = '<a data-email href="mailto:support@animadigitalaudio.com">support@animadigitalaudio.com</a>'
CREEM = '<a href="https://www.creem.io" rel="noopener">creem.io</a>'

TERMS = [
    ("1. Who we are", [f'Easy Wizard (Synth), Easy Wizard (Fx), ADA Dissolve and ADA ALLOY (each “the Software”) are audio plug-ins made and sold under the brand Anima Digital Audio by <span data-legal-name>Anima Digital Audio</span> (“we”, “us”). You can reach us at {MAIL}.']),
    ("2. Ordering through Creem", [f"Our order process is conducted by our online reseller Creem ({CREEM}). Creem is the Merchant of Record for all our orders: payments, invoices, sales tax / VAT and refunds are processed by Creem under its terms for buyers, which you accept at checkout. For questions about the Software, activation and support, contact us directly."]),
    ("3. Free trial", ["The Software can be used free of charge with all features for 60 minutes of playing time. Only the time during which audio actually runs through the Software is counted. When the trial time is used up, Easy Wizard stops producing sound, and ADA Dissolve and ADA ALLOY pass the audio through unprocessed (bypass), until the Software is activated with a license."]),
    ("4. License", ["When you buy the Software you receive a personal, non-exclusive, non-transferable license to install and use it. <strong>One license activates the Software on one computer</strong>: the license file is made for the computer whose Hardware ID is used for the activation. An Easy Wizard license unlocks both Easy Wizard (Synth) and Easy Wizard (Fx) on that computer; an ADA Dissolve license unlocks ADA Dissolve; an ADA ALLOY license unlocks ADA ALLOY. If you replace your computer, write to us and we will move your license to the new one.",
                    "You may use the Software to create music and sound for any purpose, including commercial releases. Audio you create with the Software belongs to you and is royalty-free.",
                    "You may not: copy, share, sell, rent or publish the Software or your license file; give your license to anyone else; remove or bypass the license check; or decompile, reverse-engineer or modify the Software, except where the law expressly allows it.",
                    "The Software remains the property of Anima Digital Audio. We may end your license if you break these terms."]),
    ("5. Updates and support", ["We provide support by e-mail and may publish updates to fix problems or add features. The Software requires a 64-bit host that supports VST3 (Windows, macOS) or Audio Units (macOS); please try the free trial to make sure it works with your system before you buy."]),
    ("6. No warranty, limitation of liability", ["The Software is provided “as is”. To the extent permitted by law, we give no warranty that it will be free of errors or suit a particular purpose, and we are not liable for indirect or consequential damages, loss of data or loss of profits. Our total liability is limited to the amount you paid for the Software. Nothing in these terms limits rights you have as a consumer under the law of your country."]),
    ("7. Third-party components", ["The Software uses the JUCE framework and fonts licensed under the SIL Open Font License 1.1. VST is a trademark of Steinberg Media Technologies GmbH; Audio Units, macOS and Logic Pro are trademarks of Apple Inc."]),
    ("8. Changes and governing law", ["We may update these terms; the version on this page applies to new purchases. These terms are governed by the law of the country where the seller is established, without prejudice to mandatory consumer protection rules of your country of residence."]),
]

PRIVACY = [
    ("Summary", ["We collect as little as possible. The plug-ins contain no telemetry or analytics and only connect to the internet when you press ACTIVATE. This website uses no tracking or advertising cookies."]),
    ("Who is responsible", [f"<span data-legal-name>Anima Digital Audio</span>. Contact: {MAIL}."]),
    ("Purchases", [f"Orders are processed by Creem ({CREEM}), our reseller and merchant of record. Creem collects your name, e-mail address, billing country and payment details to process the payment and taxes, under its own privacy policy. We receive your name, e-mail address, country and order details from Creem so we can deliver your license and support you. We never see your card details."]),
    ("Activation and support", ["To issue a license, the activation sends your license key, your Hardware ID (an anonymous code calculated from your computer that contains no personal data) and the name you enter to our activation server. The server checks the key with Creem, remembers which computer the key was activated on, and returns your license file. We keep this, your order details and our e-mail conversation to re-issue lost licenses and to provide support, for as long as you own the license or the law requires."]),
    ("The plug-ins", ["Our plug-ins store their license file, trial information and your presets only on your own computer. ADA Dissolve and ADA ALLOY can activate from inside the plug-in, and only when you press ACTIVATE."]),
    ("This website", ['The site is hosted by GitHub Pages, which records technical access data such as IP addresses for security (<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub Privacy Statement</a>). Fonts are loaded from Google Fonts (<a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a>). The activation page talks to our activation server on Cloudflare. The checkout itself opens on Creem\'s website.']),
    ("Your rights", [f"You can ask us at any time which data we hold about you, and ask us to correct or delete it, by writing to {MAIL}. If you are in the EU/EEA or the UK you also have the right to complain to your data protection authority."]),
]

REFUND = [
    ("Try before you buy", ["Every plug-in comes with a free trial with all features, <strong>60 minutes of playing time</strong>, so you can check that it works with your computer and DAW before you pay."]),
    ("14-day refund", [f"If the Software does not work on your system and we cannot solve the problem, you get a full refund when you ask <strong>within 14 days of purchase</strong>. Please contact us first at {MAIL} with your order number, operating system and DAW: most problems can be fixed quickly.",
                       f"Refunds are processed by our reseller and merchant of record Creem ({CREEM}) to your original payment method. You can also reply to your Creem receipt to ask for a refund.",
                       "After a refund your license is cancelled and you must delete the license file and stop using the full version."]),
    ("Your legal rights", ["This policy does not limit any rights you have under consumer law in your country, including the right of withdrawal in the EU and UK where it applies to digital products."]),
]

if __name__ == "__main__":
    home()
    for p in (EW, DISSOLVE, ALLOY):
        product_page(p)
    activate()
    legal("terms.html", "Terms and conditions", "20 November 2026", TERMS)
    legal("privacy.html", "Privacy policy", "20 November 2026", PRIVACY)
    legal("refund.html", "Refund policy", "20 November 2026", REFUND)
