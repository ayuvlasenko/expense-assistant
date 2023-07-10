import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { PrismaModule } from "~/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
