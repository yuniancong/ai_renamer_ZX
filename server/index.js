const express = require('express');
const cors = require('cors');
const path = require('path');

const configRoutes = require('./routes/config');
const filesRoutes = require('./routes/files');
const modelsRoutes = require('./routes/models');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log('Query:', req.query);
  }
  if (req.body && Object.keys(req.body).length > 0 && req.body.constructor === Object) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api/config', configRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/models', modelsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Renamer ZX Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🤖 AI Renamer ZX Server                            ║
║                                                           ║
║        Server running on: http://localhost:${PORT}        ║
║        API base URL: http://localhost:${PORT}/api         ║
║                                                           ║
║        Health check: http://localhost:${PORT}/health      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down server gracefully...');
  process.exit(0);
});
