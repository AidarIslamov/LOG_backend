import { z } from "zod";
import { userCreateSchema } from "./schemas/user.schema";
import { roundCreateSchema } from "./schemas/round.schema";
import { JWTPayload } from '@/lib/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }

  interface FastifyReply {
    clearCookie(name: string, options?: CookieOptions): this;
  }
}

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

export type UserCreateData = z.infer<typeof userCreateSchema>;
export type RoundCreateData = z.infer<typeof roundCreateSchema> & {endAt: string;}