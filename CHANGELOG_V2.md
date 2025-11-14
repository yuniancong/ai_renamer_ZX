# 更新日志 v2.0

## 🎉 重大改进 (2024)

基于用户反馈，我们对 AI Renamer ZX 进行了全面升级！

---

## ✨ 新功能

### 1. 智能模型检测与选择 🤖

**之前：**
- ❌ 需要手动输入模型名称
- ❌ 容易输错模型名
- ❌ 不知道有哪些模型可用

**现在：**
- ✅ 自动检测本地已安装的模型
- ✅ 下拉框选择，避免输入错误
- ✅ 实时刷新模型列表（点击 🔄 Refresh 按钮）
- ✅ 支持 Ollama、LM Studio、OpenAI 自动发现

**使用方法：**
1. 打开设置面板
2. 选择 Provider
3. 点击 Model 旁的 "🔄 Refresh" 按钮
4. 从下拉菜单选择模型

**技术实现：**
- `client/src/App.jsx`: 添加 `fetchModels()` 函数
- `client/src/components/SettingsPanel.jsx`: Model 输入框改为下拉框
- 自动调用后端 `/api/models/list` API
- 当 Provider 或 Base URL 改变时自动刷新

---

### 2. 语言下拉框选择 🌍

**之前：**
- ❌ 需要手动输入语言名称
- ❌ 不确定支持哪些语言
- ❌ 可能拼写错误

**现在：**
- ✅ 预设 12 种常用语言
- ✅ 下拉框快速选择
- ✅ 包含中文、英文、日语、韩语等

**支持的语言：**
- English（英语）
- Chinese（中文）
- Spanish（西班牙语）
- French（法语）
- German（德语）
- Japanese（日语）
- Korean（韩语）
- Russian（俄语）
- Portuguese（葡萄牙语）
- Italian（意大利语）
- Arabic（阿拉伯语）
- Turkish（土耳其语）

---

### 3. 实时连接状态显示 📡

**之前：**
- ❌ 不知道是否连接成功
- ❌ 只能点击 "Test Connection" 手动测试
- ❌ 连接断开无提示

**现在：**
- ✅ 右上角实时显示连接状态
- ✅ 三种状态清晰可见：
  - 🟢 **已连接** (绿色闪烁): "✅ Connected"
  - 🔴 **未连接** (红色): "❌ Disconnected"
  - 🟡 **连接中** (黄色闪烁): "🔄 Connecting..."
- ✅ 自动检测连接状态
- ✅ 配置改变时自动重新测试

**工作原理：**
1. 应用启动时自动测试连接
2. Provider 或 Base URL 改变时自动测试
3. 实时显示在设置面板右上角
4. 颜色和动画直观反馈状态

---

## 🐛 Bug 修复

### 1. 修复后端错误处理

**问题：**
- `server/middleware/errorHandler.js` 中使用了 `multer` 但未引入
- 导致文件上传错误无法正确处理

**修复：**
- 添加 `const multer = require('multer');`
- 现在文件上传错误会正确显示：
  - 文件过大：提示 "File size exceeds 100MB limit"
  - 文件过多：提示 "Maximum 50 files allowed"

---

## 🎨 UI 优化

### 设置面板改进

**布局优化：**
- 顶部添加连接状态指示器
- Model 字段添加 Refresh 按钮
- 所有输入框统一样式

**新的设置面板布局：**
```
┌─────────────────────────────────────────────┐
│ Quick Settings              ✅ Connected    │
├─────────────────────────────────────────────┤
│ Provider: [ollama ▼]                       │
│ Model: [llava ▼] 🔄 Refresh               │
│ Base URL: [http://127.0.0.1:11434]        │
│ Case: [kebabCase ▼]  Chars: [50]          │
│ Language: [Chinese ▼]  Frames: [3]        │
│ Custom Prompt: [________________]          │
│ □ Include subdirectories                   │
│                                             │
│ [Test Connection]                          │
└─────────────────────────────────────────────┘
```

---

## 📚 文档更新

### 新增文档

1. **INSTALL_GUIDE.md** - 完整安装指南
   - 详细的前置要求检查
   - 分步安装说明（带截图描述）
   - 首次配置向导
   - 功能使用说明
   - 常见问题解答（9个常见问题）
   - 高级使用技巧
   - 故障排查指南

2. **CHANGELOG_V2.md** - 本更新日志
   - 详细记录所有改进
   - 对比新旧功能
   - 技术实现说明

---

## 🔧 技术改进

### 前端

**App.jsx:**
```javascript
// 新增状态
const [availableModels, setAvailableModels] = useState([]);
const [loadingModels, setLoadingModels] = useState(false);
const [connectionStatus, setConnectionStatus] = useState(null);

// 新增函数
const fetchModels = async () => { ... };
const testConnection = async () => { ... };

// 自动触发
useEffect(() => {
  if (config.defaultProvider) {
    fetchModels();
    testConnection();
  }
}, [config.defaultProvider, config.defaultBaseURL]);
```

**SettingsPanel.jsx:**
```javascript
// 新增 props
{
  availableModels,      // 模型列表
  loadingModels,        // 加载状态
  connectionStatus,     // 连接状态
  onRefreshModels       // 刷新函数
}

// 语言选项
const languageOptions = [
  'English', 'Chinese', 'Spanish', ...
];
```

### 后端

**无需额外修改：**
- 后端 API 已经支持模型列表获取
- `/api/models/list` - 获取模型列表
- `/api/models/test` - 测试连接

---

## 🚀 性能提升

1. **模型加载优化：**
   - 缓存模型列表，减少重复请求
   - 异步加载，不阻塞 UI

2. **连接状态检测：**
   - 自动后台检测，无需手动触发
   - 配置改变时智能重新检测

3. **用户体验：**
   - 加载状态显示（"Loading models..."）
   - 错误友好提示（"No models found"）
   - 实时视觉反馈（动画、颜色）

---

## 📋 使用指南

### 快速开始

1. **安装依赖：**
   ```bash
   npm run install:all
   ```

2. **启动应用：**
   ```bash
   npm start
   ```

3. **配置模型：**
   - 打开设置 → 选择 Provider
   - 点击 🔄 Refresh 刷新模型列表
   - 选择模型 → 观察连接状态

4. **开始使用：**
   - 拖拽文件 → Preview Rename → Execute

### 推荐配置

**图片重命名（中文）：**
```
Provider: ollama
Model: llava
Language: Chinese
Case: kebabCase
Max Chars: 40
```

**代码文件整理（英文）：**
```
Provider: ollama
Model: llama3
Language: English
Case: camelCase
Max Chars: 30
```

---

## 🔮 未来计划

### v2.1（计划中）

- [ ] 批量预设管理 UI
- [ ] 历史记录查看
- [ ] 撤销重命名功能
- [ ] 导出配置分享
- [ ] 进度条显示（批量处理时）
- [ ] 支持更多 AI 提供商
- [ ] 多语言界面（i18n）

### v3.0（长期计划）

- [ ] 桌面应用打包（Electron）
- [ ] 云端同步配置
- [ ] 团队协作功能
- [ ] AI 模型微调支持
- [ ] 插件系统

---

## ⚠️ 破坏性变更

### 无破坏性变更

本次更新完全向后兼容：
- ✅ 旧配置文件仍然有效
- ✅ 手动输入模型名仍然支持（下拉框包含手动输入选项）
- ✅ API 接口保持不变

---

## 💡 迁移指南

如果您从 v1.0 升级到 v2.0：

1. **无需额外操作！**
2. 重启应用即可享受新功能
3. 首次打开设置面板时：
   - 点击 "🔄 Refresh" 刷新模型列表
   - 观察连接状态指示器
   - 选择您喜欢的模型和语言

---

## 🙏 致谢

感谢用户的宝贵反馈：
- 模型选择困难 → 自动检测功能
- 连接状态不明确 → 实时状态显示
- 语言输入不便 → 下拉框选择

您的反馈让 AI Renamer ZX 变得更好！

---

## 📞 支持

如有问题或建议：
- 查看 INSTALL_GUIDE.md 获取详细帮助
- 查看 README.md 了解完整功能
- 提交 Issue 报告问题

---

**更新日期：** 2024-11-11
**版本：** v2.0
**作者：** AI Renamer ZX Team

🎉 **享受更智能的文件重命名体验！**
