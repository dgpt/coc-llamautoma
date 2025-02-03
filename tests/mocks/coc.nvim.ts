import { mock } from 'bun:test'
import type {
  MessageItem,
  OutputChannel,
  ExtensionContext,
  Document,
  Range,
  Logger,
  Position,
} from '../../src/types'

export const window = {
  requestInput: mock((prompt: string, defaultValue?: string) => Promise.resolve('')),
  showErrorMessage: mock((message: string, ...items: MessageItem[]) => Promise.resolve(undefined)),
  showInformationMessage: mock((message: string, ...items: MessageItem[]) =>
    Promise.resolve(undefined)
  ),
  createOutputChannel: mock(
    (name: string): OutputChannel => ({
      name,
      content: '',
      show: mock(() => {}),
      hide: mock(() => {}),
      append: mock((value: string) => {}),
      appendLine: mock((value: string) => {}),
      clear: mock(() => {}),
      dispose: mock(() => {}),
    })
  ),
}

export const workspace = {
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
    languageId: 'typescript',
    version: 1,
    content: '',
    getText: () => '',
    positionAt: (offset: number) => ({ line: 0, character: offset }) as Position,
    offsetAt: (position: Position) => 0,
    lineCount: 0,
    lineAt: (line: number) => ({
      text: '',
      range: { start: { line, character: 0 }, end: { line, character: 0 } },
    }),
    buffer: {
      setLines: mock((lines: string[], options: { start: number; end: number }) =>
        Promise.resolve()
      ),
    },
  } as Document),
  getConfiguration: (section: string) => ({
    get: <T>(key: string, defaultValue?: T) => defaultValue,
  }),
}

export const commands = {
  registerCommand: mock((name: string, callback: (...args: any[]) => any) => ({
    dispose: mock(() => {}),
  })),
}

export const services = {
  registLanguageClient: mock((client: any) => ({
    dispose: mock(() => {}),
  })),
}

export function createMockContext(): ExtensionContext {
  return {
    subscriptions: [],
    extensionPath: '/test/extension/path',
    storagePath: '/test/storage/path',
    logger: {
      info: mock((msg: string) => {}),
      error: mock((msg: string | Error) => {}),
      debug: mock((msg: string) => {}),
      warn: mock((msg: string) => {}),
      category: 'test',
      level: 'info',
      trace: mock((msg: string) => {}),
      log: mock((level: string, msg: string) => {}),
      fatal: mock((msg: string) => {}),
      mark: mock((msg: string) => {}),
    } as Logger,
    asAbsolutePath: (relativePath: string) => `/test/abs/${relativePath}`,
    workspaceState: {
      get: <T>(key: string) => undefined as T | undefined,
      update: (key: string, value: any) => Promise.resolve(),
    },
    globalState: {
      get: <T>(key: string) => undefined as T | undefined,
      update: (key: string, value: any) => Promise.resolve(),
    },
  }
}
