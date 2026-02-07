# Database Setup Guide - Asteroid Risk Analyzer

## Overview
The application now includes a **SQLite3 database** for persistent data storage, caching, and improved reliability. This eliminates issues with data fetching and provides offline access to asteroid data.

## Key Features

✅ **Persistent Storage**: Asteroid data is stored in SQLite database  
✅ **Smart Caching**: Data is cached to reduce API calls  
✅ **Fallback System**: If NASA API fails, cached data is served  
✅ **Multiple Query Endpoints**: Filter by size, hazard level, etc.  
✅ **Automatic Initialization**: Database creates itself on first run  

## Installation

1. **Install Dependencies**:
```bash
npm install
```

This will install the new `better-sqlite3` and `sqlite3` packages needed for database operations.

2. **Initialize Database** (Optional - Auto-initializes on first run):
```bash
node init-db.js
```

This populates the database with sample asteroid data from `sample_asteroids.json`.

## Running the Server

```bash
npm start
```
or
```bash
node server1.js
```

The server will:
- Automatically create the database on first run
- Load data from cache if available
- Fall back to NASA API if needed
- Store results in the database for future use

## API Endpoints

### 1. Get All Asteroids (with caching)
```
GET http://localhost:8000/api/asteroids
```
**Response**:
```json
{
  "count": 18,
  "asteroids": [
    {
      "name": "(2002 TS69)",
      "velocity": "4.3",
      "distance": "38.3",
      "size": 78,
      "is_hazardous": false,
      "approach_date": "2026-Feb-07 14:38"
    }
  ]
}
```

### 2. Get Database Statistics
```
GET http://localhost:8000/api/stats
```
**Response**:
```json
{
  "totalAsteroids": 18,
  "hazardousAsteroids": 2,
  "averageSize": 45,
  "dbPath": "C:\\path\\to\\data\\asteroids.db",
  "dbSize": 65536
}
```

### 3. Get Hazardous Asteroids Only
```
GET http://localhost:8000/api/asteroids/hazardous
```

### 4. Get Asteroids by Size Range
```
GET http://localhost:8000/api/asteroids/size/20/100
```
Returns asteroids between 20-100 meters in size.

### 5. Get Single Asteroid by Name
```
GET http://localhost:8000/api/asteroids/(2002%20TS69)
```

### 6. Refresh Data from NASA API
```
POST http://localhost:8000/api/refresh
```
Force a refresh from NASA's API and update the database.

### 7. Health Check with Stats
```
GET http://localhost:8000/api/health
```
Returns server status and database statistics.

## Database Files

- **Location**: `./data/asteroids.db` (created automatically)
- **Size**: ~65KB (grows as more data is added)
- **Tables**:
  - `asteroids` - Asteroid data (name, size, velocity, distance, hazard level)
  - `cache` - API response cache with expiration times
  - `users` - User authentication data
  - `observations` - User observations and notes

## Data Flow

```
Request → Check Cache → Check Database → NASA API → Store in DB → Cache Result → Response
```

If any step has data, it's returned immediately without hitting subsequent steps.

## Troubleshooting

### Database file not created?
- Check that `/data` folder exists and is writable
- Ensure disk space is available
- Check file permissions

### Still not fetching data?
1. Run initialization: `node init-db.js`
2. Check NASA API key in `server1.js`
3. Verify internet connection
4. Check console logs for specific errors

### Clear Database and Start Fresh
```bash
# Delete the database file
rm data/asteroids.db
# Or in PowerShell:
Remove-Item data/asteroids.db

# Then re-initialize
node init-db.js
```

## Monitoring

The console shows real-time information:
- `📦 Returning cached asteroid data` - Using cache
- `💾 Returning asteroid data from database` - Using stored data
- `🌐 Fetching from NASA API...` - Calling NASA endpoint
- `✅ Successfully inserted X asteroids` - Data stored

## Next Steps

1. ✅ Install dependencies with `npm install`
2. ✅ Run server with `npm start`
3. ✅ Access dashboard at `http://localhost:8000`
4. ✅ Monitor API at `http://localhost:8000/api/stats`

Enjoy! 🚀
