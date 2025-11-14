const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const {
  loadConfig,
  updateConfig,
  savePreset,
  getPresets,
  deletePreset
} = require('../services/configManager');

/**
 * GET /api/config
 * 获取当前配置
 */
router.get('/', asyncHandler(async (req, res) => {
  const config = await loadConfig();
  res.json({
    success: true,
    config
  });
}));

/**
 * PUT /api/config
 * 更新配置
 */
router.put('/', asyncHandler(async (req, res) => {
  const updates = req.body;
  const result = await updateConfig(updates);
  res.json({
    success: true,
    message: 'Configuration updated successfully',
    config: result.config
  });
}));

/**
 * GET /api/config/presets
 * 获取所有配置预设
 */
router.get('/presets', asyncHandler(async (req, res) => {
  const presets = await getPresets();
  res.json({
    success: true,
    presets
  });
}));

/**
 * POST /api/config/presets
 * 保存配置预设
 */
router.post('/presets', asyncHandler(async (req, res) => {
  const { name, preset } = req.body;

  if (!name || !preset) {
    return res.status(400).json({
      success: false,
      error: 'Name and preset are required'
    });
  }

  const result = await savePreset(name, preset);
  res.json({
    success: true,
    message: 'Preset saved successfully',
    config: result.config
  });
}));

/**
 * DELETE /api/config/presets/:name
 * 删除配置预设
 */
router.delete('/presets/:name', asyncHandler(async (req, res) => {
  const { name } = req.params;
  const result = await deletePreset(name);
  res.json({
    success: true,
    message: 'Preset deleted successfully',
    config: result.config
  });
}));

module.exports = router;
