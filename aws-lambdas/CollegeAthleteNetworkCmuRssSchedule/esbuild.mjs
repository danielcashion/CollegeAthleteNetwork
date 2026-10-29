import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/handler.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: 'dist/handler.cjs',
  sourcemap: true,
  minify: false,
  external: [],
});

console.log('Built dist/handler.cjs');
