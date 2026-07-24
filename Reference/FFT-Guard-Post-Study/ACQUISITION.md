# Acquisition Ledger

All dates are 2026-07-23 unless noted.

| Resource | Source | Local destination | Status | Production use |
|---|---|---|---|---|
| FFT five-angle battle-map corpus | <https://fantasyanime.com/finalfantasy/fftactics/fftacticsart_maps.zip> | `downloads/fftacticsart_maps.zip`, extracted to `maps/five-angle/` | Verified: 121 complete five-view groups, 605 GIFs | Reference only |
| Existing loose FFT screenshots | copied from the current Genesis root before its planned move | `maps/existing-screenshots/` | 22 files copied | Reference only |
| GaneshaDX | <https://github.com/Garmichael/GaneshaDx> | `tools/GaneshaDx/` | Cloned at `215f1f44e808d7d643f20ddd9cce36412c79ebe2` | Tool; GPL-3.0 |
| Heretic FFT toolkit | <https://github.com/adamrt/heretic> | `tools/heretic/` | Cloned with pinned submodules at `f9c7524aa0a9ce6041491c038b6efb52ad2875b3` | Tool/reference; repository clone has no top-level license file |
| libFFT | <https://github.com/adamrt/libfft> | `tools/libfft/` | Cloned at `700ecf557ccd726266f0827adc8ae260c51642fe` | Tool; BSD-2-Clause |
| FFHacktics vanilla-map index | <https://ffhacktics.com/wiki/Category:Vanilla_Maps> | remote reference; map-name metadata is also present in `tools/libfft/fft.h` | Linked; automated API retrieval returned HTTP 403 | Reference only |
| Material Maker 1.3 source | <https://github.com/RodZill4/material-maker/tree/1.3> | `material-maker-1.3/source/` | Clean official tag `1.3` at `1a86d73967479c43db5fa17e5adda5e54a0c886f` | Tool research/reference; MIT |

## Archive verification

- File: `downloads/fftacticsart_maps.zip`
- Bytes reported by source: `27241378`
- SHA-256: `fe67a9fa9713e272976dc92bd1bb2680571ba41b4991692e760829f3ee727bff`
- ZIP test: no errors detected
- Extracted inventory: 605 GIFs
- Group verification: map ids `0` through `120`, five files per group, zero incomplete groups

## Notes

- No raw FFT game data or disc image was downloaded.
- The three tool repositories were clean immediately after acquisition.
- Heretic's private game-data prerequisite is intentionally absent.
