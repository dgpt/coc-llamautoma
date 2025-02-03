import { build } from 'bun'
import { watch } from 'chokidar'
import { join } from 'path'

async function buildProject() {
  try {
    await build({
      entrypoints: ['./src/index.ts'],
      outdir: './dist',
      target: 'node',
      format: 'cjs',
      external: ['coc.nvim', 'vscode-uri', 'glob'],
      minify: false,
    })
    console.log('Build completed successfully')
  } catch (error) {
    console.error('Build failed:', error)
  }
}

// Initial build
await buildProject()

// Watch for changes
const watcher = watch('./src/**/*.ts', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
})

watcher
  .on('ready', () => console.log('Initial scan complete. Ready for changes...'))
  .on('change', async path => {
    console.log(`File changed: ${path}`)
    await buildProject()
  })
  .on('error', error => console.error('Watch error:', error))
