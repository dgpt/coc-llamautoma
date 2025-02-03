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

  constructor(config: { serverUrl: string; timeout: number }) {
    this.serverUrl = config.serverUrl
    this.timeout = config.timeout
  }

  private async request<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${this.serverUrl}${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async chat(message: string): Promise<LlamautomaResponse> {
    return this.request<LlamautomaResponse>('/chat', { message })
  }

  async edit(message: string): Promise<LlamautomaResponse> {
    return this.request<LlamautomaResponse>('/edit', { message })
  }

  async compose(message: string): Promise<LlamautomaResponse> {
    return this.request<LlamautomaResponse>('/compose', { message })
  }

  async sync(): Promise<LlamautomaResponse> {
    const config = workspace.getConfiguration('llamautoma')
    const workspaceRoot = workspace.root

    return this.request<LlamautomaResponse>('/sync', {
      root: workspaceRoot,
      excludePatterns: config.get<string[]>('excludePatterns', []),
    })
  }
}
