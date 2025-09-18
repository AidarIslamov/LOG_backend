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

    static async getRound(uid:string, user: User): Promise<{round?: Round, message: string, success: boolean}> {
         try {
            const round = await Round.scope('withTotals').findOne({
                where: {
                    id: uid
                },
            });

            if(round) {
                if(!round.isActive) {
                    return {success: false, round, message: 'Round is not active'}
                }

                await round.addUser(user);
                return {round, message: 'User added to round', success: true}
            }
            return {message: 'Round not found', success: false}
        } catch (error) {
            return { message: 'Internal server error', success: false };
        }
    }


    static async voteAction(uid: string, user: User) {
        if (user.role === 'nikita') {
            return { status: 'prevented' };
        }

        const round = await Round.scope(['active']).findByPk(uid);
        if (!round) {
            return {error: 'Round not exist or not active'};
        }

        const transaction = await sequelize.transaction();
        
        try {
            const roundPlayer = await RoundPlayer.findOne({
                where: {
                    user_id: user.id,
                    round_id: uid
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            let score = 0;

            if (roundPlayer) {
                const oldActionCount = roundPlayer.action_count;
                const increment = (oldActionCount + 1) % 11 === 0 ? 10 : 1;
                
                score = roundPlayer.score + increment;
                
                await roundPlayer.update({
                    score,
                    action_count: oldActionCount + 1
                }, { transaction });
            }
            await transaction.commit();
            return { 
                status: 'setted', 
                score 
            };

        } catch (error) {
            await transaction.rollback();
            return { status: 'error', score: 0 };
        }
    }
}