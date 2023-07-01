import { ConfigService } from "@nestjs/config";
import { EnvValidationSchema } from "./config/env-validation.schema";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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
bootstrap();
