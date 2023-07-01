import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Balance } from "./balance.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "~/account/account.entity";

@Injectable()
export class BalanceService {
    constructor(
        @InjectRepository(Balance)
        private readonly balanceRepository: Repository<Balance>,
    ) {}

    async create(account: Account, sum: number): Promise<Balance> {
        return this.balanceRepository.save({ account, sum });
    }

    async findOneLastByAccount(account: Account): Promise<Balance | null> {
        return this.balanceRepository.findOne({
            where: { account: { id: account.id } },
            order: { createdAt: "DESC" },
        });
    }
}
