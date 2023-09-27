import Joi from "joi";

export interface EnvValidationSchema {
    API_PORT: number;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_WEBHOOK_DOMAIN: string;
    TELEGRAM_WEBHOOK_PORT: number;
    TELEGRAM_WEBHOOK_SECRET_TOKEN: string;
    TELEGRAM_USE_LONG_POLLING: boolean;
    DATABASE_URL: string;
    INVITE_TOKEN: string;
}

export const envValidationSchema = Joi.object<EnvValidationSchema, true>({
    API_PORT: Joi.number().port().required(),
    TELEGRAM_BOT_TOKEN: Joi.string().required(),
    TELEGRAM_WEBHOOK_DOMAIN: Joi.string().required(),
    TELEGRAM_WEBHOOK_PORT: Joi.number().port().required(),
    TELEGRAM_WEBHOOK_SECRET_TOKEN: Joi.string().required(),
    TELEGRAM_USE_LONG_POLLING: Joi.boolean().required(),
    DATABASE_URL: Joi.string().uri().required(),
    INVITE_TOKEN: Joi.string().required(),
}).unknown(true);
