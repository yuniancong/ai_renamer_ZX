# AI Renamer ZX 完整安装和使用指南

## 📋 目录

1. [前置要求](#前置要求)
2. [详细安装步骤](#详细安装步骤)
3. [启动应用](#启动应用)
4. [首次配置](#首次配置)
5. [功能说明](#功能说明)
6. [常见问题](#常见问题)

---

## 前置要求

### 1. Node.js 安装

**检查是否已安装：**
```bash
node --version
```

需要 Node.js >= 16.0.0

**如未安装，下载地址：**
- 官网：https://nodejs.org/
- 推荐下载 LTS 版本

### 2. AI 模型服务（三选一）

#### 选项 A：Ollama（推荐）

**优点：** 免费、开源、易用

**安装步骤：**

**macOS:**
```bash
# 使用 Homebrew
brew install ollama

# 或下载安装包
# 访问 https://ollama.com/download
```

**Windows:**
```bash
# 下载安装包
# 访问 https://ollama.com/download
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**启动 Ollama：**
```bash
# 后台启动
ollama serve
```

**下载模型：**
```bash
# 下载 Llava 模型（推荐用于图片重命名）
ollama pull llava

# 或其他模型
ollama pull llama3
ollama pull gemma2

# 查看已安装模型
ollama list
```

#### 选项 B：LM Studio

1. 访问 https://lmstudio.ai/
2. 下载并安装 LM Studio
3. 打开 LM Studio
4. 在 "Discover" 标签下搜索并下载模型
5. 在 "Local Server" 标签启动服务器

#### 选项 C：OpenAI API

需要 OpenAI API Key（付费服务）

---

## 详细安装步骤

### 步骤 1：打开终端

**macOS:**
- 按 `Cmd + Space` 打开 Spotlight
- 输入 "Terminal" 并回车

**Windows:**
- 按 `Win + R`
- 输入 `cmd` 或 `powershell` 并回车

### 步骤 2：进入项目目录

```bash
cd /Users/yuniancong/Desktop/Codex/ai_renamer_ZX
```

### 步骤 3：安装所有依赖

```bash
npm run install:all
```

**这个命令会做什么：**
1. 安装根目录依赖
2. 安装后端服务器依赖（Express, Multer, Axios 等）
3. 安装前端应用依赖（React, Vite, Tailwind 等）

**预计耗时：** 2-5 分钟（取决于网速）

**如果遇到错误，尝试：**
```bash
# 清理缓存
npm cache clean --force

# 重新安装
npm run install:all
```

---

## 启动应用

### 方式 1：一键启动（推荐）

```bash
npm start
```

这会自动启动：
- 后端 API 服务器（端口 3000）
- 前端 Web 界面（端口 5173）

**启动成功的标志：**
```
╔═══════════════════════════════════════════════════════════╗
║   ✅ Services starting...                                 ║
║   Backend:  http://localhost:3000                        ║
║   Frontend: http://localhost:5173                        ║
╚═══════════════════════════════════════════════════════════╝
```

浏览器会自动打开 http://localhost:5173

### 方式 2：分别启动（用于调试）

**终端 1 - 启动后端：**
```bash
npm run server
```

**终端 2 - 启动前端：**
```bash
npm run client
```

### 停止应用

在运行终端按 `Ctrl + C`

---

## 首次配置

### 1. 访问应用

打开浏览器访问：http://localhost:5173

### 2. 打开设置面板

点击右上角 "Show Settings" 按钮

### 3. 配置 AI 提供商

#### 如果使用 Ollama：

1. **Provider:** 选择 `ollama`
2. **Base URL:** 保持 `http://127.0.0.1:11434`
3. **Model:** 点击 "🔄 Refresh" 按钮
   - 系统会自动检测已安装的模型
   - 从下拉菜单选择 `llava` 或其他模型
4. **观察连接状态：**
   - 右上角显示 "✅ Connected" 表示成功
   - 显示 "❌ Disconnected" 表示连接失败

#### 如果使用 LM Studio：

1. 先在 LM Studio 中启动服务器
2. **Provider:** 选择 `lm-studio`
3. **Base URL:** 保持 `http://127.0.0.1:1234`
4. **Model:** 点击 "🔄 Refresh" 自动检测
5. 观察连接状态

#### 如果使用 OpenAI：

1. **Provider:** 选择 `openai`
2. **Base URL:** 保持 `https://api.openai.com`
3. **API Key:** 输入您的 OpenAI API Key
4. **Model:** 选择 `gpt-4o` 或其他模型
5. 观察连接状态

### 4. 调整其他设置

- **Case Style:** 选择文件命名风格
  - `kebabCase`: 推荐，如 `my-file-name.jpg`
  - `camelCase`: 如 `myFileName.jpg`
  - `snakeCase`: 如 `my_file_name.jpg`

- **Max Chars:** 文件名最大字符数（推荐 50）

- **Language:** 选择输出语言
  - `Chinese`: 中文命名
  - `English`: 英文命名

- **Frames:** 视频提取帧数（3-5 推荐）

- **Custom Prompt:** 自定义提示词（可选）
  - 例如："只描述主体，忽略背景"

- **Include subdirectories:** 是否包含子目录

### 5. 测试连接

点击底部 "Test Connection" 按钮

- ✅ 成功：显示 "Connection successful!"
- ❌ 失败：检查 Ollama/LM Studio 是否运行

---

## 功能说明

### 1. 上传文件

**方式 A：拖拽上传**
- 将文件或文件夹拖入上传区域
- 支持多个文件

**方式 B：点击选择**
- 点击上传区域
- 从文件管理器选择文件

### 2. 文件类型识别

上传后，文件会显示不同的图标：

- **✅ 绿色勾号** - 白名单格式（自动支持）
  - 图片：.jpg, .png, .gif
  - 视频：.mp4, .avi, .mov
  - 文档：.pdf, .txt, .md
  - 代码：.js, .py, .java 等

- **💎 蓝色钻石** - 自定义格式（用户添加）

- **⚠️ 黄色警告** - 未知格式
  - 点击下方按钮可以选择添加

### 3. 处理未知格式

当遇到未知格式时：

1. 文件显示 ⚠️ 黄色图标
2. 点击 "Ask to process this file type"
3. 弹出确认对话框：
   ```
   未知文件格式 ".xyz" 检测到！

   是否尝试用 AI 模型处理这个文件？

   选择 OK：
   - 尝试处理该文件
   - 添加 ".xyz" 到支持列表

   选择 Cancel：跳过该文件
   ```
4. 选择 OK 后，格式变为 💎 蓝色（已添加）

### 4. 预览重命名

1. 确保已上传文件
2. 点击 "Preview Rename" 按钮
3. 等待 AI 生成建议的新名称
4. 文件列表下方显示：
   ```
   original-name.jpg → suggested-new-name.jpg
   ```

### 5. 执行重命名

1. 查看预览结果
2. 确认无误后点击 "Execute Rename"
3. 等待重命名完成
4. 显示成功消息：
   ```
   Renamed 5 of 5 files
   ```

---

## 常见问题

### Q1: 后端启动失败，提示端口被占用

**错误：** `Port 3000 already in use`

**解决：**
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Q2: 连接 Ollama 失败

**错误：** "❌ Disconnected"

**解决步骤：**

1. 检查 Ollama 是否运行：
   ```bash
   ollama list
   ```

2. 手动启动 Ollama：
   ```bash
   ollama serve
   ```

3. 测试 API：
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. 在设置中点击 "🔄 Refresh" 刷新模型列表

### Q3: 模型下拉框显示 "No models found"

**原因：** 没有下载模型或 Ollama 未运行

**解决：**
```bash
# 下载模型
ollama pull llava

# 检查已安装模型
ollama list

# 刷新页面或点击 Refresh 按钮
```

### Q4: 前端页面空白

**解决：**
```bash
# 重新安装前端依赖
cd client
npm install

# 重新启动
cd ..
npm start
```

### Q5: 预览失败或无响应

**可能原因：**
1. 模型未选择
2. 连接断开
3. 文件太大

**解决：**
1. 检查右上角连接状态
2. 重新选择模型
3. 减少文件数量（建议每次 10 个以内）
4. 检查文件大小（单个文件 < 100MB）

### Q6: 视频处理失败

**错误：** "ffmpeg not found"

**解决：**
```bash
# macOS
brew install ffmpeg

# Windows
choco install ffmpeg

# Linux
sudo apt install ffmpeg
```

### Q7: 中文命名乱码

**解决：**
1. 确保 Language 选择为 `Chinese`
2. 添加自定义提示词：
   ```
   用简洁的中文描述文件内容
   ```

### Q8: 无法检测本地模型

**解决：**
1. 确认 Ollama 正在运行：
   ```bash
   ollama list
   ```

2. 检查 Base URL 是否正确：
   - Ollama: `http://127.0.0.1:11434`
   - LM Studio: `http://127.0.0.1:1234`

3. 检查防火墙设置

4. 点击设置面板的 "🔄 Refresh" 按钮

### Q9: 权限错误

**错误：** "Permission denied"

**解决：**
```bash
# 给予执行权限
chmod +x start.js

# 清理并重新安装
rm -rf node_modules server/node_modules client/node_modules
npm run install:all
```

---

## 高级使用技巧

### 1. 批量重命名照片

**场景：** 旅行照片重命名

**配置：**
- Provider: `ollama`
- Model: `llava`
- Case: `kebabCase`
- Language: `Chinese`
- Max Chars: `40`
- Custom Prompt: "描述照片中的主要场景和活动"

**效果：**
```
IMG_1234.jpg → 西湖-断桥-雪景.jpg
IMG_1235.jpg → 杭州-灵隐寺-大雄宝殿.jpg
```

### 2. 代码文件整理

**配置：**
- Case: `camelCase`
- Language: `English`
- Max Chars: `30`
- Custom Prompt: "Describe the main function or purpose"

**效果：**
```
utils.js → stringUtilities.js
helper.js → dateFormatter.js
```

### 3. 文档分类

**配置：**
- Case: `kebabCase`
- Language: `Chinese`
- Include subdirectories: ✅

拖入整个文件夹，自动递归处理所有文档。

---

## 性能优化建议

1. **批量处理：** 每次处理 10-20 个文件效果最好
2. **网络：** 使用本地模型（Ollama/LM Studio）速度更快
3. **模型选择：**
   - 图片：使用 `llava`
   - 文本：使用 `llama3` 或 `gemma2`
   - 速度优先：使用较小的模型
4. **关闭不需要的子目录扫描**

---

## 卸载

如需卸载：

```bash
# 删除项目目录
cd ..
rm -rf ai_renamer_ZX

# 卸载 Ollama（可选）
# macOS
brew uninstall ollama

# 删除模型文件（可选）
rm -rf ~/.ollama
```

---

## 获取帮助

- 查看详细文档：README.md
- 问题反馈：在项目目录提交 issue
- 查看日志：启动终端会显示详细日志

---

**祝您使用愉快！🎉**
