import { Injectable } from "@nestjs/common";
import { Account, Currency, User } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class AccountService {
    constructor(private readonly prismaService: PrismaService) {}

    create(name: string, currency: Currency, user: User): Promise<Account> {
        return this.prismaService.account.create({
            data: {
                name,
                currency: {
                    connect: {
                        id: currency.id,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
            include: {
                currency: true,
                user: true,
            },
        });
    }
}