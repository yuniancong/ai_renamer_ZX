const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getSupportedTypes,
  checkFileType,
  addCustomType,
  removeCustomType,
  checkMultipleFiles
} = require('../services/fileTypeManager');
const {
  previewFileRename,
  previewBatchRename,
  executeFileRename,
  executeBatchRename,
  processDirectoryWithPreview
} = require('../services/fileProcessor');
const {
  generateScriptFromPreview
} = require('../services/scriptGenerator');

/**
 * GET /api/files/supported-types
 * 获取支持的文件类型
 */
router.get('/supported-types', asyncHandler(async (req, res) => {
  const types = await getSupportedTypes();
  res.json({
    success: true,
    ...types
  });
}));

/**
 * POST /api/files/add-custom-type
 * 添加自定义文件类型
 */
router.post('/add-custom-type', asyncHandler(async (req, res) => {
  const { extension } = req.body;

  if (!extension) {
    return res.status(400).json({
      success: false,
      error: 'Extension is required'
    });
  }

  const result = await addCustomType(extension);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

/**
 * DELETE /api/files/custom-type/:extension
 * 删除自定义文件类型
 */
router.delete('/custom-type/:extension', asyncHandler(async (req, res) => {
  const { extension } = req.params;
  const result = await removeCustomType(extension);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
}));

/**
 * POST /api/files/check-type
 * 检查文件类型
 */
router.post('/check-type', asyncHandler(async (req, res) => {
  const { filePath, filePaths } = req.body;

  if (filePath) {
    const result = await checkFileType(filePath);
    res.json({
      success: true,
      ...result
    });
  } else if (filePaths && Array.isArray(filePaths)) {
    const result = await checkMultipleFiles(filePaths);
    res.json({
      success: true,
      ...result
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'filePath or filePaths is required'
    });
  }
}));

/**
 * POST /api/files/upload
 * 上传文件
 */
router.post('/upload', upload.array('files'), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  // 检查所有上传文件的类型
  const filePaths = req.files.map(file => file.path);
  const typeCheck = await checkMultipleFiles(filePaths);

  res.json({
    success: true,
    message: `Uploaded ${req.files.length} files`,
    files: req.files.map((file, index) => ({
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      typeCheck: typeCheck.files[index]
    })),
    summary: {
      total: typeCheck.total,
      supported: typeCheck.supported,
      unsupported: typeCheck.unsupported
    }
  });
}));

/**
 * POST /api/files/preview
 * 预览文件重命名（不实际重命名）
 */
router.post('/preview', asyncHandler(async (req, res) => {
  const { filePath, filePaths, options } = req.body;

  if (filePath) {
    const result = await previewFileRename(filePath, options);
    res.json(result);
  } else if (filePaths && Array.isArray(filePaths)) {
    const result = await previewBatchRename(filePaths, options);
    res.json(result);
  } else {
    res.status(400).json({
      success: false,
      error: 'filePath or filePaths is required'
    });
  }
}));

/**
 * POST /api/files/rename
 * 执行文件重命名
 */
router.post('/rename', asyncHandler(async (req, res) => {
  const { renamePairs } = req.body;

  if (!renamePairs || !Array.isArray(renamePairs)) {
    return res.status(400).json({
      success: false,
      error: 'renamePairs array is required'
    });
  }

  const result = await executeBatchRename(renamePairs);
  res.json(result);
}));

/**
 * POST /api/files/process-directory
 * 处理目录（预览模式）
 */
router.post('/process-directory', asyncHandler(async (req, res) => {
  const { dirPath, options } = req.body;

  if (!dirPath) {
    return res.status(400).json({
      success: false,
      error: 'dirPath is required'
    });
  }

  const result = await processDirectoryWithPreview(dirPath, options);
  res.json({
    success: true,
    ...result
  });
}));

/**
 * POST /api/files/generate-script
 * 生成重命名脚本
 */
router.post('/generate-script', asyncHandler(async (req, res) => {
  const { previewResults, scriptType, originalPath } = req.body;

  if (!previewResults || !Array.isArray(previewResults)) {
    return res.status(400).json({
      success: false,
      error: 'previewResults array is required'
    });
  }

  const options = {
    type: scriptType, // 'bash', 'batch', 'powershell', or auto-detect
    originalPath: originalPath || '.'
  };

  const result = generateScriptFromPreview(previewResults, options);

  // 设置响应头，让浏览器下载文件
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.script);
}));

module.exports = router;
