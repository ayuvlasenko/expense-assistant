/*
  Warnings:

  - Added the required column `payload` to the `TelegramSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TelegramSession" ADD COLUMN     "payload" JSONB NOT NULL;
