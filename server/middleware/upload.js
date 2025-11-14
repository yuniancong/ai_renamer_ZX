const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// 上传目录
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// 确保上传目录存在
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directory:', err);
  }
};

// 配置存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 保持原始文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// 文件过滤器（可选，暂时允许所有文件）
const fileFilter = (req, file, cb) => {
  // 接受所有文件，交由后续逻辑判断
  cb(null, true);
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB 限制
    files: 50 // 最多50个文件
  }
});

module.exports = {
  upload,
  UPLOAD_DIR,
  ensureUploadDir
};
