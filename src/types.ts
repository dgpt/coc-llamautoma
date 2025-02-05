import type {
  MessageItem,
  OutputChannel,
  TextDocument as CocTextDocument,
  Neovim,
  ExtensionContext as CocExtensionContext,
  WorkspaceFolder,
  DocumentSelector,
  Range as CocRange,
  Logger,
  GlobPattern,
  Position as CocPosition,
} from 'coc.nvim'

import {
  Message,
  Messages,
  Safety as SafetyCheck,
  ToolType,
  Param as ToolParam,
  Tool,
  Call as ToolCall,
  ToolResult,
  Feedback as ToolFeedback,
  Registry as ToolRegistry,
  TaskState,
  Task,
  WorkflowState,
  BaseResponse,
  FileOp,
  CommandOp,
  Position as LlamaPosition,
  Range as LlamaRange,
  TextDocument as LlamaTextDocument,
  TextEdit,
  DocumentChange,
  WorkspaceEdit,
} from 'llamautoma-types'

// Re-export coc.nvim types
export type {
  MessageItem,
  OutputChannel,
  CocTextDocument as Document,
  Neovim,
  WorkspaceFolder,
  DocumentSelector,
  CocRange as Range,
  Logger,
  GlobPattern,
  CocPosition as Position,
}

// Re-export ExtensionContext with our specific needs
export type ExtensionContext = CocExtensionContext

// Re-export shared types
export type {
  Message,
  Messages,
  SafetyCheck,
  ToolType,
  ToolParam,
  Tool,
  ToolCall,
  ToolResult,
  ToolFeedback,
  ToolRegistry,
  TaskState,
  Task,
  WorkflowState,
  BaseResponse,
  FileOp,
  CommandOp,
  LlamaPosition as EditorPosition,
  LlamaRange as EditorRange,
  LlamaTextDocument as EditorDocument,
  TextEdit,
  DocumentChange,
  WorkspaceEdit,
}

// Window interface extending shared types
export interface Window {
  showErrorMessage: <T extends MessageItem>(
    message: string,
    ...items: T[]
  ) => Promise<T | undefined>
  showInformationMessage: <T extends MessageItem>(
    message: string,
    ...items: T[]
  ) => Promise<T | undefined>
  createOutputChannel: (name: string) => OutputChannel
}

// Workspace interface extending shared types
export interface Workspace {
  document: Promise<Document | null>
  nvim: Neovim
  root: string
  findFiles: (include: string | GlobPattern, exclude?: string | GlobPattern) => Promise<string[]>
  getConfiguration: <T = any>(section?: string) => T
}

// Commands interface
export interface Commands {
  registerCommand: (
    name: string,
    callback: (...args: any[]) => any
  ) => {
    dispose: () => void
  }
}

// Request types using shared types
export interface SyncRequest {
  files: string[]
}

export interface SyncResponse {
  status: 'success' | 'error'
  error?: string
  files?: FileOp[]
}

export interface LlamautomaClientConfig {
  serverUrl: string
  timeout?: number
}

// Response types
export interface StreamingResponse {
  type: 'content' | 'error'
  data?: string
  error?: string
}

// Request types
export interface ChatRequest {
  threadId?: string
  messages: Message[]
  modelName?: string
  safetyConfig?: SafetyConfig
  root?: string
  excludePatterns?: string[]
}

export interface SafetyConfig {
  maxInputLength?: number
  requireToolConfirmation?: boolean
  requireToolFeedback?: boolean
  dangerousToolPatterns?: string[]
}

export interface ClientConfig {
  serverUrl: string
  timeout: number
  headers?: Record<string, string>
  maxFileSize?: number
  autoSync?: boolean
  syncOnSave?: boolean
  syncIgnorePatterns?: string[]
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

// File operation types
export interface FileRequest {
  type: 'read' | 'write' | 'delete'
  path: string
  content?: string
}

export interface CommandRequest {
  command: string
  cwd?: string
  env?: Record<string, string>
  timeout?: number
}

