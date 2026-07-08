/* dev/model-qa/creatures/blank-figure.js — the UNPAINTED MEEPLE (TABLETOP-UNITS.md §U3 / TABLETOP-
   VISION.md §2's "the blank piece" — figure half). This is the bottom of resolveWholeObject's
   fallback chain (theater-figures.js "blank:figure" entry): a featureless disc + body, ONE neutral
   channel (no skin/cloth/leather/metal breakdown a painted creature carries — this piece has never
   been painted). Stages for soft/ambient co-located NPCs pre-contact (TABLETOP-VISION §2 parity
   condition); codex contact swaps the painted piece in under the hand, this one out.

   Same landmark-table / probe-lib discipline as every other whole-object module (humanoid.js is the
   pattern this mirrors) — no anchors, one function, one geometry frame. Deliberately NO head/limb/
   weapon detail: the whole point is "a proxy mini every real DM grabs," not a creature. */
import { V, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildBlankFigure(){
  /* ---------- ONE NEUTRAL CHANNEL — no palette breakdown, just a single unpainted-resin hue
     (+ its own shade for the taper/cap reads, which is shading, not a second channel) ---------- */
  const NEUTRAL = 0x8f8a80;
  const NEUTRAL_DK = 0x726d64;
  setChannels({ [NEUTRAL]: 'stone', [NEUTRAL_DK]: 'stone' });

  /* featureless body: one tapered loft, no head/limbs — the unpainted-meeple silhouette. Medium-size
     proportions (matches humanoid.js's own hip->neck landmark band, discR 0.42 below). */
  stack([
    { y: 0.10, rx: 0.20, rz: 0.16, hex: NEUTRAL_DK },
    { y: 0.45, rx: 0.24, rz: 0.19, hex: NEUTRAL },
    { y: 0.85, rx: 0.22, rz: 0.17, hex: NEUTRAL },
    { y: 1.05, rx: 0.14, rz: 0.12, hex: NEUTRAL },
    { y: 1.20, rx: 0.085, rz: 0.085, hex: NEUTRAL },
    { y: 1.30, rx: 0.075, rz: 0.075, hex: NEUTRAL_DK },
  ], 10, { capTop: { hex: NEUTRAL_DK, lift: 0.06 } });

  /* base disc — same convention every whole-object figure carries (humanoid.js's own base-disc
     block, mirrored verbatim with the neutral hex). */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => NEUTRAL_DK);
    capFan(r2, V(0, 0.058, 0), NEUTRAL_DK);
  }
}
