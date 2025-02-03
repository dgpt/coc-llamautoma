import { build } from 'bun'

await build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'node',
  minify: true,
  sourcemap: 'external',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
