import { beforeEach, mock, beforeAll, afterAll } from 'bun:test'
import { window, workspace, commands } from './mocks/coc.nvim'
import server from 'llamautoma'

mock.module('coc.nvim', () => ({
  window,
  workspace,
  commands,
}))

const TEST_PORT = 3001
export const TEST_SERVER_URL = `http://localhost:${TEST_PORT}`

let serverInstance: ReturnType<typeof Bun.serve> | null = null

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  // Start a single server instance for all tests
  const testServer = { ...server, port: TEST_PORT }
  serverInstance = Bun.serve(testServer)
  console.log('Started test Llamautoma server')
})

afterAll(() => {
  process.env.NODE_ENV = 'development'
  // Stop the server after all tests
  if (serverInstance) {
    serverInstance.stop()
    console.log('Stopped test Llamautoma server')
    serverInstance = null
  }
})
