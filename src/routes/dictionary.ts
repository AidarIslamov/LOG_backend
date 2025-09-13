'use strict'

import dotenv from 'dotenv';
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";

dotenv.config()

const rootRoute: FastifyPluginAsync = async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.get('/dictionary', async function (request, reply) {
    return {
      constants: {
        ROUND_DURATION: process.env.ROUND_DURATION ? parseInt(process.env.ROUND_DURATION) : 60,
        COOLDOWN_DURATION: process.env.COOLDOWN_DURATION ? parseInt(process.env.COOLDOWN_DURATION) : 30,
        DEFAULT_TIME_OFFSET: process.env.DEFAULT_TIME_OFFSET ? parseInt(process.env.DEFAULT_TIME_OFFSET) : 120
      }
    }
  })
}


export default rootRoute;