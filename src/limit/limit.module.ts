import { Module } from "@nestjs/common";
import { PrismaModule } from "~/prisma/prisma.module";
import { LimitService } from "./limit.service";

@Module({
    imports: [PrismaModule],
    providers: [LimitService],
    exports: [LimitService],
})
export class LimitModule {}
