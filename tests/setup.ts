import { beforeEach } from 'bun:test'
import type { Window, Workspace, Commands } from './types'
import { window, workspace, commands } from './mocks/coc.nvim'

// Extend the global scope
declare global {
  var window: Window
  var workspace: Workspace
  var commands: Commands
}

beforeEach(() => {
  // Reset global mocks before each test
  global.window = window as Window
  global.workspace = workspace as Workspace
  global.commands = commands as Commands

  // Set up default fetch mock
  global.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

    if (url.endsWith('/health')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response)
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)
  }) as typeof fetch
})
