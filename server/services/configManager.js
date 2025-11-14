const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../config/.ai-renamer-config.json');

// 默认配置
const DEFAULT_CONFIG = {
  defaultProvider: 'ollama',
  defaultModel: 'llava',
  defaultBaseURL: 'http://127.0.0.1:11434',
  defaultApiKey: '',
  defaultFrames: 3,
  defaultCase: 'kebabCase',
  defaultChars: 50,
  defaultLanguage: 'English',
  defaultIncludeSubdirectories: false,
  defaultCustomPrompt: '',
  customFileTypes: [],
  recentConfigs: []
};

/**
 * 加载配置文件
 */
const loadConfig = async () => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (err) {
    // 文件不存在时返回默认配置
    return DEFAULT_CONFIG;
  }
};

/**
 * 保存配置文件
 */
const saveConfig = async (config) => {
  try {
    // 确保目录存在
    const dir = path.dirname(CONFIG_FILE);
    await fs.mkdir(dir, { recursive: true });

    // 保存配置
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return { success: true, config };
  } catch (err) {
    throw new Error(`Failed to save config: ${err.message}`);
  }
};

/**
 * 更新配置（部分更新）
 */
const updateConfig = async (updates) => {
  const currentConfig = await loadConfig();
  const newConfig = { ...currentConfig, ...updates };
  return saveConfig(newConfig);
};

/**
 * 保存配置预设
 */
const savePreset = async (name, preset) => {
  const config = await loadConfig();
  const presets = config.recentConfigs || [];

  // 检查是否已存在同名预设
  const existingIndex = presets.findIndex(p => p.name === name);

  if (existingIndex >= 0) {
    // 更新现有预设
    presets[existingIndex] = { name, ...preset, updatedAt: new Date().toISOString() };
  } else {
    // 添加新预设
    presets.push({ name, ...preset, createdAt: new Date().toISOString() });
  }

  // 限制预设数量（最多保存10个）
  if (presets.length > 10) {
    presets.shift();
  }

  config.recentConfigs = presets;
  return saveConfig(config);
};

/**
 * 获取所有配置预设
 */
const getPresets = async () => {
  const config = await loadConfig();
  return config.recentConfigs || [];
};

/**
 * 删除配置预设
 */
const deletePreset = async (name) => {
  const config = await loadConfig();
  const presets = config.recentConfigs || [];
  config.recentConfigs = presets.filter(p => p.name !== name);
  return saveConfig(config);
};

module.exports = {
  loadConfig,
  saveConfig,
  updateConfig,
  savePreset,
  getPresets,
  deletePreset,
  DEFAULT_CONFIG
};
