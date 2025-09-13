"use strict"

import { Round } from '@models/Round';
import { RoundPlayer } from '@models/RoundPlayer';
import { User } from '@models/User';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';

dotenv.config()

export const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    logging: false,
    pool: {
        max: 20,
        min: 3,
        acquire: 3000,
        idle: 5000,
    },
    define: {
        timestamps: true,
        underscored: false,
    },

    models: [User, Round, RoundPlayer]
})


export const initializeDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');

        await sequelize.sync({
            force: false,
            alter: process.env.NODE_ENV === 'development'
        });

        console.log('Database synchronized');


    } catch (error) {
        console.error('Database connection failed', error);
        throw error;
    }
}
