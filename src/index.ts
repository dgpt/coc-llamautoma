import {
  ExtensionContext,
  workspace,
  commands,
  window,
  languages,
  events,
  LanguageClient,
} from 'coc.nvim'
import { LlamautomaClient } from './client'
import { LlamautomaCommands } from './commands'
import { handleFileRequest } from './handlers/fileRequest'
import { handleCommandRequest } from './handlers/commandRequest'
import { logger } from './logger'
import type { FileRequest, CommandRequest } from './types'

export async function activate(context: ExtensionContext): Promise<void> {
  logger.info('Activating llamautoma extension')

  const config = workspace.getConfiguration('llamautoma')

  // Get and log each config value
  const serverUrl = config.get<string>('url') ?? 'http://localhost:3000'
  const timeout = config.get<number>('timeout', 30000)
  const secret = config.get<string>('secret', '')
  const model = config.get<string>('model', 'qwen2.5-coder:7b')
  const maxFileSize = config.get<number>('maxFileSize', 8192)
  const autoSync = config.get<boolean>('autoSync', true)
  const syncOnSave = config.get<boolean>('syncOnSave', true)
  const syncIgnorePatterns = config.get<string[]>('syncIgnorePatterns', [
    'node_modules',
    'dist',
    'build',
    '.git',
  ])
  const logLevel = config.get<'debug' | 'info' | 'warn' | 'error'>('logLevel', 'info')

  logger.info('Configuration values:', {
    serverUrl,
    timeout,
    secret: secret ? '[REDACTED]' : 'none',
    model,
    maxFileSize,
    autoSync,
    syncOnSave,
    syncIgnorePatterns,
    logLevel,
  })

  const headers: Record<string, string> = {}
  if (secret) {
    headers['X-Llamautoma-Secret'] = secret
  }

  console.log('Creating client with URL:', serverUrl)
  const client = new LlamautomaClient({
    serverUrl,
    timeout,
    headers,
    maxFileSize,
    autoSync,
    syncOnSave,
    syncIgnorePatterns,
    logLevel,
  })

  const llamautomaCommands = new LlamautomaCommands(client)

  // Register commands
  context.subscriptions.push(
    commands.registerCommand('llamautoma.chat', async () => {
      console.log('Executing chat command')
      await llamautomaCommands.chat()
    }),
    commands.registerCommand('llamautoma.sync', async () => {
      console.log('Executing sync command')
      await llamautomaCommands.sync()
    })
  )

  // Start client
  await client.start()

  // Register cleanup
  context.subscriptions.push({
    dispose: () => client.stop(),
  })

  // Register request handlers
  context.subscriptions.push({
    dispose: () => {
      // Cleanup on deactivation
      logger.dispose()
    },
  })

  // Set up message handling
  const nvim = workspace.nvim
  await nvim.command('augroup Llamautoma')
  await nvim.command('autocmd!')

  // Register file request handler
  await nvim.command(
    'autocmd User LlamautomaFileRequest lua vim.fn.CocAction("runCommand", "llamautoma.handleFileRequest", vim.b.llamautoma_file_request)'
  )

  // Register command request handler
  await nvim.command(
    'autocmd User LlamautomaCommandRequest lua vim.fn.CocAction("runCommand", "llamautoma.handleCommandRequest", vim.b.llamautoma_command_request)'
  )

  await nvim.command('augroup END')

  // Set up Lua functions
  await nvim.lua(`
    local M = {}

    function M.handle_file_request()
      local params = vim.b.llamautoma_file_request
      if params then
        vim.fn.CocRequest('llamautoma', 'handleFileRequest', params)
      end
    end

    function M.handle_command_request()
      local params = vim.b.llamautoma_command_request
      if params then
        vim.fn.CocRequest('llamautoma', 'handleCommandRequest', params)
      end
    end

    return M
  `)

  // Register command handlers
  context.subscriptions.push(
    commands.registerCommand('llamautoma.handleFileRequest', async (request: FileRequest) => {
      try {
        await handleFileRequest(request, response => {
          nvim.call('coc#rpc#notify', ['llamautoma:response', response], true)
        })
        return { success: true }
      } catch (error) {
        logger.error('File request handler error:', error)
        return { success: false, error: String(error) }
      }
    })
  )

  context.subscriptions.push(
    commands.registerCommand('llamautoma.handleCommandRequest', async (request: CommandRequest) => {
      try {
        await handleCommandRequest(request, response => {
          nvim.call('coc#rpc#notify', ['llamautoma:response', response], true)
        })
        return { success: true }
      } catch (error) {
        logger.error('Command request handler error:', error)
        return { success: false, error: String(error) }
      }
    })
  )

  // Create language client
  const languageClient = new LanguageClient(
    'llamautoma',
    'Llamautoma',
    {
      command: 'llamautoma-server',
      args: [],
    },
    {
      documentSelector: ['*'],
      synchronize: {
        configurationSection: 'llamautoma',
      },
    }
  )

  // Register custom handlers
  languageClient.onRequest('llamautoma/file_request', async (params: FileRequest) => {
    try {
      await handleFileRequest(params)
      return { success: true }
    } catch (error) {
      logger.error('File request handler error:', error)
      return { success: false, error: String(error) }
    }
  })

  languageClient.onRequest('llamautoma/command_request', async (params: CommandRequest) => {
    try {
      await handleCommandRequest(params)
      return { success: true }
    } catch (error) {
      logger.error('Command request handler error:', error)
      return { success: false, error: String(error) }
    }
  })
}

export function deactivate(): void {
  // No cleanup needed
}
