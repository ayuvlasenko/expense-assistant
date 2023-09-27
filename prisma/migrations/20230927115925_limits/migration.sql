-- CreateEnum
CREATE TYPE "LimitCategory" AS ENUM ('ACCOUNTS', 'CATEGORIES');

-- CreateTable
CREATE TABLE "Limit" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "LimitCategory" NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Limit_pkey" PRIMARY KEY ("id")
);

insert into "Limit" (
	"id",
    "updatedAt",
    "category",
    "value"
) values (
	gen_random_uuid(),
    CURRENT_TIMESTAMP,
    'ACCOUNTS',
    25
), (
	gen_random_uuid(),
    CURRENT_TIMESTAMP,
    'CATEGORIES',
    100
);
