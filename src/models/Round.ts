import dotenv from 'dotenv';
import { AllowNull, BeforeValidate, BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table, Sequelize } from "sequelize-typescript";
import { Op } from 'sequelize';
import { RoundPlayer } from "./RoundPlayer";
import { User } from './User';


dotenv.config()


@Table({
    scopes: {
        withTotals: {
            include: [{
                association: 'roundPlayers',
                include: ['user']
            }]
        },
        active: {
            where: {
                [Op.and]: [
                    { startAt: {[Op.lt]: Sequelize.fn('NOW')}},
                    { endAt: { [Op.gt]: Sequelize.fn('NOW') } },
                    Sequelize.where(
                        Sequelize.literal(`"startAt" + INTERVAL '1 second' * "cooldown"`),
                        Op.lt,
                        Sequelize.fn('NOW')
                    )
                ]
            }
        }
    }
})
export class Round extends Model {

    @PrimaryKey
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    id!: string

    @AllowNull(false)
    @Column({ type: DataType.SMALLINT, defaultValue: parseInt(process.env.ROUND_DURATION!) })
    duration!: number;

    @AllowNull(false)
    @Column({ type: DataType.SMALLINT, defaultValue: parseInt(process.env.COOLDOWN_DURATION!) })
    cooldown!: number;

    @AllowNull(false)
    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW
    })
    startAt!: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
    endAt!: Date


    @HasMany(() => RoundPlayer)
    roundPlayers!: RoundPlayer[];

    
    @BelongsToMany(() => User, () => RoundPlayer)
    users!: User[]

    declare addUser: (user: User | string, options?: any) => Promise<void>;
    declare addUsers: (users: (User | string)[], options?: any) => Promise<void>;
    declare hasUser: (user: User | string) => Promise<boolean>;
    declare countUsers: (options?: any) => Promise<number>;

    @Column(DataType.VIRTUAL)
    get isActive(): boolean {
        const now = new Date();
        return now > this.startAt && now < this.endAt;
    }

    @Column(DataType.VIRTUAL)
    get isInCoolDown(): boolean {
       if (!this.isActive) return false;
        
        const now = new Date();
        const cooldownEnd = new Date(this.startAt.getTime() + this.cooldown * 1000);
        
        return now >= this.startAt && now <= cooldownEnd;
    }

    @Column(DataType.VIRTUAL)
    get isFinished() {
        if (this.isActive) return false;
        return new Date() > new Date(this.endAt)
    }

    @Column(DataType.VIRTUAL)
    get totals() {
        if (!this.roundPlayers || !Array.isArray(this.roundPlayers)) {
            return null;
        }

        const now = new Date();
        if(now < new Date(this.endAt)) {
            return { totalScore: 0, winner: null };
        }
        
        const totalScore = this.roundPlayers.reduce((total, rp) => total + (rp.score || 0), 0);
        
        let winner = null;
        if (this.roundPlayers.length > 0) {
            const winnerPlayer = this.roundPlayers.reduce((prev, current) => 
                (prev.score > current.score) ? prev : current
            );
            winner = {
                user: {
                    name: winnerPlayer.user?.name || 'Unknown',
                    score: winnerPlayer.score || 0
                }
            };
        }
        
        return { totalScore, winner };
    }

    @BeforeValidate
    static setEndAt(round: Round) {
    if (round.startAt && round.duration && !round.endAt) {
        round.endAt = new Date(round.startAt.getTime() + round.duration * 1000);
    }
}
}