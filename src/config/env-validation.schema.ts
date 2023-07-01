import Joi from "joi";

export interface EnvValidationSchema {
    API_PORT: number;
    TYPEORM_CONNECTION: string;
    TYPEORM_HOST: string;
    TYPEORM_PORT: number;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_DATABASE: string;
    TYPEORM_LOGGING: string;
    TYPEORM_ENTITIES: string;
    TYPEORM_MIGRATIONS: string;
    TYPEORM_CACHE: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_WEBHOOK_DOMAIN: string;
    TELEGRAM_WEBHOOK_PORT: number;
    TELEGRAM_WEBHOOK_SECRET: string;
}

export const envValidationSchema = Joi.object<EnvValidationSchema, true>({
    API_PORT: Joi.number().port().required(),
    TYPEORM_CONNECTION: Joi.string().required(),
    TYPEORM_HOST: Joi.string().required(),
    TYPEORM_PORT: Joi.number().port().required(),
    TYPEORM_USERNAME: Joi.string().required(),
    TYPEORM_PASSWORD: Joi.string().required(),
    TYPEORM_DATABASE: Joi.string().required(),
    TYPEORM_LOGGING: Joi.string().required(),
    TYPEORM_ENTITIES: Joi.string().required(),
    TYPEORM_MIGRATIONS: Joi.string().required(),
    TYPEORM_CACHE: Joi.string().required(),
    TELEGRAM_BOT_TOKEN: Joi.string().required(),
    TELEGRAM_WEBHOOK_DOMAIN: Joi.string().required(),
    TELEGRAM_WEBHOOK_PORT: Joi.number().port().required(),
    TELEGRAM_WEBHOOK_SECRET: Joi.string().required(),
}).unknown(true);
