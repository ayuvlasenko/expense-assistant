import * as dotenv from "dotenv";

dotenv.config();

import Joi from "joi";
import { Client } from "pg";

interface EnvironmentSchema {
    TYPEORM_HOST: string;
    TYPEORM_PORT: number;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_DATABASE: string;
}

// TypeOrm does not support creating the database if it does not exist, so we
// have to do it ourselves
async function main(): Promise<void> {
    console.log("Starting database initialization");

    const {
        TYPEORM_HOST,
        TYPEORM_PORT,
        TYPEORM_DATABASE,
        TYPEORM_USERNAME,
        TYPEORM_PASSWORD,
    } = getEnvironmentVariables();

    console.log(
        `Connecting to postgres server at ${TYPEORM_HOST}:${TYPEORM_PORT}`,
    );

    const client = new Client({
        host: TYPEORM_HOST,
        port: TYPEORM_PORT,
        user: TYPEORM_USERNAME,
        password: TYPEORM_PASSWORD,
    });

    await client.connect();

    console.log(
        `Successfully connected to postgres server at ${TYPEORM_HOST}:${TYPEORM_PORT}`,
    );

    const { rows } = await client.query(
        `
        select
            1
        from pg_database
        where
            datname = $1
    `,
        [TYPEORM_DATABASE],
    );

    if (rows.length > 0) {
        console.log(
            `Database ${TYPEORM_DATABASE} already exists, skipping creation`,
        );
    } else {
        console.log(`Database ${TYPEORM_DATABASE} does not exist, creating it`);

        await client.query(`create database "${TYPEORM_DATABASE}"`);

        console.log(`Database ${TYPEORM_DATABASE} created successfully`);
    }

    process.exit();
}

function getEnvironmentVariables(): EnvironmentSchema {
    const value = {
        TYPEORM_HOST: process.env.TYPEORM_HOST,
        TYPEORM_PORT: process.env.TYPEORM_PORT,
        TYPEORM_USERNAME: process.env.TYPEORM_USERNAME,
        TYPEORM_PASSWORD: process.env.TYPEORM_PASSWORD,
        TYPEORM_DATABASE: process.env.TYPEORM_DATABASE,
    };

    const schema = Joi.object<EnvironmentSchema, true>({
        TYPEORM_HOST: Joi.string().required(),
        TYPEORM_PORT: Joi.number().port().required(),
        TYPEORM_USERNAME: Joi.string().required(),
        TYPEORM_PASSWORD: Joi.string().required(),
        TYPEORM_DATABASE: Joi.string()
            .regex(/^[0-9a-zA-Z_]+$/)
            .required(),
    }).unknown(true);

    return Joi.attempt(value, schema);
}

void main();
