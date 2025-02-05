import { workspace } from 'coc.nvim'
import { createReadStream } from 'fs'
import { join, resolve } from 'path'
import type { FileRequest, FileChunk, FileComplete } from 'llamautoma-types'

// 1MB chunk size for streaming
const CHUNK_SIZE = 1024 * 1024

export async function* streamFile(path: string): AsyncGenerator<FileChunk> {
  try {
    // Try to get document from workspace first
    const doc = workspace.getDocument(path)
    if (doc) {
      // For small files, send in one chunk
      if (doc.content.length <= CHUNK_SIZE) {
        yield {
          type: 'file_chunk',
          data: {
            path,
            chunk: doc.content,
            done: true,
          },
        }
        return
      }

      // For larger files, stream in chunks
      let offset = 0
      while (offset < doc.content.length) {
        const chunk = doc.content.slice(offset, offset + CHUNK_SIZE)
        offset += CHUNK_SIZE
        yield {
          type: 'file_chunk',
          data: {
            path,
            chunk,
            done: offset >= doc.content.length,
          },
        }
      }
      return
    }

    // Fallback to streaming from filesystem
    const stream = createReadStream(path, { highWaterMark: CHUNK_SIZE })
    for await (const chunk of stream) {
      yield {
        type: 'file_chunk',
        data: {
          path,
          chunk: chunk.toString('utf-8'),
          done: false,
        },
      }
    }
    yield {
      type: 'file_chunk',
      data: {
        path,
        chunk: '',
        done: true,
      },
    }
  } catch (error) {
    yield {
      type: 'file_chunk',
      data: {
        path,
        chunk: '',
        done: true,
        error: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

export async function handleFileRequest(
  request: FileRequest,
  onChunk?: (chunk: FileChunk | FileComplete) => void
): Promise<void> {
  try {
    // Handle single file request
    if (request.requestType === 'file') {
      for await (const chunk of streamFile(request.paths[0])) {
        onChunk?.(chunk)
      }
      return
    }

    // Handle multiple files request
    if (request.requestType === 'files') {
      for (const path of request.paths) {
        for await (const chunk of streamFile(path)) {
          onChunk?.(chunk)
        }
      }
      return
    }

    // Handle directory request
    if (request.requestType === 'directory') {
      const files = await workspace.findFiles(
        request.includePattern || '**/*',
        request.excludePattern || 'node_modules/**'
      )
      for (const file of files) {
        for await (const chunk of streamFile(file.fsPath)) {
          onChunk?.(chunk)
        }
      }
      return
    }

    // Handle multiple directories request
    if (request.requestType === 'directories') {
      for (const path of request.paths) {
        const files = await workspace.findFiles(
          join(path, request.includePattern || '**/*'),
          request.excludePattern || 'node_modules/**'
        )
        for (const file of files) {
          for await (const chunk of streamFile(file.fsPath)) {
            onChunk?.(chunk)
          }
        }
      }
      return
    }
  } catch (error) {
    onChunk?.({
      type: 'file_chunk',
      data: {
        path: '',
        chunk: '',
        done: true,
        error: error instanceof Error ? error.message : String(error),
      },
    })
  } finally {
    onChunk?.({
      type: 'file_complete',
    })
  }
}
