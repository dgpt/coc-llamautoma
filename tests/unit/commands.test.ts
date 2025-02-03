import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import { workspace, window, OutputChannel } from '../mocks/coc.nvim'
import { LlamautomaCommands } from '../../src/commands'
import { LlamautomaClient } from '../../src/client'

// Mock the client
const mockClient = {
  chat: mock(async (message: string) => ({ text: 'Mock response' })),
  edit: mock(async (message: string) => ({ edits: [] })),
  compose: mock(async (message: string) => ({ files: [] })),
  sync: mock(async () => ({ status: 'success' })),
} as unknown as LlamautomaClient

describe('LlamautomaCommands', () => {
  let commands: LlamautomaCommands
  let originalDocument: typeof workspace.document
  let originalNvim: typeof workspace.nvim

  beforeEach(() => {
    commands = new LlamautomaCommands(mockClient)
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

      expect(mockClient.chat).toHaveBeenCalledWith('test input')
      expect(createOutputChannel).toHaveBeenCalledWith('Llamautoma Chat')
      expect(mockChannel.show).toHaveBeenCalled()
      expect(mockChannel.appendLine).toHaveBeenCalledWith('Mock response')
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

      expect(mockClient.edit).toHaveBeenCalledWith('test input')
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

      expect(mockClient.compose).toHaveBeenCalledWith('test input')
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

      expect(mockClient.sync).toHaveBeenCalled()
      expect(showInformationMessage).toHaveBeenCalledWith('Workspace synchronized successfully')
    })
  })
})
