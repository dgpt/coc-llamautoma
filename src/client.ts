import { workspace } from 'coc.nvim'
import fetch, { Response } from 'node-fetch'
import AbortController from 'abort-controller'
import { EventEmitter } from 'events'
import { handleFileRequest } from './handlers/fileRequest'
import { window } from 'coc.nvim'
import type {
  Message,
  Messages,
  SafetyConfig,
  StreamingResponse,
  ClientConfig,
  ChatRequest,
  SyncRequest,
  SyncResponse,
} from './types'

export class LlamautomaClient extends EventEmitter {
  private config: ClientConfig
  private serverUrl: string
  private timeout: number
  private messageHistory: Map<string, Message[]> = new Map()
  private currentThreadId: string | null = null
  private outputChannel = window.createOutputChannel('Llamautoma')

  constructor(config: ClientConfig) {
    super()
    this.config = config
    this.serverUrl = config.serverUrl
    this.timeout = config.timeout
    this.setupMessageHandlers()
  }

  private setupMessageHandlers() {
    this.on('data', async (message: string) => {
      try {
        const { type, data } = JSON.parse(message)

        switch (type) {
          case 'request':
            await this.handleRequest(data)
            break
          default:
            this.log(`Unknown message type: ${type}`)
        }
      } catch (error) {
        this.log(`Error handling message: ${error}`)
      }
    })
  }

  private async handleRequest(data: any) {
    try {
      switch (data.type) {
        case 'file_request':
          // Handle file request streaming
          await handleFileRequest(data.data, chunk => {
            this.emit(
              'response',
              JSON.stringify({
                type: 'file_chunk',
                data: chunk,
              })
            )
          })

          // Signal end of all files
          this.emit(
            'response',
            JSON.stringify({
              type: 'file_complete',
            })
          )
          break

        default:
          this.log(`Unknown request type: ${data.type}`)
      }
    } catch (error) {
      this.log(`Error handling request: ${error}`)
      // Signal error
      this.emit(
        'response',
        JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
        })
      )
    }
  }

  private log(message: string) {
    this.outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`)
  }

  private getCurrentThreadId(): string {
    if (!this.currentThreadId) {
      this.currentThreadId = `thread-${Date.now()}`
    }
    return this.currentThreadId
  }

  private getMessageHistory(threadId: string): Message[] {
    if (!this.messageHistory.has(threadId)) {
      this.messageHistory.set(threadId, [])
    }
    return this.messageHistory.get(threadId)!
  }

  private addToHistory(threadId: string, message: Message) {
    const history = this.getMessageHistory(threadId)
    history.push(message)
    this.messageHistory.set(threadId, history)
  }

  private extractContent(data: any): string {
    try {
      // Handle string data
      if (typeof data === 'string') {
        // Remove JSON code block markers if present
        data = data.replace(/^```json\n/, '').replace(/\n```$/, '')

        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(data)
          return this.extractContent(parsed)
        } catch {
          // If not JSON, return as is
          return data.trim()
        }
      }

      // Handle object data
      if (data && typeof data === 'object') {
        if (data.type === 'thought') {
          return `>> ${data.content.trim()}`
        } else if (data.type === 'chat') {
          return data.content.trim()
        } else if (data.type === 'error') {
          throw new Error(data.content)
        }
      }

      return ''
    } catch (e) {
      console.error('Error extracting content:', e)
      return ''
    }
  }

  private async parseStreamingLine(line: string): Promise<string> {
    if (!line.startsWith('data: ')) return ''

    try {
      const eventData = JSON.parse(line.slice(6))
      if (!eventData.data) return ''

      return this.extractContent(eventData.data)
    } catch (e) {
      console.error('Error parsing streaming line:', e)
      return ''
    }
  }

  private async handleStreamingResponse(response: Response): Promise<string> {
    const text = await response.text()
    const lines = text.split('\n')
    const contents = await Promise.all(
      lines.filter(line => line.trim()).map(line => this.parseStreamingLine(line))
    )

    // Filter out empty lines and join with newlines
    return contents
      .filter(content => content.trim())
      .join('\n')
      .trim()
  }

  private createRequestBody(messages: Message[], options: any = {}): ChatRequest {
    return {
      threadId: options.threadId || `request-${Date.now()}`,
      messages,
      modelName: options.modelName || 'qwen2.5-coder:7b',
      safetyConfig: {
        maxInputLength: options.maxFileSize || 8192,
        requireToolConfirmation: false,
        requireToolFeedback: false,
      },
      ...(options.root && { root: options.root }),
      ...(options.excludePatterns && { excludePatterns: options.excludePatterns }),
    }
  }

  private async makeRequest(endpoint: string, body: any): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.serverUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal: controller.signal as any,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Request failed (${response.status}): ${errorText || response.statusText}`)
      }

      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async processResponse(response: Response): Promise<StreamingResponse> {
    try {
      const isStreaming = response.headers.get('content-type')?.includes('text/event-stream')
      let content = ''

      if (isStreaming) {
        content = await this.handleStreamingResponse(response)
      } else {
        const json = await response.json()
        content = this.extractContent(json)
      }

      // Only return non-empty content
      if (!content.trim()) {
        return { type: 'content', data: 'No response content received' }
      }

      return { type: 'content', data: content }
    } catch (e) {
      console.error('Error processing response:', e)
      return { type: 'error', error: 'Error processing response' }
    }
  }

  async chat(message: string): Promise<StreamingResponse> {
    const config = workspace.getConfiguration('llamautoma')
    const threadId = this.getCurrentThreadId()

    // Add user message to history
    this.addToHistory(threadId, { role: 'user', content: message })

    const messages = this.getMessageHistory(threadId)

    const body = this.createRequestBody(messages, {
      threadId,
      modelName: config.get<string>('model', 'qwen2.5-coder:7b'),
      maxFileSize: config.get<number>('maxFileSize', 8192),
    })

    const response = await this.makeRequest('/v1/chat', body)
    const result = await this.processResponse(response)

    // Add assistant response to history if it exists and is not an error message
    if (
      result.type === 'content' &&
      result.data &&
      !result.data.includes('No response content received') &&
      !result.data.includes('Error processing response')
    ) {
      this.addToHistory(threadId, {
        role: 'assistant',
        content: result.data,
      })
    }

    return result
  }

  async sync(): Promise<SyncResponse> {
    const config = workspace.getConfiguration('llamautoma')
    const messages = [
      { role: 'system', content: 'You are a workspace synchronization assistant.' },
      { role: 'user', content: 'sync' },
    ]

    const body = this.createRequestBody(messages, {
      modelName: config.get<string>('model', 'qwen2.5-coder:7b'),
      maxFileSize: config.get<number>('maxFileSize', 8192),
      root: workspace.root,
      excludePatterns: config.get('excludePatterns', []),
    })

    const response = await this.makeRequest('/v1/sync', body)
    const result = await this.processResponse(response)

    if (result.type === 'error') {
      return { status: 'error', error: result.error }
    }

    return { status: 'success' }
  }

  public async start(): Promise<void> {
    try {
      this.log('Starting Llamautoma client...')
      this.log(`Server URL: ${this.serverUrl}`)
      // Additional startup logic here
    } catch (error) {
      this.log(`Failed to start client: ${error}`)
      throw error
    }
  }

  public async stop(): Promise<void> {
    this.log('Stopping Llamautoma client...')
    this.removeAllListeners()
    this.outputChannel.dispose()
  }
}
