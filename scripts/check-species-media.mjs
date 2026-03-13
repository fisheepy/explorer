import { speciesMediaMap } from '../src/data/speciesMedia.js';

const REQUEST_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 250;
const MAX_RETRIES = 3;
const USER_AGENT = 'explorer-media-check/1.0';

function withTimeout(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestUrl(url, method) {
  const controller = withTimeout(REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      headers: method === 'GET' ? { Range: 'bytes=0-0', 'user-agent': USER_AGENT } : { 'user-agent': USER_AGENT },
      signal: controller.signal,
    });
    return { ok: response.ok, status: response.status, method };
  } catch (error) {
    return {
      ok: false,
      status: error.name === 'AbortError' ? 'timeout' : 'network-error',
      method,
      error: error.name === 'AbortError' ? 'request timed out' : error.message,
    };
  } finally {
    controller.clear();
  }
}

async function probeUrl(url) {
  let lastResult = { ok: false, status: 'retry-exhausted', method: 'HEAD' };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    if (attempt > 0) {
      await sleep(500 * attempt);
    }

    const headResult = await requestUrl(url, 'HEAD');
    lastResult = headResult;
    if (headResult.ok) {
      return headResult;
    }

    const getResult = await requestUrl(url, 'GET');
    lastResult = getResult;
    if (getResult.ok) {
      return getResult;
    }

    if (headResult.status !== 429 && getResult.status !== 429) {
      return getResult;
    }
  }

  return lastResult;
}

async function main() {
  const entries = Object.entries(speciesMediaMap).flatMap(([speciesId, media]) =>
    (media.images ?? []).map((image, index) => ({ speciesId, index, url: image.url }))
  );

  if (entries.length === 0) {
    console.log('No media URLs found.');
    return;
  }

  let failures = 0;
  let rateLimited = 0;

  for (const entry of entries) {
    await sleep(REQUEST_DELAY_MS);
    const result = await probeUrl(entry.url);
    if (result.ok) {
      console.log(`OK ${entry.speciesId}[${entry.index}] ${result.status} via ${result.method}`);
      continue;
    }

    if (result.status === 429) {
      rateLimited += 1;
      console.log(`SKIP ${entry.speciesId}[${entry.index}] ${result.status} via ${result.method}`);
      console.log(`  ${entry.url}`);
      continue;
    }

    failures += 1;
    const detail = result.error ? ` ${result.error}` : '';
    console.log(`FAIL ${entry.speciesId}[${entry.index}] ${result.status} via ${result.method}${detail}`);
    console.log(`  ${entry.url}`);
  }

  if (failures > 0) {
    console.log(`\n${failures} media URL(s) failed.`);
    process.exitCode = 1;
    return;
  }

  if (rateLimited > 0) {
    console.log(`\nAll remaining media URL(s) passed. ${rateLimited} URL(s) were rate-limited by the host.`);
    return;
  }

  console.log(`\nAll ${entries.length} media URL(s) passed.`);
}

main();
