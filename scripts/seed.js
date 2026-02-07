const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const sampleFile = path.join(repoRoot, 'sample_asteroids.json');
const dataDir = path.join(repoRoot, 'data');
const asteroidsFile = path.join(dataDir, 'asteroids.json');
const cacheFile = path.join(dataDir, 'cache.json');

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function seed() {
  ensureDir(dataDir);
  if (!fs.existsSync(sampleFile)) {
    console.error('No sample_asteroids.json found to seed from.');
    process.exit(1);
  }

  const sampleRaw = fs.readFileSync(sampleFile, 'utf8');
  // strip BOM if present
  const clean = sampleRaw.replace(/^\uFEFF/, '');
  let parsed;
  try { parsed = JSON.parse(clean); } catch (e) { console.error('Invalid sample_asteroids.json'); console.error(e.message); process.exit(1); }

  const asteroids = parsed.asteroids || [];
  fs.writeFileSync(asteroidsFile, JSON.stringify(asteroids, null, 2), 'utf8');
  fs.writeFileSync(cacheFile, JSON.stringify({}, null, 2), 'utf8');

  console.log(`Seeded ${asteroids.length} asteroids to ${asteroidsFile}`);
}

seed();
