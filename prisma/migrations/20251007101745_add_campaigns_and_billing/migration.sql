-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "config" TEXT NOT NULL,
    "functionId" TEXT,
    "discountId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CampaignEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "orderId" TEXT,
    "cartId" TEXT,
    "customerId" TEXT,
    "discountAmount" DECIMAL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "billingId" TEXT,
    "trialEndsAt" DATETIME,
    "billedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Campaign_shop_status_idx" ON "Campaign"("shop", "status");

-- CreateIndex
CREATE INDEX "CampaignEvent_campaignId_createdAt_idx" ON "CampaignEvent"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_shop_eventType_idx" ON "CampaignEvent"("shop", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPlan_shop_key" ON "BillingPlan"("shop");

-- CreateIndex
CREATE INDEX "BillingPlan_shop_status_idx" ON "BillingPlan"("shop", "status");
