/**
 * Silent demo capture (~105–120s) for voiceover / captions.
 * Run: npm run demo (terminal 1) then npm run demo:record (terminal 2)
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "docs/video");
fs.mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  recordVideo: {
    dir: outDir,
    size: { width: 1440, height: 900 },
  },
});

const page = await context.newPage();
const base = process.env.DEMO_URL || "http://localhost:8787";

await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => fetch("/api/session/reset", { method: "POST" }));
await page.reload({ waitUntil: "networkidle" });
await sleep(600);

// ~0:00–0:15 Home pitch
await sleep(15000);

// ~0:15–0:42 Watch a delivery
await page.getByRole("button", { name: "Watch a delivery" }).click();
await sleep(6500);
await sleep(20000);

// ~0:42–0:58 Apply
const apply = page.getByRole("button", {
  name: /Check porch|Enable announce|Set a 30-minute/i,
});
await apply.first().click();
await sleep(12000);
const yes = page.getByRole("button", { name: "Yes" });
if (await yes.count()) {
  await yes.first().click();
  await sleep(4000);
}

// ~0:58–1:25 Timeline
await page.getByRole("button", { name: "Timeline · judge demo" }).click();
await sleep(22000);

// ~1:25–1:38 Privacy toggle
const privacy = page.locator("#privacyToggle");
if (await privacy.count()) {
  await privacy.click();
  await sleep(4000);
  await privacy.click();
  await sleep(4000);
}

// ~1:38–1:55 Close on Home
await page.getByRole("button", { name: "Home · what you see" }).click();
await sleep(14000);

await context.close();
await browser.close();

const videos = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith(".webm"))
  .map((f) => ({
    f,
    t: fs.statSync(path.join(outDir, f)).mtimeMs,
  }))
  .sort((a, b) => b.t - a.t);

if (!videos.length) {
  console.error("No video written");
  process.exit(1);
}

const src = path.join(outDir, videos[0].f);
const dest = path.join(outDir, "pps-demo-silent.webm");
if (fs.existsSync(dest)) {
  const bak = path.join(outDir, `pps-demo-silent-prev.webm`);
  fs.renameSync(dest, bak);
}
fs.renameSync(src, dest);

const dur = execSync(
  `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${dest}"`,
  { encoding: "utf8" },
).trim();
console.log(`Wrote ${dest} (${dur}s)`);
