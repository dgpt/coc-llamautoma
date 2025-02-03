import { describe, expect, test, mock, beforeEach } from 'bun:test'
import { workspace } from '../mocks/coc.nvim'
import { LlamautomaClient } from '../../src/client'

describe('LlamautomaClient', () => {
  let client: LlamautomaClient
  let mockFetch: ReturnType<typeof mock>

  beforeEach(() => {
    client = new LlamautomaClient({
      serverUrl: 'http://localhost:3000',
      timeout: 30000,
    })

    // Mock global fetch
    mockFetch = mock((url: string, options?: RequestInit) =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: 'Mock response' }),
      })
    )
    global.fetch = mockFetch
  })

  test('should handle chat requests', async () => {
    const response = await client.chat('Hello')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/chat',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Hello' }),
      })
    )
    expect(response.text).toBe('Mock response')
  })

  test('should handle edit requests', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ edits: [] }),
      })
    )

    const response = await client.edit('Fix this')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/edit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Fix this' }),
      })
    )
    expect(response.edits).toEqual([])
  })

  test('should handle compose requests', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ files: [] }),
      })
    )

    const response = await client.compose('Create a file')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/compose',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Create a file' }),
      })
    )
    expect(response.files).toEqual([])
  })

  test('should handle sync requests', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success' }),
      })
    )

    const response = await client.sync()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/sync',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          root: '/test',
          excludePatterns: [],
        }),
      })
    )
    expect(response.status).toBe('success')
  })

  test('should handle request errors', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      })
    )

    await expect(client.chat('Hello')).rejects.toThrow('Request failed: Not Found')
  })
})
