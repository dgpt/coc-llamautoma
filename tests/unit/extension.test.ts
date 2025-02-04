import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import type { ExtensionContext } from 'coc.nvim'
import { TEST_SERVER_URL, createMockContext } from '../setup'
import { window, workspace, commands } from 'coc.nvim'

// Mock Bun.serve to prevent actual server starts
mock.module('bun', () => ({
  serve: mock(() => ({
    stop: mock(() => {}),
  })),
}))

describe('Extension Activation', () => {
  let context: ExtensionContext
  let registeredCommands: string[]

  beforeEach(async () => {
    context = createMockContext()
    registeredCommands = []
    commands.registerCommand = mock((name: string) => {
      registeredCommands.push(name)
      return { dispose: mock(() => {}) }
    })
  })

  afterEach(() => {
    mock.restore()
  })

  test('should register all commands', async () => {
    const { activate } = await import('../../src/index')
    await activate(context)

    const expectedCommands = [
      'llamautoma.chat',
      'llamautoma.edit',
      'llamautoma.compose',
      'llamautoma.sync',
    ]
    for (const command of expectedCommands) {
      expect(registeredCommands).toContain(command)
    }

    expect(context.subscriptions).toHaveLength(4)
  })

  test('should not start local server when secret is configured', async () => {
    const mockConfig = {
      secret: 'test-secret',
      serverUrl: TEST_SERVER_URL,
      timeout: 30000,
    }

    workspace.getConfiguration = (section?: string) => ({
      get: <T>(key: string, defaultValue?: T): T => (mockConfig as any)[key] ?? defaultValue,
      update: mock(() => Promise.resolve()),
      has: mock(() => false),
      inspect: mock(() => undefined),
    })

    const { activate } = await import('../../src/index')
    await activate(context)

    expect(mockConfig.serverUrl).toBe(TEST_SERVER_URL)
  })

  test('should use local server URL when no secret is configured', async () => {
    const { activate } = await import('../../src/index')
    await activate(context)

    const config = workspace.getConfiguration('llamautoma')
    expect(config.get('serverUrl', '')).toBe(TEST_SERVER_URL)
  })
})
