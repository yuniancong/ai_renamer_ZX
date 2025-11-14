# 🐛 调试和故障排查指南

## 📊 新增的调试功能

AI Renamer ZX 现在配备了强大的调试工具，帮助您快速定位和解决问题！

---

## 🎯 调试面板使用指南

### 打开调试面板

在应用界面右下角，您会看到一个蓝色的悬浮按钮：

```
🐛 Debug Logs (10)
```

点击此按钮即可打开调试面板。

### 调试面板功能

调试面板会实时显示所有前端日志，包括：

- ✅ **信息日志**（📝）- 普通操作记录
- ⚠️ **警告日志**（⚠️）- 潜在问题提示
- ❌ **错误日志**（❌）- 错误和异常

### 面板操作

- **Clear** - 清空所有日志
- **Close** - 关闭面板（悬浮按钮仍可见）
- **自动滚动** - 新日志出现时自动滚动到底部

---

## 📝 日志说明

### 前端日志（调试面板）

#### 1. 文件添加日志

当您拖拽文件时，会看到：

```
📁 === Adding Files ===
Files to add: 3
Files: ["image1.jpg", "document.pdf", "video.mp4"]
📤 Checking file types for: ["image1.jpg", "document.pdf", "video.mp4"]
✅ Type check response: { total: 3, supported: 3, ... }
📋 Processed files: [...]
```

**检查点：**
- ✅ 文件数量是否正确
- ✅ 文件名是否正确
- ✅ Type check 是否成功
- ✅ supported 数量是否符合预期

#### 2. 预览重命名日志

点击 "Preview Rename" 后：

```
🎬 === Starting Preview Process ===
Total files: 3
Config: { defaultProvider: "ollama", defaultModel: "llava", ... }
Supported files: 3
📤 Uploading 3 files...
✅ Upload response: { success: true, files: [...] }
📁 Uploaded paths: ["/uploads/123-image1.jpg", ...]
🔮 Requesting preview with config: { ... }
✅ Preview response: { total: 3, successful: 3, results: [...] }
📝 Updating file previews...
   ✓ image1.jpg → beautiful-sunset.jpg
   ✓ document.pdf → project-report-2024.pdf
   ✓ video.mp4 → cat-playing-with-ball.mp4
✅ Updated 3 file previews
🏁 Preview process completed
```

**检查点：**
- ✅ Config 是否正确（provider, model, base URL）
- ✅ 文件是否成功上传
- ✅ Upload response 是否包含 files 数组
- ✅ Preview response 是否包含 results
- ✅ 每个文件是否有新名称

#### 3. 模型获取日志

打开设置面板或切换 Provider 时：

```
📡 Fetching models from ollama...
Base URL: http://127.0.0.1:11434
✅ Found 5 models: ["llava", "llama3", "gemma2", ...]
```

**检查点：**
- ✅ Base URL 是否正确
- ✅ 是否找到模型
- ✅ 模型列表是否非空

#### 4. 连接测试日志

```
🔌 Testing connection to ollama...
Provider: ollama
Base URL: http://127.0.0.1:11434
✅ Connection successful
```

**检查点：**
- ✅ Provider 和 Base URL 是否正确
- ✅ 连接是否成功

### 后端日志（终端）

后端会在终端输出详细的请求日志：

```
============================================================
[2024-11-11T21:45:32.123Z] POST /api/files/preview
Body: {
  "filePaths": [
    "/uploads/1699734332123-image1.jpg"
  ],
  "options": {
    "defaultProvider": "ollama",
    "defaultModel": "llava",
    ...
  }
}

📝 [previewFileRename] Starting...
   File path: /uploads/1699734332123-image1.jpg
   Loading config...
   Provider: ollama
   Model: llava
   Base URL: http://127.0.0.1:11434
   Checking file type...
   Type check: { supported: true, type: 'whitelist', extension: '.jpg' }
   Is processable: true
   Calling getNewName...
   ✅ New name generated: beautiful-sunset
```

**检查点：**
- ✅ 请求路径和参数是否正确
- ✅ Config 是否正确加载
- ✅ 文件类型是否识别
- ✅ getNewName 是否被调用
- ✅ 是否成功生成新名称

---

## 🔍 常见问题诊断

### 问题 1：Preview Rename 没有反应

**症状：**
- 点击 Preview Rename 按钮
- 按钮变成 "Processing..."
- 但文件列表没有显示新名称
- Execute Rename 按钮仍然是灰色的

**诊断步骤：**

1. **打开调试面板**
   - 点击右下角 "🐛 Debug Logs"
   - 查看是否有错误日志（❌）

2. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 切换到 "Console" 标签
   - 查找红色错误信息

3. **检查后端终端**
   - 查看运行 `npm start` 的终端
   - 查找错误信息或异常栈

**可能的原因：**

#### A. 没有支持的文件

**调试面板显示：**
```
❌ No supported files to preview
```

**解决：**
- 检查文件类型是否受支持
- 查看文件图标：
  - ✅ 绿色 = 支持
  - ⚠️ 黄色 = 未知（需要添加）
- 点击未知文件下方的 "Ask to process this file type"

#### B. 模型未配置

**调试面板显示：**
```
Config: { defaultProvider: "ollama", defaultModel: "", ... }
```

**后端终端显示：**
```
Model: undefined 或 ""
```

**解决：**
1. 打开设置面板
2. 点击 Model 旁的 "🔄 Refresh"
3. 从下拉菜单选择模型
4. 观察右上角连接状态变为 "✅ Connected"

#### C. Ollama/LM Studio 未运行

**调试面板显示：**
```
❌ Error: connect ECONNREFUSED 127.0.0.1:11434
```

**解决：**
```bash
# 启动 Ollama
ollama serve

# 或检查是否已运行
ollama list
```

#### D. 文件上传失败

**调试面板显示：**
```
📤 Uploading 3 files...
❌ Upload failed: Request failed with status code 500
```

**后端终端显示：**
```
Error: ENOENT: no such file or directory
```

**解决：**
- 检查 `uploads/` 目录是否存在
- 检查文件权限
- 重启应用

#### E. API 调用失败

**调试面板显示：**
```
🔮 Requesting preview with config: { ... }
❌ Preview failed: Network Error
```

**解决：**
- 检查后端是否运行（http://localhost:3000/health）
- 检查前端代理配置（vite.config.js）
- 重启前后端服务

#### F. getNewName 返回 null

**后端终端显示：**
```
✅ New name generated: null
```

**可能原因：**
1. AI 模型未响应
2. 模型返回了空结果
3. 提示词有问题

**解决：**
1. 测试模型连接：
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "llava",
     "prompt": "test"
   }'
   ```

2. 检查模型是否正确加载：
   ```bash
   ollama list
   ```

3. 重新拉取模型：
   ```bash
   ollama pull llava
   ```

---

### 问题 2：Execute Rename 按钮是灰色的

**症状：**
- Preview Rename 成功
- 但 Execute Rename 按钮无法点击

**诊断：**

1. **检查预览结果**
   - 查看文件列表
   - 每个文件下方应该显示：`→ new-file-name.ext`
   - 如果没有显示，说明预览未成功

2. **检查调试日志**
   ```
   📝 Updating file previews...
   ✅ Updated 3 file previews
   ```
   - 如果 "Updated X file previews" 中 X = 0，说明映射失败

**可能原因：**

#### A. 文件名映射失败

**调试面板显示：**
```
📝 Updating file previews...
✅ Updated 0 file previews
```

**原因：** 上传的文件名和原文件名不匹配

**解决：** 已在新版本修复，请重新启动应用

#### B. Preview 返回失败

**调试面板显示：**
```
Preview completed: 0 succeeded, 3 failed
```

**后端终端显示：**
```
❌ Error in previewFileRename: ...
```

**解决：** 查看后端错误详情，根据错误信息处理

---

### 问题 3：模型下拉框显示 "No models found"

**症状：**
- 打开设置面板
- Model 下拉框显示 "No models found"
- 点击 Refresh 也没有反应

**诊断步骤：**

1. **检查 Ollama 是否运行**
   ```bash
   ollama list
   ```
   应该显示已安装的模型列表

2. **测试 API**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   应该返回 JSON 格式的模型列表

3. **检查调试日志**
   ```
   📡 Fetching models from ollama...
   ❌ Error: connect ECONNREFUSED
   ```

**解决：**

1. **启动 Ollama**
   ```bash
   ollama serve
   ```

2. **下载模型**
   ```bash
   ollama pull llava
   ollama pull llama3
   ```

3. **刷新模型列表**
   - 在设置面板点击 "🔄 Refresh"
   - 或重新选择 Provider

---

## 🛠️ 高级调试技巧

### 1. 查看完整的 API 响应

在浏览器控制台（F12）中：

```javascript
// 查看配置
console.log('Current config:', config);

// 查看文件列表
console.log('Files:', files);

// 查看可用模型
console.log('Available models:', availableModels);
```

### 2. 手动测试 API

使用 curl 或 Postman 测试后端 API：

```bash
# 测试健康检查
curl http://localhost:3000/health

# 测试获取配置
curl http://localhost:3000/api/config

# 测试获取模型列表
curl -X POST http://localhost:3000/api/models/list \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "ollama",
    "baseURL": "http://127.0.0.1:11434"
  }'

# 测试连接
curl -X POST http://localhost:3000/api/models/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "ollama",
    "baseURL": "http://127.0.0.1:11434",
    "model": "llava"
  }'
```

### 3. 启用详细日志

在后端添加更详细的日志：

```javascript
// server/index.js 中已包含详细的请求日志
// 每个请求都会输出：
// - 请求方法和路径
// - 查询参数
// - 请求体
```

### 4. 检查网络请求

在浏览器开发者工具中：

1. 切换到 "Network" 标签
2. 重新执行操作
3. 查看所有网络请求：
   - 状态码（200 = 成功，4xx = 客户端错误，5xx = 服务器错误）
   - 请求头
   - 请求体
   - 响应体

---

## 📊 性能监控

### 检查处理时间

调试日志会显示各个步骤的时间：

```
[21:45:32.123] Starting preview...
[21:45:33.456] Upload completed (1.3s)
[21:45:38.789] Preview completed (5.3s)
```

**正常处理时间：**
- 文件上传：< 2秒（取决于文件大小）
- 模型响应：5-20秒（取决于模型大小和硬件）
- 总预览时间：< 30秒

**如果时间过长：**
- 检查 Ollama/LM Studio 是否使用 GPU
- 尝试使用更小的模型
- 减少视频帧数（frames）

---

## 🆘 仍然无法解决？

如果问题仍然存在：

1. **收集信息：**
   - 前端调试日志（调试面板中复制）
   - 后端终端日志（完整复制）
   - 浏览器控制台日志（F12 Console）
   - 操作步骤（详细描述您做了什么）

2. **检查环境：**
   - Node.js 版本：`node --version`
   - Ollama 版本：`ollama --version`
   - 操作系统和版本

3. **清理并重启：**
   ```bash
   # 清理临时文件
   rm -rf uploads/*

   # 清理配置
   rm config/.ai-renamer-config.json

   # 重新安装依赖
   rm -rf node_modules server/node_modules client/node_modules
   npm run install:all

   # 重启应用
   npm start
   ```

4. **查看文档：**
   - INSTALL_GUIDE.md - 完整安装指南
   - README.md - 项目文档
   - QUICK_START.md - 快速开始

---

## 📌 调试检查清单

使用此清单快速诊断问题：

```
前端检查：
□ 调试面板已打开
□ 浏览器控制台已打开（F12）
□ 查看调试日志中的错误（❌）
□ 查看网络请求状态

后端检查：
□ 后端服务正在运行（http://localhost:3000/health）
□ 终端中查看请求日志
□ 查看是否有错误栈

配置检查：
□ Provider 已选择（ollama/lm-studio/openai）
□ Model 已选择（非空）
□ Base URL 正确
□ 连接状态显示 "✅ Connected"

文件检查：
□ 文件类型受支持（✅ 绿色图标）
□ 文件大小 < 100MB
□ 文件数量 < 50个

模型检查：
□ Ollama/LM Studio 正在运行
□ 模型已下载（ollama list）
□ 模型列表非空

环境检查：
□ Node.js >= 16.0.0
□ 所有依赖已安装（npm run install:all）
□ uploads/ 目录存在且可写
```

---

**调试愉快！🐛✨**
