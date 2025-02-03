import type { MessageItem, OutputChannel, GlobPattern, Neovim } from './mocks/coc.nvim'

export interface Document {
  uri: string
  content: string
  buffer: {
    setLines: (
      lines: string[],
      options: { start: number; end: number; strictIndexing: boolean }
    ) => Promise<void>
  }
}

export interface Window {
  showErrorMessage: <T extends MessageItem>(
    message: string,
    ...items: T[]
  ) => Promise<T | undefined>
  showInformationMessage: <T extends MessageItem>(
    message: string,
    ...items: T[]
  ) => Promise<T | undefined>
  requestInput: (prompt: string, defaultValue?: string) => Promise<string | undefined>
  createOutputChannel: (name: string) => OutputChannel
}

export interface Workspace {
  root: string
  document: Promise<Document | null>
  findFiles: (include: GlobPattern, exclude?: GlobPattern) => Promise<string[]>
  nvim: Neovim
  getConfiguration: (section: string) => {
    get: <T>(key: string, defaultValue?: T) => T | undefined
  }
}

export interface Commands {
  registerCommand: (
    name: string,
    callback: (...args: any[]) => any
  ) => {
    dispose: () => void
  }
}

export interface Logger {
  category: string
  level: string
  debug(msg: string): void
  info(msg: string): void
  warn(msg: string): void
  error(msg: string): void
  trace(msg: string): void
  log(level: string, msg: string): void
  fatal(msg: string): void
  mark(msg: string): void
}

export interface ExtensionContext {
  subscriptions: Array<{ dispose: () => void; command?: string }>
  extensionPath: string
  storagePath: string
  logger: Logger
  asAbsolutePath: (relativePath: string) => string
  workspaceState: {
    get: <T>(key: string) => T | undefined
    update: (key: string, value: any) => Promise<void>
  }
  globalState: {
    get: <T>(key: string) => T | undefined
    update: (key: string, value: any) => Promise<void>
  }
}

export type { MessageItem, OutputChannel, GlobPattern, Neovim }
