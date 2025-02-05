Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './lib',
  target: 'node',
  minify: false,
  format: 'cjs',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  external: ['coc.nvim'],
})
