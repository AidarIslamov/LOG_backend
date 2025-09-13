'use strict'

import { Round } from "@models/Round";
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify"
import { roundCreateJsonSchema } from "@lib/schemas/round.schema";
import { RoundService } from "@/services/round.service";
import { RoundCreateData } from "@/lib/types";

const rootRoute: FastifyPluginAsync = async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {

    fastify.get('/round/:uid', async (request: FastifyRequest<{ Params: { uid: string } }>, reply: FastifyReply) => {
        return Round.findOne({
            include: 'users',
            where: { id: request.params.uid }
        }).catch(() => ({ error: 'Not Found' }))
    })
    fastify.get('/round', async (request, reply) => {
        return Round.findAll({
            include: 'users',
            order: [['createdAt', 'DESC'], ['startAt', 'DESC']]
        })
    })
    fastify.post('/round', {
        schema: {
            body: roundCreateJsonSchema // TODO: improve validation error messages
        },
        preHandler: async (request, reply) => {
            const { startAt, duration, cooldown } = request.body as any;
            const inputDate = new Date(startAt);

            if (inputDate <= new Date()) {
                throw new Error('Start date must be at least from now');
            }

            const endAt = new Date(inputDate.getTime() + (duration + cooldown) * 1000);

            (request as any).body.endAt = endAt;
        },
        handler: async (request: FastifyRequest<{Body: RoundCreateData}>, reply: FastifyReply) => {
            const roundData = request.body;

            // if (request.user) {
            //     roundData.createdBy = (request.user as any).id;
            // }

            const round = RoundService.createRound(roundData)
            return round
        }
    })
}


export default rootRoute;