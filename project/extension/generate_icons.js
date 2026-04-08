const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size) {
  // --- PNG Header & IHDR ---
  function byte(val) { return val & 0xff; }
  function uint32BE(val) {
    return [(val >>> 24) & 0xff, (val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff];
  }
  function crc32(data) {
    let table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const typeBytes = [...type].map(c => c.charCodeAt(0));
    const len = uint32BE(data.length);
    const crcInput = [...typeBytes, ...data];
    const crcVal = uint32BE(crc32(crcInput));
    return [...len, ...typeBytes, ...data, ...crcVal];
  }

  // Draw a simple shield icon on pixel grid
  const pixels = [];
  const bg    = [29, 78, 216, 255];  // blue fill
  const white = [255, 255, 255, 255];
  const trans = [0, 0, 0, 0];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x - size / 2;
      const cy = y - size / 2;
      const r  = size / 2;

      // Circle background
      const inCircle = cx * cx + cy * cy <= r * r;
      if (!inCircle) { pixels.push(...trans); continue; }

      // Draw checkmark-like shield path (white)
      const nx = x / size, ny = y / size;
      const p1x = 0.3, p1y = 0.5;
      const p2x = 0.45, p2y = 0.65;
      const p3x = 0.7, p3y = 0.33;
      const thick = 0.06;

      function distToSeg(ax, ay, bx, by, px, py) {
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
        const ex = ax + t * dx, ey = ay + t * dy;
        return Math.hypot(px - ex, py - ey);
      }

      const d1 = distToSeg(p1x, p1y, p2x, p2y, nx, ny);
      const d2 = distToSeg(p2x, p2y, p3x, p3y, nx, ny);
      const onLine = d1 < thick || d2 < thick;

      pixels.push(...(onLine ? white : bg));
    }
  }

  // Build raw image data (filter byte + RGBA per row)
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    rawRows.push(0); // filter type = None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      rawRows.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawRows));

  const png = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    ...chunk('IHDR', [...uint32BE(size), ...uint32BE(size), 8, 6, 0, 0, 0]),
    ...chunk('IDAT', [...compressed]),
    ...chunk('IEND', []),
  ];

  return Buffer.from(png);
}

const outDir = path.join(__dirname, 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

[16, 48, 128].forEach(size => {
  const buf = createPNG(size);
  const file = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(file, buf);
  console.log(`✅ Created icon${size}.png (${buf.length} bytes)`);
});
