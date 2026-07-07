/* GENESIS MODULE — src/ui/ref-atlas.js — Reference Shelf app #3: the Table Atlas
   (docs/TABLE-ATLAS.md unit U2). Classic <script>, shared global scope — NOT an ES module (the
   Atlas has no 3D, so it follows the Wiki's pattern, not the Monster Manual's; see the spec's
   "DECISION — classic <script>, NOT an ES module").

   Read-only v1: a dashboard over the whole compiled table corpus — what tables exist, what rows
   they hold, what they're wired to (data/table-usage.js, TABLE_USAGE), how spicy each band-strip
   is (data/table-atlas.js, TABLE_ATLAS_DATA), and how often each table fires in test sessions
   (data/roll-counts.js, ROLL_COUNTS — soft dep, degrades to "—" when absent).

   Registers ONE REFERENCE_APPS entry ({id:'atlas', label:'Table Atlas', order:3, mount, teardown})
   via referenceShelfRegister (classic global, src/ui/reference-shelf.js) — the registration-timing
   law re-invokes renderStart() for us since this module executes post-boot.

   The classic/ES-module boundary: this file reads TABLE_ATLAS_DATA / TABLE_USAGE / ROLL_COUNTS /
   GENESIS_TABLES as bare classic-script globals directly — no window-bridge needed (see the
   spec's "Consequence for the window-bridge" — src/ui/ref-globals-bridge.js is NOT extended here).

   Owns exactly: (nothing global beyond the registration side-effect). Internal state
   (_refAtlasFilter, _refAtlasSort, _refAtlasCategory, _refAtlasWiring, _refAtlasStatus,
   _refAtlasSelected) is module-local (IIFE), not exposed via manifest `owns`, mirroring
   ref-wiki.js's convention exactly. */

(function () {
  var _refAtlasFilter = "";        // free-text over name+id+path
  var _refAtlasCategory = "";      // registry byCategory key, "" = all
  var _refAtlasWiring = "";        // WIRED | PROCEDURE | CHAINED | ORACLE-ONLY | UNMAPPED, "" = all
  var _refAtlasStatus = "";        // active | archived | stub, "" = all (edge case 6: shown, greyed, filterable)
  var _refAtlasSort = "band";      // band | rollCount | rows | die | wiring | category
  var _refAtlasSortDir = "desc";   // asc | desc
  var _refAtlasSelected = null;    // id of the selected table, or null

  // ---- band vocabulary (docs/TABLE-ATLAS.md "Band vocabulary") ----
  var CANONICAL_BANDS = ["Grounded", "Textured", "Strange", "Volatile", "Mythic"];
  // Reuse existing CSS band tokens (FABLE-DEV-TOOLS §6 ruling: no new palette). The repo only
  // carries THREE band-adjacent tokens today (--grounded, --less, --strange) — Volatile/Mythic
  // have no dedicated token yet. DECISION (documented here, not invented silently): Volatile
  // borrows --blood (danger/heat register fits "volatile"); Mythic borrows --gold-leaf (the
  // existing "high/rare" accent used for gold-leaf emphasis elsewhere). Both are visibly distinct
  // from the other three and from each other; swap to dedicated tokens if/when the art ladder
  // grows one (§II.0b) — this is a reuse, not a new palette.
  var BAND_VAR = {
    Grounded: "var(--grounded)",
    Textured: "var(--less)",
    Strange: "var(--strange)",
    Volatile: "var(--blood)",
    Mythic: "var(--gold-leaf)",
    other: "var(--ink-dim)",
    unbanded: "var(--edge)",
  };

  var WIRING_GLYPH = {
    WIRED: "\u{1F517}",        // 🔗
    PROCEDURE: "▶",       // ▶
    CHAINED: "⛓",         // ⛓
    "ORACLE-ONLY": "⚠️", // ⚠️
    UNMAPPED: "❓",        // ❓
  };
  var WIRING_ARIA = {
    WIRED: "wired in code",
    PROCEDURE: "via procedure",
    CHAINED: "chained",
    "ORACLE-ONLY": "Oracle-only — no auto trigger",
    UNMAPPED: "unmapped",
  };

  function _refAtlasData() {
    return typeof TABLE_ATLAS_DATA !== "undefined" ? TABLE_ATLAS_DATA : {};
  }
  function _refAtlasUsage() {
    return typeof TABLE_USAGE !== "undefined" ? TABLE_USAGE : {};
  }
  function _refAtlasRollCounts() {
    // U1 is a SOFT dep — a missing ROLL_COUNTS global must never throw (docs/TABLE-ATLAS.md
    // edge case 1). Every read of this goes through _refAtlasRollCount(id) below, never a bare
    // ROLL_COUNTS[id] access, so absence degrades cleanly everywhere.
    return typeof ROLL_COUNTS !== "undefined" ? ROLL_COUNTS : null;
  }
  function _refAtlasRollCount(id) {
    var rc = _refAtlasRollCounts();
    if (!rc || !(id in rc)) return null; // null = "no roll data" (renders as "—")
    return rc[id];
  }

  function _refAtlasEscapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function _refAtlasStatusNorm(status) {
    // table-atlas.js rows carry the registry's raw status word ("active"/"archive"/"stub");
    // the filter UI and this normalizer speak "archived" (matches docs/TABLE-ATLAS.md wording).
    if (status === "archive") return "archived";
    return status || "active";
  }

  // ---- the under-spiced heuristic (PROVISIONAL — docs/TABLE-ATLAS.md "PROVISIONAL for Adam") ----
  function _refAtlasBandedTotal(bands) {
    var total = 0;
    CANONICAL_BANDS.forEach(function (b) { total += bands[b] || 0; });
    return total;
  }
  function _refAtlasUnderSpiced(entry) {
    var total = _refAtlasBandedTotal(entry.bands || {});
    if (total === 0) return false; // wholly un-banded tables are exempt (a name bank isn't "under-spiced")
    if (entry.playerFacing === "reveal" && total === 0) return false;
    var groundedFrac = (entry.bands.Grounded || 0) / total;
    return groundedFrac > 0.70;
  }

  // ---- band weight for sort-by-band (which band dominates the strip; canonical order = rarity) ----
  function _refAtlasBandWeight(entry) {
    var order = ["unbanded", "other", "Grounded", "Textured", "Strange", "Volatile", "Mythic"];
    var bands = entry.bands || {};
    var best = 0, bestW = 0;
    order.forEach(function (b, i) {
      var n = bands[b] || 0;
      if (n > 0) { best = i; if (n > 0) bestW = i; }
    });
    return bestW;
  }

  function _refAtlasFiltered() {
    var data = _refAtlasData();
    var list = Object.keys(data).map(function (id) { return data[id]; });
    return list.filter(function (e) {
      if (_refAtlasCategory && e.category !== _refAtlasCategory) return false;
      if (_refAtlasWiring && e.wiring !== _refAtlasWiring) return false;
      if (_refAtlasStatus && _refAtlasStatusNorm(e.status) !== _refAtlasStatus) return false;
      if (_refAtlasFilter) {
        var hay = ((e.name || "") + " " + (e.id || "") + " " + (e.path || "")).toLowerCase();
        if (hay.indexOf(_refAtlasFilter.toLowerCase()) === -1) return false;
      }
      return true;
    });
  }

  function _refAtlasSorted(list) {
    var dir = _refAtlasSortDir === "asc" ? 1 : -1;
    var key = _refAtlasSort;
    var withKey = list.map(function (e) {
      var v;
      if (key === "rollCount") { var rc = _refAtlasRollCount(e.id); v = rc == null ? -1 : rc; }
      else if (key === "rows") v = e.rows || 0;
      else if (key === "die") v = e.die || 0;
      else if (key === "wiring") v = e.wiring || "";
      else if (key === "category") v = (e.category || "") + "/" + (e.sub || "");
      else v = _refAtlasBandWeight(e); // "band" default
      return { e: e, v: v };
    });
    withKey.sort(function (a, b) {
      if (a.v < b.v) return -1 * dir;
      if (a.v > b.v) return 1 * dir;
      return (a.e.name || "").localeCompare(b.e.name || "");
    });
    return withKey.map(function (x) { return x.e; });
  }

  function _refAtlasCategories() {
    var data = _refAtlasData();
    var seen = [];
    Object.keys(data).forEach(function (id) {
      var c = data[id].category;
      if (c && seen.indexOf(c) === -1) seen.push(c);
    });
    seen.sort();
    return seen;
  }

  // ---- band strip: labeled counts, NEVER cryptic initials (FABLE-DEV-TOOLS ruling) ----
  function _refAtlasBandStripHTML(entry) {
    var bands = entry.bands || {};
    var segs = CANONICAL_BANDS.map(function (b) {
      var n = bands[b] || 0;
      return '<span class="refatlas-band-seg" style="color:' + BAND_VAR[b] + '" title="' + b + ' ' + n + '">'
        + _refAtlasEscapeHtml(b) + " " + n + "</span>";
    });
    if (bands.other) segs.push('<span class="refatlas-band-seg refatlas-band-other" style="color:' + BAND_VAR.other + '" title="non-spice label, ' + bands.other + ' rows">other ' + bands.other + "</span>");
    if (bands.unbanded) segs.push('<span class="refatlas-band-seg refatlas-band-unbanded" style="color:' + BAND_VAR.unbanded + '" title="carries no spice band">unbanded ' + bands.unbanded + "</span>");
    return '<div class="refatlas-band-strip" role="text">' + segs.join(" · ") + "</div>";
  }

  function _refAtlasWiringBadgeHTML(entry) {
    var glyph = WIRING_GLYPH[entry.wiring] || WIRING_GLYPH.UNMAPPED;
    var aria = WIRING_ARIA[entry.wiring] || WIRING_ARIA.UNMAPPED;
    return '<span class="refatlas-wiring-badge refatlas-wiring-' + _refAtlasEscapeHtml(entry.wiring || "UNMAPPED")
      + '" aria-label="' + _refAtlasEscapeHtml(aria) + '" title="' + _refAtlasEscapeHtml(aria) + '">'
      + glyph + "</span>";
  }

  function _refAtlasRollCountHTML(entry) {
    var rc = _refAtlasRollCount(entry.id);
    if (rc == null) {
      return '<span class="refatlas-rollcount refatlas-rollcount-none" aria-label="no roll data">—</span>';
    }
    return '<span class="refatlas-rollcount" aria-label="fired ' + rc + ' times in test sessions">' + rc + "</span>";
  }

  function _refAtlasUnderSpicedFlagHTML(entry) {
    if (!_refAtlasUnderSpiced(entry)) return "";
    return '<span class="refatlas-flag-underspiced" aria-label="advisory: band distribution looks under-spiced against current doctrine" title="advisory: looks under-spiced against current doctrine">⚑ under-spiced?</span>';
  }

  function _refAtlasRowHTML(entry) {
    var active = entry.id === _refAtlasSelected ? " active" : "";
    var statusChip = _refAtlasStatusNorm(entry.status) !== "active"
      ? '<span class="refatlas-status-chip refatlas-status-' + _refAtlasEscapeHtml(_refAtlasStatusNorm(entry.status)) + '">' + _refAtlasEscapeHtml(_refAtlasStatusNorm(entry.status)) + "</span>"
      : "";
    return (
      '<div class="refatlas-row' + active + '" role="listitem" tabindex="0" ' +
      'aria-label="' + _refAtlasEscapeHtml(entry.name) + ', ' + _refAtlasEscapeHtml(entry.wiring || "UNMAPPED") + ', ' +
      _refAtlasBandedTotal(entry.bands || {}) + ' banded rows of ' + (entry.rows || 0) + '" ' +
      'onclick="_refAtlasSelect(\'' + _refAtlasEscapeHtml(entry.id) + '\')" ' +
      'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();_refAtlasSelect(\'' + _refAtlasEscapeHtml(entry.id) + '\')}">' +
      '<div class="refatlas-row-head">' +
      '<span class="refatlas-row-name">' + _refAtlasEscapeHtml(entry.name) + "</span>" +
      _refAtlasWiringBadgeHTML(entry) +
      statusChip +
      _refAtlasUnderSpicedFlagHTML(entry) +
      "</div>" +
      '<div class="refatlas-row-meta">' +
      '<code>' + _refAtlasEscapeHtml(entry.id) + "</code> · " +
      (entry.die ? "d" + _refAtlasEscapeHtml(entry.die) : "—") + " · " +
      (entry.rows || 0) + " rows · roll count " + _refAtlasRollCountHTML(entry) +
      "</div>" +
      _refAtlasBandStripHTML(entry) +
      "</div>"
    );
  }

  function _refAtlasNavHTML() {
    var cats = _refAtlasCategories();
    var catOptions = ['<option value="">All categories</option>'].concat(
      cats.map(function (c) {
        var sel = c === _refAtlasCategory ? " selected" : "";
        return '<option value="' + _refAtlasEscapeHtml(c) + '"' + sel + ">" + _refAtlasEscapeHtml(c) + "</option>";
      })
    ).join("");
    var wiringOptions = ["", "WIRED", "PROCEDURE", "CHAINED", "ORACLE-ONLY", "UNMAPPED"].map(function (w) {
      var sel = w === _refAtlasWiring ? " selected" : "";
      var label = w === "" ? "All wiring" : (WIRING_GLYPH[w] + " " + w);
      return '<option value="' + _refAtlasEscapeHtml(w) + '"' + sel + ">" + _refAtlasEscapeHtml(label) + "</option>";
    }).join("");
    var statusOptions = ["", "active", "archived", "stub"].map(function (s) {
      var sel = s === _refAtlasStatus ? " selected" : "";
      var label = s === "" ? "All statuses" : s;
      return '<option value="' + _refAtlasEscapeHtml(s) + '"' + sel + ">" + _refAtlasEscapeHtml(label) + "</option>";
    }).join("");
    var sortOptions = [
      ["band", "Spice band"], ["rollCount", "Roll count"], ["rows", "Row count"],
      ["die", "Die shape"], ["wiring", "Wiring status"], ["category", "Category"],
    ].map(function (pair) {
      var sel = pair[0] === _refAtlasSort ? " selected" : "";
      return '<option value="' + pair[0] + '"' + sel + ">" + pair[1] + "</option>";
    }).join("");

    return (
      '<div class="refatlas-nav" role="navigation" aria-label="Table Atlas filters">' +
      '<div class="refatlas-controls">' +
      '<input type="text" class="refatlas-search" placeholder="Search tables…" ' +
      'aria-label="Search the Table Atlas" value="' + _refAtlasEscapeHtml(_refAtlasFilter) + '" ' +
      'oninput="_refAtlasSetFilter(this.value)" />' +
      '<select aria-label="Filter by category" onchange="_refAtlasSetCategory(this.value)">' + catOptions + "</select>" +
      '<select aria-label="Filter by wiring status" onchange="_refAtlasSetWiring(this.value)">' + wiringOptions + "</select>" +
      '<select aria-label="Filter by status" onchange="_refAtlasSetStatus(this.value)">' + statusOptions + "</select>" +
      '<label class="refatlas-sort-label">Sort by <select aria-label="Sort by" onchange="_refAtlasSetSort(this.value)">' + sortOptions + "</select></label>" +
      '<button class="btn ghost sm" onclick="_refAtlasToggleSortDir()" aria-label="Toggle sort direction">' +
      (_refAtlasSortDir === "asc" ? "↑ asc" : "↓ desc") + "</button>" +
      "</div>" +
      "</div>"
    );
  }

  function _refAtlasListHTML() {
    var filtered = _refAtlasSorted(_refAtlasFiltered());
    if (!filtered.length) {
      return '<div class="refatlas-empty">No tables match.</div>';
    }
    return '<div class="refatlas-list" role="list" aria-label="Tables">' +
      filtered.map(_refAtlasRowHTML).join("") + "</div>";
  }

  function _refAtlasCopyBundle(entry) {
    var lines = [
      "id: " + entry.id,
      "name: " + entry.name,
      "source path: " + (entry.path || "(no registry path — Unsorted)"),
      "compiled artifact key (tables.json): " + entry.id,
      "wiring: " + entry.wiring,
      "consumers: " + JSON.stringify(entry.consumers || {}),
      "band histogram: " + JSON.stringify(entry.bands || {}),
      "roll count: " + (_refAtlasRollCount(entry.id) == null ? "no data" : _refAtlasRollCount(entry.id)),
      "suggested edit target: " + (entry.path ? entry.path : "Engine/03. _Tables/** (source .md) — never tables.json"),
    ];
    return lines.join("\n");
  }

  function _refAtlasDetailRowsHTML(entry) {
    var tables = typeof GENESIS_TABLES !== "undefined" ? GENESIS_TABLES : {};
    var compiled = tables[entry.id];
    if (!compiled || !compiled.rows) {
      return '<p class="refatlas-detail-empty">No compiled rows available for this table (id did not resolve into tables.json — see the UNMAPPED wiring badge above).</p>';
    }
    var rows = compiled.rows.map(function (r) {
      var lo = r[0], hi = r[1], band = r[2], txt = r[3];
      var range = lo === hi ? String(lo) : (lo + "–" + hi);
      return '<tr><td>' + _refAtlasEscapeHtml(range) + '</td><td>' + _refAtlasEscapeHtml(band || "") + '</td><td>' + _refAtlasEscapeHtml(txt || "") + "</td></tr>";
    }).join("");
    return (
      '<table class="refatlas-detail-table"><thead><tr><th>Roll</th><th>Band</th><th>Text</th></tr></thead><tbody>' +
      rows + "</tbody></table>"
    );
  }

  function _refAtlasDetailHTML() {
    var data = _refAtlasData();
    var entry = _refAtlasSelected ? data[_refAtlasSelected] : null;
    if (!entry) {
      return '<div class="refatlas-detail refatlas-detail-empty"><p>Select a table from the list to see its rows, wiring, and band histogram.</p></div>';
    }
    return (
      '<article class="refatlas-detail" aria-labelledby="refAtlasDetailTitle">' +
      '<div class="refatlas-detail-cat">' + _refAtlasEscapeHtml(entry.category) + (entry.sub ? " / " + _refAtlasEscapeHtml(entry.sub) : "") + "</div>" +
      '<h3 id="refAtlasDetailTitle" class="refatlas-detail-title">' + _refAtlasEscapeHtml(entry.name) + "</h3>" +
      '<p class="refatlas-detail-meta">' +
      _refAtlasWiringBadgeHTML(entry) + " " + _refAtlasEscapeHtml(WIRING_ARIA[entry.wiring] || "") + " · " +
      "roll count: " + _refAtlasRollCountHTML(entry) + " · " +
      "path: <code>" + _refAtlasEscapeHtml(entry.path || "(none — Unsorted)") + "</code>" +
      "</p>" +
      _refAtlasBandStripHTML(entry) +
      _refAtlasUnderSpicedFlagHTML(entry) +
      '<div class="refatlas-detail-rows">' + _refAtlasDetailRowsHTML(entry) + "</div>" +
      '<button class="btn ghost sm refatlas-copy-btn" onclick="_refAtlasCopy(\'' + _refAtlasEscapeHtml(entry.id) + '\')">Copy edit bundle</button>' +
      "</article>"
    );
  }

  function _refAtlasRender(container) {
    if (!container) return;
    container.innerHTML =
      '<div class="refatlas-root">' +
      _refAtlasNavHTML() +
      '<div class="refatlas-main">' +
      _refAtlasListHTML() +
      '<div class="refatlas-detail-panel">' + _refAtlasDetailHTML() + "</div>" +
      "</div>" +
      "</div>";
  }

  // -- event handlers, global so inline handlers can reach them (same convention as ref-wiki.js) --
  function _refAtlasSelect(id) {
    _refAtlasSelected = id;
    _refAtlasRender(document.getElementById("refShelfBody"));
  }
  function _refAtlasSetFilter(text) {
    _refAtlasFilter = text || "";
    _refAtlasRender(document.getElementById("refShelfBody"));
  }
  function _refAtlasSetCategory(cat) {
    _refAtlasCategory = cat || "";
    _refAtlasRender(document.getElementById("refShelfBody"));
  }
  function _refAtlasSetWiring(w) {
    _refAtlasWiring = w || "";
    _refAtlasRender(document.getElementById("refShelfBody"));
  }
  function _refAtlasSetStatus(s) {
    _refAtlasStatus = s || "";
    _refAtlasRender(document.getElementById("refShelfBody"));
  }
  function _refAtlasSetSort(key) {
    _refAtlasSort = key || "band";
    _refAtlasRender(document.getElementById("refShelfBody"));
  }
  function _refAtlasToggleSortDir() {
    _refAtlasSortDir = _refAtlasSortDir === "asc" ? "desc" : "asc";
    _refAtlasRender(document.getElementById("refShelfBody"));
  }
  function _refAtlasCopy(id) {
    var data = _refAtlasData();
    var entry = data[id];
    if (!entry) return;
    var text = _refAtlasCopyBundle(entry);
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
    return text; // returned for harness/testability even when clipboard API is unavailable
  }

  if (typeof window !== "undefined") {
    window._refAtlasSelect = _refAtlasSelect;
    window._refAtlasSetFilter = _refAtlasSetFilter;
    window._refAtlasSetCategory = _refAtlasSetCategory;
    window._refAtlasSetWiring = _refAtlasSetWiring;
    window._refAtlasSetStatus = _refAtlasSetStatus;
    window._refAtlasSetSort = _refAtlasSetSort;
    window._refAtlasToggleSortDir = _refAtlasToggleSortDir;
    window._refAtlasCopy = _refAtlasCopy;
  } else if (typeof globalThis !== "undefined") {
    globalThis._refAtlasSelect = _refAtlasSelect;
    globalThis._refAtlasSetFilter = _refAtlasSetFilter;
    globalThis._refAtlasSetCategory = _refAtlasSetCategory;
    globalThis._refAtlasSetWiring = _refAtlasSetWiring;
    globalThis._refAtlasSetStatus = _refAtlasSetStatus;
    globalThis._refAtlasSetSort = _refAtlasSetSort;
    globalThis._refAtlasToggleSortDir = _refAtlasToggleSortDir;
    globalThis._refAtlasCopy = _refAtlasCopy;
  }

  function _refAtlasMount(container) {
    _refAtlasFilter = "";
    _refAtlasCategory = "";
    _refAtlasWiring = "";
    _refAtlasStatus = "";
    _refAtlasSort = "band";
    _refAtlasSortDir = "desc";
    _refAtlasSelected = null;
    _refAtlasRender(container);
  }

  function _refAtlasTeardown(container) {
    if (container) container.innerHTML = "";
    _refAtlasFilter = "";
    _refAtlasCategory = "";
    _refAtlasWiring = "";
    _refAtlasStatus = "";
    _refAtlasSelected = null;
  }

  if (typeof referenceShelfRegister === "function") {
    referenceShelfRegister({
      id: "atlas",
      label: "Table Atlas",
      icon: "\u{1F5FA}",
      order: 3,
      mount: _refAtlasMount,
      teardown: _refAtlasTeardown,
    });
  }
})();
