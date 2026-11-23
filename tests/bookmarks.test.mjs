import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrl, makeSlug, parseStored, toBase62 } from '../src/lib/bookmarks.js';

test('normalizeUrl accepts http(s) URLs and adds a scheme when missing', () => {
  assert.equal(normalizeUrl('https://example.com'), 'https://example.com/');
  assert.equal(normalizeUrl('  example.com/path '), 'https://example.com/path');
});

test('normalizeUrl rejects empty, non-http and host-less input', () => {
  assert.equal(normalizeUrl(''), null);
  assert.equal(normalizeUrl('   '), null);
  assert.equal(normalizeUrl('javascript:alert(1)'), null);
  assert.equal(normalizeUrl('ftp://example.com'), null);
  assert.equal(normalizeUrl('notaurl'), null);
});

test('toBase62 encodes numbers', () => {
  assert.equal(toBase62(0), '0');
  assert.equal(toBase62(61), 'z');
  assert.equal(toBase62(62), '10');
});

test('makeSlug uses the mona- prefix, is deterministic and avoids collisions', () => {
  const a = makeSlug('https://example.com/');
  assert.match(a, /^mona-[0-9A-Za-z]{4,}$/);
  assert.equal(makeSlug('https://example.com/'), a);
  assert.notEqual(makeSlug('https://example.com/', [a]), a);
});

test('parseStored tolerates bad data', () => {
  assert.deepEqual(parseStored(null), []);
  assert.deepEqual(parseStored('not json'), []);
  assert.deepEqual(parseStored('{}'), []);
  const good = { url: 'https://example.com/', slug: 'mona-abcd' };
  assert.deepEqual(parseStored(JSON.stringify([good, { url: 1 }, null])), [good]);
});
