'use strict'

import 'module-alias/register';
import AutoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import fastify, { type FastifyInstance, type FastifyPluginOptions } from 'fastify';
import path from 'node:path';
import { initializeDB } from './config/database';
import fastifyCookie from '@fastify/cookie';
import dotenv from 'dotenv';
dotenv.config()

const options = {}

async function app(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    hook: 'onRequest',
  })
};

const server = fastify({
  // logger: {
  //   level: 'info',
  //   transport: {
  //     target: 'pino-pretty',
  //     options: { colorize: true }
  //   }
  // }
});

server.register(app, options);
server.register(cors, {
  origin: true,
  credentials: true
})

const startServer = async () => {
  initializeDB();
  server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Server running on ${address}`);
  });
}

if (require.main === module) {
  startServer()
}

export { app, options, server };
