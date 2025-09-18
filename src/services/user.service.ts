import { UserCreateData, UserLoginData } from "@/lib/types";
import { User } from "@models/User";
import { compareSync, hashSync } from "bcrypt-ts";
import transliterate from '@sindresorhus/transliterate';
import dotenv from 'dotenv';
dotenv.config()


export class UserService {
    static async createUser(data: UserCreateData): Promise<{user: User |null, success: boolean, created?:boolean}> {
        try {
            const salt = this.getSalt();
            const hashedPassword = hashSync(data.password, salt);
            const role = transliterate(data.name.toLowerCase());

            const [user, created ] = await User.findOrCreate({
                where: { name: data.name },
                defaults: {
                    name: data.name,
                    password: hashedPassword,
                    agreement: data.agreement,
                    role: role
                },
            });

            const { password, ...userWithoutPassword } = user.toJSON();
            return { user: userWithoutPassword as User, success: true, created  };

        } catch (error) {
            return { user: null, success: false };
        }
    }

    static async authUser(data: UserLoginData) {
       try {
        const user = await User.scope('withPassword').findOne({
            where: { name: data.name }
        });

        if (!user) {
            return { user: null, success: false };
        }

        const isValid = compareSync(data.password, user.password);
        if (!isValid) {
            return { user: null, success: false };
        }

        const { password, ...userWithoutPassword } = user.toJSON();
        return { user: userWithoutPassword as User, success: true };

    } catch (error) {
        console.error('Auth user error:', error);
        return { user: null, success: false };
    }
    }

    private static getSalt() {
        return parseInt(process.env.BCRYPT_SALT_RROUNDS!)
    }
}