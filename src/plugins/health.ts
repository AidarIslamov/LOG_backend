"use strict"

import {type FastifyInstance, type FastifyPluginAsync, type FastifyPluginOptions } from "fastify";

const healthPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.get('/health', async (request, reply) => {
        return {status: 'OK', timestamp: new Date().toISOString()}
    });
};

export default healthPlugin;