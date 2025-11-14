import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 配置管理
export const configAPI = {
  getConfig: () => api.get('/config'),
  updateConfig: (config) => api.put('/config', config),
  getPresets: () => api.get('/config/presets'),
  savePreset: (name, preset) => api.post('/config/presets', { name, preset }),
  deletePreset: (name) => api.delete(`/config/presets/${name}`)
};

// 文件管理
export const filesAPI = {
  getSupportedTypes: () => api.get('/files/supported-types'),
  addCustomType: (extension) => api.post('/files/add-custom-type', { extension }),
  removeCustomType: (extension) => api.delete(`/files/custom-type/${extension}`),
  checkType: (filePath) => api.post('/files/check-type', { filePath }),
  checkMultipleTypes: (filePaths) => api.post('/files/check-type', { filePaths }),
  upload: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  // Preview 可能需要很长时间（多个文件 + AI 处理）
  // 设置 5 分钟超时（300秒）
  preview: (filePaths, options) => api.post('/files/preview', { filePaths, options }, {
    timeout: 300000  // 5 分钟
  }),
  // Rename 也可能需要较长时间
  rename: (renamePairs) => api.post('/files/rename', { renamePairs }, {
    timeout: 300000  // 5 分钟
  }),
  processDirectory: (dirPath, options) => api.post('/files/process-directory', { dirPath, options }, {
    timeout: 300000  // 5 分钟
  }),
  generateScript: (previewResults, scriptType, originalPath) =>
    api.post('/files/generate-script', { previewResults, scriptType, originalPath }, {
      responseType: 'blob', // Important for downloading files
      timeout: 60000  // 脚本生成较快，保持 60 秒
    })
};

// 模型管理
export const modelsAPI = {
  listModels: (provider, baseURL, apiKey) => api.post('/models/list', { provider, baseURL, apiKey }),
  autoSelect: (options) => api.post('/models/auto-select', options),
  test: (provider, baseURL, apiKey, model) => api.post('/models/test', { provider, baseURL, apiKey, model })
};

// 健康检查
export const healthCheck = () => axios.get('http://localhost:3000/health');

export default api;
