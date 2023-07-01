import { Module } from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { Currency } from "./currency.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Currency])],
    providers: [CurrencyService],
    exports: [CurrencyService],
})
export class CurrencyModule {}
