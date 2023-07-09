import { Module } from "@nestjs/common";
import { PrismaModule } from "~/prisma/prisma.module";
import { OperationService } from "./operation.service";

@Module({
    imports: [PrismaModule],
    providers: [OperationService],
    exports: [OperationService],
})
export class OperationModule {}
