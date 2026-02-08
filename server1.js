const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'Z4uVwY8SX6zGguf9ebgvKxQhEzXNUuc9YxqUvNdr';
const AUTH_SERVER = process.env.AUTH_URL || 'http://localhost:4000';

// Middleware
app.use(cors());
app.use(express.json());

// Lightweight proxy for auth API so the frontend can call same-origin /api/auth/*
app.use('/api/auth', async (req, res) => {
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    // Forward /api/auth/* to the authentication server
    const isHealth = req.originalUrl && req.originalUrl.endsWith('/health');
    const targetUrl = isHealth ? `${AUTH_SERVER}/api/health` : `${AUTH_SERVER}${req.originalUrl}`;
    try {
        // Clean headers - only forward content-type and authorization
        const forwardHeaders = {};
        if (req.headers['content-type']) {
            forwardHeaders['content-type'] = req.headers['content-type'];
        }
        if (req.headers['authorization']) {
            forwardHeaders['authorization'] = req.headers['authorization'];
        }

        const axiosConfig = {
            method: req.method,
            url: targetUrl,
            headers: forwardHeaders,
            data: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
            params: req.query,
            timeout: 30000,
            validateStatus: () => true
        };

        console.log('Proxying auth request ->', axiosConfig.method, axiosConfig.url);
        const response = await axios(axiosConfig);

        // Forward response headers (skip hop-by-hop headers)
        const skip = ['transfer-encoding', 'connection', 'keep-alive', 'content-encoding', 'host', 'content-length'];
        for (const k of Object.keys(response.headers || {})) {
            if (skip.includes(k.toLowerCase())) continue;
            res.setHeader(k, response.headers[k]);
        }

        res.status(response.status).json(response.data);
    } catch (err) {
        console.error('Auth proxy error:', err && err.message ? err.message : err);
        res.status(502).json({ 
            error: 'Authentication server unavailable',
            message: 'Please ensure the authentication server is running',
            details: err && err.message ? err.message : 'Network error'
        });
    }
});

// Serve static files (CSS, Images, Client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Route to get Asteroid Data
 * First tries cache, then database, then NASA API
 */
app.get('/api/asteroids', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `asteroids_${today}`;

        // Check cache first
        let cachedData = db.getCache(cacheKey);
        if (cachedData) {
            console.log('📦 Returning cached asteroid data');
            return res.json(cachedData);
        }

        // Check database
        let asteroids = db.getAllAsteroids();
        if (asteroids && asteroids.length > 0) {
            console.log('💾 Returning asteroid data from database');
            const response = {
                count: asteroids.length,
                asteroids: asteroids.map(a => ({
                    name: a.name,
                    velocity: a.velocity.toString(),
                    distance: a.distance.toString(),
                    size: a.size,
                    is_hazardous: Boolean(a.is_hazardous),
                    approach_date: a.approach_date
                }))
            };
            db.setCache(cacheKey, response);
            return res.json(response);
        }

        // Fallback to NASA API
        console.log('🌐 Fetching from NASA API...');
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
        const response = await axios.get(url);
        const data = response.data;

        const asteroidList = data.near_earth_objects[today] || [];

        // Process and store in database
        const formattedData = asteroidList.map(neo => ({
            name: neo.name,
            velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1),
            distance: (parseFloat(neo.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(1),
            size: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
            is_hazardous: neo.is_potentially_hazardous_asteroid,
            approach_date: neo.close_approach_data[0].close_approach_date_full
        }));

        // Store in database
        db.bulkInsertAsteroids(formattedData);

        const responseData = {
            count: data.element_count,
            asteroids: formattedData
        };

        // Cache the response
        db.setCache(cacheKey, responseData);
        res.json(responseData);

    } catch (error) {
        console.error('❌ Error fetching asteroid data:', error.message);

        // As last resort, try to get any available data from database
        try {
            const fallbackData = db.getAllAsteroids();
            if (fallbackData && fallbackData.length > 0) {
                console.log('⚠️ Returning fallback data from database');
                return res.json({
                    count: fallbackData.length,
                    asteroids: fallbackData.map(a => ({
                        name: a.name,
                        velocity: a.velocity.toString(),
                        distance: a.distance.toString(),
                        size: a.size,
                        is_hazardous: Boolean(a.is_hazardous),
                        approach_date: a.approach_date
                    })),
                    warning: 'Showing cached data. Live API unavailable.'
                });
            }
        } catch (e) {
            console.error('Failed to get fallback data:', e.message);
        }

        res.status(500).json({ error: 'Failed to fetch asteroid data' });
    }
});

// Main Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Database Statistics Endpoint
app.get('/api/stats', (req, res) => {
    try {
        const stats = db.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error.message);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Get hazardous asteroids only
app.get('/api/asteroids/hazardous', (req, res) => {
    try {
        const hazardous = db.getHazardousAsteroids();
        res.json({
            count: hazardous.length,
            asteroids: hazardous.map(a => ({
                name: a.name,
                velocity: a.velocity.toString(),
                distance: a.distance.toString(),
                size: a.size,
                is_hazardous: Boolean(a.is_hazardous),
                approach_date: a.approach_date
            }))
        });
    } catch (error) {
        console.error('Error getting hazardous asteroids:', error.message);
        res.status(500).json({ error: 'Failed to fetch hazardous asteroids' });
    }
});

// Get asteroids by size range
app.get('/api/asteroids/size/:min/:max', (req, res) => {
    try {
        const { min, max } = req.params;
        const asteroids = db.getAsteroidsBySize(parseInt(min), parseInt(max));
        res.json({
            count: asteroids.length,
            asteroids: asteroids.map(a => ({
                name: a.name,
                velocity: a.velocity.toString(),
                distance: a.distance.toString(),
                size: a.size,
                is_hazardous: Boolean(a.is_hazardous),
                approach_date: a.approach_date
            }))
        });
    } catch (error) {
        console.error('Error getting asteroids by size:', error.message);
        res.status(500).json({ error: 'Failed to fetch asteroids' });
    }
});

// Get single asteroid by name
app.get('/api/asteroids/:name', (req, res) => {
    try {
        const { name } = req.params;
        const asteroid = db.getAsteroidByName(name);
        if (!asteroid) {
            return res.status(404).json({ error: 'Asteroid not found' });
        }
        res.json({
            name: asteroid.name,
            velocity: asteroid.velocity.toString(),
            distance: asteroid.distance.toString(),
            size: asteroid.size,
            is_hazardous: Boolean(asteroid.is_hazardous),
            approach_date: asteroid.approach_date
        });
    } catch (error) {
        console.error('Error getting asteroid:', error.message);
        res.status(500).json({ error: 'Failed to fetch asteroid' });
    }
});

// Refresh data from NASA API
app.post('/api/refresh', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `asteroids_${today}`;

        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
        console.log('🔄 Refreshing data from NASA API...');

        const response = await axios.get(url);
        const data = response.data;
        const asteroidList = data.near_earth_objects[today] || [];

        const formattedData = asteroidList.map(neo => ({
            name: neo.name,
            velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1),
            distance: (parseFloat(neo.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(1),
            size: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
            is_hazardous: neo.is_potentially_hazardous_asteroid,
            approach_date: neo.close_approach_data[0].close_approach_date_full
        }));

        // Store in database
        db.bulkInsertAsteroids(formattedData);
        db.clearExpiredCache();

        res.json({
            success: true,
            message: `Refreshed ${formattedData.length} asteroid records`,
            count: data.element_count
        });
    } catch (error) {
        console.error('Error refreshing data:', error.message);
        res.status(500).json({ error: 'Failed to refresh data from NASA API' });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    const stats = db.getStats();
    res.json({
        status: 'OK',
        server: 'Asteroid Risk Analyzer with Database',
        timestamp: new Date().toISOString(),
        database: stats
    });
});
// Start Server - try multiple ports if one is in use
const preferredPorts = [process.env.PORT ? Number(process.env.PORT) : PORT, 8000, 3000, 5000, 8001, 3001];

function startServerAtIndex(index = 0) {
    const portToTry = preferredPorts[index] || 0;
    const server = app.listen(portToTry, () => {
        const actualPort = server.address().port;
        console.log(`🚀 Asteroid Risk Analyzer Server running on http://localhost:${actualPort}`);
        console.log(`📡 API Endpoints: http://localhost:${actualPort}/api/asteroids`);
        console.log(`📊 Stats: http://localhost:${actualPort}/api/stats`);
        console.log(`🔄 Refresh: POST http://localhost:${actualPort}/api/refresh`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.warn(`Port ${portToTry} in use, trying next port...`);
            server.close?.();
            if (index + 1 < preferredPorts.length) {
                startServerAtIndex(index + 1);
            } else {
                console.error('No available ports found. Please set PORT environment variable to an unused port and retry.');
                process.exit(1);
            }
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n⏹️ Shutting down server gracefully...');
        server.close(() => {
            console.log('Server closed');
            db.closeDatabase();
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        console.log('\n⏹️ Server termination signal received');
        server.close(() => {
            console.log('Server closed');
            db.closeDatabase();
            process.exit(0);
        });
    });
}

startServerAtIndex(0);

