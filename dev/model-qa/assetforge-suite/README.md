# Assetforge suite proof

This directory is the retained executable proof corpus for the twelve non-emote Assetforge
vertical slices.

Run every proof:

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
fixture; it does not mean the fixture art or any generated candidate is admitted to production.
