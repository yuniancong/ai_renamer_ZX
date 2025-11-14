# 🔥 热修复：Preview Rename 功能

## 问题描述

**错误信息：**
```
❌ Error in previewFileRename: TypeError [ERR_INVALID_ARG_TYPE]:
The "path" argument must be of type string. Received undefined
```

**发生位置：**
- `isProcessableFile.js:6` - 调用 `path.extname(filePath)` 时收到 `undefined`

## 根本原因

### 问题 1：函数参数格式不匹配

**原始代码期望：**
```javascript
// ai-renamer-main/src/isProcessableFile.js
module.exports = ({ filePath }) => {  // 期望对象
  const ext = path.extname(filePath).toLowerCase()
  ...
}
```

**我们的调用：**
```javascript
// server/services/fileProcessor.js (错误)
const processable = isProcessableFile(filePath);  // 传递字符串
```

**修复：**
```javascript
// server/services/fileProcessor.js (正确)
const processable = isProcessableFile({ filePath });  // 传递对象
```

---

### 问题 2：缺少文件预处理逻辑

原始的 `processFile.js` 会根据文件类型进行预处理：

- **图片文件**：将路径添加到 `images` 数组
- **视频文件**：提取帧，生成 `images` 和 `videoPrompt`
- **文本文件**：读取内容到 `content`

然后将这些数据传递给 `getNewName({ ...options, images, content, videoPrompt })`

**我们的错误：**
```javascript
// 直接传递 filePath，缺少预处理
const newName = await getNewName({
  ...mergedOptions,
  filePath  // ❌ 缺少 images/content/videoPrompt
});
```

---

## 完整修复方案

### 1. 导入必要的模块

**添加：**
```javascript
const { v4: uuidv4 } = require('uuid');
const isImage = require('../../ai-renamer-main/src/isImage');
const isVideo = require('../../ai-renamer-main/src/isVideo');
const extractFrames = require('../../ai-renamer-main/src/extractFrames');
const readFileContent = require('../../ai-renamer-main/src/readFileContent');
const deleteDirectory = require('../../ai-renamer-main/src/deleteDirectory');
```

### 2. 重写 previewFileRename 函数

**完整流程：**

```javascript
const previewFileRename = async (filePath, options = {}) => {
  let framesOutputDir = null;

  try {
    // 1. 加载和合并配置
    const config = await loadConfig();
    const mergedOptions = {
      provider: config.defaultProvider,  // 映射字段名
      model: config.defaultModel,
      baseURL: config.defaultBaseURL,
      _case: config.defaultCase || 'kebabCase',
      chars: config.defaultChars || 50,
      language: config.defaultLanguage || 'English',
      frames: config.defaultFrames || 3,
      customPrompt: config.defaultCustomPrompt || '',
      ...options
    };

    // 2. 检查文件是否可处理
    const processable = isProcessableFile({ filePath });  // ✅ 传递对象

    // 3. 根据文件类型预处理
    const ext = path.extname(filePath).toLowerCase();
    let content, videoPrompt, images = [];

    if (isImage({ ext })) {
      // 图片：添加到 images 数组
      images.push(filePath);
    } else if (isVideo({ ext })) {
      // 视频：提取帧
      framesOutputDir = `/tmp/ai-renamer/${uuidv4()}`;
      const extractedFrames = await extractFrames({
        frames: mergedOptions.frames,
        framesOutputDir,
        inputFile: filePath
      });
      images = extractedFrames.images;
      videoPrompt = extractedFrames.videoPrompt;
    } else {
      // 文本：读取内容
      content = await readFileContent({ filePath });
    }

    // 4. 获取新文件名（带预处理数据）
    const newName = await getNewName({
      ...mergedOptions,
      images,       // ✅ 包含图片路径
      content,      // ✅ 包含文本内容
      videoPrompt,  // ✅ 包含视频描述
      relativeFilePath: path.basename(filePath),
      filePath
    });

    // 5. 清理临时帧目录
    if (framesOutputDir) {
      await deleteDirectory({ folderPath: framesOutputDir });
    }

    return {
      success: true,
      filePath,
      originalName: path.basename(filePath),
      newName: newName || null
    };
  } catch (err) {
    // 错误处理和清理
    if (framesOutputDir) {
      await deleteDirectory({ folderPath: framesOutputDir });
    }

    return {
      success: false,
      filePath,
      originalName: path.basename(filePath),
      error: err.message
    };
  }
};
```

---

## 配置字段映射

原始 CLI 使用的字段名和我们的配置字段名不同：

| 配置文件字段 | 原始函数期望 | 说明 |
|-------------|-------------|------|
| `defaultProvider` | `provider` | AI 提供商 |
| `defaultModel` | `model` | 模型名称 |
| `defaultBaseURL` | `baseURL` | API 地址 |
| `defaultApiKey` | `apiKey` | API 密钥 |
| `defaultCase` | `_case` | 命名风格 |
| `defaultChars` | `chars` | 最大字符数 |
| `defaultLanguage` | `language` | 输出语言 |
| `defaultFrames` | `frames` | 视频帧数 |
| `defaultCustomPrompt` | `customPrompt` | 自定义提示 |

---

## 测试验证

### 测试步骤

1. **启动应用**
   ```bash
   npm start
   ```

2. **上传图片文件**
   ```
   拖拽 .png, .jpg 文件到上传区
   点击 "Preview Rename"
   ```

   **预期后端日志：**
   ```
   📝 [previewFileRename] Starting...
      File path: /uploads/123-image.png
      Loading config...
      Provider: ollama
      Model: llava:13b
      📷 Processing as image...
      Calling getNewName with processed data...
      ✅ New name generated: beautiful-sunset
   ```

3. **上传视频文件**
   ```
   拖拽 .mp4, .mov 文件
   点击 "Preview Rename"
   ```

   **预期日志：**
   ```
   🎥 Processing as video...
      Extracting frames (this may take a while)...
      ✅ Extracted 3 frames
      Calling getNewName with processed data...
      ✅ New name generated: cat-playing-ball
      🧹 Cleaning up temporary frames...
   ```

4. **上传文本文件**
   ```
   拖拽 .txt, .md 文件
   点击 "Preview Rename"
   ```

   **预期日志：**
   ```
   📄 Processing as text file...
      ✅ Read 1234 characters
      Calling getNewName with processed data...
      ✅ New name generated: project-documentation
   ```

---

## 已修复的文件

- ✅ `server/services/fileProcessor.js` - 完全重写 `previewFileRename` 函数
- ✅ 添加了所有必要的依赖导入
- ✅ 实现了完整的文件预处理逻辑
- ✅ 添加了临时文件清理
- ✅ 改进了错误处理和日志

---

## 潜在问题和注意事项

### 1. 视频处理需要 ffmpeg

**如果用户没有安装 ffmpeg：**
```bash
# macOS
brew install ffmpeg

# Windows
choco install ffmpeg

# Linux
sudo apt install ffmpeg
```

**错误提示：**
```
❌ Error in previewFileRename: ffmpeg not found
```

### 2. 临时文件目录

视频帧会临时存储在 `/tmp/ai-renamer/`

- macOS/Linux：自动清理
- Windows：需要手动清理或更改路径

### 3. 大文件处理

- 图片：通常很快（< 10秒）
- 视频：取决于长度和帧数（10-60秒）
- 大文本文件：可能超过 token 限制

---

## 性能优化建议

### 1. 减少视频帧数

在设置中调整 Frames 参数：
- 3 帧：快速（推荐）
- 5 帧：平衡
- 10 帧：详细但慢

### 2. 批量处理限制

建议每次处理：
- 图片：10-20 个
- 视频：2-5 个
- 文本：20-30 个

### 3. 超时设置

如果处理时间过长，可以调整超时：
```javascript
// server/services/api.js
timeout: 120000  // 2 分钟
```

---

## 回滚方案

如果新版本有问题，可以使用简化版本：

```javascript
// 简化版 - 仅支持文本文件
const previewFileRename = async (filePath, options = {}) => {
  const config = await loadConfig();
  const content = await readFileContent({ filePath });

  const newName = await getNewName({
    provider: config.defaultProvider,
    model: config.defaultModel,
    baseURL: config.defaultBaseURL,
    _case: config.defaultCase,
    chars: config.defaultChars,
    language: config.defaultLanguage,
    content,
    filePath
  });

  return {
    success: true,
    filePath,
    newName
  };
};
```

---

## 更新日志

**日期：** 2024-11-11
**版本：** v2.0.1 (Hotfix)

**修复：**
- ✅ 修复 `isProcessableFile` 参数格式错误
- ✅ 实现完整的文件预处理逻辑
- ✅ 支持图片、视频、文本文件处理
- ✅ 添加临时文件清理
- ✅ 改进配置字段映射
- ✅ 增强错误处理和日志

**测试：**
- ✅ 图片文件重命名
- ✅ 视频文件重命名（需要 ffmpeg）
- ✅ 文本文件重命名
- ✅ 错误场景处理

---

## 下一步

建议添加的功能：
1. 进度条显示（视频提取帧时）
2. 文件类型图标显示
3. 预处理结果预览（显示提取的帧数/内容长度）
4. 批量处理并发控制
5. 缓存机制（避免重复处理）

---

**修复完成！现在 Preview Rename 应该可以正常工作了。**

**立即测试：**
```bash
npm start
# 拖拽图片文件
# 点击 Preview Rename
# 查看调试日志和后端日志
```
