#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🚀 Starting AI Renamer ZX                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

console.log('📦 Starting backend server...\n');

// 启动后端服务器
const serverCommand = isWindows ? 'npm.cmd' : 'npm';
const server = spawn(serverCommand, ['start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// 等待后端启动后再启动前端
setTimeout(() => {
  console.log('\n🎨 Starting frontend client...\n');

  const clientCommand = isWindows ? 'npm.cmd' : 'npm';
  const client = spawn(clientCommand, ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit'
  });

  client.on('error', (err) => {
    console.error('❌ Failed to start client:', err);
    server.kill();
    process.exit(1);
  });

  client.on('exit', (code) => {
    console.log('\n👋 Client exited, shutting down server...');
    server.kill();
    process.exit(code);
  });
}, 3000);

// 优雅退出处理
const gracefulShutdown = () => {
  console.log('\n\n👋 Shutting down AI Renamer ZX gracefully...');
  server.kill();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ Services starting...                                 ║
║                                                           ║
║   Backend:  http://localhost:3000                        ║
║   Frontend: http://localhost:5173                        ║
║                                                           ║
║   Press Ctrl+C to stop all services                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);
