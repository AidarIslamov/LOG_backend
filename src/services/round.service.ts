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

    static getRound(uid:string, user: User, cb: ({round, message}: {round?: Round, message?: string}) => void) {
        Round.findByPk(uid)
            .then((round: Round | null) => {
                if(round) {
                    if(round.isActive) {
                        round.addUser(user).then(() => cb({round, message: 'User added to round'}))
                    } else {
                        cb({round, message: 'Round is not active'});
                    }
                } else {
                    cb({message: 'Round not found'});
                }      
            });

        
    }
}