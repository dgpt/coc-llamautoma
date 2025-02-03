import type {
  MessageItem,
  OutputChannel,
  TextDocument,
  Neovim,
  ExtensionContext,
  WorkspaceFolder,
  DocumentSelector,
  Range,
  Logger,
  GlobPattern,
  Position,
} from 'coc.nvim'

export type {
  MessageItem,
  OutputChannel,
  TextDocument as Document,
  Neovim,
  ExtensionContext,
  WorkspaceFolder,
  DocumentSelector,
  Range,
  Logger,
  GlobPattern,
  Position,
}

// Re-export Window interface with our specific needs
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

// Re-export Workspace interface with our specific needs
export interface Workspace {
  root: string
  document: Promise<Document | null>
  findFiles: (include: GlobPattern, exclude?: GlobPattern) => Promise<string[]>
  nvim: Neovim
  getConfiguration: (section: string) => {
    get: <T>(key: string, defaultValue?: T) => T | undefined
  }
}

// Re-export Commands interface with our specific needs
export interface Commands {
  registerCommand: (
    name: string,
    callback: (...args: any[]) => any
  ) => {
    dispose: () => void
  }
}

export interface EditRequest {
  prompt: string
  file: string
  content: string
}

export interface EditResponse {
  edits: Array<{
    file: string
    content: string
  }>
}

export interface ComposeRequest {
  prompt: string
  filename: string
}

export interface ComposeResponse {
  content: string
}

export interface SyncRequest {
  files: string[]
}

export interface SyncResponse {
  success: boolean
}

export interface LlamautomaClientConfig {
  serverUrl: string
  timeout?: number
}
