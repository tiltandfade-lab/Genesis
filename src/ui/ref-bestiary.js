/* GENESIS MODULE — src/ui/ref-bestiary.js — REFERENCE SHELF app #2: the Monster Manual.
   Spec: docs/BESTIARY-MANUAL.md (unit S2) + docs/REFERENCE-SHELF.md ("Registered app #1 — Monster
   Manual"). ES module (own <script type="module"> tag, genesis.html, loaded AFTER theater-boot.js's
   tag so window.Theater.refFigure exists). Imports "three" via the existing importmap +
   resolveWholeObject from ./theater-figures.js (a real ES export). Reads the classic-script globals
   BESTIARY, REALM_BESTIARY, MONSTER_FLAVOR, MODEL_RECIPES, theaterArchetypeFor off `window` — this
   module never declares any of those itself (the classic/module boundary stays one-way, CLAUDE.md).

   Registers ONE REFERENCE_APPS entry ({id:'bestiary', label:'Monster Manual', order:1, mount,
   teardown}) via referenceShelfRegister (classic global, src/ui/reference-shelf.js, loaded earlier in
   loadOrder) — S1's own registration-timing law re-invokes renderStart() for us since this module
   executes post-boot.

   Read-only in v1 (docs/BESTIARY-MANUAL.md "Non-goals"). Never calls window.Theater.retire(); every
   figure this module builds is disposed via window.Theater.refFigure.dispose(group) — never
   geometry.dispose() directly (shared-cache safety, the PIXEL_SKIN_CACHE / whole-object geometry
   caches this module shares with the battle stage). */

import { resolveWholeObject } from "./theater-figures.js";

// ============================================================================
// Data adapter — manualEntries(). Pure function; reads whatever fields are actually present on the
// live globals (never a hardcoded field list that could silently drift from the compiled data).
// ============================================================================

function _slugify(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";
}

// stable string hash (deterministic seed for a figure build — same entry, same seed, every reload)
function _stableHash(s) {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Cached across calls within a page lifetime (the underlying globals are static once loaded) — the
// harness / detail view call this repeatedly and it must stay cheap after the first pass.
let _cachedEntries = null;

function _regularEntries(bestiary, monsterFlavor) {
  const out = [];
  const ids = Object.keys(bestiary || {});
  for (const id of ids) {
    const b = bestiary[id];
    if (!b) continue;
    const flavorSrc = (monsterFlavor && monsterFlavor[id]) || null;
    out.push({
      id,
      corpus: "regular",
      name: b.name,
      cr: b.cr,
      type: (b.typeline || "").split(",")[0] || b.type,
      size: b.size,
      ac: b.ac,
      hp: b.hp,
      speed: b.speed,
      abilities: b.abilities,
      actions: b.actions,
      traits: b.traits,
      flavorTable: flavorSrc ? flavorSrc.flavorTable : null,
      desc: flavorSrc ? flavorSrc.desc : null,
      habitat: b.habitat,
      activity: b.activity,
      treasure: b.treasure,
      factionFit: b.factionFit,
      modelKey: id
    });
  }
  return out;
}

// realm ids are DERIVED (REALM_BESTIARY entries carry no id field): realm + ":" + slugify(name),
// with a -2/-3… suffix on within-realm name collisions, so the derivation is deterministic across
// reloads regardless of authoring-order collisions.
function _realmEntries(realmBestiary, bestiary) {
  const out = [];
  const realms = Object.keys(realmBestiary || {});
  for (const realm of realms) {
    const rows = realmBestiary[realm] || [];
    const seen = Object.create(null);
    for (const e of rows) {
      const baseSlug = _slugify(e.name);
      seen[baseSlug] = (seen[baseSlug] || 0) + 1;
      const n = seen[baseSlug];
      const id = realm + ":" + (n > 1 ? baseSlug + "-" + n : baseSlug);
      const frame = e.frame ? bestiary[e.frame] : null;
      out.push({
        id,
        corpus: "realm",
        name: e.name,
        realm,
        frame: e.frame,
        cr: e.cr,
        type: e.type,
        size: e.size,
        // realm entries carry NO stats of their own — resolved off the frame chassis
        ac: frame ? frame.ac : null,
        hp: frame ? frame.hp : null,
        speed: frame ? frame.speed : null,
        abilities: frame ? frame.abilities : null,
        actions: frame ? frame.actions : null,
        traits: e.traits || (frame ? frame.traits : null),
        flavorTable: e.flavorTable,
        desc: e.desc,
        habitat: e.habitat,
        activity: e.activity,
        treasure: e.treasure,
        factionFit: e.factionFit,
        displaced: e.displaced,
        modelKey: e.model
      });
    }
  }
  return out;
}

export function manualEntries() {
  if (_cachedEntries) return _cachedEntries;
  const bestiary = (typeof window !== "undefined" && window.BESTIARY) || {};
  const realmBestiary = (typeof window !== "undefined" && window.REALM_BESTIARY) || {};
  const monsterFlavor = (typeof window !== "undefined" && window.MONSTER_FLAVOR) || {};
  _cachedEntries = _regularEntries(bestiary, monsterFlavor).concat(_realmEntries(realmBestiary, bestiary));
  return _cachedEntries;
}

// exposed for the verification harness (docs/BESTIARY-MANUAL.md verification §1)
if (typeof window !== "undefined") window.manualEntries = manualEntries;

// ============================================================================
// Model provenance — resolves the fallback tier for an entry's modelKey, mirroring figureFor's own
// precedence (whole-object -> recipe -> cuboid) WITHOUT re-deriving it (this reads the same
// registries figureFor itself consults, it just answers "which tier" ahead of the actual GL build).
// ============================================================================

function archetypeForEntry(entry) {
  const fn = (typeof window !== "undefined") && window.theaterArchetypeFor;
  if (typeof fn !== "function") return "biped";
  return fn(entry.type, entry.size, entry.name);
}

function provenanceTierFor(modelKey) {
  if (resolveWholeObject(modelKey)) return "registered";
  const modelRecipes = (typeof window !== "undefined" && window.MODEL_RECIPES) || {};
  if (modelRecipes[modelKey]) return "recipe";
  return "cuboid";
}

// ============================================================================
// The shared offscreen renderer + card blit pipeline (Fable ruling: ONE shared WebGLRenderer,
// 2D-blit to each card's own <canvas>). Grid cards stay STATIC after first paint; the detail viewer
// gets its OWN dedicated second context (2 total, constant) and always orbits.
// ============================================================================

const LIVE_CARD_CAP = 24;
const CARD_PX = 96; // offscreen render target size per card blit

let _THREE = null;
let _sharedRenderer = null;   // grid's shared offscreen WebGLRenderer
let _sharedScene = null;
let _sharedCamera = null;
let _detailRenderer = null;   // detail viewer's own dedicated renderer (context #2)
let _detailScene = null;
let _detailCamera = null;

async function _ensureThree() {
  if (_THREE) return _THREE;
  _THREE = await import("three");
  return _THREE;
}

// test-only hook: jsdom/Node have no WebGL, so a real THREE.WebGLRenderer can't construct there
// (BESTIARY-MANUAL.md verification header: "test the plain-object/adapter/lifecycle state, not real
// GL pixels"). This lets the harness inject a minimal fake THREE namespace (fake WebGLRenderer/
// Scene/camera classes with no-op methods) so the REAL _mountCard/_unmountCard/_ensureSharedGridContext
// code paths run end-to-end and the lifecycle bookkeeping (_liveCount/_liveGroups/_cardState, the
// LIVE_CARD_CAP enforcement) is exercised for real, without ever touching an actual GL context.
export function __setThreeForTest(stubThree) { _THREE = stubThree; }

function _ensureSharedGridContext() {
  if (_sharedRenderer) return;
  const THREE = _THREE;
  _sharedRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
  _sharedRenderer.setSize(CARD_PX, CARD_PX, false);
  _sharedScene = new THREE.Scene();
  _sharedCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  _sharedCamera.position.set(2.4, 2.0, 2.4);
  _sharedCamera.lookAt(0, 0.5, 0);
  _sharedScene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dl = new THREE.DirectionalLight(0xffffff, 0.6);
  dl.position.set(2, 4, 2);
  _sharedScene.add(dl);
}

function _ensureDetailContext() {
  if (_detailRenderer) return;
  const THREE = _THREE;
  _detailRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  _detailScene = new THREE.Scene();
  _detailCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  _detailCamera.position.set(2.6, 2.0, 2.6);
  _detailCamera.lookAt(0, 0.5, 0);
  _detailScene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dl = new THREE.DirectionalLight(0xffffff, 0.6);
  dl.position.set(2, 4, 2);
  _detailScene.add(dl);
}

// build the live figure group for an entry via the ONE shared seam (window.Theater.refFigure) —
// never figureFor/clearGroup directly (module-private in theater-boot.js).
function _buildFigureFor(entry) {
  const Theater = (typeof window !== "undefined") && window.Theater;
  if (!Theater || !Theater.refFigure || typeof Theater.refFigure.build !== "function") return null;
  const archetype = archetypeForEntry(entry);
  const seed = _stableHash(entry.id);
  return Theater.refFigure.build({
    archetype,
    seed,
    tint: null,
    silhouette: null,
    weapon: null,
    recipeSlug: entry.modelKey
  });
}

function _disposeFigure(group) {
  const Theater = (typeof window !== "undefined") && window.Theater;
  if (!group) return;
  if (Theater && Theater.refFigure && typeof Theater.refFigure.dispose === "function") {
    Theater.refFigure.dispose(group);
  }
}

// ============================================================================
// The grid — lazy IntersectionObserver mount/dispose, hard live-canvas cap, static idle (orbit on
// hover/focus only per Fable's ruling — free after first blit under the shared-renderer arch).
// ============================================================================

// per-card mount state, keyed by card element (WeakMap so GC-friendly on teardown). _liveGroups is a
// plain Set of every currently-mounted THREE.Group sharing the one grid scene — needed because the
// shared scene holds every visible card's figure at once; a single-card blit must hide every OTHER
// group for that render pass (toggling .visible), then restore, so each card's canvas shows only its
// own figure despite sharing one GL context.
const _cardState = new WeakMap();
const _liveGroups = new Set();
let _liveCount = 0;
let _gridObserver = null;
let _hoverRaf = null;

function _mountCard(cardEl, entry) {
  if (_cardState.has(cardEl)) return;
  if (_liveCount >= LIVE_CARD_CAP) return; // soft cap — a card simply stays un-rendered until room frees up
  _ensureSharedGridContext();
  const group = _buildFigureFor(entry);
  if (!group) return;
  _sharedScene.add(group);
  _liveGroups.add(group);
  _liveCount++;
  _cardState.set(cardEl, { group, entry });
  _blitCard(cardEl);
  // one static paint; hover/focus re-render on demand only (Fable: "a static card is literally
  // free after first paint")
  cardEl.addEventListener("mouseenter", _onCardHoverStart);
  cardEl.addEventListener("focus", _onCardHoverStart);
  cardEl.addEventListener("mouseleave", _onCardHoverEnd);
  cardEl.addEventListener("blur", _onCardHoverEnd);
}

function _unmountCard(cardEl) {
  const st = _cardState.get(cardEl);
  if (!st) return;
  if (_sharedScene) _sharedScene.remove(st.group);
  _liveGroups.delete(st.group);
  _disposeFigure(st.group);
  _cardState.delete(cardEl);
  _liveCount--;
  cardEl.removeEventListener("mouseenter", _onCardHoverStart);
  cardEl.removeEventListener("focus", _onCardHoverStart);
  cardEl.removeEventListener("mouseleave", _onCardHoverEnd);
  cardEl.removeEventListener("blur", _onCardHoverEnd);
}

function _blitCard(cardEl) {
  if (!_sharedRenderer) return;
  const st = _cardState.get(cardEl);
  if (!st) return;
  // isolate this card's group for the render pass — hide every other live group sharing the scene,
  // restore afterward (cheap: a boolean flip, not a scene rebuild).
  const others = [];
  _liveGroups.forEach((g) => { if (g !== st.group && g.visible) { others.push(g); g.visible = false; } });
  _sharedRenderer.render(_sharedScene, _sharedCamera);
  others.forEach((g) => { g.visible = true; });
  const canvas2d = cardEl.querySelector("canvas.mm-card-canvas");
  if (!canvas2d || !canvas2d.getContext) return;
  const ctx2d = canvas2d.getContext("2d");
  if (!ctx2d) return;
  ctx2d.imageSmoothingEnabled = false;
  ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
  ctx2d.drawImage(_sharedRenderer.domElement, 0, 0, canvas2d.width, canvas2d.height);
}

function _onCardHoverStart(ev) {
  const cardEl = ev.currentTarget;
  const st = _cardState.get(cardEl);
  if (!st) return;
  const start = performance.now();
  const spin = () => {
    const cur = _cardState.get(cardEl);
    if (!cur) return; // unmounted mid-hover
    cur.group.rotation.y = (performance.now() - start) / 900;
    _blitCard(cardEl);
    cur._raf = requestAnimationFrame(spin);
  };
  st._raf = requestAnimationFrame(spin);
}

function _onCardHoverEnd(ev) {
  const cardEl = ev.currentTarget;
  const st = _cardState.get(cardEl);
  if (!st) return;
  if (st._raf) cancelAnimationFrame(st._raf);
  st._raf = null;
  st.group.rotation.y = 0;
  _blitCard(cardEl);
}

function _bandColor(band) {
  return ({
    Grounded: "#5f8a3f",
    Textured: "#7a8fa8",
    Strange: "#2e6f63",
    Volatile: "#c07a3a",
    Mythic: "#c4435e"
  })[band] || "#7c6a4c";
}

function _cardHTML(entry) {
  const tier = provenanceTierFor(entry.modelKey);
  const chip = entry.corpus === "realm" ? entry.realm : "regular";
  return `<div class="mm-card" tabindex="0" role="button" data-id="${entry.id}" aria-label="${entry.name}, ${chip}, CR ${entry.cr}, ${entry.type || ""}">
    <canvas class="mm-card-canvas" width="96" height="96"></canvas>
    <div class="mm-card-name">${entry.name}</div>
    <div class="mm-card-meta"><span class="mm-chip">${chip}</span> CR ${entry.cr != null ? entry.cr : "—"} · ${entry.type || "—"}${tier === "cuboid" ? ' <span class="mm-chip mm-chip-cuboid">cuboid</span>' : ""}</div>
  </div>`;
}

function _buildGrid(container, entries) {
  const grid = document.createElement("div");
  grid.className = "mm-grid";
  grid.setAttribute("role", "list");
  grid.setAttribute("aria-label", "Monster Manual — creature grid, live 3D previews on scroll");
  grid.innerHTML = entries.map(_cardHTML).join("");
  container.appendChild(grid);

  const byId = {};
  for (const e of entries) byId[e.id] = e;

  if (typeof IntersectionObserver !== "undefined") {
    _gridObserver = new IntersectionObserver((observedEntries) => {
      for (const rec of observedEntries) {
        const cardEl = rec.target;
        const entry = byId[cardEl.dataset.id];
        if (!entry) continue;
        if (rec.isIntersecting) _mountCard(cardEl, entry);
        else _unmountCard(cardEl);
      }
    }, { root: container, rootMargin: "200px" });
    grid.querySelectorAll(".mm-card").forEach((el) => _gridObserver.observe(el));
  }

  grid.addEventListener("click", (ev) => {
    const cardEl = ev.target.closest(".mm-card");
    if (!cardEl) return;
    const entry = byId[cardEl.dataset.id];
    if (entry) _openDetail(container, entries, entry);
  });
  grid.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const cardEl = ev.target.closest(".mm-card");
    if (!cardEl) return;
    ev.preventDefault();
    const entry = byId[cardEl.dataset.id];
    if (entry) _openDetail(container, entries, entry);
  });

  return grid;
}

function _teardownGrid(container) {
  if (_gridObserver) {
    _gridObserver.disconnect();
    _gridObserver = null;
  }
  const grid = container.querySelector(".mm-grid");
  if (grid) {
    grid.querySelectorAll(".mm-card").forEach((cardEl) => _unmountCard(cardEl));
  }
}

// ============================================================================
// The detail view — one dedicated orbiting viewer + full stat block/actions/traits/flavor/narrative/
// provenance/copyable id + the alt-menu MECHANISM (spec: no registry entry declares alts today, so
// this ships the mechanism only — hidden whenever absent/singular).
// ============================================================================

let _detailRafId = null;
let _detailGroup = null;
let _detailAlts = null; // {alts:[{label,module,fn}], active index} when a stub/real entry declares them

function _stopDetailLoop() {
  if (_detailRafId != null) {
    cancelAnimationFrame(_detailRafId);
    _detailRafId = null;
  }
}

function _teardownDetailFigure() {
  _stopDetailLoop();
  if (_detailGroup && _detailScene) _detailScene.remove(_detailGroup);
  if (_detailGroup) _disposeFigure(_detailGroup);
  _detailGroup = null;
}

async function _mountDetailFigure(canvasEl, entry) {
  await _ensureThree();
  _ensureDetailContext();
  _teardownDetailFigure();
  _detailGroup = _buildFigureFor(entry);
  if (_detailGroup && _detailScene) _detailScene.add(_detailGroup);
  _detailRenderer.setSize(canvasEl.clientWidth || 320, canvasEl.clientHeight || 320, false);
  if (!canvasEl.contains(_detailRenderer.domElement)) {
    canvasEl.innerHTML = "";
    canvasEl.appendChild(_detailRenderer.domElement);
  }
  const start = performance.now();
  const spin = () => {
    if (_detailGroup) _detailGroup.rotation.y = (performance.now() - start) / 2400;
    if (_detailRenderer && _detailScene && _detailCamera) _detailRenderer.render(_detailScene, _detailCamera);
    _detailRafId = requestAnimationFrame(spin);
  };
  _detailRafId = requestAnimationFrame(spin);
}

function _actionsHTML(actions) {
  if (!actions || !actions.length) return '<div class="mm-muted">—</div>';
  const parseFn = (typeof window !== "undefined") && window.cmParseActionText;
  return actions.map((a) => {
    const parsed = (typeof parseFn === "function" && a.text) ? parseFn(a.text) : {};
    const bits = [];
    if (parsed.atk != null) bits.push(`atk ${parsed.atk >= 0 ? "+" : ""}${parsed.atk}`);
    if (parsed.dmg && parsed.dmg.length) {
      bits.push(parsed.dmg.map((d) => d.die ? `${d.n}d${d.die}${d.bonus ? (d.bonus > 0 ? "+" + d.bonus : d.bonus) : ""} ${d.type || ""}` : `${d.bonus} ${d.type || ""}`).join(", "));
    }
    if (parsed.saveDC != null) bits.push(`DC ${parsed.saveDC} ${(parsed.saveAbility || "").toUpperCase()} save`);
    const parsedLine = bits.length ? `<div class="mm-action-parsed">${bits.join(" · ")}</div>` : "";
    return `<div class="mm-action"><div class="mm-action-name">${a.name || "Action"}</div>${parsedLine}<div class="mm-action-text">${(a.text || "").replace(/\*\*/g, "")}</div></div>`;
  }).join("");
}

function _traitsHTML(traits) {
  if (!traits) return '<div class="mm-muted">—</div>';
  if (Array.isArray(traits)) {
    if (!traits.length) return '<div class="mm-muted">—</div>';
    return traits.map((t) => `<div class="mm-trait"><div class="mm-trait-name">${t.name || "Trait"}</div><div class="mm-trait-text">${(t.text || "").replace(/\*\*/g, "")}</div></div>`).join("");
  }
  // realm-shaped traits: {note, actions:[...]} — the note is the trait-like blurb; actions already
  // surfaced in the Actions section, so only the note renders here (no duplication).
  if (traits.note) return `<div class="mm-trait"><div class="mm-trait-text">${traits.note}</div></div>`;
  return '<div class="mm-muted">—</div>';
}

function _flavorTableHTML(flavorTable) {
  if (!flavorTable || !flavorTable.rows || !flavorTable.rows.length) return '<div class="mm-muted">—</div>';
  const rows = flavorTable.rows.map((r) =>
    `<tr style="border-left:3px solid ${_bandColor(r.band)}"><td class="mm-flavor-n">${r.n}</td><td class="mm-flavor-band" style="color:${_bandColor(r.band)}">${r.band}</td><td class="mm-flavor-text">${r.text}</td></tr>`
  ).join("");
  return `<table class="mm-flavor-table"><caption class="mm-muted">${flavorTable.die || "d8"} flavor table</caption><tbody>${rows}</tbody></table>`;
}

// the alt-menu MECHANISM: renders a bullet/segmented selector under the viewer ONLY when the
// resolved registry entry declares alts:[{label,module,fn}] (none do today — mechanism-only ship).
function _altMenuHTML(entry) {
  const resolved = resolveWholeObject(entry.modelKey);
  const alts = (resolved && Array.isArray(resolved.alts)) ? resolved.alts : (_detailAlts && _detailAlts.stubAlts) || null;
  if (!alts || alts.length < 2) return "";
  return `<div class="mm-alt-menu" role="group" aria-label="Model variant">` +
    alts.map((a, i) => `<button class="btn ghost sm mm-alt-btn${i === 0 ? " active" : ""}" data-alt-idx="${i}">${a.label}</button>`).join("") +
    `</div>`;
}

function _detailHTML(entry) {
  const tier = provenanceTierFor(entry.modelKey);
  const frameLine = entry.corpus === "realm" ? `<div class="mm-frame-line">frame: ${entry.frame || "—"}</div>` : "";
  const abilLine = entry.abilities ? Object.keys(entry.abilities).map((k) => `${k.toUpperCase()} ${entry.abilities[k].score}(${entry.abilities[k].mod >= 0 ? "+" : ""}${entry.abilities[k].mod})`).join(" ") : "—";
  return `
    <div class="mm-detail">
      <div class="mm-detail-viewer-wrap">
        <div class="mm-detail-viewer" data-id="${entry.id}"></div>
        <div class="mm-alt-menu-host">${_altMenuHTML(entry)}</div>
      </div>
      <div class="mm-detail-body">
        <h2 class="mm-detail-name">${entry.name}</h2>
        ${frameLine}
        <div class="mm-detail-id">id: <code class="mm-copy-id" tabindex="0" role="button" title="Click to copy">${entry.id}</code></div>
        <div class="mm-stat-block">
          <div>CR ${entry.cr != null ? entry.cr : "—"}</div>
          <div>${entry.type || "—"} · ${entry.size || "—"}</div>
          <div>AC ${entry.ac != null ? entry.ac : "—"}</div>
          <div>HP ${entry.hp != null ? entry.hp : "—"}</div>
          <div>Speed ${entry.speed || "—"}</div>
          <div>${abilLine}</div>
        </div>
        <h3>Actions</h3>
        <div class="mm-actions">${_actionsHTML(entry.actions)}</div>
        <h3>Traits</h3>
        <div class="mm-traits">${_traitsHTML(entry.traits)}</div>
        <h3>Flavor</h3>
        ${_flavorTableHTML(entry.flavorTable)}
        <h3>Narrative</h3>
        <div class="mm-narrative">${entry.desc || '<span class="mm-muted">—</span>'}</div>
        <div class="mm-narrative-lines">
          <div>Habitat: ${(entry.habitat && entry.habitat.length) ? entry.habitat.join(", ") : "—"}</div>
          <div>Activity: ${(entry.activity && entry.activity.length) ? entry.activity.join("; ") : "—"}</div>
          <div>Treasure: ${entry.treasure || "—"}</div>
          <div>Faction fit: ${entry.factionFit || "—"}</div>
        </div>
        <div class="mm-provenance">Model: <code>${entry.modelKey || "—"}</code> — <span class="mm-tier mm-tier-${tier}">${tier}</span></div>
      </div>
    </div>`;
}

function _openDetail(container, entries, entry) {
  const host = container.querySelector(".mm-detail-host") || (() => {
    const d = document.createElement("div");
    d.className = "mm-detail-host";
    container.appendChild(d);
    return d;
  })();
  host.innerHTML = _detailHTML(entry);
  host.hidden = false;
  const grid = container.querySelector(".mm-grid");
  if (grid) grid.hidden = true;

  const backBtn = document.createElement("button");
  backBtn.className = "btn ghost sm mm-back-btn";
  backBtn.textContent = "← Back to grid";
  backBtn.onclick = () => _closeDetail(container);
  host.insertBefore(backBtn, host.firstChild);

  const viewerEl = host.querySelector(".mm-detail-viewer");
  _mountDetailFigure(viewerEl, entry);

  const copyEl = host.querySelector(".mm-copy-id");
  if (copyEl) {
    const doCopy = () => { if (navigator.clipboard) navigator.clipboard.writeText(entry.id).catch(() => {}); };
    copyEl.addEventListener("click", doCopy);
    copyEl.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); doCopy(); } });
  }

  host.querySelectorAll(".mm-alt-btn").forEach((btn) => {
    btn.addEventListener("click", () => _swapAlt(host, entry, parseInt(btn.dataset.altIdx, 10)));
  });
}

function _swapAlt(host, entry, idx) {
  const resolved = resolveWholeObject(entry.modelKey);
  const alts = (resolved && Array.isArray(resolved.alts)) ? resolved.alts : (_detailAlts && _detailAlts.stubAlts) || null;
  if (!alts || !alts[idx]) return;
  host.querySelectorAll(".mm-alt-btn").forEach((b, i) => b.classList.toggle("active", i === idx));
  // old group disposed via refFigure.dispose inside _mountDetailFigure's own _teardownDetailFigure call
  const altEntry = Object.assign({}, entry, { modelKey: alts[idx].fn || entry.modelKey });
  const viewerEl = host.querySelector(".mm-detail-viewer");
  _mountDetailFigure(viewerEl, altEntry);
}

function _closeDetail(container) {
  _teardownDetailFigure();
  const host = container.querySelector(".mm-detail-host");
  if (host) { host.hidden = true; host.innerHTML = ""; }
  const grid = container.querySelector(".mm-grid");
  if (grid) grid.hidden = false;
}

// test-only hook (fix/bestiary-globals verification): exposes the REAL _applyFilters (filter +
// default alphabetical sort) so the harness can assert the no-filter/all-entries-A-Z contract
// against actual production code, never a reimplementation that could silently drift from it.
export function __applyFiltersForTest(entries, filters) { return _applyFilters(entries, filters || {}); }

// test-only hook (verification §5, red-first): lets the harness inject a stub registry-shaped alt
// list without touching the real WHOLE_OBJECT_REGISTRY. Never used by real entries today.
export function __setStubAlts(stubAlts) { _detailAlts = stubAlts ? { stubAlts } : null; }
// test-only hook: exposes _altMenuHTML(entry) so the harness can assert the mechanism is absent for
// every real entry and present/swappable once a stub is injected, without needing a real DOM/GL pass.
export function __altMenuHTML(entry) { return _altMenuHTML(entry); }

// test-only lifecycle hooks (verification §1, red-first leak check): exercise the REAL _mountCard/
// _unmountCard functions (the ones the IntersectionObserver callback calls in production) against a
// caller-supplied fake card element + entry, without needing a real DOM/GL pass. __liveCardCount()
// reads the same _liveCount counter the cap-check (LIVE_CARD_CAP) enforces in production.
export function __mountCardForTest(cardEl, entry) { return _mountCard(cardEl, entry); }
export function __unmountCardForTest(cardEl) { return _unmountCard(cardEl); }
export function __liveCardCount() { return _liveCount; }
export function __liveCardCap() { return LIVE_CARD_CAP; }

// ============================================================================
// Filters / search — Corpus · realm · CR range · type · size · habitat · has-flavor-table ·
// has-desc · model-tier · free-text name. Filter state lives in the URL query (shareable/reproducible).
// ============================================================================

function _filterHTML() {
  return `<div class="mm-filters" role="search" aria-label="Monster Manual filters">
    <input type="text" class="mm-f-name" placeholder="Search name…" aria-label="Search by name">
    <select class="mm-f-corpus" aria-label="Corpus"><option value="">All corpus</option><option value="regular">Regular</option><option value="realm">Realm</option></select>
    <select class="mm-f-tier" aria-label="Model tier"><option value="">All tiers</option><option value="registered">Registered</option><option value="recipe">Recipe</option><option value="cuboid">Cuboid</option></select>
    <input type="text" class="mm-f-type" placeholder="Type…" aria-label="Creature type">
    <input type="text" class="mm-f-size" placeholder="Size…" aria-label="Size">
    <input type="number" class="mm-f-cr-min" placeholder="CR min" aria-label="CR minimum" step="0.125">
    <input type="number" class="mm-f-cr-max" placeholder="CR max" aria-label="CR maximum" step="0.125">
    <label class="mm-f-check"><input type="checkbox" class="mm-f-has-flavor"> has flavor table</label>
    <label class="mm-f-check"><input type="checkbox" class="mm-f-has-desc"> has desc</label>
  </div>`;
}

function _readFiltersFromURL() {
  if (typeof URLSearchParams === "undefined" || typeof location === "undefined") return {};
  const p = new URLSearchParams(location.search);
  const out = {};
  ["name", "corpus", "tier", "type", "size", "crMin", "crMax", "hasFlavor", "hasDesc"].forEach((k) => {
    const v = p.get("mm_" + k);
    if (v != null && v !== "") out[k] = v;
  });
  return out;
}

function _writeFiltersToURL(filters) {
  if (typeof URLSearchParams === "undefined" || typeof history === "undefined" || typeof location === "undefined") return;
  const p = new URLSearchParams(location.search);
  ["name", "corpus", "tier", "type", "size", "crMin", "crMax", "hasFlavor", "hasDesc"].forEach((k) => p.delete("mm_" + k));
  Object.keys(filters).forEach((k) => { if (filters[k]) p.set("mm_" + k, filters[k]); });
  const q = p.toString();
  history.replaceState(null, "", location.pathname + (q ? "?" + q : ""));
}

function _applyFilters(entries, filters) {
  const filtered = entries.filter((e) => {
    if (filters.name && !e.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.corpus && e.corpus !== filters.corpus) return false;
    if (filters.tier && provenanceTierFor(e.modelKey) !== filters.tier) return false;
    if (filters.type && !(e.type || "").toLowerCase().includes(filters.type.toLowerCase())) return false;
    if (filters.size && (e.size || "").toLowerCase() !== filters.size.toLowerCase()) return false;
    if (filters.crMin && !(e.cr >= parseFloat(filters.crMin))) return false;
    if (filters.crMax && !(e.cr <= parseFloat(filters.crMax))) return false;
    if (filters.hasFlavor === "1" && !(e.flavorTable && e.flavorTable.rows && e.flavorTable.rows.length)) return false;
    if (filters.hasDesc === "1" && !e.desc) return false;
    return true;
  });
  // Adam's ruling (2026-07-06): the grid always shows a stable alphabetical-by-name order — on
  // mount with no filters that means ALL entries A-Z (previously raw data order, which read as
  // random/broken); filtered views stay sorted too rather than reverting to data order. Filters
  // remain real-time with no submit step — only the ORDER of the result changes here.
  return filtered.slice().sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

// ============================================================================
// mount/teardown — the REFERENCE_APPS contract (docs/REFERENCE-SHELF.md).
// ============================================================================

let _mountedContainer = null;
let _mountedEntries = null;

async function mount(container) {
  await _ensureThree();
  const entries = manualEntries();
  _mountedEntries = entries;
  _mountedContainer = container;

  const wrap = document.createElement("div");
  wrap.className = "mm-root";
  wrap.innerHTML = _filterHTML();
  container.appendChild(wrap);

  const filters = _readFiltersFromURL();
  const filterInputs = {
    name: wrap.querySelector(".mm-f-name"),
    corpus: wrap.querySelector(".mm-f-corpus"),
    tier: wrap.querySelector(".mm-f-tier"),
    type: wrap.querySelector(".mm-f-type"),
    size: wrap.querySelector(".mm-f-size"),
    crMin: wrap.querySelector(".mm-f-cr-min"),
    crMax: wrap.querySelector(".mm-f-cr-max"),
    hasFlavor: wrap.querySelector(".mm-f-has-flavor"),
    hasDesc: wrap.querySelector(".mm-f-has-desc")
  };
  if (filters.name) filterInputs.name.value = filters.name;
  if (filters.corpus) filterInputs.corpus.value = filters.corpus;
  if (filters.tier) filterInputs.tier.value = filters.tier;
  if (filters.type) filterInputs.type.value = filters.type;
  if (filters.size) filterInputs.size.value = filters.size;
  if (filters.crMin) filterInputs.crMin.value = filters.crMin;
  if (filters.crMax) filterInputs.crMax.value = filters.crMax;
  if (filters.hasFlavor === "1") filterInputs.hasFlavor.checked = true;
  if (filters.hasDesc === "1") filterInputs.hasDesc.checked = true;

  let gridHost = document.createElement("div");
  gridHost.className = "mm-grid-host";
  wrap.appendChild(gridHost);

  function rerender() {
    const cur = {
      name: filterInputs.name.value,
      corpus: filterInputs.corpus.value,
      tier: filterInputs.tier.value,
      type: filterInputs.type.value,
      size: filterInputs.size.value,
      crMin: filterInputs.crMin.value,
      crMax: filterInputs.crMax.value,
      hasFlavor: filterInputs.hasFlavor.checked ? "1" : "",
      hasDesc: filterInputs.hasDesc.checked ? "1" : ""
    };
    _writeFiltersToURL(cur);
    _teardownGrid(gridHost);
    gridHost.innerHTML = "";
    const filtered = _applyFilters(entries, cur);
    _buildGrid(gridHost, filtered);
  }

  Object.values(filterInputs).forEach((el) => el.addEventListener("input", rerender));
  rerender();
}

function teardown(container) {
  if (!container) return;
  _closeDetail(container);
  _teardownGrid(container.querySelector(".mm-grid-host") || container);
  if (_sharedRenderer) {
    _sharedRenderer.dispose();
    _sharedRenderer = null;
    _sharedScene = null;
    _sharedCamera = null;
  }
  if (_detailRenderer) {
    _detailRenderer.dispose();
    _detailRenderer = null;
    _detailScene = null;
    _detailCamera = null;
  }
  _liveCount = 0;
  _liveGroups.clear();
  container.innerHTML = "";
  _mountedContainer = null;
  _mountedEntries = null;
}

// ============================================================================
// Registration — the shelf entry. Runs at module top-level (post-boot), which S1's registration-
// timing law handles by re-invoking renderStart() for us if #panel-start is already the active panel.
// ============================================================================

if (typeof window !== "undefined" && typeof window.referenceShelfRegister === "function") {
  window.referenceShelfRegister({
    id: "bestiary",
    label: "Monster Manual",
    icon: "\u{1F409}",
    order: 1,
    mount,
    teardown
  });
}

export { mount, teardown, provenanceTierFor };
