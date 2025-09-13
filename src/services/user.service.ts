import { UserCreateData } from "@/lib/types";
import { User } from "@/models/User";
import { hashSync } from "bcrypt-ts";
import transliterate from '@sindresorhus/transliterate';
import dotenv from 'dotenv';
dotenv.config()


export class UserService {
    static createUserThen(data: UserCreateData, cb: (user: User, result: boolean) => void) {

        const salt = this.getSalt()
        const hashedPassword = hashSync(data.password, salt);
        const role = transliterate(data.name.toLowerCase())
        
        User.findOrCreate({
            where: { name: data.name },
            defaults: {
                name: data.name,
                password: hashedPassword,
                agreement: data.agreement,
                role: role
            },
        }).then(([user, result]) => {
            const { password, ...userWithoutPassword } = user.toJSON();
            cb(userWithoutPassword, result);
        })
    }

    private static getSalt() {
        return parseInt(process.env.BCRYPT_SALT_RROUNDS!)
    }
}