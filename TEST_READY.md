# Test Suite Ready — Open Hub (by Anarchy)

The automated End-to-End (E2E) and Contract Test Suite for **Open Hub (by Anarchy)** is complete, audited, and ready for Milestone M4 execution.

## How to Run the Test Suite
- **Run all 152 tests (Tiers 1–4)**:
  ```bash
  node /home/antigravity/tests/e2e/run-e2e.mjs
  ```
- **Run by Tier (`1`, `2`, `3`, `4`)**:
  ```bash
  node /home/antigravity/tests/e2e/run-e2e.mjs --tier=1
  node /home/antigravity/tests/e2e/run-e2e.mjs --tier=2
  node /home/antigravity/tests/e2e/run-e2e.mjs --tier=3
  node /home/antigravity/tests/e2e/run-e2e.mjs --tier=4
  ```
- **Run by Feature (`F1`..`F13`) or Test ID**:
  ```bash
  node /home/antigravity/tests/e2e/run-e2e.mjs --feature=F12
  node /home/antigravity/tests/e2e/run-e2e.mjs --id=T4-J01
  ```

## Test Suite Breakdown (152 Automated Tests)
- **Tier 1 — Feature Happy Paths (`tests/e2e/tier1-features.mjs`)**: **65 tests** (5 tests per feature across `F1` through `F13`).
- **Tier 2 — Boundary & Corner Cases (`tests/e2e/tier2-boundaries.mjs`)**: **65 tests** (5 boundary/corner case tests per feature across `F1` through `F13`).
- **Tier 3 — Cross-Feature Combinations (`tests/e2e/tier3-combinations.mjs`)**: **15 tests** (`T3-C01`..`T3-C15` pairwise & multi-feature integrations).
- **Tier 4 — End-to-End Application User Journeys (`tests/e2e/tier4-journeys.mjs`)**: **7 tests** (`T4-J01`..`T4-J07` full realistic workflows).
- **Shared Runner & HTTP/Contract Harness (`tests/e2e/helpers.mjs`, `tests/e2e/run-e2e.mjs`)**: Automatically probes `http://localhost:3000` (and starts `npx next dev -p 3000` if not already listening), executes all assertions, prints per-tier and per-feature summary tables, and exits with code `0` iff all 152 tests pass (`1` otherwise).
