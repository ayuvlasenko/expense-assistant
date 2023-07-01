import * as dotenv from "dotenv";

dotenv.config();

import Joi from "joi";
import { DataSource, DataSourceOptions, LoggerOptions } from "typeorm";
import { envValidationSchema } from "./src/config/env-validation.schema";

Joi.attempt(process.env, envValidationSchema);

const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    logging: [process.env.TYPEORM_LOGGING] as LoggerOptions,
    entities: [process.env.TYPEORM_ENTITIES] as string[],
    migrations: [process.env.TYPEORM_MIGRATIONS] as string[],
    cache: process.env.TYPEORM_CACHE === "TRUE",
};

export default new DataSource(dataSourceOptions);
