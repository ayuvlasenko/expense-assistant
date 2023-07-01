import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Currency } from "~/currency/currency.entity";
import { User } from "~/user/user.entity";
import { Account } from "./account.entity";
import { Repository } from "typeorm";

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    create(name: string, currency: Currency, user: User): Promise<Account> {
        const account = new Account(name, currency, user);

        return this.accountRepository.save(account);
    }
}
