# Sprite World-Pixel-Density Census

Target: **32 px/ft of alpha-content subject height**.

This is a census, not an approval pass. It changes neither source art nor canonical
physical scale. Transparent canvas padding is excluded. When a governed source pack
declares an authored head-to-feet axis, equipment may extend beyond that physical axis
without falsely inflating character density.

| Metric | Value |
| --- | ---: |
| Registry rows with cut art and world height | 904 |
| Measured sources | 10 |
| Target-compatible (±3%, minimum ±2 px) | 8 |
| Under-density legacy | 0 |
| Over-density legacy | 2 |
| Missing/empty sources | 894 |
| Median measured px/ft | 32.017 |

## Largest density mismatches

| Sprite | Feet | Subject px | Measured px/ft | Verdict |
| --- | ---: | ---: | ---: | --- |
| `spr-fantasy-winged-kobold-urd` | 3 | 217 | 72.33 | over-density-legacy |
| `spr-pc-human-fighter-female` | 5.6 | 204 | 36.43 | over-density-legacy |
| `pc-caster` | 5.7 | 182 | 31.93 | target-compatible |
| `pc-scout` | 5.8 | 186 | 32.07 | target-compatible |
| `guard-crossbow` | 5.8 | 186 | 32.07 | target-compatible |
| `guard-runner` | 5.7 | 182 | 31.93 | target-compatible |
| `pc-support` | 5.9 | 189 | 32.03 | target-compatible |
| `guard-captain` | 6.1 | 195 | 31.97 | target-compatible |
| `pc-vanguard` | 6 | 192 | 32.00 | target-compatible |
| `guard-heavy` | 6.25 | 200 | 32.00 | target-compatible |

New or re-authored sprites should place the subject at `round(feet × 32)` pixels while
allowing a larger padded frame. Existing mismatches require re-authoring, not runtime
texture scaling disguised as compliance.
