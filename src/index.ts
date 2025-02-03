import { ExtensionContext, workspace, commands } from '../tests/mocks/coc.nvim'
import { LlamautomaClient } from './client'
import { LlamautomaCommands } from './commands'

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('llamautoma')
  const serverUrl =
    config.get<string>('serverUrl', 'http://localhost:3000') ?? 'http://localhost:3000'
  const timeout = config.get<number>('timeout', 30000) ?? 30000

  const client = new LlamautomaClient({ serverUrl, timeout })
  const llamautomaCommands = new LlamautomaCommands(client)

  context.subscriptions.push(
    commands.registerCommand('llama.chat', () => llamautomaCommands.chat()),
    commands.registerCommand('llama.edit', () => llamautomaCommands.edit()),
    commands.registerCommand('llama.compose', () => llamautomaCommands.compose()),
    commands.registerCommand('llama.sync', () => llamautomaCommands.sync())
  )
}

export function deactivate(): void {
  // Cleanup if needed
}
