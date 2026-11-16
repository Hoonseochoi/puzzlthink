// End-to-end encryption for per-player secrets in friend rooms.
// Every browser makes an ECDH key pair and shares only the public half through presence.
// The host and each guest derive the same AES-GCM key, so other players on the channel
// cannot read a guest's private payload.

const b64 = (bytes: ArrayBuffer | Uint8Array) => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let text = '';
  for (const byte of view) text += String.fromCharCode(byte);
  return btoa(text);
};
const unb64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

export const cryptoReady = () => typeof crypto !== 'undefined' && !!crypto.subtle;

export async function makeKeyPair() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey']);
  const pub = b64(await crypto.subtle.exportKey('raw', pair.publicKey));
  return { privateKey: pair.privateKey, pub };
}

export async function deriveKey(privateKey: CryptoKey, peerPub: string) {
  const publicKey = await crypto.subtle.importKey('raw', unb64(peerPub), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  return crypto.subtle.deriveKey({ name: 'ECDH', public: publicKey }, privateKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function seal(key: CryptoKey, value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(value)));
  return { iv: b64(iv), data: b64(data) };
}

export async function open<T>(key: CryptoKey, box: { iv: string; data: string }): Promise<T> {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, key, unb64(box.data));
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}
