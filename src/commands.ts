import { workspace, window } from '../tests/mocks/coc.nvim'
import { LlamautomaClient } from './client'

export class LlamautomaCommands {
  constructor(private client: LlamautomaClient) {}

  async chat(): Promise<void> {
    try {
      const input = await window.requestInput('Enter your message:')
      if (!input) return

      const channel = window.createOutputChannel('Llamautoma Chat')
      channel.show()

      const response = await this.client.chat(input)
      if (response.text) {
        channel.appendLine(response.text)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      window.showErrorMessage(`Chat failed: ${message}`)
    }
  }

  async edit(): Promise<void> {
    try {
      const doc = await workspace.document
      if (!doc) {
        window.showErrorMessage('No active document')
        return
      }

      const input = await window.requestInput('Enter your edit request:')
      if (!input) return

      const response = await this.client.edit(input)
      if (response.edits) {
        for (const edit of response.edits) {
          if (edit.file === doc.uri) {
            const buffer = await workspace.nvim.buffer
            const lines = edit.content.split('\n')
            await buffer.setLines(lines, { start: 0, end: doc.lineCount })
          }
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      window.showErrorMessage(`Edit failed: ${message}`)
    }
  }

  async compose(): Promise<void> {
    try {
      const filename = await window.requestInput('Enter the filename:')
      if (!filename) return

      const input = await window.requestInput('Enter your compose request:')
      if (!input) return

      const response = await this.client.compose(input)
      if (response.files) {
        for (const file of response.files) {
          await workspace.nvim.command(`new ${file.path}`)
          const buffer = await workspace.nvim.buffer
          const lines = file.content.split('\n')
          await buffer.setLines(lines, { start: 0, end: -1 })
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      window.showErrorMessage(`Compose failed: ${message}`)
    }
  }

  async sync(): Promise<void> {
    try {
      const response = await this.client.sync()
      if (response.status === 'success') {
        window.showInformationMessage('Workspace synchronized successfully')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      window.showErrorMessage(`Sync failed: ${message}`)
    }
  }
}
