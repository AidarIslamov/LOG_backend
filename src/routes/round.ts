'use strict'

import { Round } from "@models/Round";
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify"
import { roundCreateJsonSchema } from "@lib/schemas/round.schema";
import { RoundService } from "@/services/round.service";
import { RoundCreateData } from "@/lib/types";
import { authenticate } from "@/middleware/auth";
import { User } from "@models/User";

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
            authenticate(request, reply)
            const { startAt, duration, cooldown } = request.body as any;
            const inputDate = new Date(startAt);

            if (inputDate <= new Date()) {
                throw new Error('Start date must be at least from now');
            }

            const endAt = new Date(inputDate.getTime() + (duration + cooldown) * 1000);

            (request as any).body.endAt = endAt;
        },
        handler: async (request: FastifyRequest<{Body: RoundCreateData}>, reply: FastifyReply) => {
            if(request.user?.role !== 'admin') {
                throw new Error('You not have enough permissions');
            }
            const user = await User.findByPk(request.user.id);
             if (!user) {
                throw new Error('Unknown user');
            }
            const roundData = request.body;
            const round = RoundService.createRound(roundData, user)
            return round
        }
    }),

    // Game actions
    fastify.post('/round/:uid/enter', {
        preHandler: authenticate,
        handler: async (request: FastifyRequest<{ Params: { uid: string } }>, reply: FastifyReply) => {
            if(!request.user) {
                throw new Error('User authentication required');
            }
            const user = await User.findByPk(request.user.id);
            if (!user) {
                throw new Error('Unknown user');
            }

            await new Promise<void>((resolve) => {
                const cb = (error?: string) => {
                    if(!error) {
                        reply
                            .code(200)
                            .send({
                                message: 'User added to round',
                            });
                    } else {
                        reply
                            .code(200)
                            .send({
                                message: error,
                            });
                    }
                    resolve();
                }
                RoundService.addUserToRound(request.params.uid, user, cb)
            })
        }
    })
        
}


export default rootRoute;