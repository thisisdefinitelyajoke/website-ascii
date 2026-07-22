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

function ansiToHex(n) {
  if (n < 16) {
    const basic = [0, 95, 135, 175, 215, 255];
    const b = n === 0 ? 0 : n === 8 ? 95 : basic[(n - 6) % 6] || 0;
    const v = n < 8 ? 128 + n * 16 : n === 8 ? 128 : 255;
    return n < 8
      ? `#${[0,0,0].map(() => Math.min(v, 255).toString(16).padStart(2,'0')).join('')}`
      : `#${n === 8 ? '808080' : n === 9 ? 'ff0000' : n === 10 ? '00ff00' : n === 11 ? 'ffff00' : n === 12 ? '0000ff' : n === 13 ? 'ff00ff' : n === 14 ? '00ffff' : 'ffffff'}`;
  }
  if (n < 232) {
    const i = n - 16;
    const r = (i / 36) | 0;
    const g = ((i % 36) / 6) | 0;
    const b = i % 6;
    const toHex = (v) => [0, 95, 135, 175, 215, 255][v].toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  const gray = (n - 232) * 10 + 8;
  const h = gray.toString(16).padStart(2, '0');
  return `#${h}${h}${h}`;
}

function ansiToHtml(text) {
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '\x1b' && text[i + 1] === '[') {
      const end = text.indexOf('m', i);
      if (end === -1) { result += text.slice(i); break; }
      const code = text.slice(i + 2, end);
      if (code === '0') {
        result += '</span>';
      } else if (code.startsWith('38;5;')) {
        const n = parseInt(code.slice(5), 10);
        result += `<span style="color:${ansiToHex(n)}">`;
      }
      i = end + 1;
    } else {
      result += text[i];
      i++;
    }
  }
  return result;
}

function asciiUrl(key) {
  return `${BASE}/${key}.ascii.json`;
}

function convertEntry(val) {
  return typeof val === 'string' && val.includes('\x1b') ? ansiToHtml(val) : val;
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
    const converted = {};
    for (const [id, val] of Object.entries(data)) {
      converted[id] = convertEntry(val);
    }
    cache[key] = converted;
    return converted[colorwayId] || null;
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
    const converted = {};
    for (const [id, val] of Object.entries(data)) {
      converted[id] = convertEntry(val);
    }
    cache[key] = converted;
    return converted;
  } catch (e) {
    cache[key] = {};
    return cache[key];
  }
}
