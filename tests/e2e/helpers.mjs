import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

export const ROOT_DIR = "/home/antigravity";
export const BASE_URL = process.env.OPENHUB_BASE_URL || "http://localhost:3000";

const pageCache = new Map();
let spawnedServerProcess = null;

/**
 * Resolves a project-relative path, supporting transparent fallback between
 * tailwind.config.ts and tailwind.config.js.
 */
function resolveProjectPath(relPath) {
  const cleanRel = relPath.replace(/^\/+/, "");
  const fullPath = path.join(ROOT_DIR, cleanRel);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  if (cleanRel === "tailwind.config.ts") {
    const jsFallback = path.join(ROOT_DIR, "tailwind.config.js");
    if (fs.existsSync(jsFallback)) return jsFallback;
  }
  if (cleanRel === "tailwind.config.js") {
    const tsFallback = path.join(ROOT_DIR, "tailwind.config.ts");
    if (fs.existsSync(tsFallback)) return tsFallback;
  }
  return fullPath;
}

export function fileExists(relPath) {
  const target = resolveProjectPath(relPath);
  return fs.existsSync(target);
}

export function readProjectFile(relPath) {
  const target = resolveProjectPath(relPath);
  if (!fs.existsSync(target)) {
    throw new Error(`Required project file does not exist: ${relPath} (resolved: ${target})`);
  }
  return fs.readFileSync(target, "utf8");
}

export function readAnyProjectFile(relPaths) {
  for (const relPath of relPaths) {
    if (fileExists(relPath)) {
      return { path: relPath, content: readProjectFile(relPath) };
    }
  }
  throw new Error(`None of the candidate files exist: ${relPaths.join(", ")}`);
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

export function assertIncludes(haystack, needle, message) {
  if (typeof haystack !== "string" || !haystack.includes(needle)) {
    throw new Error(
      `${message} — expected content to include ${JSON.stringify(needle)}`
    );
  }
}

export function assertMatch(text, regex, message) {
  if (typeof text !== "string" || !regex.test(text)) {
    throw new Error(
      `${message} — expected content to match ${regex.toString()}`
    );
  }
}

/**
 * Fetches an HTTP route from the running Next.js server on port 3000.
 */
export async function fetchPage(route, options = {}) {
  const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
  const url = `${BASE_URL}${normalizedRoute}`;
  const method = (options.method || "GET").toUpperCase();
  const hasCustomHeaders =
    options.headers && Object.keys(options.headers).length > 0;
  const cacheKey = `${method}:${url}`;

  if (method === "GET" && !hasCustomHeaders && !options.noCache && pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const res = await fetch(url, {
      method,
      headers: options.headers || {},
      redirect: options.redirect || "manual",
      signal: controller.signal,
    });
    const html = await res.text();
    const headersObj = {};
    res.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    const result = {
      status: res.status,
      ok: res.ok,
      headers: headersObj,
      html,
      url: res.url,
    };

    if (method === "GET" && !hasCustomHeaders && !options.noCache) {
      pageCache.set(cacheKey, result);
    }

    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Probes localhost:3000 and starts `npx next dev -p 3000` if not already listening.
 */
export async function ensureServerReady() {
  const isUp = async () => {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        signal: AbortSignal.timeout(2500),
      });
      return res.status > 0;
    } catch {
      return false;
    }
  };

  if (await isUp()) {
    return () => {};
  }

  console.log(`[E2E] Port 3000 not listening. Spawning Next.js dev server in ${ROOT_DIR}...`);
  spawnedServerProcess = spawn("npx", ["next", "dev", "-p", "3000"], {
    cwd: ROOT_DIR,
    stdio: "ignore",
    detached: false,
    env: { ...process.env, PORT: "3000" },
  });

  const start = Date.now();
  while (Date.now() - start < 25000) {
    if (await isUp()) {
      console.log(`[E2E] Next.js server ready on ${BASE_URL}`);
      return () => {
        if (spawnedServerProcess) {
          spawnedServerProcess.kill("SIGTERM");
          spawnedServerProcess = null;
        }
      };
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(`Timed out waiting 25s for Next.js server on ${BASE_URL}`);
}

class TestRunner {
  constructor() {
    this.tests = [];
  }

  register(id, tier, feature, title, fn) {
    this.tests.push({ id, tier: Number(tier), feature, title, fn });
  }

  async runFromCli(argv = process.argv.slice(2)) {
    const tierArg = argv.find((a) => a.startsWith("--tier="));
    const featureArg = argv.find((a) => a.startsWith("--feature="));
    const idArg = argv.find((a) => a.startsWith("--id="));

    const filterTier = tierArg ? Number(tierArg.split("=")[1]) : null;
    const filterFeature = featureArg ? featureArg.split("=")[1].toUpperCase() : null;
    const filterId = idArg ? idArg.split("=")[1] : null;

    const selected = this.tests.filter((t) => {
      if (filterTier && t.tier !== filterTier) return false;
      if (filterFeature && !t.feature.toUpperCase().split("+").includes(filterFeature) && t.feature.toUpperCase() !== filterFeature) {
        return false;
      }
      if (filterId && !t.id.includes(filterId)) return false;
      return true;
    });

    const cleanup = await ensureServerReady();
    const results = [];
    let passed = 0;
    let failed = 0;

    console.log(`\n================================================================================`);
    console.log(`OPEN HUB (BY ANARCHY) — E2E & CONTRACT TEST SUITE (${selected.length} tests selected)`);
    console.log(`================================================================================\n`);

    for (const testCase of selected) {
      const t0 = Date.now();
      try {
        await testCase.fn();
        const elapsed = Date.now() - t0;
        passed++;
        results.push({ ...testCase, status: "PASS", elapsed, error: null });
        console.log(`  [PASS] [${testCase.id}] (T${testCase.tier} | ${testCase.feature}) ${testCase.title} (${elapsed}ms)`);
      } catch (err) {
        const elapsed = Date.now() - t0;
        failed++;
        const errMsg = err instanceof Error ? err.message : String(err);
        results.push({ ...testCase, status: "FAIL", elapsed, error: errMsg });
        console.log(`  [FAIL] [${testCase.id}] (T${testCase.tier} | ${testCase.feature}) ${testCase.title} (${elapsed}ms)`);
        console.log(`         ↳ ${errMsg}`);
      }
    }

    cleanup();

    // Summary by Tier
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`SUMMARY BY TIER`);
    console.log(`--------------------------------------------------------------------------------`);
    for (const tierNum of [1, 2, 3, 4]) {
      const tierTests = results.filter((r) => r.tier === tierNum);
      if (tierTests.length === 0) continue;
      const tierPass = tierTests.filter((r) => r.status === "PASS").length;
      const tierFail = tierTests.length - tierPass;
      console.log(
        `  Tier ${tierNum}: ${tierPass}/${tierTests.length} passed (${tierFail} failed)`
      );
    }

    // Summary by Feature
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`SUMMARY BY FEATURE`);
    console.log(`--------------------------------------------------------------------------------`);
    const features = Array.from(new Set(results.map((r) => r.feature)));
    for (const feat of features) {
      const featTests = results.filter((r) => r.feature === feat);
      const featPass = featTests.filter((r) => r.status === "PASS").length;
      const featFail = featTests.length - featPass;
      console.log(
        `  ${feat.padEnd(14)}: ${featPass}/${featTests.length} passed (${featFail} failed)`
      );
    }

    console.log(`\n================================================================================`);
    console.log(`TOTAL: ${passed}/${selected.length} PASSED | ${failed} FAILED`);
    console.log(`================================================================================\n`);

    return { total: selected.length, passed, failed, results };
  }
}

export const runner = new TestRunner();

export function test(id, tier, feature, title, fn) {
  runner.register(id, tier, feature, title, fn);
}
