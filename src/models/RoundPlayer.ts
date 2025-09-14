import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from "sequelize-typescript";
import { Round } from "./Round";
import { User } from "./User";

@Table
export class RoundPlayer extends Model {

    @AllowNull(false)
    @ForeignKey(() => Round)
    @Column(DataType.UUID)
    round_id!: string;

    @BelongsTo(() => Round)
    round!: Round

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column
    user_id!: number;

    @AllowNull(false)
    @Default(0)
    @Column
    score!: number

    @AllowNull(false)
    @Default(0)
    @Column
    action_count!: number
    
    @BelongsTo(() => User)
    user!: User
}