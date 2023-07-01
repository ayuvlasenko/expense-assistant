import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findOrCreate(telegramId: string): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { telegramId },
            relations: ["accounts"],
        });

        if (existingUser) {
            return existingUser;
        }

        return this.userRepository.save(new User(telegramId));
    }
}
