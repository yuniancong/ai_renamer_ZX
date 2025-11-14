const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { autoSelectModel } = require('../services/fileProcessor');
const chooseModel = require('../../ai-renamer-main/src/chooseModel');
const axios = require('axios');

/**
 * POST /api/models/list
 * 获取可用模型列表
 */
router.post('/list', asyncHandler(async (req, res) => {
  const { provider, baseURL, apiKey } = req.body;

  try {
    let models = [];

    if (provider === 'ollama') {
      const url = `${baseURL || 'http://127.0.0.1:11434'}/api/tags`;
      const response = await axios.get(url);
      models = response.data.models || [];
    } else if (provider === 'lm-studio') {
      const url = `${baseURL || 'http://127.0.0.1:1234'}/v1/models`;
      const response = await axios.get(url);
      models = response.data.data || [];
    } else if (provider === 'openai') {
      const url = `${baseURL || 'https://api.openai.com'}/v1/models`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });
      models = response.data.data || [];
    }

    res.json({
      success: true,
      provider,
      models: models.map(m => ({
        id: m.name || m.id,
        name: m.name || m.id,
        size: m.size,
        modified: m.modified_at
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      message: err.message
    });
  }
}));

/**
 * POST /api/models/auto-select
 * 自动选择模型
 */
router.post('/auto-select', asyncHandler(async (req, res) => {
  const options = req.body;
  const result = await autoSelectModel(options);
  res.json(result);
}));

/**
 * POST /api/models/test
 * 测试模型连接
 */
router.post('/test', asyncHandler(async (req, res) => {
  const { provider, baseURL, apiKey, model } = req.body;

  try {
    let testResult = false;

    if (provider === 'ollama') {
      const url = `${baseURL || 'http://127.0.0.1:11434'}/api/tags`;
      const response = await axios.get(url, { timeout: 5000 });
      testResult = response.status === 200;
    } else if (provider === 'lm-studio') {
      const url = `${baseURL || 'http://127.0.0.1:1234'}/v1/models`;
      const response = await axios.get(url, { timeout: 5000 });
      testResult = response.status === 200;
    } else if (provider === 'openai') {
      const url = `${baseURL || 'https://api.openai.com'}/v1/models`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        timeout: 5000
      });
      testResult = response.status === 200;
    }

    res.json({
      success: testResult,
      message: testResult ? 'Connection successful' : 'Connection failed',
      provider,
      baseURL
    });
  } catch (err) {
    res.json({
      success: false,
      error: 'Connection failed',
      message: err.message,
      provider,
      baseURL
    });
  }
}));

module.exports = router;
