const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;
const NASA_API_KEY = 'dA7AirbtYyrUyiW1sxLTIrw7qfj5meQhef73MtQ9';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (CSS, Images, Client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Route to get Asteroid Data
 * Fetches data based on the current date
 */
app.get('/api/asteroids', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
        
        const response = await axios.get(url);
        const data = response.data;

        // Process the raw NASA data for your dashboard
        const asteroidList = data.near_earth_objects[today] || [];
        
        const formattedData = asteroidList.map(neo => ({
            name: neo.name,
            velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1),
            distance: (parseFloat(neo.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(1), // Millions of km
            size: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
            is_hazardous: neo.is_potentially_hazardous_asteroid,
            approach_date: neo.close_approach_data[0].close_approach_date_full
        }));

        res.json({
            count: data.element_count,
            asteroids: formattedData
        });
    } catch (error) {
        console.error('Error fetching NASA data:', error.message);
        res.status(500).json({ error: 'Failed to fetch cosmic data' });
    }
});

// Main Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', server: 'NASA Data API', timestamp: new Date().toISOString() });
});
// Start Server - try multiple ports if one is in use
const preferredPorts = [process.env.PORT ? Number(process.env.PORT) : PORT, 8000, 3000, 5000, 8001, 3001];

function startServerAtIndex(index = 0) {
    const portToTry = preferredPorts[index] || 0;
    const server = app.listen(portToTry, () => {
        const actualPort = server.address().port;
        console.log(`🚀 NASA Data Server running on http://localhost:${actualPort}`);
        console.log(`📡 API Endpoint: http://localhost:${actualPort}/api/asteroids`);
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
}

startServerAtIndex(0);

