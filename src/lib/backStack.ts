/**
 * History entries that the system back (browser back, Android back button or gesture, the TWA app's back) pops
 * before it leaves the page: a popup's entry (useBackClose), the game's 전체 모드 entry and its exit guard (focusStore).
 *
 * Every layer is pushed at the current address (hash included, so GameGate stays on the game) and kept in one list,
 * so a back press reaches only the layer on top: a popup opened over 전체 모드 closes first, then 전체 모드 ends.
 * No marker in history.state: the router rewrites the state of every push, so the list is the bookkeeping.
 */

type Layer = { id: number; href: string; onPop: () => void };

const layers: Layer[] = [];
let nextId = 1;
let skip = 0; // pops this module caused itself (dropping a layer), not a back press
let installed = false;

function install() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('popstate', () => {
    if (skip > 0) { skip -= 1; return; }
    const top = layers[layers.length - 1];
    // Only a layer pushed at the address we are now back on: anything else is a navigation of its own.
    if (!top || top.href !== window.location.href) return;
    layers.pop();
    top.onPop();
  });
}

/** Adds an entry at the current address; the next back press pops it and calls `onPop`. */
export function pushLayer(onPop: () => void): number {
  install();
  const href = window.location.href;
  window.history.pushState(null, '', href);
  const id = nextId++;
  layers.push({ id, href, onPop });
  return id;
}

export const hasLayer = (id: number | null) => id !== null && layers.some((layer) => layer.id === id);

/**
 * Takes a layer away. When it is on top and the address is still the one it was pushed at, its history entry is
 * popped too (quietly); otherwise only the bookkeeping goes (the player followed a link, the entry stays behind).
 */
export function dropLayer(id: number | null) {
  const index = layers.findIndex((layer) => layer.id === id);
  if (index < 0) return;
  const [layer] = layers.splice(index, 1);
  if (index === layers.length && window.location.href === layer.href) { skip += 1; window.history.back(); }
}

/** Forgets a layer without touching the history (its page is going away). */
export function forgetLayer(id: number | null) {
  const index = layers.findIndex((layer) => layer.id === id);
  if (index >= 0) layers.splice(index, 1);
}

/** Pops a layer that is on top and then runs `then` (leaving the page through the history, e.g. GameGate's exit). */
export function popLayerThen(id: number | null, then: () => void): boolean {
  const index = layers.findIndex((layer) => layer.id === id);
  if (index < 0 || index !== layers.length - 1 || window.location.href !== layers[index].href) { forgetLayer(id); return false; }
  layers[index].onPop = then;
  window.history.back();
  return true;
}
