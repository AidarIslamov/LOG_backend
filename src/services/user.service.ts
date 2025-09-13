import { UserCreateData, UserLoginData } from "@/lib/types";
import { User } from "@models/User";
import { compareSync, hashSync } from "bcrypt-ts";
import transliterate from '@sindresorhus/transliterate';
import dotenv from 'dotenv';
dotenv.config()


export class UserService {
    static createUserThen(data: UserCreateData, cb: (user: User | null, result: boolean) => void) {

        const salt = this.getSalt();
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
        }).catch(error => {
            cb(null, false);
        });
        
    }

    static authUserThen(data: UserLoginData, cb: (user: User | null, result: boolean) => void) {
        User.scope('withPassword').findOne({
            where: { name: data.name }
        }).then((user) => {
            if (!user) {
                return cb(null, false);
            }
            const { password, ...userWithoutPassword } = user.toJSON();
            const isValid = compareSync(data.password, password);

            if (isValid) {
                cb(userWithoutPassword, true);
            } else {
                cb(null, false);
            }
        }).catch(error => {
            cb(null, false);
        });
    }

    private static getSalt() {
        return parseInt(process.env.BCRYPT_SALT_RROUNDS!)
    }
}