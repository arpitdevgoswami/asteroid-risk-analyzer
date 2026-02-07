const fs = require('fs');
const path = require('path');

// Use a simple JSON-file-based storage to avoid native-build issues on Windows.
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const ASTEROIDS_FILE = path.join(dataDir, 'asteroids.json');
const CACHE_FILE = path.join(dataDir, 'cache.json');

function readJson(filePath, defaultValue) {
    try {
        if (!fs.existsSync(filePath)) return defaultValue;
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw || 'null') || defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function initializeDatabase() {
    if (!fs.existsSync(ASTEROIDS_FILE)) writeJson(ASTEROIDS_FILE, []);
    if (!fs.existsSync(CACHE_FILE)) writeJson(CACHE_FILE, {});
    console.log('✅ JSON-file database initialized (data/asteroids.json)');
}

function upsertAsteroid(asteroid) {
    const list = readJson(ASTEROIDS_FILE, []);
    const idx = list.findIndex(a => a.name === asteroid.name);
    const record = Object.assign({}, asteroid, {
        velocity: Number(asteroid.velocity),
        distance: Number(asteroid.distance),
        size: Number(asteroid.size),
        is_hazardous: asteroid.is_hazardous ? 1 : 0,
        approach_date: asteroid.approach_date || new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    if (idx >= 0) {
        list[idx] = Object.assign(list[idx], record);
    } else {
        record.id = (list.reduce((m, r) => Math.max(m, r.id || 0), 0) || 0) + 1;
        record.created_at = new Date().toISOString();
        list.push(record);
    }
    writeJson(ASTEROIDS_FILE, list);
    return record;
}

function bulkInsertAsteroids(asteroids) {
    for (const a of asteroids) upsertAsteroid(a);
    console.log(`✅ Inserted/updated ${asteroids.length} asteroids into JSON DB`);
}

function getAllAsteroids() {
    const list = readJson(ASTEROIDS_FILE, []);
    return list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

function getAsteroidByName(name) {
    const list = readJson(ASTEROIDS_FILE, []);
    return list.find(a => a.name === name) || null;
}

function getHazardousAsteroids() {
    const list = readJson(ASTEROIDS_FILE, []);
    return list.filter(a => Number(a.is_hazardous) === 1).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

function getAsteroidsBySize(minSize, maxSize) {
    const list = readJson(ASTEROIDS_FILE, []);
    return list.filter(a => a.size >= minSize && a.size <= maxSize).sort((a, b) => b.size - a.size);
}

// Simple cache stored in a JSON object { key: { data, expiresAt } }
function setCache(key, data, expiresInMinutes = 60) {
    const cache = readJson(CACHE_FILE, {});
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60000).toISOString();
    cache[key] = { data, expiresAt, createdAt: new Date().toISOString() };
    writeJson(CACHE_FILE, cache);
}

function getCache(key) {
    const cache = readJson(CACHE_FILE, {});
    const entry = cache[key];
    if (!entry) return null;
    if (new Date(entry.expiresAt) <= new Date()) {
        delete cache[key];
        writeJson(CACHE_FILE, cache);
        return null;
    }
    return entry.data;
}

function clearExpiredCache() {
    const cache = readJson(CACHE_FILE, {});
    let changed = false;
    for (const k of Object.keys(cache)) {
        if (new Date(cache[k].expiresAt) <= new Date()) {
            delete cache[k];
            changed = true;
        }
    }
    if (changed) writeJson(CACHE_FILE, cache);
}

function getStats() {
    const list = readJson(ASTEROIDS_FILE, []);
    const total = list.length;
    const hazardous = list.filter(a => Number(a.is_hazardous) === 1).length;
    const avgSize = Math.round((list.reduce((s, r) => s + (r.size || 0), 0) / (total || 1)) || 0);
    let dbSize = 0;
    try { dbSize = fs.statSync(ASTEROIDS_FILE).size; } catch (e) {}
    return {
        totalAsteroids: total,
        hazardousAsteroids: hazardous,
        averageSize: avgSize,
        dbPath: ASTEROIDS_FILE,
        dbSize
    };
}

function closeDatabase() {
    // No-op for JSON storage
    console.log('✅ JSON DB closed (no-op)');
}

initializeDatabase();

module.exports = {
    initializeDatabase,
    upsertAsteroid,
    bulkInsertAsteroids,
    getAllAsteroids,
    getAsteroidByName,
    getHazardousAsteroids,
    getAsteroidsBySize,
    setCache,
    getCache,
    clearExpiredCache,
    getStats,
    closeDatabase
};
