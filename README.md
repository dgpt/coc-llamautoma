# coc-llamautoma

AI-powered code generation and editing for coc.nvim, powered by Llamautoma. This extension provides seamless integration between your Vim/Neovim editor and the Llamautoma AI server, enabling advanced code generation, editing, and assistance features.

## Features

- **AI Chat**: Interactive chat with context-aware AI about your code
- **Smart Editing**: AI-assisted code modifications across multiple files
- **Code Generation**: Generate new files and code based on natural language descriptions
- **Workspace Sync**: Keep AI context up-to-date with your workspace changes
- **LSP Integration**: Full Language Server Protocol support
- **Real-time Updates**: Streaming responses for immediate feedback
- **Safety Checks**: Built-in safety measures for code modifications
- **Git-aware**: Respects `.gitignore` patterns during synchronization
- **Multi-file Support**: Handle changes across multiple files seamlessly
- **Autocompletion**: AI-powered code completion suggestions

## Prerequisites

- Neovim >= 0.10.0 or Vim >= 9.0
- [coc.nvim](https://github.com/neoclide/coc.nvim) >= 0.0.80
- [Bun](https://bun.sh/)
- [Ollama](https://ollama.ai/) with required models:
  - Default: `qwen2.5-coder:7b` (production)
  - Testing: `qwen2.5-coder:1.5b` (faster for tests)

## Installation

### Via coc.nvim

```vim
:CocInstall coc-llamautoma
```

### Manual Installation

```bash
cd ~/.config/coc/extensions
git clone https://github.com/dgpt/coc-llamautoma
cd coc-llamautoma
bun install
bun run build
```

## Configuration

### Basic Settings

Add these configurations to your `coc-settings.json`:

```json
{
  "llamautoma.enable": true,
  "llamautoma.serverUrl": "http://localhost:3000",
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

### Key Mappings

Add these to your (Neo)vim configuration:

```vim
" Chat with AI about current file
nmap <silent> <Leader>lc :CocCommand llama.chat<CR>

" Edit current file with AI
nmap <silent> <Leader>le :CocCommand llama.edit<CR>

" Generate new file with AI
nmap <silent> <Leader>ln :CocCommand llama.compose<CR>

" Sync workspace with AI
nmap <silent> <Leader>ls :CocCommand llama.sync<CR>
```

## Commands

### `:CocCommand llama.chat`
- Opens an interactive chat window with the AI
- Context-aware of your current file and workspace
- Supports code snippets and multi-line input
- Use `q` to close the chat window
- History is preserved per session

### `:CocCommand llama.edit`
- Edit the current file with AI assistance
- Supports multi-file edits
- Shows preview of changes before applying
- Safety checks for dangerous modifications
- Undo/redo support for AI changes

### `:CocCommand llama.compose`
- Generate new files with AI
- Supports multiple file generation
- Context-aware of your project structure
- Automatic import management
- Template-based generation

### `:CocCommand llama.sync`
- Synchronize workspace with AI
- Respects `.gitignore` patterns
- Progress indicator for large workspaces
- Selective sync support
- Automatic periodic sync (if enabled)

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/coc-llamautoma
cd coc-llamautoma

# Install dependencies
bun install

# Build the extension
bun run build

# Watch for changes
bun run watch

# Run tests
bun test

# Run tests with coverage
bun test --coverage
```

## Project Structure

```
coc-llamautoma/
├── src/
│   ├── client/        # Llamautoma client implementation
│   ├── commands/      # Command implementations
│   ├── config/        # Configuration management
│   ├── handlers/      # LSP event handlers
│   └── utils/         # Utility functions
├── tests/
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
└── package.json
```

## Troubleshooting

### Common Issues

1. **Server Connection Failed**
   - Check if Llamautoma server is running
   - Verify server URL in configuration
   - Check network connectivity

2. **Command Not Found**
   - Ensure extension is properly installed
   - Run `:CocList extensions` to verify
   - Try reinstalling the extension

3. **Sync Issues**
   - Check workspace permissions
   - Verify `.gitignore` patterns
   - Check file size limits

4. **Performance Issues**
   - Reduce workspace size
   - Adjust sync settings
   - Update to latest version

### Logs

- View extension logs: `:CocCommand workspace.showOutput`
- Select 'coc-llamautoma' from the output list
- Set `llamautoma.logLevel` to "debug" for detailed logs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
