import { BadRequestException, Injectable } from "@nestjs/common";
import { parseCurrencyCode } from "~/common/parsers";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class CurrencyService {
    constructor(private readonly prismaService: PrismaService) {}

    async findOneOrCreate(code: string) {
        const maybeCode = parseCurrencyCode(code);
        if (!maybeCode) {
            throw new BadRequestException(
                "Currency code should be a string of 3 latin letters",
            );
        }

        const existingCurrency = await this.prismaService.currency.findUnique({
            where: {
                code: maybeCode,
            },
        });

        if (existingCurrency) {
            return existingCurrency;
        }

        return this.prismaService.currency.create({
            data: { code: maybeCode },
        });
    }

    async findOne(code: string) {
        return this.prismaService.currency.findUnique({
            where: {
                code,
            },
        });
    }
}
