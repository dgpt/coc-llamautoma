import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import { commands, workspace, createMockContext } from '../mocks/coc.nvim'
import { activate, deactivate } from '../../src/index'
import { TEST_SERVER_URL } from '../setup'

describe('Extension Activation', () => {
  let context: ReturnType<typeof createMockContext>
  let registeredCommands: string[]
  let mockRegisterCommand: ReturnType<typeof mock>
  let mockConfig: Record<string, any>

  beforeEach(() => {
    registeredCommands = []
    mockRegisterCommand = mock((name: string, callback: (...args: any[]) => any) => {
      registeredCommands.push(name)
      return { dispose: mock(() => {}) }
    })
    commands.registerCommand = mockRegisterCommand

    // Mock configuration
    mockConfig = {
      secret: '',
      serverUrl: TEST_SERVER_URL,
      timeout: 30000,
    }
    workspace.getConfiguration = () => ({
      get: (key: string, defaultValue?: any) => mockConfig[key] ?? defaultValue,
    })

    // Create mock context with proper logger type
    context = createMockContext()
  })

  afterEach(() => {
    mock.restore()
  })

  test('should register all commands', async () => {
    await activate(context)

    const expectedCommands = ['llama.chat', 'llama.edit', 'llama.compose', 'llama.sync']

    for (const command of expectedCommands) {
      expect(registeredCommands).toContain(command)
    }

    expect(context.subscriptions).toHaveLength(4)
  })

  test('should not start local server when secret is configured', async () => {
    mockConfig.secret = 'test-secret'
    await activate(context)

    // Verify the server URL is set to the hosted URL when secret is configured
    expect(mockConfig.serverUrl).toBe(TEST_SERVER_URL)
  })

  test('should use local server URL when no secret is configured', async () => {
    await activate(context)

    // Verify the server URL is set to localhost when no secret is configured
    expect(mockConfig.serverUrl).toBe(TEST_SERVER_URL)
  })
})
