import { BadRequestException, Injectable } from "@nestjs/common";
import { FindOptionsOrder, Repository } from "typeorm";
import { Currency } from "./currency.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class CurrencyService {
    constructor(
        @InjectRepository(Currency)
        private readonly currencyRepository: Repository<Currency>,
    ) {}

    async findOneOrCreate(code: string): Promise<Currency> {
        const existingCurrency = await this.currencyRepository.findOneBy({
            code: code.toUpperCase(),
        });

        if (existingCurrency) {
            return existingCurrency;
        }

        if (code.match(/[^\s*A-Z\s*]{3}/)) {
            throw new BadRequestException(
                "Currency code must contain only uppercase latin letters",
            );
        }

        const currency = new Currency(code.trim().toUpperCase());

        return this.currencyRepository.save(currency);
    }

    async findOne(code: string): Promise<Currency | null> {
        return this.currencyRepository.findOneBy({
            code: code.trim().toUpperCase(),
        });
    }

    async findAndCount(options: {
        code?: string;
        skip?: number;
        limit?: number;
        order?: FindOptionsOrder<Currency>;
    }): Promise<[Currency[], number]> {
        return this.currencyRepository.findAndCount({
            where: {
                code: options.code,
            },
            order: options.order ?? { code: 1 },
            skip: options.skip,
            take: options.limit,
        });
    }
}
