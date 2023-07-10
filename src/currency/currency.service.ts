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

        if (!/^[A-Z]{3}$/.test(maybeCode)) {
            throw new BadRequestException(
                "Currency code must contain only uppercase latin letters",
            );
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
