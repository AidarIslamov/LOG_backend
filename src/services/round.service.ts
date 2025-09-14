import { RoundCreateData } from "@/lib/types";
import { User } from "@models/User";
import { Round } from "@models/Round";
import { RoundPlayer } from "@/models/RoundPlayer";
import { sequelize } from "@/config/database";

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


    /**
     * Variant withot ttransactions and blocks.
     * Single query. 
     * Data always actual, because before SET - use old data, then update data (i mean action_count)
     * 
     * Disadvantages of this approach:
     *  - Database-specific solution - tailored for a particular database (syntax), in this case PostgreSQL
     *  - ORM not used - not always convenient
     *  - Error handling is complex
     * 
     * Advantages:
     *  - Performance
     * 
     * 
     * If need pissimistic lock, using ORM, uncommit lines on 101...
     * 
     */
    static voteAction(uid:string, user: User, cb: ({error, status, score } : {error?: string, status?: string, score?: number}) => void) {
        Round.scope(['active'])
            .findByPk(uid)
            .then((round: Round | null) => {
                if(round) {
                    if(user.role === 'nikita') { // I hope Nikita doesn't find out about this.
                        cb({status: 'prevented'})
                    } else {
                        const tableName = `"${RoundPlayer.tableName}"`;
                       
                        sequelize.query(
                                `UPDATE ${tableName} 
                                SET 
                                    score = score + (
                                    CASE 
                                        WHEN (action_count + 1) % 11 = 0 THEN 10 
                                        ELSE 1 
                                    END
                                    ),
                                    action_count = action_count + 1
                                WHERE user_id = :userId AND round_id = :roundId
                                RETURNING score, action_count`,
                                {
                                    replacements: { userId: user.id, roundId: uid },
                                    type: 'UPDATE'
                                }
                            ).then(([result]) => {
                                const score = (result as any[])?.[0]?.score ?? 0;
                                cb({ status: 'setted', score });
                            }).catch(error => {
                                console.error('Update error:', error);
                                cb({ status: 'error', score: 0 });
                            });
                    }
                } else {
                        cb({error: 'Round not exist or not active'});
                    } 
            }).catch(error => {
                // console.error(error);
            });
    }

    // static async voteAction(uid: string, user: User, cb: ({error, status, score} : {error?: string, status?: string, score?: number}) => void) {
    //     if (user.role === 'nikita') {
    //         return cb({ status: 'prevented' });
    //     }

    //     const round = await Round.scope(['active']).findByPk(uid);
    //     if (!round) {
    //         return cb({ error: 'Round not exist or not active' });
    //     }

    //     const transaction = await sequelize.transaction();
        
    //     try {
    //         const roundPlayer = await RoundPlayer.findOne({
    //             where: {
    //                 user_id: user.id,
    //                 round_id: uid
    //             },
    //             transaction,
    //             lock: transaction.LOCK.UPDATE
    //         });

    //         let score = 0;

    //         if (roundPlayer) {
    //             const oldActionCount = roundPlayer.action_count;
    //             const increment = (oldActionCount + 1) % 11 === 0 ? 10 : 1;
                
    //             score = roundPlayer.score + increment;
                
    //             await roundPlayer.update({
    //                 score,
    //                 action_count: oldActionCount + 1
    //             }, { transaction });
    //         }
    //         await transaction.commit();
    //         return cb({ 
    //             status: 'setted', 
    //             score 
    //         });

    //     } catch (error) {
    //         await transaction.rollback();
    //         cb({ status: 'error', score: 0 });
    //     }
    // }
}