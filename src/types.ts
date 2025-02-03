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
