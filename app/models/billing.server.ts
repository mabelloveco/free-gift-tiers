import { prisma } from "../db.server";

export interface BillingPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    campaigns: number;
    events: number;
  };
}

export const BILLING_PLANS: Record<string, BillingPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      "1 active campaign",
      "Basic analytics",
      "Free gift tiers only",
      "Community support",
    ],
    limits: {
      campaigns: 1,
      events: 100,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: {
      monthly: 19,
      yearly: 171,
    },
    features: [
      "5 active campaigns",
      "BXGY campaigns",
      "Volume discounts",
      "Advanced analytics",
      "Email support",
    ],
    limits: {
      campaigns: 5,
      events: 1000,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: {
      monthly: 39,
      yearly: 351,
    },
    features: [
      "15 active campaigns",
      "All campaign types",
      "Priority support",
      "Custom branding",
      "API access",
    ],
    limits: {
      campaigns: 15,
      events: 10000,
    },
  },
  plus: {
    id: "plus",
    name: "Plus",
    price: {
      monthly: 49,
      yearly: 441,
    },
    features: [
      "Unlimited campaigns",
      "Unlimited events",
      "Dedicated support",
      "Custom development",
      "White-label solution",
    ],
    limits: {
      campaigns: Infinity,
      events: Infinity,
    },
  },
};

export interface BillingSubscription {
  id: string;
  shop: string;
  plan: string;
  status: "active" | "cancelled" | "pending";
  billingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getBillingPlan(shop: string): Promise<BillingSubscription | null> {
  return await prisma.billingPlan.findUnique({
    where: { shop },
  });
}

export async function createBillingPlan(
  shop: string,
  plan: string,
  billingId?: string
): Promise<BillingSubscription> {
  return await prisma.billingPlan.upsert({
    where: { shop },
    update: {
      plan,
      billingId,
      status: "active",
      updatedAt: new Date(),
    },
    create: {
      shop,
      plan,
      billingId,
      status: "active",
    },
  });
}

export async function cancelBillingPlan(shop: string): Promise<BillingSubscription> {
  return await prisma.billingPlan.update({
    where: { shop },
    data: {
      plan: "free",
      billingId: null,
      status: "cancelled",
      updatedAt: new Date(),
    },
  });
}

export async function updateBillingStatus(
  shop: string,
  status: "active" | "cancelled" | "pending"
): Promise<BillingSubscription> {
  return await prisma.billingPlan.update({
    where: { shop },
    data: {
      status,
      updatedAt: new Date(),
    },
  });
}

export function getPlanDetails(planId: string): BillingPlan | null {
  return BILLING_PLANS[planId] || null;
}

export function getAllPlans(): BillingPlan[] {
  return Object.values(BILLING_PLANS);
}

export async function checkPlanLimits(
  shop: string,
  limitType: "campaigns" | "events"
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const billingPlan = await getBillingPlan(shop);
  const plan = billingPlan ? getPlanDetails(billingPlan.plan) : BILLING_PLANS.free;
  
  if (!plan) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const limit = plan.limits[limitType];
  
  if (limit === Infinity) {
    return { allowed: true, current: 0, limit: Infinity };
  }

  // Get current usage
  let current = 0;
  if (limitType === "campaigns") {
    current = await prisma.campaign.count({
      where: { shop, status: "active" },
    });
  } else if (limitType === "events") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    current = await prisma.campaignEvent.count({
      where: {
        shop,
        createdAt: { gte: thirtyDaysAgo },
      },
    });
  }

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export async function canCreateCampaign(shop: string): Promise<boolean> {
  // Users can create unlimited campaigns
  return true;
}

export async function canActivateCampaign(shop: string): Promise<boolean> {
  // Check if they can activate another campaign based on their plan
  const limits = await checkPlanLimits(shop, "campaigns");
  return limits.allowed;
}

export async function getUsageStats(shop: string): Promise<{
  campaigns: { current: number; limit: number };
  events: { current: number; limit: number };
}> {
  const campaignLimits = await checkPlanLimits(shop, "campaigns");
  const eventLimits = await checkPlanLimits(shop, "events");

  return {
    campaigns: {
      current: campaignLimits.current,
      limit: campaignLimits.limit,
    },
    events: {
      current: eventLimits.current,
      limit: eventLimits.limit,
    },
  };
}
