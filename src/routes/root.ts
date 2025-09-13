'use strict'

import { Round } from "@models/Round"
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify"

const rootRoute: FastifyPluginAsync = async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.get('/', async function (request, reply) {
    return Round.findAll()
  })
}


export default rootRoute;