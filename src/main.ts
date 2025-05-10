import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fastifyStatic from '@fastify/static';

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/public/',
});

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}

