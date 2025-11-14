# AI Renamer ZX

AI-powered file renaming tool with a beautiful visual interface. Built with React + Express, powered by Ollama/LM Studio/OpenAI models.

## Features

- 🎨 **Visual Interface**: Drag & drop files, configure settings in real-time
- 🤖 **AI-Powered**: Uses local LLMs (Llava, Gemma, Llama) or OpenAI models
- 📁 **Flexible File Support**:
  - Whitelist of common formats (images, videos, documents, code)
  - Custom file type support
  - Mixed mode: Ask user for unknown formats
- ⚙️ **Configurable**: Provider, model, case style, language, custom prompts
- 🔄 **Preview Before Rename**: See what the new names will be before committing
- 💾 **Project-Level Config**: Settings stored in project directory

## Architecture

```
ai_renamer_ZX/
├── server/              # Express API backend
│   ├── routes/          # API routes (config, files, models)
│   ├── services/        # Business logic
│   └── middleware/      # Upload & error handling
├── client/              # React + Vite frontend
│   └── src/
│       ├── components/  # UI components
│       └── services/    # API client
├── ai-renamer-main/     # Original CLI (core logic)
├── config/              # Project configuration
└── start.js             # One-click startup script
```

## Prerequisites

- **Node.js** >= 16.0.0
- **Ollama** or **LM Studio** with at least one model installed
  - For Ollama: [Download here](https://ollama.com/download)
  - For LM Studio: [Download here](https://lmstudio.ai/)
- **ffmpeg** (optional, for video processing)

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for root, server, and client.

### 2. Start the Application

```bash
npm start
```

This single command starts both backend and frontend:
- Backend API: http://localhost:3000
- Frontend UI: http://localhost:5173

The browser will automatically open to the frontend.

### 3. Configure Your AI Provider

1. Click "Show Settings" in the UI
2. Select your provider (Ollama/LM Studio/OpenAI)
3. Configure model name and base URL
4. Click "Test Connection" to verify
5. Adjust other settings (case style, language, etc.)

### 4. Rename Files

1. Drag and drop files into the upload area
2. Unknown file types will prompt you to add them
3. Click "Preview Rename" to see suggested names
4. Click "Execute Rename" to apply the changes

## Manual Start (Development)

Start backend and frontend separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## Configuration

Settings are stored in `config/.ai-renamer-config.json`:

```json
{
  "defaultProvider": "ollama",
  "defaultModel": "llava",
  "defaultBaseURL": "http://127.0.0.1:11434",
  "defaultCase": "kebabCase",
  "defaultChars": 50,
  "defaultLanguage": "English",
  "customFileTypes": [".xyz", ".custom"]
}
```

## File Type Support Strategy

### Whitelist (Auto-Supported)
Common formats are automatically supported:
- Images: `.jpg`, `.png`, `.gif`, etc.
- Videos: `.mp4`, `.avi`, `.mov`, etc.
- Documents: `.pdf`, `.txt`, `.md`, etc.
- Code: `.js`, `.py`, `.java`, etc.

### Custom Types
User-added formats via the UI or configuration.

### Mixed Mode (Unknown Formats)
When an unknown file type is detected:
1. UI shows a warning icon ⚠️
2. User can click to add the type to supported list
3. Or choose to skip the file

## API Endpoints

### Configuration
- `GET /api/config` - Get current configuration
- `PUT /api/config` - Update configuration
- `GET /api/config/presets` - Get saved presets
- `POST /api/config/presets` - Save a preset

### Files
- `POST /api/files/upload` - Upload files
- `POST /api/files/preview` - Preview rename results
- `POST /api/files/rename` - Execute rename
- `GET /api/files/supported-types` - Get supported file types
- `POST /api/files/add-custom-type` - Add custom file type

### Models
- `POST /api/models/list` - List available models
- `POST /api/models/test` - Test provider connection
- `POST /api/models/auto-select` - Auto-select best model

## Supported Providers

### Ollama (Default)
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llava
```

Settings:
- Provider: `ollama`
- Base URL: `http://127.0.0.1:11434`
- Model: `llava`, `gemma2`, `llama3`, etc.

### LM Studio
1. Download and open LM Studio
2. Load a model
3. Start local server

Settings:
- Provider: `lm-studio`
- Base URL: `http://127.0.0.1:1234`
- Model: Auto-detected

### OpenAI
Settings:
- Provider: `openai`
- Base URL: `https://api.openai.com`
- API Key: Your OpenAI API key
- Model: `gpt-4o`, `gpt-4-vision-preview`, etc.

## Case Styles

Supported case transformations:
- `camelCase` → twoWords
- `kebabCase` → two-words
- `snakeCase` → two_words
- `pascalCase` → TwoWords
- And more...

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Node.js version: `node --version`

### Frontend won't start
- Check if port 5173 is available
- Try `cd client && npm install`

### Model connection fails
- Verify Ollama/LM Studio is running
- Check base URL in settings
- Test with `curl http://localhost:11434/api/tags`

### File upload fails
- Check file size (max 100MB)
- Check file type support
- Add custom type if needed

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT License - Based on [ai-renamer](https://github.com/ozgrozer/ai-renamer)

## Credits

Built on top of the excellent [ai-renamer](https://github.com/ozgrozer/ai-renamer) CLI tool by [@ozgrozer](https://github.com/ozgrozer).
