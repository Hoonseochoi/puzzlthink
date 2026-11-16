// Hook points for full-screen ads. Nothing is shown yet: each call resolves at once.
//
// When H5 Games Ads (AdSense's Ad Placement API) is approved for the site, load its script in the
// root layout and implement this with `adBreak({ type: 'next', name, afterAd: resolve, adBreakDone: resolve })`.
// Do not call adBreak before approval: using it without access can put the AdSense account at risk.

/** Shows an interstitial ad (when one is available), then resolves so the caller can continue. */
export function showInterstitial(name: string): Promise<void> {
  void name; // placement name, for reporting once ads are wired up
  return Promise.resolve();
}
