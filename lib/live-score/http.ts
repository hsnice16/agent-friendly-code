const CONCURRENCY = 8;

// A host that stops answering must fail into the retry page well inside the
// route's maxDuration, not hang until the platform kills the function.
const REQUEST_TIMEOUT_MS = 15_000;

export async function pooled<T>(items: T[], fn: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let next = queue.shift(); next !== undefined; next = queue.shift()) await fn(next);
    }),
  );
}

export function timedFetch(url: string, init: RequestInit, deadline?: AbortSignal): Promise<Response> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return fetch(url, { ...init, signal: deadline ? AbortSignal.any([timeout, deadline]) : timeout });
}

// Raw bytes, not `res.text()`: decoding and re-encoding would rewrite invalid
// UTF-8 and change the length the scorer measures.
export async function readCapped(res: Response, max: number): Promise<Uint8Array> {
  if (!res.body) return new Uint8Array();

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (total < max) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value.subarray(0, max - total));
    total += Math.min(value.length, max - total);
  }

  await reader.cancel().catch(() => {});
  return Buffer.concat(chunks);
}
