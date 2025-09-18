'use strict'

import { Round } from "@models/Round";
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify"
import { roundCreateJsonSchema } from "@lib/schemas/round.schema";
import { RoundService } from "@/services/round.service";
import { RoundCreateData } from "@/lib/types";
import { authenticate } from "@/middleware/auth";
import { User } from "@models/User";


const rootRoute: FastifyPluginAsync = async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {

    fastify.get('/round/:uid', {
        preHandler: authenticate,
        handler: async (request: FastifyRequest<{ Params: { uid: string } }>, reply: FastifyReply) => {
            try {
                if(!request.user) {
                    return reply.status(401).send({ 
                        success: false, 
                        message: 'User authentication required' 
                    })
                }
                const user = await User.findByPk(request.user.id);
                if (!user) {
                    return reply.status(404).send({ 
                        success: false, 
                        message: 'User not found' 
                    });
                }

                const result = await RoundService.getRound(request.params.uid, user);
                if (result.success && result.round) {
                    reply.send({ round: result.round, message: result.message });
                } else {
                    reply.status(404).send({ 
                        success: false, 
                        message: result.message 
                    });
                } 

            } catch (error) {
                reply.status(500).send({ 
                    success: false, 
                    message: 'Internal server error' 
                });
            }
        }
    })
    fastify.get('/round', {
        preHandler: authenticate,
        handler: async (request, reply) => {
            return Round.findAll({
                include: 'users',
                order: [['createdAt', 'DESC'], ['startAt', 'DESC']]
            })
        }
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
            const round = await RoundService.createRound(roundData, user)
            return round
        }
    })

    // Game actions
    fastify.post('/round/:uid/vote', {
        preHandler: authenticate,
        handler: async(request: FastifyRequest<{ Params: { uid: string } }>, reply: FastifyReply) => {
                if(!request.user) {
                    throw new Error('User authentication required');
                }
                const user = await User.findByPk(request.user.id);
                if (!user) {
                    throw new Error('Unknown user');
                }

                const result = await RoundService.voteAction(request.params.uid, user);     
                if (result.error) {
                    reply.send({ success: false, error: result.error });
                } else {
                    reply.send({ success: true, score: result.score, status: result.status });
                }           
        }
    })
        
}


export default rootRoute;