// Pure helpers for the bookmarks feature (no DOM, no storage) so they can be unit tested.

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function toBase62(n) {
  if (n === 0) return '0';
  let out = '';
  while (n > 0) {
    out = ALPHABET[n % 62] + out;
    n = Math.floor(n / 62);
  }
  return out;
}

export function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Returns a normalized http(s) URL string, or null when the input is not a valid URL.
export function normalizeUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : 'https://' + raw;
  let url;
  try {
    url = new URL(withScheme);
  } catch (err) {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
  return url.href;
}

// Builds a short "mona-" slug, avoiding collisions with the slugs already in use.
export function makeSlug(url, existing = []) {
  const taken = new Set(existing);
  for (let counter = 0; counter < 1000; counter++) {
    const slug = 'mona-' + toBase62(hashString(url + ':' + counter)).padStart(4, '0');
    if (!taken.has(slug)) return slug;
  }
  return 'mona-' + toBase62(Date.now());
}

// Safely parses the stored JSON; anything malformed yields an empty list.
export function parseStored(json) {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data.filter((b) => b && typeof b.url === 'string' && typeof b.slug === 'string');
  } catch (err) {
    return [];
  }
}
