/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `TelegramSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TelegramSession_userId_key" ON "TelegramSession"("userId");
