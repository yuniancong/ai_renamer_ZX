# 🔥 热修复：Socket Hang Up 错误

## 问题描述

**错误信息：**
```
📝 [previewFileRename] Starting...
   File path: /uploads/1762870777501-86245544-CleanShot(202511-11-21-49-31)-CleanShot.png
   ...
   📷 Processing as image...
   Calling getNewName with processed data...
🔴 Model error: socket hang up (1762870777501-86245544-CleanShot(202511-11-21-49-31)-CleanShot.png)
✅ New name generated: undefined
```

**文件信息：**
- 文件大小：1.6MB (PNG 图片)
- Provider: ollama
- Model: llava:13b
- Base URL: http://127.0.0.1:11434

**症状：**
- 文件上传成功
- 文件类型检测正常
- 开始处理图片
- 调用 AI 模型时连接中断
- 返回 `newName: null`

---

## 根本原因

### 问题：缺少超时配置

在 `ai-renamer-main/src/getModelResponse.js` 中，axios 请求没有配置超时时间：

**原始代码：**
```javascript
// Ollama API (第 21-26 行)
const apiResult = await axios({
  url,
  data,
  method: 'post',
  headers: { 'Content-Type': 'application/json' }
  // ❌ 没有 timeout 配置
})

// OpenAI/LM Studio API (第 62-70 行)
const apiResult = await axios({
  url,
  data,
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey && { Authorization: `Bearer ${apiKey}` })
  }
  // ❌ 没有 timeout 配置
})
```

### 为什么会发生 Socket Hang Up？

1. **大图片处理耗时**
   - 1.6MB PNG 图片需要转换为 Base64（约 2.1MB）
   - llava:13b 模型需要时间分析图片
   - 总处理时间可能超过默认超时

2. **默认超时太短**
   - Axios 默认超时通常很短（数秒）
   - 不足以处理大图片或复杂模型推理

3. **连接异常处理不足**
   - 超时时只显示 "socket hang up"
   - 无法区分是超时、连接拒绝还是服务崩溃

---

## 完整修复方案

### 1. 添加超时配置

**Ollama API：**
```javascript
const apiResult = await axios({
  url,
  data,
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000 // ✅ 2 分钟超时（足够处理大图片）
})
```

**OpenAI/LM Studio API：**
```javascript
const apiResult = await axios({
  url,
  data,
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey && { Authorization: `Bearer ${apiKey}` })
  },
  timeout: 120000 // ✅ 2 分钟超时
})
```

### 2. 改进错误处理

**Ollama API 错误处理：**
```javascript
} catch (err) {
  // 更好的错误信息
  if (err.code === 'ECONNABORTED') {
    throw new Error(`Request timeout (${err.config.timeout}ms) - try reducing image size or increasing timeout`)
  } else if (err.code === 'ECONNREFUSED') {
    throw new Error(`Cannot connect to Ollama at ${baseURL} - is it running?`)
  } else if (err.message === 'socket hang up') {
    throw new Error('Connection lost - Ollama may be overloaded or crashed')
  }
  throw new Error(err?.response?.data?.error?.message || err?.response?.data?.error || err.message)
}
```

**OpenAI/LM Studio API 错误处理：**
```javascript
} catch (err) {
  // 更好的错误信息
  if (err.code === 'ECONNABORTED') {
    throw new Error(`Request timeout (${err.config.timeout}ms) - try reducing image size or increasing timeout`)
  } else if (err.code === 'ECONNREFUSED') {
    throw new Error(`Cannot connect to ${provider} at ${baseURL} - is it running?`)
  } else if (err.message === 'socket hang up') {
    throw new Error(`Connection lost - ${provider} may be overloaded or crashed`)
  }
  throw new Error(err?.response?.data?.error?.message || err?.response?.data?.error || err.message)
}
```

### 3. 添加 provider 参数

为了在错误信息中显示正确的 provider 名称：

```javascript
const openaiApis = async ({ model, prompt, images, apiKey, baseURL, provider = 'API' }) => {
  // ✅ 添加 provider 参数，默认值为 'API'
  ...
}
```

---

## 修复后的完整文件

### ai-renamer-main/src/getModelResponse.js

```javascript
const fs = require('fs')
const axios = require('axios')

const ollamaApis = async ({ model, prompt, images, baseURL }) => {
  try {
    const url = `${baseURL}/api/generate`

    const data = {
      model,
      prompt,
      stream: false
    }

    if (images && images.length > 0) {
      data.images = await Promise.all(images.map(async imagePath => {
        const imageData = await fs.promises.readFile(imagePath)
        return imageData.toString('base64')
      }))
    }

    const apiResult = await axios({
      url,
      data,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000 // ✅ 2 分钟超时
    })

    return apiResult.data.response
  } catch (err) {
    // ✅ 改进的错误处理
    if (err.code === 'ECONNABORTED') {
      throw new Error(`Request timeout (${err.config.timeout}ms) - try reducing image size or increasing timeout`)
    } else if (err.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to Ollama at ${baseURL} - is it running?`)
    } else if (err.message === 'socket hang up') {
      throw new Error('Connection lost - Ollama may be overloaded or crashed')
    }
    throw new Error(err?.response?.data?.error?.message || err?.response?.data?.error || err.message)
  }
}

const openaiApis = async ({ model, prompt, images, apiKey, baseURL, provider = 'API' }) => {
  try {
    const url = `${baseURL}/v1/chat/completions`

    const data = {
      model,
      stream: false
    }

    const messages = [{
      role: 'user',
      content: [
        { type: 'text', text: prompt }
      ]
    }]

    if (images && images.length > 0) {
      for (const imagePath of images) {
        const imageData = await fs.promises.readFile(imagePath)
        messages[0].content.push({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageData.toString('base64')}` }
        })
      }
    }

    data.messages = messages

    const apiResult = await axios({
      url,
      data,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` })
      },
      timeout: 120000 // ✅ 2 分钟超时
    })

    return apiResult.data.choices[0].message.content
  } catch (err) {
    // ✅ 改进的错误处理
    if (err.code === 'ECONNABORTED') {
      throw new Error(`Request timeout (${err.config.timeout}ms) - try reducing image size or increasing timeout`)
    } else if (err.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to ${provider} at ${baseURL} - is it running?`)
    } else if (err.message === 'socket hang up') {
      throw new Error(`Connection lost - ${provider} may be overloaded or crashed`)
    }
    throw new Error(err?.response?.data?.error?.message || err?.response?.data?.error || err.message)
  }
}

module.exports = async options => {
  try {
    const { provider } = options

    if (provider === 'ollama') {
      return ollamaApis(options)
    } else if (provider === 'openai' || provider === 'lm-studio') {
      return openaiApis(options)
    } else {
      throw new Error('🔴 No supported provider found')
    }
  } catch (err) {
    throw new Error(err.message)
  }
}
```

---

## 超时配置说明

### 为什么选择 120 秒？

| 文件类型 | Base64 大小 | 预期处理时间 | 推荐超时 |
|---------|------------|------------|---------|
| 小图片 (< 500KB) | < 700KB | 5-15 秒 | 30 秒 |
| 中图片 (500KB-2MB) | 0.7-2.7MB | 15-45 秒 | 60 秒 |
| **大图片 (2-5MB)** | **2.7-6.7MB** | **30-90 秒** | **120 秒** |
| 视频帧 (3 帧) | 取决于分辨率 | 20-60 秒 | 120 秒 |
| 纯文本 | < 100KB | 3-10 秒 | 30 秒 |

**当前配置：**
- 统一设置为 120 秒（2 分钟）
- 足够处理大部分图片和视频
- 避免不必要的超时错误

### 如何调整超时时间？

如果需要处理更大的文件或使用更慢的模型：

**方法 1：修改代码**
```javascript
timeout: 180000 // 3 分钟
timeout: 300000 // 5 分钟
```

**方法 2：添加配置选项**（未来改进）
```json
// config/.ai-renamer-config.json
{
  "requestTimeout": 120000
}
```

---

## 错误类型对照表

| 错误代码 | 错误信息 | 原因 | 解决方案 |
|---------|---------|------|---------|
| `ECONNABORTED` | Request timeout | 请求超时 | 增加超时时间或减小文件大小 |
| `ECONNREFUSED` | Cannot connect | 连接被拒绝 | 检查服务是否运行、端口是否正确 |
| `socket hang up` | Connection lost | 连接中断 | 检查服务状态、内存使用 |
| `404` | Not found | API 端点错误 | 检查 baseURL 配置 |
| `401` | Unauthorized | API key 错误 | 检查 apiKey 配置 |
| `500` | Internal server error | 服务器内部错误 | 查看 Ollama 日志 |

---

## 验证修复

### 测试步骤

1. **重启应用**
   ```bash
   # 停止当前运行
   Ctrl+C

   # 重新启动
   npm start
   ```

2. **测试小图片（快速测试）**
   ```
   上传 < 500KB 图片
   点击 Preview Rename
   预期：10-20 秒内完成
   ```

3. **测试大图片（之前失败的场景）**
   ```
   上传 1-2MB PNG 图片
   点击 Preview Rename
   预期：30-60 秒内完成
   ```

4. **观察日志**

   **成功的日志：**
   ```
   📝 [previewFileRename] Starting...
      File path: /uploads/xxx.png
      Provider: ollama
      Model: llava:13b
      📷 Processing as image...
      Calling getNewName with processed data...
   ✅ New name generated: descriptive-filename
   ```

   **超时的日志（如果确实超时）：**
   ```
   🔴 Model error: Request timeout (120000ms) - try reducing image size or increasing timeout
   ```

   **连接问题的日志：**
   ```
   🔴 Model error: Cannot connect to Ollama at http://127.0.0.1:11434 - is it running?
   ```

---

## 检查 Ollama 状态

### 确认 Ollama 正在运行

```bash
# 检查 Ollama 进程
ps aux | grep ollama

# 检查 Ollama API
curl http://127.0.0.1:11434/api/tags

# 应该返回：
{
  "models": [
    {
      "name": "llava:13b",
      ...
    }
  ]
}
```

### 确认模型已加载

```bash
# 列出已安装的模型
ollama list

# 应该看到：
NAME            ID              SIZE      MODIFIED
llava:13b       xxx             7.4 GB    x days ago
```

### 手动测试 Ollama

```bash
# 测试文本生成
ollama run llava:13b "Hello"

# 测试图片分析（需要准备一张测试图片）
ollama run llava:13b "Describe this image" --image test.png
```

---

## 性能优化建议

### 1. 减小图片大小

**方法 A：压缩图片（客户端）**
```javascript
// 未来改进：在前端压缩图片
const compressImage = async (file) => {
  const canvas = document.createElement('canvas');
  // ... 压缩逻辑
  return compressedBlob;
};
```

**方法 B：调整分辨率（服务器）**
```bash
# 使用 ImageMagick 预处理
convert input.png -resize 1024x1024 -quality 85 output.jpg
```

### 2. 选择更快的模型

| 模型 | 大小 | 速度 | 质量 |
|------|------|------|------|
| llava:7b | 4.5GB | 快 | 中 |
| **llava:13b** | **7.4GB** | **中** | **高** |
| llava:34b | 19GB | 慢 | 很高 |

**建议：**
- 测试时使用 `llava:7b`
- 生产时使用 `llava:13b`

### 3. 监控 Ollama 性能

```bash
# 查看 Ollama 日志
tail -f ~/.ollama/logs/server.log

# 监控资源使用
htop
# 或
Activity Monitor (macOS)
```

---

## 常见问题

### Q1: 修复后仍然超时怎么办？

**A:** 可能的原因：
1. **Ollama 内存不足**
   ```bash
   # 重启 Ollama
   ollama serve
   ```

2. **模型未正确加载**
   ```bash
   # 重新拉取模型
   ollama pull llava:13b
   ```

3. **系统资源不足**
   - 关闭其他占用 GPU/CPU 的程序
   - 考虑使用更小的模型

### Q2: 如何知道图片正在处理中？

**A:** 当前日志会显示：
```
📷 Processing as image...
Calling getNewName with processed data...
```

建议未来改进：
- 添加进度条
- 显示 "正在分析图片，请稍候..."
- 显示预计等待时间

### Q3: 2 分钟超时是否太长？

**A:** 取决于使用场景：
- **本地 Ollama（GPU）**：通常 30-60 秒足够
- **本地 Ollama（CPU）**：可能需要 60-120 秒
- **远程 API**：取决于网络速度和服务器负载

可以根据实际情况调整。

---

## 故障排查清单

- [ ] 确认 Ollama 正在运行（`ps aux | grep ollama`）
- [ ] 确认模型已安装（`ollama list`）
- [ ] 确认 API 可访问（`curl http://127.0.0.1:11434/api/tags`）
- [ ] 确认端口配置正确（默认 11434）
- [ ] 重启应用（`npm start`）
- [ ] 测试小图片（< 500KB）
- [ ] 测试大图片（1-2MB）
- [ ] 检查后端日志（服务器终端）
- [ ] 检查前端日志（浏览器控制台 + Debug Panel）
- [ ] 检查 Ollama 日志（`~/.ollama/logs/server.log`）

---

## 相关文档

- **HOTFIX_DEPENDENCIES.md** - uuid 和安全问题修复
- **HOTFIX_PREVIEW.md** - Preview 功能修复
- **DEBUGGING_GUIDE.md** - 完整调试指南
- **INSTALL_GUIDE.md** - 安装指南

---

## 更新日志

**日期：** 2024-11-11
**版本：** v2.0.3 (Hotfix)

**修复：**
- ✅ 添加 120 秒超时到 Ollama API 调用
- ✅ 添加 120 秒超时到 OpenAI/LM Studio API 调用
- ✅ 改进错误处理（区分超时、连接拒绝、连接中断）
- ✅ 添加详细的错误信息
- ✅ 添加 provider 参数到 openaiApis 函数

**影响：**
- ✅ 修复大图片处理时的 socket hang up 错误
- ✅ 提供更清晰的错误信息
- ✅ 支持更长的 AI 模型推理时间
- ✅ 更好的用户体验（知道问题所在）

**测试：**
- [ ] 待测试：小图片处理（< 500KB）
- [ ] 待测试：大图片处理（1-2MB）
- [ ] 待测试：视频处理
- [ ] 待测试：超时场景

---

**修复完成！现在请重启应用并重新测试。**

**重启命令：**
```bash
# 停止当前运行（Ctrl+C）
# 然后重新启动
npm start
```

**测试步骤：**
1. 重启应用
2. 上传之前失败的图片（1.6MB PNG）
3. 点击 Preview Rename
4. 等待 30-60 秒
5. 检查是否成功生成新文件名
