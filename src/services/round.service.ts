import { RoundCreateData } from "@/lib/types";
import { User } from "@models/User";
import { Round } from "@models/Round";
import { RoundPlayer } from "@/models/RoundPlayer";
import { Sequelize } from "sequelize-typescript";

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
        Round.scope('withTotals').findOne({
            where: {
                id: uid
            },
        })
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

    static voteAction(uid:string, user: User, cb: ({error, status, score } : {error?: string, status?: string, score?: number}) => void) {
        Round.scope(['active'])
            .findByPk(uid)
            .then((round: Round | null) => {
                if(round) {
                    if(user.role === 'nikita') { // I hope Nikita doesn't find out about this.
                        cb({status: 'prevented'})
                    } else {
                        RoundPlayer.update(
                            { 
                                score: Sequelize.literal('"score" + 1') 
                            },
                            {
                                where: { 
                                    user_id: user.id, 
                                    round_id: uid 
                                }
                            }
                        ).then(([affectedCount]) => {
                            if(affectedCount !== 0) {
                                    RoundPlayer.findOne({
                                        where: { user_id: user.id, round_id: uid },
                                        attributes: ['score']
                                    }).then((roundPlayer: RoundPlayer | null) => {
                                        cb({status: 'setted', score: roundPlayer?.score ?? 0})
                                    })
                            }
                        });
                    }
                } else {
                        cb({error: 'Round not found'});
                    } 
            }).catch(error => {
                // console.error(error);
            });
    }
}