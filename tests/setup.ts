import { beforeEach, mock, beforeAll, afterAll } from 'bun:test'
import type { ExtensionContext, WorkspaceConfiguration } from 'coc.nvim'
import server from 'llamautoma'

const TEST_PORT = 3001
export const TEST_SERVER_URL = `http://localhost:${TEST_PORT}`

// Mock coc.nvim modules
const mockWindow = {
  requestInput: mock((prompt: string) => Promise.resolve('test input')),
  showErrorMessage: mock((message: string) => Promise.resolve(undefined)),
  showInformationMessage: mock((message: string) => Promise.resolve(undefined)),
  createOutputChannel: mock(() => ({
    name: 'Llamautoma Chat',
    content: '',
    show: mock(() => {}),
    hide: mock(() => {}),
    append: mock(() => {}),
    appendLine: mock(() => {}),
    clear: mock(() => {}),
    dispose: mock(() => {}),
  })),
}

const mockWorkspace = {
  root: '/test',
  nvim: {
    command: mock((cmd: string) => Promise.resolve()),
    buffer: Promise.resolve({
      setLines: mock((lines: string[], options: { start: number; end: number }) =>
        Promise.resolve()
      ),
    }),
  },
  document: Promise.resolve({
    uri: 'test.ts',
    lineCount: 10,
    buffer: {
      setLines: mock((lines: string[], options: { start: number; end: number }) =>
        Promise.resolve()
      ),
    },
  }),
  getConfiguration: (section?: string): WorkspaceConfiguration => ({
    get: <T>(key: string, defaultValue?: T): T =>
      (
        ({
          secret: '',
          serverUrl: TEST_SERVER_URL,
          timeout: 30000,
        }) as any
      )[key] ?? defaultValue,
    update: mock(() => Promise.resolve()),
    has: mock(() => false),
    inspect: mock(() => undefined),
  }),
}

const mockCommands = {
  registerCommand: mock((name: string) => ({
    dispose: mock(() => {}),
  })),
}

// Set up global mocks
mock.module('coc.nvim', () => ({
  window: mockWindow,
  workspace: mockWorkspace,
  commands: mockCommands,
}))

// Export mocked context for tests
export function createMockContext(): ExtensionContext {
  return {
    subscriptions: [],
    extensionPath: '/test/extension/path',
    storagePath: '/test/storage/path',
    workspaceState: {
      get: mock((key: string) => undefined),
      update: mock((key: string, value: any) => Promise.resolve()),
    },
    globalState: {
      get: mock((key: string) => undefined),
      update: mock((key: string, value: any) => Promise.resolve()),
    },
    asAbsolutePath: mock((relativePath: string) => `/test/abs/${relativePath}`),
    logger: {
      category: 'test',
      level: 'info',
      log: mock(() => {}),
      error: mock(() => {}),
      warn: mock(() => {}),
      info: mock(() => {}),
      debug: mock(() => {}),
      trace: mock(() => {}),
      fatal: mock(() => {}),
      mark: mock(() => {}),
    },
  } as unknown as ExtensionContext
}
let serverInstance: ReturnType<typeof Bun.serve> | null = null

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  // Start a single server instance for all tests
  const testServer = { ...server, port: TEST_PORT }
  serverInstance = Bun.serve(testServer)
  console.log('Started test Llamautoma server')
})

afterAll(() => {
  process.env.NODE_ENV = 'development'
  // Stop the server after all tests
  if (serverInstance) {
    serverInstance.stop()
    console.log('Stopped test Llamautoma server')
    serverInstance = null
  }
})

// Reset mocks before each test
beforeEach(() => {
  mock.restore()
})

