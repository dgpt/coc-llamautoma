import { spawn } from 'child_process'
import { workspace } from 'coc.nvim'
import { logger } from '../logger'
import type { CommandRequest, CommandChunk, CommandComplete, ErrorResponse } from 'llamautoma-types'

export async function handleCommandRequest(
  request: CommandRequest,
  onChunk?: (chunk: CommandChunk | CommandComplete | ErrorResponse) => void
): Promise<void> {
  try {
    const { command, cwd = workspace.root, env, timeout } = request

    // Create child process
    const child = spawn(command, {
      shell: true,
      cwd,
      env: { ...process.env, ...env },
    })

    // Set timeout if specified
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (timeout) {
      timeoutId = setTimeout(() => {
        child.kill()
        onChunk?.({
          type: 'error',
          error: `Command timed out after ${timeout}ms`,
        })
      }, timeout)
    }

    // Handle stdout
    child.stdout.on('data', (data: Buffer) => {
      onChunk?.({
        type: 'command_chunk',
        data: {
          content: data.toString(),
          done: false,
        },
      })
    })

    // Handle stderr
    child.stderr.on('data', (data: Buffer) => {
      onChunk?.({
        type: 'command_chunk',
        data: {
          content: data.toString(),
          done: false,
          error: 'stderr',
        },
      })
    })

    // Handle process exit
    child.on('exit', (code: number | null, signal: string | null) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      onChunk?.({
        type: 'command_complete',
        data: {
          exitCode: code ?? -1,
          signal: signal ?? undefined,
        },
      })
    })

    // Handle process error
    child.on('error', (error: Error) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      onChunk?.({
        type: 'error',
        error: error.message,
      })
    })
  } catch (error) {
    onChunk?.({
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
