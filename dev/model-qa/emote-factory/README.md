# Sprite-emote factory evidence

`build/assetforge.py` owns this directory. The committed self-test evidence is intentionally split
into:

- `jobs/`: exact job manifests and generation packets for one PC, one ordinary NPC, one humanoid
  monster, and one non-humanoid monster;
- `fixtures/`: deterministic transport fixtures plus four mutations;
- `runs/*/receipt.json`: positive and negative mechanical receipts;
- `runs/*/valid/proof-board.png`: aspect-true visual boards for the four accepted classes;
- `reviews/`: one completely passed review and one deliberately failed rear-hand review;
- `self-test-receipt.json`: the suite-level assertion record.

The positive transport fixtures repeat the canonical source silhouette in all six cells. They prove
the compiler's class coverage, slicing, keying, baseline, packing, metadata, board, and receipt
behavior. They are **not generated emote art** and must not be reviewed or admitted as though they
were six distinct emotional performances.

The negative fixtures prove that a blank state, baseline drift, unrelated palette, and cell-edge
contamination are rejected. The review negatives additionally prove that malformed hand/anatomy
feedback compiles to rejection rather than being hidden behind a technical pass. Derived atlases
and per-state cuts are gitignored because they regenerate from the committed job and fixture.

Run from the repository root:

```bash
python3 build/assetforge.py emote self-test --force
```

The command exits nonzero if any positive fixture fails or any negative fixture passes.
