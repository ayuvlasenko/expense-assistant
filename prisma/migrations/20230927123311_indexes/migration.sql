-- CreateIndex
CREATE INDEX "Account_userId_createdAt_idx" ON "Account"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Category_userId_createdAt_idx" ON "Category"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Operation_accountId_createdAt_idx" ON "Operation"("accountId", "createdAt" DESC);
