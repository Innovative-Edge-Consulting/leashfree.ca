import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://leashfree.ca";
const HOST = "leashfree.ca";
const KEY_FILE = "26d88966f7a74cddaf13e59cc8015171.txt";
const KEY_LOCATION = `${SITE}/${KEY_FILE}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";
const MAX_URLS_PER_REQUEST = 10000;
const MAX_SUBMIT_ATTEMPTS = Number.parseInt(process.env.INDEXNOW_RETRIES || "5", 10);
const RETRY_DELAY_MS = Number.parseInt(process.env.INDEXNOW_RETRY_DELAY_MS || "60000", 10);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const urlArgs = args.filter((arg) => arg !== "--dry-run");

function xmlUnescape(value) {
  return value
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => xmlUnescape(match[1].trim()));
}

function readKey() {
  const path = join(process.cwd(), "public", KEY_FILE);
  if (!existsSync(path)) {
    throw new Error(`Missing IndexNow key file at ${path}`);
  }

  return readFileSync(path, "utf8").trim();
}

function urlsFromBuiltSitemaps() {
  const sitemapsDir = join(process.cwd(), "dist", "sitemaps");
  if (!existsSync(sitemapsDir)) {
    throw new Error("No built sitemaps found. Run `npm run build` first, or pass URL arguments.");
  }

  return readdirSync(sitemapsDir)
    .filter((file) => file.endsWith(".xml"))
    .flatMap((file) => extractLocs(readFileSync(join(sitemapsDir, file), "utf8")));
}

function normalizeUrls(urls) {
  const seen = new Set();
  const normalized = [];

  for (const value of urls) {
    const url = new URL(value, SITE);
    if (url.hostname !== HOST) {
      throw new Error(`IndexNow URL does not belong to ${HOST}: ${url.href}`);
    }

    const href = url.href;
    if (!seen.has(href)) {
      seen.add(href);
      normalized.push(href);
    }
  }

  return normalized;
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isVerificationPending(status, text) {
  return status === 403 && text.includes("SiteVerificationNotCompleted");
}

const key = readKey();
const urlList = normalizeUrls(urlArgs.length ? urlArgs : urlsFromBuiltSitemaps());

if (!urlList.length) {
  throw new Error("No URLs found to submit to IndexNow.");
}

for (const batch of chunk(urlList, MAX_URLS_PER_REQUEST)) {
  const body = {
    host: HOST,
    key,
    keyLocation: KEY_LOCATION,
    urlList: batch
  };

  if (dryRun) {
    console.log(`IndexNow dry run: ${batch.length} URLs would be submitted to ${INDEXNOW_ENDPOINT}`);
    continue;
  }

  for (let attempt = 1; attempt <= MAX_SUBMIT_ATTEMPTS; attempt += 1) {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(body)
    });

    if ([200, 202].includes(response.status)) {
      console.log(`IndexNow submitted ${batch.length} URLs with HTTP ${response.status}`);
      break;
    }

    const text = await response.text();
    const shouldRetry = attempt < MAX_SUBMIT_ATTEMPTS && isVerificationPending(response.status, text);

    if (!shouldRetry) {
      throw new Error(`IndexNow submission failed with HTTP ${response.status}: ${text}`);
    }

    console.log(
      `IndexNow verification is pending; retrying in ${Math.round(RETRY_DELAY_MS / 1000)}s ` +
        `(${attempt}/${MAX_SUBMIT_ATTEMPTS})`
    );
    await sleep(RETRY_DELAY_MS);
  }
}
