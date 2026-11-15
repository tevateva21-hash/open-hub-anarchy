#!/usr/bin/env node
import { runner } from "./helpers.mjs";
import { registerTier1Tests } from "./tier1-features.mjs";
import { registerTier2Tests } from "./tier2-boundaries.mjs";
import { registerTier3Tests } from "./tier3-combinations.mjs";
import { registerTier4Tests } from "./tier4-journeys.mjs";

registerTier1Tests();
registerTier2Tests();
registerTier3Tests();
registerTier4Tests();

runner
  .runFromCli(process.argv.slice(2))
  .then((summary) => {
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error("[E2E Runner Fatal Error]:", err);
    process.exit(1);
  });
