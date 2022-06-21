const esbuild = require('esbuild');
require('dotenv').config();

const serverEnv = { 'process.env.NODE_ENV': `'production'` };
const clientEnv = { 'process.env.NODE_ENV': `'production'` };
for (const key in process.env) {
  if (key.indexOf('SERVER_') === 0) {
    serverEnv[`process.env.${key}`] = `'${process.env[key]}'`;
  }
  if (key.indexOf('CLIENT_') === 0) {
    serverEnv[`process.env.${key}`] = `'${process.env[key]}'`;
    clientEnv[`process.env.${key}`] = `'${process.env[key]}'`;
  }
}
esbuild
  .build({
    entryPoints: ['src/client/index.tsx'],
    bundle: true,
    minify: true,
    define: clientEnv,
    outfile: 'dist/public/index.js',
  })
  .catch(() => process.exit(1))
  .then(() => {
    esbuild
      .build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        outfile: 'dist/index.js',
        platform: 'node',
        define: serverEnv,
      })
      .catch(() => process.exit(1));
  });
