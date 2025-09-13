import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTService } from '@/lib/jwt';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.cookies?.token;

    if (!token) {
      return reply.code(401).send({ 
        error: 'Authentication required',
        message: 'No authentication token found' 
      });
    }

    const decoded = JWTService.verify(token);
    if (!decoded) {
      reply.clearCookie('token');
      return reply.code(401).send({ 
        error: 'Invalid token',
        message: 'Authentication token is invalid or expired' 
      });
    }

    request.user = decoded;

  } catch (error) {
    return reply.code(500).send({ 
      error: 'Authentication error',
      message: 'Internal authentication error' 
    });
  }
};
