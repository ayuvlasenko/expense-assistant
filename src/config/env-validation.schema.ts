import Joi from "joi";

export interface EnvValidationSchema {
    API_PORT: number;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_WEBHOOK_DOMAIN: string;
    TELEGRAM_WEBHOOK_PORT: number;
    TELEGRAM_WEBHOOK_SECRET_TOKEN: string;
    DATABASE_URL: string;
}

export const envValidationSchema = Joi.object<EnvValidationSchema, true>({
    API_PORT: Joi.number().port().required(),
    TELEGRAM_BOT_TOKEN: Joi.string().required(),
    TELEGRAM_WEBHOOK_DOMAIN: Joi.string().required(),
    TELEGRAM_WEBHOOK_PORT: Joi.number().port().required(),
    TELEGRAM_WEBHOOK_SECRET_TOKEN: Joi.string().required(),
    DATABASE_URL: Joi.string().uri().required(),
}).unknown(true);
