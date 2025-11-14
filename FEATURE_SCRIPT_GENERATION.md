# 📜 新功能：生成重命名脚本

## 🎯 功能说明

由于 Web 应用的安全限制，浏览器**无法直接修改您本地文件系统的文件**。

为了解决这个问题，我们新增了**生成重命名脚本**功能，让您可以批量重命名原始文件。

---

## ⚠️ 重要说明：Execute Rename 的工作原理

### 当前流程

```
1. 您拖拽文件 → 浏览器
2. 文件上传 → 服务器 /uploads/ 目录（创建副本）
3. Preview Rename → 分析服务器上的副本，生成新文件名
4. Execute Rename → 重命名服务器上的副本
5. ❌ 您桌面上的原始文件保持不变
```

### 验证

检查服务器 uploads 目录：
```bash
ls /Users/yuniancong/Desktop/Codex/ai_renamer_ZX/uploads/
```

您会看到重命名后的文件，例如：
```
红雾森林.png
异世界之温暖的森林.png
我的聊天记录.png
```

但是您桌面上的原始文件没有被修改。

---

## 🚀 使用新功能：下载重命名脚本

### 工作流程

1. **拖拽文件** → 添加要重命名的文件
2. **点击 Preview Rename** → 查看 AI 建议的新文件名
3. **点击 Download Script** → 下载重命名脚本
   - macOS/Linux: 下载 `rename.sh` (Bash 脚本)
   - Windows: 下载 `rename.ps1` (PowerShell 脚本)
4. **运行脚本** → 在原文件目录执行脚本

---

## 📝 详细步骤

### Step 1: 生成预览

1. 打开应用：http://localhost:5173
2. 拖拽文件到上传区（例如：`照片1.png`、`照片2.jpg`）
3. 点击 **Preview Rename**
4. 等待 AI 分析完成
5. 查看建议的新文件名

### Step 2: 下载脚本

预览完成后，界面会显示：

```
💡 Need to rename your original files?
The "Execute Rename" button only renames files on the server.
To rename your original files, download the rename script below
and run it in your file directory.

[📜 Download Script (macOS/Linux)]  [📜 Download Script (Windows)]
```

**macOS 用户**：点击 "Download Script (macOS/Linux)"
- 下载 `rename.sh` 文件

**Windows 用户**：点击 "Download Script (Windows)"
- 下载 `rename.ps1` 文件

### Step 3: 运行脚本

#### macOS/Linux

1. **复制脚本到原文件目录**
   ```bash
   # 假设您的照片在桌面的 Photos 文件夹
   cp ~/Downloads/rename.sh ~/Desktop/Photos/
   cd ~/Desktop/Photos/
   ```

2. **设置执行权限**
   ```bash
   chmod +x rename.sh
   ```

3. **（可选）先运行 Dry-Run 模式**
   ```bash
   ./rename.sh --dry-run
   ```

   输出示例：
   ```
   🔍 DRY RUN MODE - No files will be renamed

   🤖 AI Renamer ZX - Batch Rename Script
   ========================================

   Total files to rename: 3

   ✓ Would rename
      From: 照片1.png
      To:   红雾森林.png

   ✓ Would rename
      From: 照片2.jpg
      To:   异世界之温暖的森林.jpg

   ✓ Would rename
      From: 照片3.png
      To:   我的聊天记录.png

   ========================================
   Summary:
     ✅ Success: 3
     ⚠️  Skipped: 0
     ❌ Errors: 0

   This was a DRY RUN. Run without --dry-run to actually rename files.
   ```

4. **执行实际重命名**
   ```bash
   ./rename.sh
   ```

   输出示例：
   ```
   🤖 AI Renamer ZX - Batch Rename Script
   ========================================

   Total files to rename: 3

   ✓ Renamed
      From: 照片1.png
      To:   红雾森林.png

   ✓ Renamed
      From: 照片2.jpg
      To:   异世界之温暖的森林.jpg

   ✓ Renamed
      From: 照片3.png
      To:   我的聊天记录.png

   ========================================
   Summary:
     ✅ Success: 3
     ⚠️  Skipped: 0
     ❌ Errors: 0

   ✅ Rename completed!
   ```

#### Windows (PowerShell)

1. **复制脚本到原文件目录**
   - 将下载的 `rename.ps1` 复制到文件所在目录

2. **打开 PowerShell**
   - 按 `Win + X`，选择 "Windows PowerShell (管理员)"

3. **启用脚本执行**（首次运行需要）
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

4. **导航到文件目录**
   ```powershell
   cd C:\Users\YourName\Desktop\Photos
   ```

5. **（可选）先运行 Dry-Run 模式**
   ```powershell
   .\rename.ps1 -DryRun
   ```

6. **执行实际重命名**
   ```powershell
   .\rename.ps1
   ```

#### Windows (Batch)

如果不想用 PowerShell，可以选择下载 Batch 脚本（未来版本将添加按钮）：

1. 双击 `rename.bat` 运行
2. 或在命令提示符运行：
   ```cmd
   cd C:\Users\YourName\Desktop\Photos
   rename.bat
   ```

---

## 🔒 安全特性

### 1. Dry-Run 模式

脚本支持 Dry-Run 模式，**只显示会进行的操作，不实际修改文件**：

```bash
./rename.sh --dry-run      # macOS/Linux
.\rename.ps1 -DryRun        # Windows PowerShell
```

**建议：始终先运行 Dry-Run 确认结果！**

### 2. 目标文件存在检测

如果目标文件名已存在，脚本会：
- ⚠️ 跳过重命名
- 显示警告信息
- 不覆盖现有文件

示例：
```
⚠️  Skip: Target exists
   From: 照片1.png
   To:   红雾森林.png  (already exists!)
```

### 3. 源文件不存在检测

如果源文件不存在，脚本会：
- ❌ 显示错误
- 继续处理其他文件

示例：
```
✗ Not found: 照片1.png
```

### 4. 详细的执行摘要

脚本完成后会显示统计：
```
========================================
Summary:
  ✅ Success: 15    # 成功重命名
  ⚠️  Skipped: 2    # 目标已存在，跳过
  ❌ Errors: 1      # 源文件不存在
```

---

## 📊 脚本示例

### Bash 脚本 (macOS/Linux)

```bash
#!/bin/bash
# AI Renamer ZX - Batch Rename Script
# Generated: 2024-11-11 22:45:00

set -e  # Exit on error

# Parse arguments
DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
fi

echo "🤖 AI Renamer ZX - Batch Rename Script"
echo "========================================"
echo ""
echo "Total files to rename: 3"
echo ""

SUCCESS_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0

# File 1/3
if [ -f '照片1.png' ]; then
  if [ -f '红雾森林.png' ]; then
    echo "⚠️  Skip: Target exists"
    ((SKIP_COUNT++))
  else
    if [ "$DRY_RUN" = true ]; then
      echo "✓ Would rename"
    else
      mv '照片1.png' '红雾森林.png'
      echo "✓ Renamed"
    fi
    ((SUCCESS_COUNT++))
  fi
  echo "   From: 照片1.png"
  echo "   To:   红雾森林.png"
else
  echo "✗ Not found: 照片1.png"
  ((ERROR_COUNT++))
fi
echo ""

# ... 更多文件 ...

echo "========================================"
echo "Summary:"
echo "  ✅ Success: $SUCCESS_COUNT"
echo "  ⚠️  Skipped: $SKIP_COUNT"
echo "  ❌ Errors: $ERROR_COUNT"
```

### PowerShell 脚本 (Windows)

```powershell
# AI Renamer ZX - Batch Rename Script
# Generated: 2024-11-11 22:45:00

param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "🤖 AI Renamer ZX - Batch Rename Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files to rename: 3"
Write-Host ""

$successCount = 0
$skipCount = 0
$errorCount = 0

# File 1/3
if (Test-Path "照片1.png") {
  if (Test-Path "红雾森林.png") {
    Write-Host "⚠️  Skip: Target exists" -ForegroundColor Yellow
    $skipCount++
  } else {
    if ($DryRun) {
      Write-Host "✓ Would rename" -ForegroundColor Green
    } else {
      Rename-Item "照片1.png" "红雾森林.png"
      Write-Host "✓ Renamed" -ForegroundColor Green
    }
    $successCount++
  }
  Write-Host "   From: 照片1.png"
  Write-Host "   To:   红雾森林.png"
} else {
  Write-Host "✗ Not found: 照片1.png" -ForegroundColor Red
  $errorCount++
}
Write-Host ""

# ... 更多文件 ...

Write-Host "========================================"
Write-Host "Summary:"
Write-Host "  ✅ Success: $successCount" -ForegroundColor Green
Write-Host "  ⚠️  Skipped: $skipCount" -ForegroundColor Yellow
Write-Host "  ❌ Errors: $errorCount" -ForegroundColor Red
```

---

## 🎨 UI 改进

### 新增提示信息

Preview 完成后，界面会显示黄色提示框：

```
💡 Need to rename your original files?

The "Execute Rename" button only renames files on the server.
To rename your original files, download the rename script below
and run it in your file directory.
```

### 新增按钮

- **Download Script (macOS/Linux)** - 下载 Bash 脚本
- **Download Script (Windows)** - 下载 PowerShell 脚本

### Execute Rename 按钮标签更新

从 `Execute Rename` 改为 `Execute Rename (Server Only)`
- 明确说明只会重命名服务器副本
- 避免用户误解

---

## 🔧 技术实现

### 后端 API

**端点：** `POST /api/files/generate-script`

**请求体：**
```json
{
  "previewResults": [
    {
      "success": true,
      "originalName": "照片1.png",
      "newName": "红雾森林",
      "filePath": "/uploads/1234-照片1.png"
    }
  ],
  "scriptType": "bash",  // 'bash', 'powershell', 'batch', or null (auto-detect)
  "originalPath": "."    // 可选，原文件目录路径
}
```

**响应：**
- Content-Type: `text/plain; charset=utf-8`
- Content-Disposition: `attachment; filename="rename.sh"`
- Body: 脚本内容

### 前端实现

**API 调用：**
```javascript
const response = await filesAPI.generateScript(previewResults, 'bash', null);

// 创建下载
const blob = new Blob([response.data], { type: 'text/plain' });
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'rename.sh';
link.click();
```

### 脚本生成服务

位置：`server/services/scriptGenerator.js`

**功能：**
- `generateBashScript()` - 生成 Bash 脚本
- `generatePowerShellScript()` - 生成 PowerShell 脚本
- `generateBatchScript()` - 生成 Batch 脚本
- `generateScriptFromPreview()` - 从预览结果生成脚本

**特性：**
- ✅ 自动转义特殊字符
- ✅ 彩色输出
- ✅ Dry-Run 模式
- ✅ 错误处理
- ✅ 执行摘要

---

## 🆚 Execute Rename vs Download Script

| 特性 | Execute Rename | Download Script |
|------|---------------|-----------------|
| **重命名位置** | 服务器 /uploads/ | 您的本地文件系统 |
| **影响文件** | 服务器副本 | 原始文件 |
| **需要手动操作** | ❌ 否 | ✅ 是（运行脚本） |
| **安全性** | 高（沙箱环境） | 需要确认（Dry-Run） |
| **可撤销** | ✅ 可重新上传 | ❌ 不可撤销 |
| **适用场景** | 测试、验证 | 批量重命名原文件 |

---

## 💡 最佳实践

### 1. 先 Preview，再 Download

```
1. Preview Rename → 检查 AI 生成的文件名是否合理
2. 调整配置（如果需要）→ Language, Case, Chars, Custom Prompt
3. 重新 Preview → 直到满意
4. Download Script → 下载脚本
```

### 2. 始终先 Dry-Run

```bash
# ✅ 推荐
./rename.sh --dry-run  # 先查看会进行什么操作
./rename.sh            # 确认无误后再执行

# ❌ 不推荐
./rename.sh            # 直接执行，无法预览
```

### 3. 备份重要文件

在重命名重要文件前：
```bash
# 创建备份
cp -r Photos Photos_backup

# 运行重命名
cd Photos
./rename.sh

# 确认无误后删除备份
rm -rf Photos_backup
```

### 4. 分批处理大量文件

如果有上百个文件：
- 先处理 10-20 个测试
- 确认结果符合预期
- 再处理剩余文件

---

## 🐛 故障排查

### macOS: "Permission denied"

```bash
# 错误
bash: ./rename.sh: Permission denied

# 解决
chmod +x rename.sh
./rename.sh
```

### macOS: "Operation not permitted"

可能是文件在受保护的目录（如 Desktop/Documents）：
```bash
# 在系统偏好设置中授予终端权限
# System Preferences → Security & Privacy → Privacy → Full Disk Access
# 添加 Terminal.app
```

### Windows: "无法加载，因为在此系统上禁止运行脚本"

```powershell
# 临时启用脚本执行
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 然后运行脚本
.\rename.ps1
```

### 脚本显示 "Not found"

确认：
1. 脚本和文件在同一目录
2. 文件名完全匹配（包括空格、大小写）
3. 文件确实存在

```bash
# 列出当前目录文件
ls -la

# 运行 Dry-Run 查看详情
./rename.sh --dry-run
```

### 中文文件名乱码

确保终端使用 UTF-8 编码：
```bash
# macOS/Linux
export LANG=zh_CN.UTF-8

# Windows PowerShell (通常默认支持)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

---

## 📚 相关文档

- **HOTFIX_SOCKET_HANGUP.md** - Socket hang up 错误修复
- **HOTFIX_DEPENDENCIES.md** - 依赖和安全问题修复
- **HOTFIX_PREVIEW.md** - Preview 功能修复
- **DEBUGGING_GUIDE.md** - 完整调试指南
- **INSTALL_GUIDE.md** - 安装指南

---

## 🎯 总结

### 为什么需要这个功能？

Web 应用无法直接修改本地文件系统 → 只能重命名服务器副本 → 不能满足实际需求

### 解决方案

生成重命名脚本 → 下载到本地 → 在原文件目录运行 → 批量重命名原始文件

### 工作流程

```
拖拽文件 → Preview → Download Script → 复制到文件目录 → 运行脚本 → ✅ 完成
```

### 安全保障

- Dry-Run 模式
- 目标文件存在检测
- 详细的执行摘要
- 不可撤销操作前的确认

---

**更新日期：** 2024-11-11
**版本：** v2.1.0

**新增功能完成！现在可以轻松批量重命名您的原始文件了。**

**立即测试：**
```bash
npm start
# 1. 拖拽文件
# 2. Preview Rename
# 3. Download Script
# 4. 在原文件目录运行脚本
```
