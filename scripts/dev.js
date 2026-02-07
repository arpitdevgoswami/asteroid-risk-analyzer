const { spawn } = require('child_process');
const path = require('path');

function startServer(name, script, port) {
  const proc = spawn('node', [script], { cwd: path.join(__dirname, '..'), env: process.env });

  proc.stdout.on('data', (d) => {
    process.stdout.write(`[${name}] ${d}`);
  });
  proc.stderr.on('data', (d) => {
    process.stderr.write(`[${name} ERR] ${d}`);
  });

  proc.on('close', (code) => {
    console.log(`[${name}] exited with ${code}`);
  });

  return proc;
}

console.log('Starting both servers: auth (server.js) and api (server1.js)');
startServer('auth', 'server.js');
startServer('api', 'server1.js');

process.on('SIGINT', () => {
  console.log('\nDev launcher exiting');
  process.exit(0);
});
