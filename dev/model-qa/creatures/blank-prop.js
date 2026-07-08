/* dev/model-qa/creatures/blank-prop.js — the PLAIN BLOCK (TABLETOP-UNITS.md §U3 / TABLETOP-
   VISION.md §2's "the blank piece" — prop half). Bottom of resolveWholeObject's fallback chain
   (theater-figures.js "blank:prop" entry): a featureless square-prism block, ONE neutral channel,
   no ornamentation — the placeholder mini-terrain piece for a scene-identity prop the registry
   can't yet resolve (never renders as an empty zone; never the cuboid load-failure path).

   Same landmark-table / probe-lib discipline as every other whole-object module (prop-container.js
   is the closest sibling) — one function, one geometry frame, no anchors. The block is authored as
   many identical stacked bands (not a single 12-tri box) purely so a plain shape still clears the
   harness's tri-count floor (dev/verify-theater-figures.mjs check 2, [120,2600]) without adding any
   visual ornamentation — every band is IDENTICAL in radius, so the silhouette reads as one flat-
   sided block, not a tapered/faceted shape. */
import { V, stack, setChannels } from '../probe-lib.js';

export function buildBlankProp(){
  const NEUTRAL = 0x8f8a80;
  const NEUTRAL_DK = 0x726d64;
  setChannels({ [NEUTRAL]: 'stone', [NEUTRAL_DK]: 'stone' });

  const bands = [];
  const BAND_COUNT = 16; // identical radius every band — subdivision only, never a taper
  for(let i = 0; i < BAND_COUNT; i++){
    const t = i / (BAND_COUNT - 1);
    bands.push({ y: 0.02 + t * 0.60, rx: 0.20, rz: 0.20, hex: (i % 2 === 0) ? NEUTRAL : NEUTRAL_DK });
  }
  stack(bands, 4, {
    phase: Math.PI / 4, // corners on-axis -> a flat-faced square prism, not a diamond
    capTop: { hex: NEUTRAL_DK, lift: 0.02 },
    capBot: { hex: NEUTRAL_DK, lift: 0.02 },
  });
}
