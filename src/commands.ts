import { workspace, window, commands } from 'coc.nvim'
import { LlamautomaClient } from './client'
import type { StreamingResponse } from './types'

export class LlamautomaCommands {
  private channels: Map<string, any> = new Map()
  private activeChannel: any | null = null

  constructor(private client: LlamautomaClient) {}

  private getOrCreateChannel(name: string) {
    if (!this.channels.has(name)) {
      const channel = window.createOutputChannel(name)
      this.channels.set(name, channel)
    }
    return this.channels.get(name)
  }

  private async showChannel(name: string) {
    const channel = this.getOrCreateChannel(name)
    if (this.activeChannel !== channel) {
      channel.show()
      this.activeChannel = channel
      // Set buffer options after showing
      const nvim = workspace.nvim
      await nvim.command('setlocal buftype=nofile')
      await nvim.command('setlocal noswapfile')
      await nvim.command('setlocal nomodifiable')
      await nvim.command('setlocal nomodified')
    }
    return channel
  }

  private async appendToChannel(channel: any, text: string) {
    // Don't append empty lines or raw JSON
    if (!text || !text.trim()) return
    if (
      text.includes('"type":') ||
      text.includes('"content":') ||
      (text.startsWith('{') && !text.startsWith('>> '))
    )
      return

    const nvim = workspace.nvim
    const bufnr = await nvim.call('bufnr', ['%'])

    // Make buffer modifiable
    await nvim.command('setlocal modifiable')

    // Append the text
    channel.appendLine(text)

    // Make buffer non-modifiable again
    await nvim.command('setlocal nomodifiable')
    await nvim.command('setlocal nomodified')

    // Scroll to bottom if we're in the output window
    const currentBufnr = await nvim.call('bufnr', ['%'])
    if (currentBufnr === bufnr) {
      await nvim.command('normal! G')
      await nvim.command('redraw')
    }
  }

  private async handleError(error: unknown, command: string) {
    const message = error instanceof Error ? error.message : String(error)
    window.showErrorMessage(`${command} command failed: ${message}`)
    const channel = await this.showChannel(`Llamautoma ${command}`)
    await this.appendToChannel(channel, `Error: ${message}`)
  }

  async chat(): Promise<void> {
    try {
      const channel = await this.showChannel('Llamautoma Chat')
      const input = await window.requestInput('Enter your message:')
      if (!input) return

      await this.appendToChannel(channel, `You: ${input}`)

      const response = await this.client.chat(input)
      if (response.type === 'error') {
        await this.appendToChannel(channel, `Error: ${response.error}`)
      } else if (response.type === 'content') {
        await this.appendToChannel(channel, `Assistant: ${response.data}`)
      }
    } catch (error: unknown) {
      await this.handleError(error, 'Chat')
    }
  }

  async sync(): Promise<void> {
    try {
      const channel = await this.showChannel('Llamautoma Sync')
      await this.appendToChannel(channel, 'Syncing workspace...')

      const response = await this.client.sync()
      if (response.status === 'success') {
        window.showInformationMessage('Workspace synchronized successfully')
        await this.appendToChannel(channel, 'Sync completed successfully')
      } else {
        await this.appendToChannel(channel, 'Sync completed but no success status received')
      }
    } catch (error: unknown) {
      await this.handleError(error, 'Sync')
    }
  }
}
