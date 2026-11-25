import { spawn, exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const pythonCmd = isWindows ? 'python' : 'python3';

console.log('\x1b[1m\x1b[36m========================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m       🚀 SmartAttend Unified Services Runner          \x1b[0m');
console.log('\x1b[1m\x1b[36m========================================================\x1b[0m');
console.log('Starting all services:\n');
console.log('  1. 🏫 Web Dashboard         -> http://localhost:5173');
console.log('  2. 👆 Biometric Bridge       -> http://localhost:8002');
console.log('  3. 👁️ Face Recognition API  -> http://localhost:8001\n');
console.log('Press \x1b[1mCtrl+C\x1b[0m at any time to gracefully stop all services.\n');

const children = [];

function runProcess(name, color, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  children.push(child);

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${color}[${name}]\x1b[0m ${line}`);
      }
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${color}[${name} ERR]\x1b[0m ${line}`);
      }
    }
  });

  child.on('error', (err) => {
    console.error(`${color}[${name} ERROR]\x1b[0m ${err.message}`);
  });

  child.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m Process exited with code ${code}`);
  });

  return child;
}

// 1. Start Web Dashboard
runProcess(
  'WEB:5173',
  '\x1b[34m',
  npmCmd,
  ['--workspace=@smartattend/web', 'run', 'dev'],
  rootDir
);

// 2. Start Biometric Device Bridge
runProcess(
  'BRIDGE:8002',
  '\x1b[33m',
  npmCmd,
  ['--workspace=@smartattend/device-bridge', 'run', 'dev'],
  rootDir
);

// 3. Start Face Recognition Microservice
runProcess(
  'FACE:8001',
  '\x1b[35m',
  pythonCmd,
  ['-m', 'uvicorn', 'app.main:app', '--port', '8001'],
  path.join(rootDir, 'services', 'face-recognition')
);

// Open browser automatically after 3.5 seconds
setTimeout(() => {
  const openCmd = isWindows ? 'start http://localhost:5173' : 'xdg-open http://localhost:5173';
  exec(openCmd);
  console.log('\n\x1b[1m\x1b[32m✔ Browser launched: http://localhost:5173\x1b[0m\n');
}, 3500);

// Graceful shutdown
function shutdown() {
  console.log('\n\x1b[33mStopping all SmartAttend services...\x1b[0m');
  for (const child of children) {
    try {
      if (isWindows) {
        exec(`taskkill /pid ${child.pid} /T /F`);
      } else {
        child.kill('SIGTERM');
      }
    } catch (e) {
      // ignore
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
