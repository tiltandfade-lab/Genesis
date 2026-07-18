/* dev/door-workbench/workbench.js — parent-side controller for the KGR-8 door workbench.
   Injects the shared leaf-fit helper + the clay-room boot script into the same-origin
   genesis.html iframe, boots the room, then drives window.kgr8FitLeafToAperture live off the
   six controls. SAVE POSTs the values to /api/door-mount-lock (serve.mjs writes
   dev/battle-gate/kgr8-clay-room/door-mount-lock.json atomically).
   Puppeteer hooks (used by the roundtrip verifier): window.WB_READY (boolean),
   window.WB_LAST_FIT (last fit result), window.WB_SET(name, value), window.WB_SAVE(). */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const iframe = $("engine");
  const statusEl = $("status");
  const veil = $("bootveil");

  /* ── the six controls (defaults = the v4 fit, i.e. the current rig behavior) ── */
  const CONTROLS = [
    { name: "zOffset",    label: "1 · Leaf depth in wall (z)", min: -0.6, max: 0.6,  step: 0.01, def: 0,    fmt: (v) => v.toFixed(3),
      hint: "0 = slab-centered · + toward the room · − deeper into the wall" },
    { name: "depthFrac",  label: "2 · Leaf thickness",         min: 0.05, max: 1.0,  step: 0.05, def: 0.5,  fmt: (v) => v.toFixed(3),
      hint: "fraction of the measured wall slab depth (0.5 = Adam's half-depth canon, 1.0 = full slab)" },
    { name: "overlapW",   label: "3 · Leaf width (side lap)",  min: 0,    max: 0.5,  step: 0.01, def: 0.15, fmt: (v) => v.toFixed(3),
      hint: "per-side lap beyond the aperture onto the jamb butt ends" },
    { name: "headDrop",   label: "4 · Leaf height (head drop)", min: 0,   max: 1.2,  step: 0.02, def: 0,    fmt: (v) => v.toFixed(3),
      hint: "0 = full-height slot · >0 lowers the leaf top and fills clay wall above the head" },
    { name: "sillHeight", label: "5 · Sill height",            min: 0,    max: 0.5,  step: 0.01, def: 0,    fmt: (v) => v.toFixed(3),
      hint: "raises the threshold; the leaf stands on the sill top" },
    { name: "revealLining", label: "6 · Reveal lining",        toggle: true, def: true,
      hint: "the two clay jamb linings through the aperture tunnel (R toggles)" },
  ];
  const params = {};
  CONTROLS.forEach((c) => { params[c.name] = c.def; });
  let selected = 0;
  let ready = false;
  let dollyOn = false;
  let lastFit = null;

  /* ── panel DOM ── */
  const host = $("controls");
  CONTROLS.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "ctl" + (c.toggle ? " toggle" : "");
    div.id = "ctl-" + c.name;
    div.innerHTML = c.toggle
      ? `<div class="row1"><label>${c.label}</label><span class="val" id="val-${c.name}"></span></div>
         <div class="hint">${c.hint}</div>`
      : `<div class="row1"><label>${c.label}</label><span class="val" id="val-${c.name}"></span></div>
         <input type="range" id="rng-${c.name}" min="${c.min}" max="${c.max}" step="${c.step / 10}" value="${c.def}">
         <div class="hint">${c.hint}</div>`;
    host.appendChild(div);
    div.addEventListener("click", () => selectRow(i));
    if (c.toggle) {
      div.addEventListener("click", () => setParam(c.name, !params[c.name]));
    } else {
      $("rng-" + c.name).addEventListener("input", (e) => setParam(c.name, parseFloat(e.target.value)));
    }
  });
  function selectRow(i) {
    selected = i;
    CONTROLS.forEach((c, j) => { $("ctl-" + c.name).classList.toggle("sel", j === i); });
  }
  selectRow(0);

  function renderVals() {
    CONTROLS.forEach((c) => {
      $("val-" + c.name).textContent = c.toggle ? (params[c.name] ? "ON" : "OFF") : c.fmt(params[c.name]);
      if (!c.toggle) $("rng-" + c.name).value = params[c.name];
    });
  }
  renderVals();

  /* ── live re-fit (debounced a frame) ── */
  let fitQueued = false;
  function setParam(name, value) {
    const c = CONTROLS.find((x) => x.name === name);
    if (!c) return;
    if (!c.toggle) value = Math.min(c.max, Math.max(c.min, value));
    params[name] = value;
    renderVals();
    queueFit();
  }
  function queueFit() {
    if (!ready || fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(() => {
      fitQueued = false;
      applyFit();
    });
  }
  function applyFit() {
    const WB = iframe.contentWindow.KGR8WB;
    if (!WB) return;
    try {
      const fit = WB.fitLeaf({ ...params });
      lastFit = fit;
      window.WB_LAST_FIT = fit;
      if (!fit.ok) { setStatus("fit error: " + fit.error, "err"); return; }
      if (dollyOn) WB.cameraDolly(13); // leaf moved — keep the dolly centered on it
      setStatus("ready — live", "ready");
      renderMeasured(fit);
    } catch (e) {
      setStatus("fit threw: " + e.message, "err");
    }
  }
  function renderMeasured(fit) {
    const p = fit.params || {};
    $("measured").innerHTML =
`<b>MEASURED (live)</b>
leaf box x [${fit.leafBox.min[0]}, ${fit.leafBox.max[0]}]
         y [${fit.leafBox.min[1]}, ${fit.leafBox.max[1]}]
         z [${fit.leafBox.min[2]}, ${fit.leafBox.max[2]}]
leaf depth <b>${fit.leafDepth}</b>  (slab ${fit.slabDepth}, frac ${p.depthFrac})
reveal (visible face → leaf face) <b>${fit.revealDepth}</b>
slab center z ${fit.slabCenterZ}  zOffset <b>${p.zOffset}</b>
aperture [${fit.aperture[0]}, ${fit.aperture[1]}]  lap/side ${p.overlapW}
wall top ${fit.wallTop}  leaf top ${fit.leafTop}  (head drop ${p.headDrop})
floor top ${fit.floorTop}  sill top ${fit.sillTop}  (sill h ${p.sillHeight})
fill: ${(fit.apertureFill || []).map((f) => f.name).join(" + ") || "none"}`;
  }

  function setStatus(text, cls) {
    statusEl.textContent = text;
    statusEl.className = cls || "";
  }

  /* ── camera ── */
  function setDolly(on) {
    const WB = iframe.contentWindow.KGR8WB;
    if (!ready || !WB) return;
    dollyOn = on;
    $("dollyBtn").classList.toggle("on", on);
    const r = on ? WB.cameraDolly(13) : WB.cameraFull();
    if (r && !r.ok) setStatus("camera: " + r.error, "err");
  }
  $("dollyBtn").addEventListener("click", () => setDolly(!dollyOn));
  $("resetBtn").addEventListener("click", () => {
    CONTROLS.forEach((c) => { params[c.name] = c.def; });
    renderVals();
    queueFit();
  });

  /* ── save/lock ── */
  async function save() {
    if (!ready) return { ok: false, error: "not ready" };
    const msg = $("saveMsg");
    msg.className = ""; msg.textContent = "saving…";
    try {
      const res = await fetch("/api/door-mount-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: { ...params }, measured: lastFit && lastFit.ok ? {
          leafBox: lastFit.leafBox, revealDepth: lastFit.revealDepth, leafDepth: lastFit.leafDepth,
          slabDepth: lastFit.slabDepth, slabCenterZ: lastFit.slabCenterZ, aperture: lastFit.aperture,
          wallTop: lastFit.wallTop, floorTop: lastFit.floorTop, sillTop: lastFit.sillTop, leafTop: lastFit.leafTop,
        } : null }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || ("HTTP " + res.status));
      msg.className = "ok";
      msg.textContent = "LOCKED → " + body.path;
      window.WB_LAST_SAVE = body;
      return body;
    } catch (e) {
      msg.className = "err";
      msg.textContent = "save failed: " + e.message;
      window.WB_LAST_SAVE = { ok: false, error: e.message };
      return { ok: false, error: e.message };
    }
  }
  $("saveBtn").addEventListener("click", save);

  /* ── keyboard (parent AND iframe, so focus never strands the arrows) ── */
  function onKey(e) {
    if (!ready) return;
    const k = e.key;
    if (k >= "1" && k <= "6") { selectRow(parseInt(k, 10) - 1); e.preventDefault(); return; }
    if (k === "d" || k === "D") { setDolly(!dollyOn); e.preventDefault(); return; }
    if (k === "r" || k === "R") { setParam("revealLining", !params.revealLining); e.preventDefault(); return; }
    if (k === "s" || k === "S") { save(); e.preventDefault(); return; }
    const up = k === "ArrowUp" || k === "ArrowRight";
    const down = k === "ArrowDown" || k === "ArrowLeft";
    if (!up && !down) return;
    e.preventDefault();
    const c = CONTROLS[selected];
    if (c.toggle) { setParam(c.name, !params[c.name]); return; }
    const step = e.shiftKey ? c.step / 10 : c.step; // shift = fine
    setParam(c.name, +(params[c.name] + (up ? step : -step)).toFixed(4));
  }
  window.addEventListener("keydown", onKey);

  /* ── boot ── */
  function injectScript(doc, src) {
    return new Promise((resolve, reject) => {
      const s = doc.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("failed to load " + src));
      doc.body.appendChild(s);
    });
  }
  async function boot() {
    try {
      setStatus("engine loading…");
      const W = iframe.contentWindow, D = iframe.contentDocument;
      // slim the game chrome: the stage is the whole show (toast/bardo hider = the rig's own list)
      const style = D.createElement("style");
      style.textContent = [
        ".topbar,.rail{display:none !important}",
        ".wrap{max-width:none !important;padding:0 !important;gap:0 !important}",
        "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}",
        ".game.battle-stage .panel-col.stage-feed-col{display:none !important}",
        ".game.battle-stage .status-side{display:none !important}", // the in-world character/nav column — dead weight beside the workbench panel
      ].join("\n");
      D.head.appendChild(style);
      await injectScript(D, "/dev/door-workbench/kgr8-leaf-fit.page.js");
      await injectScript(D, "/dev/door-workbench/clay-room-boot.page.js");
      const summary = await W.KGR8WB.bootAll((phase) => setStatus(phase));
      veil.style.display = "none";
      ready = true;
      $("saveBtn").disabled = false;
      window.addEventListener("keydown", onKey); // idempotent
      W.addEventListener("keydown", onKey);
      lastFit = summary.fit;
      window.WB_LAST_FIT = lastFit;
      renderMeasured(summary.fit);
      const cam = summary.cameraCheck;
      setStatus(`ready — camera pitch ${cam.pitchDeg}° / yaw ${cam.yawDeg}° (frozen)`, "ready");
      applyFit(); // assert the panel's params (defaults = v4) once against the live room
      window.WB_READY = true;
    } catch (e) {
      veil.textContent = "BOOT FAILED: " + e.message;
      setStatus("boot failed: " + e.message, "err");
      window.WB_BOOT_ERROR = e.message;
    }
  }
  iframe.addEventListener("load", () => { boot(); });

  /* puppeteer hooks */
  window.WB_SET = (name, value) => { setParam(name, value); applyFit(); return { ...params }; };
  window.WB_SAVE = () => save();
  window.WB_PARAMS = () => ({ ...params });
  window.WB_DOLLY = (on) => setDolly(!!on);
})();
