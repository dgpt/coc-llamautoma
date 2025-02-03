import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import type { LlamautomaCommands } from '../../src/commands'
import type { LlamautomaClient } from '../../src/client'
import { TEST_SERVER_URL } from '../setup'
import { window, workspace } from 'coc.nvim'

describe('LlamautomaCommands', () => {
  let commands: LlamautomaCommands
  let client: LlamautomaClient

  beforeEach(async () => {
    // Import modules after mocking
    const { LlamautomaClient } = await import('../../src/client')
    const { LlamautomaCommands } = await import('../../src/commands')

    client = new LlamautomaClient({
      serverUrl: TEST_SERVER_URL,
      timeout: 30000,
      headers: undefined,
    })
    commands = new LlamautomaCommands(client)
  })

  afterEach(() => {
    mock.restore()
  })

  describe('chat', () => {
    test('should call client.chat and display response', async () => {
      await commands.chat()
      expect(window.createOutputChannel).toHaveBeenCalled()
      expect(window.requestInput).toHaveBeenCalledWith('Enter your message:')
    })
  })

  describe('edit', () => {
    test('should call client.edit and apply changes', async () => {
      await commands.edit()
      expect(window.requestInput).toHaveBeenCalledWith('Enter your edit request:')
      expect(workspace.document).toBeDefined()
    })
  })

  describe('compose', () => {
    test('should call client.compose and create files', async () => {
      await commands.compose()
      expect(window.requestInput).toHaveBeenCalledWith('Enter the filename:')
      expect(workspace.nvim.command).toHaveBeenCalled()
    })
  })

  describe('sync', () => {
    test('should call client.sync and update workspace', async () => {
      await commands.sync()
      expect(window.showInformationMessage).toHaveBeenCalledWith(
        'Workspace synchronized successfully'
      )
    })
  })
})
