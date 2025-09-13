import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface JWTPayload {
    id: number;
    name: string;
    role: string;
    iat?: number;
    exp?: number;
}

export class JWTService {
    static sign(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload,
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN,
            } as jwt.SignOptions
        );
    }

    static verify(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch {
            return null;
        }
    }

    static decode(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload;
        } catch {
            return null;
        }
    }
}