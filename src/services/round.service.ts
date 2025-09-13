import { RoundCreateData } from "@/lib/types";
import { User } from "@models/User";
import { Round } from "@models/Round";

export class RoundService {

    static async createRound(data: RoundCreateData, user: User): Promise<Round> {
        const round = await Round.create({
            duration: data.duration,
            cooldown: data.cooldown,
            startAt: new Date(data.startAt),
            endAt: new Date(data.endAt),
        })

        await round.addUser(user)

        return round;
    }

    static addUserToRound(uid:string, user: User, cb: (error?: string) => void) {
        Round.findByPk(uid)
        .then((round: Round | null) => {
            if(round) {
                if(user.role === 'admin' || round.isActive) {
                    round.addUser(user).then(() => cb())
                } else {
                    cb('Round is not active');
                }
            } else {
                cb('Round not found');
            }      
        });

        
    }
}