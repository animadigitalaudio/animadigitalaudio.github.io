/* =====================================================================
   Wizard Chaos orb - the same GLSL shader as the plug-in's WIZARD CHAOS view.
   Renders only while visible; move = steer, click = ignite. No WebGL -> the
   static picture (data-fallback) stays.
   ===================================================================== */
(function () {
  var FS = "precision highp float;\nuniform vec2  uRes;\nuniform float uTime;\nuniform vec2  uMouse;   // -1..1 (smoothed in JS)\nuniform float uFlash;   // 0..1 after a click\nuniform float uPhase;   // accumulated motion time: runs up to 6x faster on the peak of a click (JS)\n\n// ---------- palette (linear-ish HDR values, tone-mapped at the end) ----------\nconst vec3 MIDNIGHT = vec3(0.006, 0.006, 0.040);   // midnight indigo\nconst vec3 ELECTRIC = vec3(0.035, 0.150, 0.780);   // deep royal blue (the body of the flow)\nconst vec3 ICE      = vec3(0.180, 0.420, 1.000);   // restrained light blue (only on the crests)\nconst vec3 NEON     = vec3(0.020, 0.110, 0.900);   // saturated blue neon for the impact flash\nconst vec3 CORE     = vec3(1.000, 0.985, 0.960);\n\n// ---------- 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) ----------\nvec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }\nvec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }\nvec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }\nvec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }\nfloat snoise(vec3 v){\n  const vec2 C = vec2(1.0/6.0, 1.0/3.0);\n  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n  vec3 i  = floor(v + dot(v, C.yyy));\n  vec3 x0 = v - i + dot(i, C.xxx);\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min(g.xyz, l.zxy);\n  vec3 i2 = max(g.xyz, l.zxy);\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy;\n  vec3 x3 = x0 - D.yyy;\n  i = mod289(i);\n  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));\n  float n_ = 0.142857142857;\n  vec3 ns = n_ * D.wyz - D.xzx;\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_);\n  vec4 x = x_ * ns.x + ns.yyyy;\n  vec4 y = y_ * ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n  vec4 b0 = vec4(x.xy, y.xy);\n  vec4 b1 = vec4(x.zw, y.zw);\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;\n  vec3 p0 = vec3(a0.xy, h.x);\n  vec3 p1 = vec3(a0.zw, h.y);\n  vec3 p2 = vec3(a1.xy, h.z);\n  vec3 p3 = vec3(a1.zw, h.w);\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));\n  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));\n}\n\n// 5-octave FBM, octaves rotated against each other so no grid shows\nconst mat3 OCT = mat3( 0.00,  0.80,  0.60,\n                      -0.80,  0.36, -0.48,\n                      -0.60, -0.48,  0.64);\nfloat fbm5(vec3 p){\n  float s = 0.0, a = 0.5;\n  for (int i = 0; i < 5; i++) { s += a * snoise(p); p = OCT * p * 2.02; a *= 0.5; }\n  return s;\n}\n\n// three-pass domain warping (Quilez): silky, folding plasma; returns density and the warp field\nfloat plasma(vec3 p, float t, out vec3 warp){   // t = motion phase\n  vec3 q = vec3(fbm5(p + vec3(0.0, 0.0, t * 0.32)),\n                fbm5(p + vec3(5.2, 1.3, -t * 0.27)),\n                0.0);\n  vec3 r = vec3(fbm5(p + 1.6 * q + vec3(1.7, 9.2, t * 0.22)),\n                fbm5(p + 1.6 * q + vec3(8.3, 2.8, -t * 0.19)),\n                0.0);\n  warp = r;\n  return fbm5(p + 1.8 * r + vec3(0.0, 0.0, t * 0.15));\n}\n\nfloat hash31(vec3 p){ p = fract(p * vec3(443.897, 441.423, 437.195)); p += dot(p, p.yzx + 19.19); return fract((p.x + p.y) * p.z); }\nvec3  hash33(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }\n\n// fine glowing motes drifting with the flow, at a given depth layer\nfloat motes(vec2 q, float depth, float t, vec3 warp){\n  vec2 g = q * (11.0 + 7.0 * depth) + warp.xy * 0.9 + vec2(0.0, t * 0.10 * (1.0 + depth));\n  vec2 id = floor(g), f = fract(g);\n  float acc = 0.0;\n  for (int y = -1; y <= 1; y++)\n  for (int x = -1; x <= 1; x++){\n    vec2 o = vec2(float(x), float(y));\n    vec3 h = hash33(vec3(id + o, depth * 17.0));\n    if (h.z > 0.33) continue;                                   // sparse\n    vec2 c = o + 0.5 + 0.38 * sin(t * (0.3 + h.xy) + 6.2831 * h.xy);\n    float d = length(f - c);\n    float tw = 0.55 + 0.45 * sin(t * (2.0 + 3.0 * h.x) + 6.2831 * h.y);   // twinkle\n    acc += tw * exp(-d * d * 900.0) + 0.15 * tw * exp(-d * d * 120.0);\n  }\n  return acc;\n}\n\nfloat sdSeg(vec2 p, vec2 a, vec2 b){\n  vec2 pa = p - a, ba = b - a;\n  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);\n  return length(pa - ba * h);\n}\nfloat h11(float n){ return fract(sin(n * 127.1) * 43758.5453); }\n\n// plasma micro-lightning: thin jagged discharges that leap from the core outwards, re-striking ~14x a second\n// (faster and more often on a click), each strike flaring and dying within its frame, fading out inside the\n// volume well before the glass. Returns HDR light.\nvec3 lightning(vec2 uv, vec2 core, float t, float ph, float px, float flash){\n  float clock = t * 14.0 + ph * 4.0;\n  float strike = floor(clock);\n  float life = fract(clock);\n  vec3 acc = vec3(0.0);\n  for (int k = 0; k < 9; k++){\n    float fk = float(k);\n    float seed = strike * 3.17 + fk * 23.71;\n    if (h11(seed) > 0.32 + 0.6 * flash) continue;                     // chaotic: only some bolts fire per strike\n    float a = 6.2831 * h11(seed + 1.0);\n    vec2 dir = vec2(cos(a), sin(a)), perp = vec2(-dir.y, dir.x);\n    float len = (0.38 + 0.42 * h11(seed + 2.0)) * (1.0 + 0.25 * flash);\n    vec2 prev = core;\n    float dmin = 1e3, at = 0.0;\n    for (int i = 1; i <= 10; i++){\n      float fi = float(i) / 10.0;\n      float j = (h11(seed + float(i) * 2.3) - 0.5) * 0.10 * (0.25 + fi)\n              + (h11(seed + float(i) * 7.9) - 0.5) * 0.03;              // big zig + fine crackle\n      vec2 cur = core + dir * len * fi + perp * j;\n      float dd = sdSeg(uv, prev, cur);\n      if (dd < dmin) { dmin = dd; at = fi; }\n      prev = cur;\n    }\n    float fade = (1.0 - at) * (1.0 - at);                                 // dies away towards the tip\n    float flick = exp(-life * (3.0 - 1.5 * flash)) * (0.7 + 0.3 * h11(seed + 9.0));\n    float w = max(0.004, 1.2 * px);\n    float hot  = exp(-(dmin * dmin) / (w * w));                           // razor-thin white filament\n    float glow = exp(-dmin / (0.018 + 0.012 * flash));                    // electric haze around it\n    acc += fade * flick * (vec3(0.85, 0.92, 1.0) * hot * 2.2 + ICE * glow * 0.45 + NEON * glow * 0.35);\n  }\n  // keep every discharge inside the volume (fades out before the glass, never crosses the edge)\n  return acc * (1.0 - smoothstep(0.70, 0.90, length(uv))) * (1.0 + 1.6 * flash);\n}\n\nvec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }\n\n// emitted light seen along one refracted view ray through the volume (3 depth slices, parallax per slice)\nvec3 volume(vec2 uv, float z, float t, float ph, out float density){\n  vec3 col = vec3(0.0);\n  density = 0.0;\n  // refraction through thick glass: rays bend inward towards the rim\n  float eta = 1.0 / 1.45;\n  vec3 n = vec3(uv, z);\n  vec3 rd = refract(vec3(0.0, 0.0, -1.0), n, eta);\n  for (int i = 0; i < 3; i++){\n    float fi = float(i);\n    float depth = 0.25 + 0.35 * fi;                              // 0.25 .. 0.95 into the sphere\n    vec3 pos = n + rd * depth * (z + 0.2);                       // point inside the ball along the bent ray\n    vec2 q = pos.xy + uMouse * (0.05 + 0.10 * fi);               // deeper = more parallax\n    // vortex: every depth turns at its own speed, the inner rings faster than the outer ones\n    float swirl = ph * (0.30 + 0.14 * fi) * (1.5 - 0.7 * length(q)) + 0.9 * sin(ph * 0.21 + fi);\n    float cs = cos(swirl), sn = sin(swirl);\n    q = mat2(cs, -sn, sn, cs) * q;                               // slow hypnotic rotation, different per depth\n    vec3 warp;\n    float f = plasma(vec3(q * (0.62 + 0.18 * fi), fi * 3.1 + ph * 0.08), ph, warp);\n    f = f * 0.5 + 0.5;\n    // ridges of the flow glow ice-cyan, the body electric blue, the gaps stay midnight\n    float body  = smoothstep(0.45, 0.95, f);\n    float ridge = pow(smoothstep(0.62, 1.0, f + 0.15 * length(warp.xy)), 4.0);\n    float att = exp(-fi * 0.55);                                 // deeper slices are dimmer (absorption)\n    col += att * (ELECTRIC * body * 0.22 + ICE * ridge * 0.30);\n    col += att * ICE * motes(q, fi, ph, warp) * (0.30 + 0.8 * uFlash);\n    density += att * body;\n  }\n  return col;\n}\n\nvoid main(){\n  float m = min(uRes.x, uRes.y);\n  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / m;\n  float t = uTime;\n  float R = 0.30;\n  float px = 1.0 / (m * R);                                      // one pixel in sphere units\n  vec2 uvRaw = p / R;\n  float d = length(uvRaw);\n\n  // ---------- background: near-black with a soft electric halo ----------\n  vec3 hdr = mix(vec3(0.004, 0.006, 0.018), vec3(0.008, 0.016, 0.045), 1.0 - smoothstep(0.0, 1.0, length(p)));\n  float halo = exp(-max(d - 1.0, 0.0) * 6.0) + 0.35 * exp(-max(d - 1.0, 0.0) * 2.0);\n  hdr += ELECTRIC * 0.10 * halo * smoothstep(0.97, 1.0, d);\n  // impact: on a click the whole space lights up in deep blue neon, strongest near the orb, fading out with uFlash\n  float f2 = uFlash * uFlash;\n  float spread = exp(-max(d - 1.0, 0.0) * (0.55 + 1.6 * (1.0 - uFlash)));       // the light front reaches further at the start\n  hdr += NEON * (0.95 * f2 * spread + 0.18 * uFlash) * smoothstep(0.96, 1.0, d);   // kept below white so it stays saturated\n  hdr += vec3(0.10, 0.30, 1.0) * 0.9 * f2 * exp(-max(d - 1.0, 0.0) * 5.0) * smoothstep(0.96, 1.0, d);   // hot rim of light hugging the glass\n\n  // ---------- the sphere ----------\n  float cover = 1.0 - smoothstep(1.0 - 1.5 * px, 1.0 + 0.5 * px, d);   // analytic AA edge\n  if (cover > 0.0){\n    vec2 uv = uvRaw / max(d, 1.0);\n    float z = sqrt(max(1e-4, 1.0 - dot(uv, uv)));\n    vec3 n = vec3(uv, z);\n\n    float dens;\n    vec3 emit = volume(uv, z, t, uPhase, dens);\n\n    // the core: dazzling white with a long cinematic falloff (centre, nudged by the cursor)\n    vec2 coreP = uMouse * 0.08;\n    float cd = length(uv - coreP);\n    float core = 1.6 * exp(-cd * cd * 90.0) + 0.30 * exp(-cd * cd * 14.0) + 0.05 * exp(-cd * 3.0);\n    core *= 1.0 + (0.14 + 0.35 * uFlash) * sin(uPhase * 4.5) + 2.2 * uFlash;   // the core throbs, faster on a hit\n    emit += CORE * core * 0.9 + ELECTRIC * core * 0.5;\n    emit += lightning(uv, coreP, t, uPhase, px, uFlash);\n    emit *= 1.0 + 0.9 * uFlash;\n\n    // deep midnight base, darker at the bottom (inner shadow) and towards the edge of the glass\n    vec3 base = MIDNIGHT * (0.7 + 0.3 * smoothstep(-1.0, 0.8, uv.y));\n    float shadow = mix(0.35, 1.0, smoothstep(-1.05, 0.25, uv.y));           // deep inner shading below\n    vec3 inner = (base + emit) * shadow;\n\n    // glass shell: Fresnel rim with chromatic aberration (R / G / B edges a hair apart)\n    float fR = pow(1.0 - sqrt(max(1e-4, 1.0 - min(1.0, d * 1.006) * min(1.0, d * 1.006))), 3.0);\n    float fG = pow(1.0 - z, 3.0);\n    float fB = pow(1.0 - sqrt(max(1e-4, 1.0 - min(1.0, d * 0.992) * min(1.0, d * 0.992))), 3.0);\n    vec3 rim = vec3(fR * 0.30, fG * 0.55, fB * 1.0) * (ICE * 0.25 + ELECTRIC * 0.35) * (0.8 + 1.4 * uFlash);   // soft refraction edge only\n\n    vec3 c = inner + rim;\n    hdr = mix(hdr, c, cover);\n  }\n\n  // ---------- tone mapping (ACES) + gamma + a whisper of grain against banding ----------\n  vec3 col = aces(hdr * 0.95);\n  col = pow(col, vec3(1.0 / 2.2));\n  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + t) * 43758.5453) - 0.5) / 255.0;\n  gl_FragColor = vec4(col, 1.0);\n}";
  var VS = "attribute vec2 aPos;\nvoid main(){gl_Position=vec4(aPos,0.0,1.0);}";

  document.querySelectorAll("canvas[data-orb]").forEach(function (canvas) {
    var gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false });
    if (!gl) return;
    function sh (type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    } catch (e) { return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    function U (n) { return gl.getUniformLocation(prog, n); }
    var uRes = U("uRes"), uTime = U("uTime"), uMouse = U("uMouse"), uFlash = U("uFlash"), uPhase = U("uPhase");
    canvas.classList.add("is-live");

    function resize () {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(r.width * dpr));
      canvas.height = Math.max(2, Math.floor(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    var target = { x: 0, y: 0 }, mouse = { x: 0, y: 0 }, flash = 0, phase = 0;
    function point (e) {
      var r = canvas.getBoundingClientRect(), m = Math.min(r.width, r.height);
      target.x = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (m * 0.30)));
      target.y = Math.max(-1, Math.min(1, -(e.clientY - r.top - r.height / 2) / (m * 0.30)));
    }
    canvas.addEventListener("pointermove", point);
    canvas.addEventListener("pointerleave", function () { target.x = 0; target.y = 0; });
    canvas.addEventListener("pointerdown", function (e) { point(e); flash = 1; });

    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var visible = true, running = false, last = 0, t0 = performance.now();
    function draw (now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var k = 1 - Math.exp(-dt * 4.0);
      mouse.x += (target.x - mouse.x) * k; mouse.y += (target.y - mouse.y) * k;
      flash *= Math.exp(-dt / 0.7);
      phase += dt * (1.0 + 5.0 * flash * flash);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uFlash, flash);
      gl.uniform1f(uPhase, phase);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop (now) {
      if (!visible || still) { running = false; return; }
      draw(now);
      requestAnimationFrame(loop);
    }
    function start () { if (!running && !still) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
    draw(performance.now() + 2000);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0.05 }).observe(canvas);
    }
    start();
  });
})();
