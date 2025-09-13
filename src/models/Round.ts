import dotenv from 'dotenv';
import { AllowNull, BeforeValidate, BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { RoundPlayer } from "./RoundPlayer";
import { User } from './User';

dotenv.config()


@Table
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

    @BeforeValidate
    static setEndAt(round: Round) {
    if (round.startAt && round.duration && !round.endAt) {
        round.endAt = new Date(round.startAt.getTime() + round.duration * 1000);
    }
}
}