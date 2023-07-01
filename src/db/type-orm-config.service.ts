import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { EnvValidationSchema } from "../config/env-validation.schema";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(
        private readonly configService: ConfigService<
            EnvValidationSchema,
            true
        >,
    ) {}

    createTypeOrmOptions():
        | Promise<TypeOrmModuleOptions>
        | TypeOrmModuleOptions {
        return {
            type: "postgres",
            host: this.configService.get("TYPEORM_HOST", { infer: true }),
            port: this.configService.get("TYPEORM_PORT", { infer: true }),
            username: this.configService.get("TYPEORM_USERNAME", {
                infer: true,
            }),
            password: this.configService.get("TYPEORM_PASSWORD", {
                infer: true,
            }),
            database: this.configService.get("TYPEORM_DATABASE", {
                infer: true,
            }),
            cache:
                this.configService.get("TYPEORM_CACHE", { infer: true }) ===
                "TRUE",
            autoLoadEntities: true,
        };
    }
}
