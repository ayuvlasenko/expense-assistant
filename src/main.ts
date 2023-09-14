import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { EnvValidationSchema } from "./config/env-validation.schema";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.enableShutdownHooks();

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    app.setGlobalPrefix("api");

    const configService: ConfigService<EnvValidationSchema, true> =
        app.get(ConfigService);
    const port = configService.get("API_PORT", { infer: true });

    await app.listen(port);
}

void bootstrap();
