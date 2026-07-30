# Source ledger

Every external source used by the study. Access date for all rows: **2026-07-29** (fetches
this session) unless noted. Per-file image records (URL, dims, selection state, reasons)
live in `local-captures/{fft,ts,ic}-ledger.json`; this file lists the principal sources
and the boundaries. No copyrighted capture, ripped asset, or full article text is
committed — full texts and images stay under gitignored `local-captures/`.

## Developer / primary technical sources

| source | URL | type | used for |
|---|---|---|---|
| FFT 1997 Famitsu developer interview (Matsuno, Sakaguchi, Ito, Yoshida) — shmuplations translation | https://shmuplations.com/fft/ | developer interview | 16×16-for-60fps-UI rationale; rotation-as-reveal; "diorama / miniature garden"; terrain-effects-as-UX (lanes 1/2/4/6) |
| Triangle Strategy producers interview (Asano/Arai) — 4Gamer | https://www.4gamer.net/games/478/G047834/20220304093/ | developer interview (JP primary) | 360°-camera map cost; map-edge debates; "accurate HD-2D" = pixel base + build-up (lanes 4/6/8; H2/H5) |
| NE translation of the 4Gamer camera/HD-2D passages | https://nintendoeverything.com/triangle-strategy-devs-on-how-the-game-uses-accurate-hd-2d/ | press translation | quoted EN wording for the above |
| TS pixel-art interview, Shizuka Morimoto — ndw.jp (Nintendo DREAM) | https://www.ndw.jp/trianglestrategy_pixelart-interview/ | developer interview (JP primary) | hand-dotted env textures on 3D; 8-direction sprites for 4 protagonists only; pose×cast cost; outsourced animation; white-value discipline (lanes 3/5/8) |
| TS producers interview — Destructoid | https://www.destructoid.com/triangle-strategy-interview-producers-asano-arai-square-enix-hd-2d-tactics-rpg/ | developer interview | camera-vs-dots challenge quote; Artdink credit (lane 5/8) |
| Ivalice Chronicles — Maehiro interviews (GamingTrend, RPGFan) + Automaton 4Gamer summary | URLs in `local-captures/ic-notes.md` C1–C3 | developer interview | new engine; lost PS1 source; neither-remaster-nor-remake (IC column framing) |
| IC feature/press coverage (official two-mode wording; RPG Site review; Nova Crystallis; Game8 differences) | URLs in `ic-notes.md` C4–C8 | official + press | Enhanced/Classic modes; Tactical View; subdivided sprites + paper-grain overlay |
| Famitsu TS interview page + 4Gamer full text + NE demo-feedback + Inverse pieces | fetched to `local-captures/sources/_raw_*` | press | context/corroboration only |

## Map data / documentation

| source | URL | type | used for |
|---|---|---|---|
| FFHacktics wiki per-map pages (MAP001…MAP119) via Wayback CDX | per-map archive URLs in `fft-ledger.json` | game-data documentation | exact per-tile terrain grids for 48 maps (lane 1 documented dims) |
| libFFT (adamrt) `fft.h` map table | https://github.com/adamrt/libfft | open-source tool (BSD-2) | GNS id → map-name table (0–119) |
| GameFAQs FFT Battle Mechanics Guide v5 (Aerostar) | saved full text in `local-captures/sources/` | community mechanics documentation | height/terrain mechanics references (lane 1/2) |
| Game8 / TheGamer / Neoseeker TS chapter guides | per-file URLs in `ts-ledger.json` | guide documentation + captures | battle IDs, Wolffort mechanics, deploy counts, tile-property HUDs |
| ffhacktics "Map Order In-Attack-Out" page | saved in `sources/` | documentation | map ordering cross-check |

## Image corpora

| corpus | source | provenance & boundary |
|---|---|---|
| FFT five-angle render corpus (121 maps × 5 views, 605 GIFs) | https://fantasyanime.com/finalfantasy/fftactics/fftacticsart_maps.zip | re-downloaded this session; **SHA-256 `fe67a9fa9713e272976dc92bd1bb2680571ba41b4991692e760829f3ee727bff` — byte-identical to the 2026-07-23 Guard-Post-Study acquisition ledger**. Community renders of shipped map data (2008 fftactics.art rip); geometry-faithful; reference-only; gitignored |
| FFT per-map wiki/Fandom captures (Wayback `id_` originals; Fandom MediaWiki API `format=original`) | per-file URLs in `fft-ledger.json` | community captures + render diagrams; reference-only; gitignored |
| TS captures (Game8, TheGamer, Steam store, official site) | per-file URLs in `ts-ledger.json` | press/official/guide captures; 66 selected / 4 quarantined / 2 rejected; gitignored |
| IC captures (Square Enix official site + press kit, Gematsu, Game8, store pages) | per-file URLs in `ic-ledger.json` | incl. 2 first-party same-camera mode pairs; 33 selected / 7 rejected kept for audit; gitignored |
| In-repo `Reference/FFT Battle Maps/` (22 loose files, incl. 4K IC AVIF, © SQEX press frames) | committed to Genesis repo prior to this study (Adam's collection) | inspected + cataloged; original web sources of some files untraced — labeled; used as IC/FFT supplementary evidence |

## Genesis internal sources

Authority docs (the 16 §3 files), clay-capture receipts, PROMPT-SET documented cell
intents, palette/registry JSONs, BW3/light-lab build records — all cited in-lane with
paths; version state recorded in GENESIS-CAPTURE-INVENTORY (master `b72228b3`, terrain
`32b907ad`, sites `af99980e`).

## Boundary confirmations (§13.B provenance gate)

- Copyrighted captures: **untracked** (`local-captures/`, `local-analysis-plates/` in
  `.gitignore` — verified).
- No ripped game asset, disc data, or extracted mesh/texture entered the repository; no
  disc image was acquired. (FFHacktics hosts per-map .glb meshes — deliberately NOT
  fetched.)
- No AI-generated or fan-made image is treated as shipped-game evidence (quarantines:
  fft-early-prototype-mockup; AI-suspect files excluded by agents; Genesis target renders
  are always labeled as Genesis targets, never as game evidence).
- Community-tier claims are labeled (DTG blog corroboration; Kirkwall-class weak sources
  were already excluded in the prior urban study and not revived).
- Quotes in committed files are short and attributed; full texts live only in
  `local-captures/sources/`.
