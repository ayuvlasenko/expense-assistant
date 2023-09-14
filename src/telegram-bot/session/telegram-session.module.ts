import { Module } from "@nestjs/common";
import { PrismaModule } from "~/prisma/prisma.module";
import { TelegramSessionService } from "./telegram-session.service";

@Module({
    imports: [PrismaModule],
    providers: [TelegramSessionService],
    exports: [TelegramSessionService],
})
export class TelegramSessionModule {}
