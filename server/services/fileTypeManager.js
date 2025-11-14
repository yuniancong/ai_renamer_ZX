const path = require('path');
const { loadConfig, saveConfig } = require('./configManager');

// 从原项目导入支持的扩展名
const defaultSupportedExtensions = require('../../ai-renamer-main/src/supportedExtensions');

/**
 * 获取所有支持的文件类型（白名单 + 自定义）
 */
const getSupportedTypes = async () => {
  const config = await loadConfig();
  const customTypes = config.customFileTypes || [];

  return {
    whitelistTypes: defaultSupportedExtensions,
    customTypes: customTypes,
    allTypes: [...new Set([...defaultSupportedExtensions, ...customTypes])]
  };
};

/**
 * 检查文件类型是否支持
 * @returns {Object} { supported: boolean, type: 'whitelist'|'custom'|'unknown' }
 */
const checkFileType = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const { whitelistTypes, customTypes } = await getSupportedTypes();

  if (whitelistTypes.includes(ext)) {
    return { supported: true, type: 'whitelist', extension: ext };
  }

  if (customTypes.includes(ext)) {
    return { supported: true, type: 'custom', extension: ext };
  }

  return { supported: false, type: 'unknown', extension: ext };
};

/**
 * 添加自定义文件类型
 */
const addCustomType = async (extension) => {
  // 规范化扩展名（确保以 . 开头）
  const normalizedExt = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;

  const config = await loadConfig();
  const customTypes = config.customFileTypes || [];

  // 检查是否已存在
  if (customTypes.includes(normalizedExt)) {
    return { success: false, message: 'File type already exists' };
  }

  // 检查是否在白名单中
  if (defaultSupportedExtensions.includes(normalizedExt)) {
    return { success: false, message: 'File type already in whitelist' };
  }

  customTypes.push(normalizedExt);
  config.customFileTypes = customTypes;

  await saveConfig(config);

  return {
    success: true,
    message: 'File type added successfully',
    extension: normalizedExt
  };
};

/**
 * 删除自定义文件类型
 */
const removeCustomType = async (extension) => {
  const normalizedExt = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;

  const config = await loadConfig();
  const customTypes = config.customFileTypes || [];

  if (!customTypes.includes(normalizedExt)) {
    return { success: false, message: 'File type not found' };
  }

  config.customFileTypes = customTypes.filter(ext => ext !== normalizedExt);
  await saveConfig(config);

  return {
    success: true,
    message: 'File type removed successfully',
    extension: normalizedExt
  };
};

/**
 * 批量检查文件类型
 */
const checkMultipleFiles = async (filePaths) => {
  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      const check = await checkFileType(filePath);
      return {
        path: filePath,
        name: path.basename(filePath),
        ...check
      };
    })
  );

  return {
    total: results.length,
    supported: results.filter(r => r.supported).length,
    unsupported: results.filter(r => !r.supported).length,
    files: results
  };
};

module.exports = {
  getSupportedTypes,
  checkFileType,
  addCustomType,
  removeCustomType,
  checkMultipleFiles
};
