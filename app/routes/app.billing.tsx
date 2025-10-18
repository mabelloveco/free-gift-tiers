import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineGrid,
  Text,
  Button,
  List,
  Badge,
  InlineStack,
  Banner,
  Divider,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { 
  getBillingPlan, 
  createBillingPlan, 
  cancelBillingPlan,
  getAllPlans,
  getPlanDetails,
  getUsageStats,
  type BillingPlan
} from "../models/billing.server";

// Billing plans are now imported from billing.server.ts

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const billingPlan = await getBillingPlan(session.shop);
  const plans = getAllPlans();
  const usageStats = await getUsageStats(session.shop);

  // Serialize plans data to ensure proper client-side hydration
  const serializedPlans = plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: {
      monthly: plan.price.monthly,
      yearly: plan.price.yearly
    },
    features: plan.features,
    limits: {
      campaigns: plan.limits.campaigns === Infinity ? -1 : plan.limits.campaigns,
      events: plan.limits.events === Infinity ? -1 : plan.limits.events,
    }
  }));

  // Get current plan details for display
  const currentPlanDetails = billingPlan ? getPlanDetails(billingPlan.plan) : null;

  return json({ 
    billingPlan: billingPlan || { plan: "free", status: "active", interval: "monthly" },
    plans: serializedPlans,
    usageStats,
    currentPlanDetails
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPlan = String(formData.get("plan"));
  const interval = String(formData.get("interval") || "monthly");

  try {
    if (selectedPlan === "free") {
      // Cancel current subscription and downgrade to free
      await cancelBillingPlan(session.shop);
      return json({ success: true, message: "Plan downgraded to Free" });
    }

    const planDetails = getPlanDetails(selectedPlan);
    if (!planDetails) {
      return json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const amount = interval === "yearly" ? planDetails.price.yearly : planDetails.price.monthly;
    const billingInterval = interval === "yearly" ? billing.Interval.Annual : billing.Interval.Every30Days;

    // Create Shopify AppSubscription
    const billingResponse = await billing.request({
      plan: selectedPlan,
      amount,
      currencyCode: "USD",
      interval: billingInterval,
    });

    if (billingResponse?.confirmationUrl) {
      // Store pending subscription
      await createBillingPlan(session.shop, selectedPlan, null);
      return redirect(billingResponse.confirmationUrl);
    }

    return json({ error: "Failed to create billing subscription" }, { status: 400 });
  } catch (error) {
    console.error("Billing error:", error);
    return json({ 
      error: "An error occurred while processing your billing request" 
    }, { status: 500 });
  }
};

export default function Billing() {
  const { billingPlan, plans, usageStats, currentPlanDetails } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  
  const handleSelectPlan = (plan: string) => {
    const formData = new FormData();
    formData.append("plan", plan);
    formData.append("interval", billingInterval);
    submit(formData, { method: "post" });
  };

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const yearlyMonthly = monthlyPrice * 12;
    const savings = Math.round(((yearlyMonthly - yearlyPrice) / yearlyMonthly) * 100);
    return savings;
  };

  return (
    <Page>
      <TitleBar title="Billing & Plans" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {actionData?.error && (
              <Banner tone="critical">
                <p>{actionData.error}</p>
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingLg">
                      Current Plan
                    </Text>
                    <InlineStack gap="200">
                      <Badge tone="success">
                        {billingPlan.plan.toUpperCase()}
                      </Badge>
                      <Badge>{billingPlan.status}</Badge>
                    </InlineStack>
                  </BlockStack>
                  {billingPlan.plan !== "free" && currentPlanDetails && (
                    <Text as="p" variant="headingLg">
                      ${currentPlanDetails.price.monthly}
                      /month
                    </Text>
                  )}
                </InlineStack>
                
                <Divider />
                
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">Usage Statistics</Text>
                  <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" tone="subdued">Active Campaigns</Text>
                      <Text as="p" variant="headingLg">
                        {usageStats.campaigns.current} / {usageStats.campaigns.limit === -1 ? '∞' : usageStats.campaigns.limit}
                      </Text>
                    </BlockStack>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" tone="subdued">Events (30 days)</Text>
                      <Text as="p" variant="headingLg">
                        {usageStats.events.current} / {usageStats.events.limit === -1 ? '∞' : usageStats.events.limit}
                      </Text>
                    </BlockStack>
                  </InlineGrid>
                </BlockStack>
              </BlockStack>
            </Card>

            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  Choose Your Plan
                </Text>
                
                <ButtonGroup variant="segmented">
                  <Button
                    pressed={billingInterval === "monthly"}
                    onClick={() => setBillingInterval("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    pressed={billingInterval === "yearly"}
                    onClick={() => setBillingInterval("yearly")}
                  >
                    Yearly
                    {billingInterval === "yearly" && (
                      <Badge tone="success">Save 25%</Badge>
                    )}
                  </Button>
                </ButtonGroup>
              </InlineStack>
            </BlockStack>

            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              {plans.map((plan) => {
                const displayPrice = billingInterval === "yearly" 
                  ? plan.price.yearly 
                  : plan.price.monthly;
                const priceLabel = billingInterval === "yearly" ? "/year" : "/month";
                const savings = billingInterval === "yearly" 
                  ? calculateSavings(plan.price.monthly, plan.price.yearly)
                  : 0;

                return (
                  <Card key={plan.id}>
                    <BlockStack gap="400">
                      <BlockStack gap="200">
                        <InlineStack align="space-between" blockAlign="start">
                          <Text as="h3" variant="headingMd">
                            {plan.name}
                          </Text>
                          {savings > 0 && (
                            <Badge tone="success">{savings}% off</Badge>
                          )}
                        </InlineStack>
                        
                        <BlockStack gap="100">
                          <Text as="p" variant="heading2xl">
                            ${displayPrice}
                            <Text as="span" variant="bodyMd" tone="subdued">
                              {displayPrice > 0 ? priceLabel : ""}
                            </Text>
                          </Text>
                          {billingInterval === "yearly" && plan.price.monthly > 0 && (
                            <Text as="p" variant="bodySm" tone="subdued">
                              ${plan.price.monthly}/month billed annually
                            </Text>
                          )}
                        </BlockStack>
                      </BlockStack>

                      <Divider />

                      <BlockStack gap="200">
                        <List>
                          {plan.features.map((feature, i) => (
                            <List.Item key={i}>{feature}</List.Item>
                          ))}
                        </List>
                      </BlockStack>

                      <Button
                        variant={
                          billingPlan.plan === plan.id ? "primary" : "secondary"
                        }
                        fullWidth
                        disabled={billingPlan.plan === plan.id}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {billingPlan.plan === plan.id
                          ? "Current Plan"
                          : "Select Plan"}
                      </Button>
                    </BlockStack>
                  </Card>
                );
              })}
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
