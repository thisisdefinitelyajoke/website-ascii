const BASE = 'https://media.githubusercontent.com/media/thisisdefinitelyajoke/database-ascii/master/db';

const cache = {};

function sanitize(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\-.\s]+/g, '_')
    .replace(/[\s_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function asciiUrl(key) {
  return `${BASE}/${key}.ascii.json`;
}

export async function getAsciiArt(colorwayId, makerName) {
  if (!makerName) return null;
  const key = sanitize(makerName);
  if (cache[key]) {
    return cache[key][colorwayId] || null;
  }
  try {
    const res = await fetch(asciiUrl(key));
    if (!res.ok) {
      cache[key] = {};
      return null;
    }
    const data = await res.json();
    cache[key] = data;
    return data[colorwayId] || null;
  } catch (e) {
    cache[key] = {};
    return null;
  }
}

export async function getMakerAsciiMap(makerName) {
  if (!makerName) return {};
  const key = sanitize(makerName);
  if (cache[key]) return cache[key];
  try {
    const res = await fetch(asciiUrl(key));
    if (!res.ok) {
      cache[key] = {};
      return cache[key];
    }
    const data = await res.json();
    cache[key] = data;
    return data;
  } catch (e) {
    cache[key] = {};
    return cache[key];
  }
}
