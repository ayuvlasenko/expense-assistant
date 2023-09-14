import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class CurrencyService {
    constructor(private readonly prismaService: PrismaService) {}

    async findOneOrCreate(code: string) {
        const maybeCode = code.toUpperCase().trim();

        const existingCurrency = await this.prismaService.currency.findUnique({
            where: {
                code: maybeCode,
            },
        });

        if (existingCurrency) {
            return existingCurrency;
        }

        if (!this.isValid(maybeCode)) {
            throw new BadRequestException(
                "Currency code must contain only uppercase latin letters",
            );
        }

        return this.prismaService.currency.create({
            data: { code: maybeCode },
        });
    }

    isValid(code: string) {
        return /^[A-Z]{3}$/.test(code);
    }

    async findOne(code: string) {
        return this.prismaService.currency.findUnique({
            where: {
                code,
            },
        });
    }
}
