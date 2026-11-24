// Web Worker for the 벽바둑 "매우 어려움" AI: runs the search off the main thread so the board stays responsive.
import { type HellRequest, hellSearch } from './wallgoHell';

self.onmessage = (event: MessageEvent<{ id: number; request: HellRequest }>) => {
  const { id, request } = event.data;
  let result = null;
  try { result = hellSearch(request); } catch { result = null; }
  self.postMessage({ id, result });
};
