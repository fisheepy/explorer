import { speciesMediaMap } from '../src/data/speciesMedia.js';

const REQUEST_TIMEOUT_MS = 10000;

function withTimeout(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

async function probeUrl(url) {
  const head = withTimeout(REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: head.signal,
    });
    if (response.ok) {
      return { ok: true, status: response.status, method: 'HEAD' };
    }

    if (response.status !== 405 && response.status !== 403) {
      return { ok: false, status: response.status, method: 'HEAD' };
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      return { ok: false, status: 'network-error', method: 'HEAD', error: error.message };
    }
  } finally {
    head.clear();
  }

  const get = withTimeout(REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { Range: 'bytes=0-0' },
      signal: get.signal,
    });
    return { ok: response.ok, status: response.status, method: 'GET' };
  } catch (error) {
    return { ok: false, status: 'network-error', method: 'GET', error: error.message };
  } finally {
    get.clear();
  }
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

  for (const entry of entries) {
    const result = await probeUrl(entry.url);
    if (result.ok) {
      console.log(`OK ${entry.speciesId}[${entry.index}] ${result.status} via ${result.method}`);
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

  console.log(`\nAll ${entries.length} media URL(s) passed.`);
}

main();
