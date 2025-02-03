import { workspace } from '../tests/mocks/coc.nvim'

export interface LlamautomaResponse {
  text?: string
  edits?: Array<{
    file: string
    content: string
  }>
  files?: Array<{
    path: string
    content: string
  }>
  status?: string
}

export class LlamautomaClient {
  private serverUrl: string
  private timeout: number
  private headers: Record<string, string>

  constructor(config: { serverUrl: string; timeout: number; headers?: Record<string, string> }) {
    this.serverUrl = config.serverUrl
    this.timeout = config.timeout
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  private async request<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${this.serverUrl}${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async chat(message: string): Promise<LlamautomaResponse> {
    return this.request<LlamautomaResponse>('/chat', {
      type: 'chat',
      messages: [{ role: 'user', content: message }],
      modelName: 'qwen2.5-coder:1.5b',
      host: 'http://localhost:11434',
      safetyConfig: {
        maxInputLength: 8192,
      },
    })
  }

  async edit(message: string): Promise<LlamautomaResponse> {
    return this.request<LlamautomaResponse>('/edit', {
      type: 'edit',
      messages: [{ role: 'user', content: message }],
      modelName: 'qwen2.5-coder:1.5b',
      host: 'http://localhost:11434',
      safetyConfig: {
        maxInputLength: 8192,
      },
    })
  }

  async compose(message: string): Promise<LlamautomaResponse> {
    return this.request<LlamautomaResponse>('/compose', {
      type: 'compose',
      messages: [{ role: 'user', content: message }],
      modelName: 'qwen2.5-coder:1.5b',
      host: 'http://localhost:11434',
      safetyConfig: {
        maxInputLength: 8192,
      },
    })
  }

  async sync(): Promise<LlamautomaResponse> {
    const config = workspace.getConfiguration('llamautoma')
    const workspaceRoot = workspace.root

    return this.request<LlamautomaResponse>('/sync', {
      type: 'sync',
      root: workspaceRoot,
      excludePatterns: config.get<string[]>('excludePatterns', []),
      modelName: 'qwen2.5-coder:1.5b',
      host: 'http://localhost:11434',
      safetyConfig: {
        maxInputLength: 8192,
      },
    })
  }
}
