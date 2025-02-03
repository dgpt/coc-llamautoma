import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import { OutputChannel } from '../../src/types'
import { workspace, window } from '../mocks/coc.nvim'
import { LlamautomaCommands } from '../../src/commands'
import { LlamautomaClient } from '../../src/client'
import { TEST_SERVER_URL } from '../setup'

describe('LlamautomaCommands', () => {
  let commands: LlamautomaCommands
  let originalDocument: typeof workspace.document
  let originalNvim: typeof workspace.nvim
  let client: LlamautomaClient

  beforeEach(() => {
    client = new LlamautomaClient({
      serverUrl: TEST_SERVER_URL,
      timeout: 30000,
      headers: undefined,
    })
    commands = new LlamautomaCommands(client)
    originalDocument = workspace.document
    originalNvim = workspace.nvim
  })

  afterEach(() => {
    mock.restore()
    // Restore original workspace properties
    Object.defineProperty(workspace, 'document', {
      get: () => originalDocument,
    })
    Object.defineProperty(workspace, 'nvim', {
      get: () => originalNvim,
    })
  })

  describe('chat', () => {
    test('should call client.chat and display response', async () => {
      // Mock window.createOutputChannel
      const mockChannel: OutputChannel = {
        name: 'Llamautoma Chat',
        content: '',
        show: mock(() => {}),
        hide: mock(() => {}),
        appendLine: mock(() => {}),
        append: mock(() => {}),
        clear: mock(() => {}),
        dispose: mock(() => {}),
      }
      const createOutputChannel = mock(() => mockChannel)
      Object.defineProperty(window, 'createOutputChannel', {
        value: createOutputChannel,
      })

      // Mock window.requestInput
      const requestInput = mock(() => Promise.resolve('test input'))
      Object.defineProperty(window, 'requestInput', {
        value: requestInput,
      })

      await commands.chat()

      expect(mockChannel.show).toHaveBeenCalled()
      expect(mockChannel.appendLine).toHaveBeenCalled()
    })
  })

  describe('edit', () => {
    test('should call client.edit and apply changes', async () => {
      // Mock workspace.document
      const mockBuffer = {
        setLines: mock(() => Promise.resolve()),
      }
      const mockDoc = {
        uri: 'test.ts',
        buffer: mockBuffer,
      }
      Object.defineProperty(workspace, 'document', {
        get: () => Promise.resolve(mockDoc),
      })

      // Mock window.requestInput
      const requestInput = mock(() => Promise.resolve('test input'))
      Object.defineProperty(window, 'requestInput', {
        value: requestInput,
      })

      await commands.edit()

      // Verify the buffer was updated
      expect(mockBuffer.setLines).toHaveBeenCalled()
    })
  })

  describe('compose', () => {
    test('should call client.compose and create files', async () => {
      // Mock window.requestInput
      const requestInput = mock(() => Promise.resolve('test input'))
      Object.defineProperty(window, 'requestInput', {
        value: requestInput,
      })

      // Mock workspace.nvim
      const mockBuffer = {
        setLines: mock(() => Promise.resolve()),
      }
      const mockNvim = {
        command: mock(() => Promise.resolve()),
        buffer: Promise.resolve(mockBuffer),
      }
      Object.defineProperty(workspace, 'nvim', {
        get: () => mockNvim,
      })

      await commands.compose()

      // Verify nvim commands were called
      expect(mockNvim.command).toHaveBeenCalled()
    })
  })

  describe('sync', () => {
    test('should call client.sync and update workspace', async () => {
      // Mock window.showInformationMessage
      const showInformationMessage = mock(() => Promise.resolve(undefined as string | undefined))
      Object.defineProperty(window, 'showInformationMessage', {
        value: showInformationMessage,
      })

      await commands.sync()

      expect(showInformationMessage).toHaveBeenCalledWith('Workspace synchronized successfully')
    })
  })
})
