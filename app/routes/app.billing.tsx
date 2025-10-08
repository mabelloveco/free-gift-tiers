import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useActionData } from "@remix-run/react";
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

  return json({ 
    billingPlan: billingPlan || { plan: "free", status: "active" },
    plans,
    usageStats
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPlan = String(formData.get("plan"));

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

    // Create Shopify AppSubscription
    const billingResponse = await billing.request({
      plan: selectedPlan,
      amount: planDetails.price,
      currencyCode: "USD",
      interval: billing.Interval.Every30Days,
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
  const { billingPlan, plans, usageStats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  const handleSelectPlan = (plan: string) => {
    const formData = new FormData();
    formData.append("plan", plan);
    submit(formData, { method: "post" });
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
                  {billingPlan.plan !== "free" && (
                    <Text as="p" variant="headingLg">
                      ${plans.find(p => p.id === billingPlan.plan)?.price || 0}
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
                        {usageStats.campaigns.current} / {usageStats.campaigns.limit === Infinity ? '∞' : usageStats.campaigns.limit}
                      </Text>
                    </BlockStack>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" tone="subdued">Events (30 days)</Text>
                      <Text as="p" variant="headingLg">
                        {usageStats.events.current} / {usageStats.events.limit === Infinity ? '∞' : usageStats.events.limit}
                      </Text>
                    </BlockStack>
                  </InlineGrid>
                </BlockStack>
              </BlockStack>
            </Card>

            <Text as="h2" variant="headingLg">
              Choose Your Plan
            </Text>

            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingMd">
                        {plan.name}
                      </Text>
                      <Text as="p" variant="heading2xl">
                        ${plan.price}
                        <Text as="span" variant="bodyMd" tone="subdued">
                          {plan.price > 0 ? "/month" : ""}
                        </Text>
                      </Text>
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
              ))}
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
