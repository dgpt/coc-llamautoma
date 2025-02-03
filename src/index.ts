import { ExtensionContext, workspace, commands } from 'coc.nvim'
import { LlamautomaClient } from './client'
import { LlamautomaCommands } from './commands'
import server from 'llamautoma'

let serverProcess: ReturnType<typeof Bun.serve> | null = null

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('llamautoma')
  const secret = config.get<string>('secret', '')
  const serverUrl = secret
    ? 'https://api.llamautoma.ai' // Will be the hosted server URL
    : (config.get<string>('serverUrl') ?? 'http://localhost:3000')
  const timeout = config.get<number>('timeout', 30000) ?? 30000

  // Start local server if no secret is configured
  if (!secret) {
    try {
      serverProcess = Bun.serve(server)
      console.log('Started local Llamautoma server')
    } catch (error) {
      console.error('Failed to start local Llamautoma server:', error)
    }
  }

  const client = new LlamautomaClient({
    serverUrl,
    timeout,
    headers: secret ? { 'X-Llamautoma-Secret': secret } : undefined,
  })
  const llamautomaCommands = new LlamautomaCommands(client)

  context.subscriptions.push(
    commands.registerCommand('llama.chat', () => llamautomaCommands.chat()),
    commands.registerCommand('llama.edit', () => llamautomaCommands.edit()),
    commands.registerCommand('llama.compose', () => llamautomaCommands.compose()),
    commands.registerCommand('llama.sync', () => llamautomaCommands.sync())
  )
}

export function deactivate(): void {
  // Cleanup server if running
  if (serverProcess) {
    try {
      serverProcess.stop()
      console.log('Stopped local Llamautoma server')
    } catch (error) {
      console.error('Failed to stop local Llamautoma server:', error)
    }
    serverProcess = null
  }
}
