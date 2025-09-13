"use strict"

import { AllowNull, BelongsToMany, Column, DataType, Index, Model, Table, Unique } from "sequelize-typescript";
import { Round } from "./Round";
import { RoundPlayer } from "./RoundPlayer";

@Table({
    defaultScope: {
        attributes: { exclude: ['password'] },
    }
})
export class User extends Model {
    @Unique
    @Index
    @AllowNull(false)
    @Column(DataType.STRING(50))
    name!: string;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    role!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string

    @Column({
        type: DataType.BOOLEAN
    })
    agreement!: boolean

    @BelongsToMany(() => Round, () => RoundPlayer)
    rounds!: Round[]



    //     public async checkPassword(plainPassword: string) {
    //         return await compare(plainPassword, this.password)
    //     }
}

