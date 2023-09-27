import { Module } from "@nestjs/common";
import { PrismaModule } from "~/prisma/prisma.module";
import { AccountService } from "./account.service";
import { LimitModule } from "~/limit/limit.module";

@Module({
    imports: [LimitModule, PrismaModule],
    providers: [AccountService],
    exports: [AccountService],
})
export class AccountModule {}
