/**
 * Combined Server Launcher for Render.com (single process)
 * Starts both Authentication (4000) and API (8000) servers
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Asteroid Risk Analyzer in Production Mode (Render)...');
console.log('Environment:', process.env.NODE_ENV || 'production');

// Extract main port from PORT env var (default to 4000 for Render compatibility)
const MAIN_PORT = process.env.PORT || 4000;
const API_PORT = parseInt(MAIN_PORT) + 100; // 4100 if main is 4000, etc.

console.log(`📡 Auth Server Port: ${MAIN_PORT}`);
console.log(`📡 API Server Port: ${API_PORT}`);

function startServer(name, script, env) {
  console.log(`\n[${name}] Starting...`);
  
  const serverEnv = Object.assign({}, process.env, env);
  const proc = spawn('node', [script], { 
    cwd: path.join(__dirname),
    env: serverEnv,
    stdio: 'inherit' // Inherit parent stdio to see all logs
  });

  proc.on('error', (err) => {
    console.error(`[${name}] Failed to start:`, err.message);
    process.exit(1);
  });

  proc.on('exit', (code) => {
    console.error(`[${name}] exited with code ${code}`);
    // If one server dies, exit the whole process
    process.exit(code || 1);
  });

  return proc;
}

// Start Auth Server (server.js)
const authProc = startServer('AUTH', 'server.js', { PORT: MAIN_PORT });

// Delay API server start to let Auth server bind first
setTimeout(() => {
  startServer('API', 'server1.js', { PORT: API_PORT });
}, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down servers gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Termination signal received');
  process.exit(0);
});
