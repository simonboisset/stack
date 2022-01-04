const { spawn } = require('child_process');
const esbuild = require('esbuild');
const { createServer, request } = require('http');
require('dotenv').config();

const serverEnv = { 'process.env.NODE_ENV': `'dev'` };
const clientEnv = { 'process.env.NODE_ENV': `'dev'` };
const clients = [];

Object.keys(process.env).forEach((key) => {
  if (key.indexOf('SERVER_') === 0) {
    serverEnv[`process.env.${key}`] = `'${process.env[key]}'`;
  }
  if (key.indexOf('CLIENT_') === 0) {
    serverEnv[`process.env.${key}`] = `'${process.env[key]}'`;
    clientEnv[`process.env.${key}`] = `'${process.env[key]}'`;
  }
});

const openBrowser = () => {
  setTimeout(() => {
    const op = { darwin: ['open'], linux: ['xdg-open'], win32: ['cmd', '/c', 'start'] };
    const ptf = process.platform;
    if (clients.length === 0) spawn(op[ptf][0], [...[op[ptf].slice(1)], 'http://localhost:3000']);
  }, 1000);
};

esbuild
  .build({
    entryPoints: ['src/client/index.tsx'],
    bundle: true,
    minify: true,
    define: clientEnv,
    outfile: 'dist/public/index.js',
    watch: {
      onRebuild(error) {
        setTimeout(() => {
          clients.forEach((res) => res.write('data: update\n\n'));
        }, 1000);
        console.log(error || 'client rebuilt');
      },
    },
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    incremental: true,
    define: serverEnv,
    watch: {
      onRebuild: (error) => {
        console.log(error || 'server rebuilt');
      },
    },
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

esbuild.serve({ servedir: './' }, {}).then(() => {
  createServer((req, res) => {
    const { url, method, headers } = req;
    if (req.url === '/esbuild') {
      return clients.push(
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          Connection: 'keep-alive',
        })
      );
    }

    const path = url.split('/').pop().indexOf('.') ? url : `/index.html`;
    req.pipe(
      request({ hostname: '0.0.0.0', port: 8000, path, method, headers }, (prxRes) => {
        res.writeHead(prxRes.statusCode, prxRes.headers);
        prxRes.pipe(res, { end: true });
      }),
      { end: true }
    );
    return null;
  }).listen(5010);

  openBrowser();
});
