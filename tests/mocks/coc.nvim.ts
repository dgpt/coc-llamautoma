import { mock } from 'bun:test'

export interface MessageItem {
  title: string
}

export interface OutputChannel {
  name: string
  content: string
  show(): void
  hide(): void
  append(value: string): void
  appendLine(value: string): void
  clear(): void
  dispose(): void
}

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
    buffer: {
      setLines: mock((lines: string[], options: { start: number; end: number }) =>
        Promise.resolve()
      ),
    },
  }),
  getConfiguration: (section: string) => ({
    get: <T>(key: string, defaultValue?: T) => defaultValue,
  }),
}

export const commands = {
  registerCommand: mock((name: string, callback: (...args: any[]) => any) => ({
    dispose: mock(() => {}),
  })),
}

export interface ExtensionContext {
  subscriptions: { dispose(): any }[]
}

export const services = {
  registLanguageClient: mock((client: any) => ({
    dispose: mock(() => {}),
  })),
}
