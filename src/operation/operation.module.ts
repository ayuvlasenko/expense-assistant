import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Operation } from "./operation.entity";
import { OperationService } from "./operation.service";

@Module({
    imports: [TypeOrmModule.forFeature([Operation])],
    providers: [OperationService],
    exports: [OperationService],
})
export class OperationModule {}
