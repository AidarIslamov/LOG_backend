import { JWTService } from "@/lib/jwt";
import { userCreateJsonSchema, userLoginJsonSchema } from "@/lib/schemas/user.schema";
import { UserCreateData } from "@/lib/types";
import { authenticate } from "@/middleware/auth";
import { User } from "@models/User";
import { UserService } from "@/services/user.service";
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify"

const rootRoute: FastifyPluginAsync = async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
    fastify.get('/me', {
        preHandler: authenticate,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            if (!request.user) {
                reply.clearCookie('token');
                return reply.code(401).send({
                    statusCode: 401,
                    error: 'User not found',
                    message: "Incorrect name or password, please try again"
                });
            }
            reply.send(request.user)
        }
    }),
        fastify.post('/signup', {
            schema: {
                body: userCreateJsonSchema
            },
            preHandler: async (request: FastifyRequest<{ Body: UserCreateData }>, reply: FastifyReply) => {
                const { agreement } = request.body;

                if (!agreement) {
                    return reply.code(400).send({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: '/body/agreement You must accept the terms and conditions'
                    });
                }
            },
            handler: async (request: FastifyRequest<{ Body: UserCreateData }>, reply: FastifyReply) => {
                    try {
                        const result = await UserService.createUser(request.body);
                        
                        if (!result.user) {
                            return reply.code(500).send({
                                statusCode: 500,
                                error: 'Internal Server Error', 
                                message: 'Failed to create user'
                            });
                        }

                        // if (!result.created) {
                        //     return reply.code(409).send({
                        //         statusCode: 409,
                        //         error: 'Conflict',
                        //         message: 'User already exists'
                        //     });
                        // }

                        const token = JWTService.sign({
                            id: result.user.id,
                            name: result.user.name,
                            role: result.user.role,
                        });

                        reply.setCookie('token', token, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'strict',
                            maxAge: 7 * 24 * 60 * 60 * 1000,
                            path: '/',
                        });

                        reply.code(201).send({
                            message: 'User created successfully',
                            user: result.user
                        });

                    } catch (error) {
                        console.error('Signup error:', error);
                        reply.code(500).send({
                            statusCode: 500,
                            error: 'Internal Server Error',
                            message: 'Internal server error'
                        });
                    }
            }
        }),
        fastify.post('/login', {
            schema: {
                body: userLoginJsonSchema
            },
            handler: async (request: FastifyRequest<{ Body: UserCreateData }>, reply: FastifyReply) => {
                try {
                    const result = await UserService.authUser(request.body);
                    
                    if (!result.success || !result.user) {
                        return reply.code(401).send({
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: "Incorrect name or password, please try again"
                        });
                    }

                    const token = JWTService.sign({
                        id: result.user.id,
                        name: result.user.name,
                        role: result.user.role,
                    });

                    reply.setCookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        path: '/',
                    });

                    reply.code(200).send({
                        message: 'Login successful',
                        user: result.user
                    });

                } catch (error) {
                    console.error('Login error:', error);
                    reply.code(500).send({
                        statusCode: 500,
                        error: 'Internal Server Error',
                        message: 'Internal server error'
                    });
                }
            }
        }),
        fastify.get('/logout', {
            preHandler: authenticate,
            handler: async (request: FastifyRequest, reply: FastifyReply) => {
                reply.clearCookie('token');
                reply.code(200)
            }
        })
}

export default rootRoute;