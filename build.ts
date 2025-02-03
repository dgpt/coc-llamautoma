await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './lib',
  target: 'node',
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  external: ['coc.nvim'],
})
