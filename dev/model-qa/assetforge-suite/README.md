# Assetforge candidacy fixture suite

This directory is the retained executable candidacy-evidence corpus for the twelve non-emote Assetforge
vertical slices.

Run every fixture pair:

```bash
python3 build/assetforge.py suite self-test --force
```

Run one family:

```bash
python3 build/assetforge.py boundary self-test --force
```

`suite-receipt.json` is the top-level verdict. `suite-proof-board.png` is the visual index.
`manifests/` and `fixtures/` preserve the exact positive and red-first inputs. Each
`runs/<family>/positive/` directory contains the candidate outputs, family proof board, and
receipt. Each `runs/<family>/negative/receipt.json` records the gate that bit.

All artifacts are quarantined evidence. `PASS` means the family contract worked on its retained
fixture. It does not prove the tool, complete its dedicated proving pass, or admit the fixture art
or any generated candidate to production. Historical filenames retain `proof` for compatibility.
