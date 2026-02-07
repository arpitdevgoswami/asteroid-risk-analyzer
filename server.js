const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NASA_API_KEY = 'py68ASYJWRChDIR3wha2XEozyu3aqykOZjVxbS77';

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
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Cosmic Watch running at http://localhost:${PORT}`);
});