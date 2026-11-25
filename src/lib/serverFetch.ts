/**
 * JSON from the API for server-rendered pages, with a deadline; null when the answer is not ok.
 * A page that waits on the API with no limit hangs with it (2026-11-26: ranking pages stood still for 20 s+
 * after the API host restarted). Callers treat a throw as "no data", so a late answer becomes an empty
 * section instead of a page that never arrives.
 */
export function serverJson<T>(url: string, init: RequestInit & { next?: { revalidate?: number } }, ms = 4000): Promise<T | null> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The race covers a wait that the signal does not reach (for example in the fetch cache).
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new Error(`timeout after ${ms} ms`)); }, ms);
  });
  const answer = fetch(url, { ...init, signal: controller.signal }).then(async (res) => (res.ok ? ((await res.json()) as T) : null));
  return Promise.race([answer, deadline]).finally(() => clearTimeout(timer));
}
