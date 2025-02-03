import { describe, expect, test, mock, beforeEach } from 'bun:test'
import { ExtensionContext, commands, workspace } from '../mocks/coc.nvim'
import { activate } from '../../src/index'

describe('Extension Activation', () => {
  let context: ExtensionContext
  let registeredCommands: string[]
  let mockRegisterCommand: ReturnType<typeof mock>

  beforeEach(() => {
    registeredCommands = []
    mockRegisterCommand = mock((name: string, callback: (...args: any[]) => any) => {
      registeredCommands.push(name)
      return { dispose: mock(() => {}) }
    })
    commands.registerCommand = mockRegisterCommand

    context = {
      subscriptions: [],
    }
  })

  test('should register all commands', async () => {
    await activate(context)

    const expectedCommands = ['llama.chat', 'llama.edit', 'llama.compose', 'llama.sync']

    for (const command of expectedCommands) {
      expect(registeredCommands).toContain(command)
    }

    expect(context.subscriptions).toHaveLength(4)
  })
})
