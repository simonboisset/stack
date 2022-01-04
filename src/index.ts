import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import path from 'path';

const app = fastify();
// Api routes
app.get('/api', async (_, res) => {
  res.send({ hello: 'word' });
});

// React app server
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
});
app.setNotFoundHandler((_, res) => {
  res.sendFile('index.html');
});

const start = async () => {
  try {
    await app.listen(3000);
    app.log.info('Server listing');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
