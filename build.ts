Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './lib',
  target: 'node',
  minify: true,
  format: 'iife',
  packages: 'external',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  external: ['coc.nvim'],
})
