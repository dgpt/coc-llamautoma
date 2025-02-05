import { describe, expect, test, beforeEach } from 'bun:test'
import { workspace } from '../mocks/coc.nvim'
import { LlamautomaClient } from '../../src/client'
import { TEST_SERVER_URL } from '../setup'

describe('LlamautomaClient', () => {
  let client: LlamautomaClient

  beforeEach(() => {
    client = new LlamautomaClient({
      serverUrl: TEST_SERVER_URL,
      timeout: 30000,
      headers: undefined,
    })
  })

  test('should handle chat requests', async () => {
    const response = await client.chat('Hello')
    expect(response).toBeDefined()
    expect(typeof response.content).toBe('string')
  })

  test('should handle edit requests', async () => {
    const response = await client.edit('Fix this')
    expect(response).toBeDefined()
    expect(Array.isArray(response.edits)).toBe(true)
  })

  test('should handle compose requests', async () => {
    const response = await client.compose('Create a file')
    expect(response).toBeDefined()
    expect(Array.isArray(response.files)).toBe(true)
  })

  test('should handle sync requests', async () => {
    const response = await client.sync()
    expect(response).toBeDefined()
    expect(response.status).toBe('success')
  })

  test('should handle custom headers', async () => {
    const clientWithHeaders = new LlamautomaClient({
      serverUrl: TEST_SERVER_URL,
      timeout: 30000,
      headers: { 'X-Custom-Header': 'test' },
    })

    const response = await clientWithHeaders.chat('Hello')
    expect(response).toBeDefined()
    expect(typeof response.content).toBe('string')
  })
})
