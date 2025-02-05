# 🦙 💻 coc-llamautoma

A powerful [coc.nvim](https://github.com/neoclide/coc.nvim) extension that brings AI-powered code generation, editing, and assistance directly to your Neovim editor. Built on top of the Llamautoma framework.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Neovim](https://img.shields.io/badge/Neovim-57A143?style=flat-square&logo=neovim&logoColor=white)](https://neovim.io/)
[![coc.nvim](https://img.shields.io/badge/coc.nvim-2a2a2a?style=flat-square)](https://github.com/neoclide/coc.nvim)

## ✨ Features

- 🤖 AI-powered chat interface for code assistance
- ✏️ Smart code editing and modifications
- 🔨 Code generation and file composition
- 🔄 Workspace synchronization with AI context
- ⚡ Real-time streaming responses
- 🔒 Built-in safety controls

## 🚀 Quick Start

### Prerequisites

- [Neovim](https://neovim.io/) >= 0.8.0
- [coc.nvim](https://github.com/neoclide/coc.nvim)
- [Node.js](https://nodejs.org/) >= 16.0.0
- Running [Llamautoma server](https://github.com/llamautoma/llamautoma)
- [Ollama](https://ollama.com/)
   - Default: `qwen2.5-coder:7b`

(Cloud-based solution coming soon)
(VSCode extension maybe coming soon?)

### Installation

1. Install using your preferred package manager:

```vim
" Using vim-plug
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'dgpt/coc-llamautoma'

" Using packer.nvim
use {'neoclide/coc.nvim', branch = 'release'}
use {'dgpt/coc-llamautoma'}
```

```vim
" Using Vundle
Plugin 'neoclide/coc.nvim'
Plugin 'dgpt/coc-llamautoma'
```

2. Configure the extension in your coc-settings.json:

```json
{
  "llamautoma.enable": true,
  "llamautoma.url": "http://localhost:3000",
  "llamautoma.timeout": 30000,
  "llamautoma.model": "qwen2.5-coder:7b",
  "llamautoma.autoSync": true,
  "llamautoma.syncOnSave": true,
  "llamautoma.syncIgnorePatterns": [
    "node_modules",
    "dist",
    "build",
    ".git"
  ],
  "llamautoma.maxFileSize": 1000000,
  "llamautoma.logLevel": "info"
}
```

## 🎮 Commands

The following commands can be executed using `:CocCommand`:

### Core Commands
- `llamautoma.chat`: Open interactive chat for code assistance
- `llamautoma.sync`: Synchronize workspace with AI context

Each command supports streaming responses for real-time feedback.

## ⌨️ Example Keymaps

```vim
" Example key mappings
nmap <silent> <Leader>lc :CocCommand llamautoma.chat<CR>
nmap <silent> <Leader>ls :CocCommand llamautoma.sync<CR>
```

## ⚙️ Configuration Options

Available settings in coc-settings.json:

```json
{
  // Server Configuration
  "llamautoma.enable": true,
  "llamautoma.url": "http://localhost:3000",  // Local server URL
  "llamautoma.timeout": 30000,                // Request timeout in ms

  // Model Configuration
  "llamautoma.model": "qwen2.5-coder:7b",    // Default model

  // Sync Configuration
  "llamautoma.autoSync": true,               // Auto-sync workspace
  "llamautoma.syncOnSave": true,             // Sync on file save
  "llamautoma.syncIgnorePatterns": [         // Files to ignore
    "node_modules",
    "dist",
    "build",
    ".git"
  ],

  // Safety Configuration
  "llamautoma.maxFileSize": 1000000,         // Max file size in bytes
  "llamautoma.logLevel": "info"              // Logging verbosity
}
```

## 🔒 Safety Features

coc-llamautoma includes several safety features:

- Request timeouts and size limits
- Configurable file exclusions
- Workspace synchronization controls
- Error handling and recovery
- Activity logging

## 🐛 Troubleshooting

Common issues and solutions:

1. **Server Connection**
   ```bash
   # Check server status
   curl http://localhost:3000/health
   ```

2. **Extension Loading**
   ```vim
   :CocList extensions    " Check if extension is loaded
   :CocInfo              " Check extension status
   ```

3. **Logs**
   ```vim
   :CocCommand workspace.showOutput
   ```

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
