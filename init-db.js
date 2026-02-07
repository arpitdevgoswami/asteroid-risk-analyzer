#!/usr/bin/env node
/**
 * Script to initialize database with sample asteroid data
 */

const db = require('./db');
const sampleData = require('./sample_asteroids.json');

console.log('🚀 Starting database initialization...\n');

try {
    console.log('📥 Loading sample asteroid data...');
    
    if (sampleData && sampleData.asteroids) {
        db.bulkInsertAsteroids(sampleData.asteroids);
        
        console.log('\n✅ Database initialization complete!\n');
        
        // Show statistics
        const stats = db.getStats();
        console.log('📊 Database Statistics:');
        console.log(`   Total Asteroids: ${stats.totalAsteroids}`);
        console.log(`   Hazardous Asteroids: ${stats.hazardousAsteroids}`);
        console.log(`   Average Size: ${stats.averageSize} meters`);
        console.log(`   Database Location: ${stats.dbPath}`);
        console.log(`   Database Size: ${(stats.dbSize / 1024).toFixed(2)} KB\n`);
        
        // Show sample asteroids
        const allAsteroids = db.getAllAsteroids();
        console.log('Sample Asteroids in Database:');
        allAsteroids.slice(0, 5).forEach(asteroid => {
            console.log(`   - ${asteroid.name} | Size: ${asteroid.size}m | Hazardous: ${Boolean(asteroid.is_hazardous)}`);
        });
        
        console.log('\n✨ Ready to run the server!');
        console.log('Run: npm start (or node server1.js)\n');
    } else {
        console.error('❌ Could not find asteroid data in sample_asteroids.json');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
}

db.closeDatabase();
