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
import { prisma } from "../db.server";

const PLANS = {
  free: {
    name: "Free",
    price: 0,
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
  grow: {
    name: "Grow",
    price: 19.99,
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
  advanced: {
    name: "Advanced",
    price: 49.99,
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
    name: "Plus",
    price: 99.99,
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  let billingPlan = await prisma.billingPlan.findUnique({
    where: { shop: session.shop },
  });

  if (!billingPlan) {
    billingPlan = await prisma.billingPlan.create({
      data: {
        shop: session.shop,
        plan: "free",
        status: "active",
      },
    });
  }

  return json({ billingPlan, plans: PLANS });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPlan = String(formData.get("plan"));

  if (selectedPlan === "free") {
    // Cancel current subscription
    await prisma.billingPlan.update({
      where: { shop: session.shop },
      data: {
        plan: "free",
        billingId: null,
      },
    });
    return json({ success: true });
  }

  const planDetails = PLANS[selectedPlan as keyof typeof PLANS];

  // Create Shopify billing charge
  const billingResponse = await billing.request({
    plan: selectedPlan,
    amount: planDetails.price,
    currencyCode: "USD",
    interval: billing.Interval.Every30Days,
  });

  if (billingResponse?.confirmationUrl) {
    return redirect(billingResponse.confirmationUrl);
  }

  return json({ error: "Failed to create billing charge" }, { status: 400 });
};

export default function Billing() {
  const { billingPlan, plans } = useLoaderData<typeof loader>();
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
                      ${plans[billingPlan.plan as keyof typeof plans].price}
                      /month
                    </Text>
                  )}
                </InlineStack>
              </BlockStack>
            </Card>

            <Text as="h2" variant="headingLg">
              Choose Your Plan
            </Text>

            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              {Object.entries(plans).map(([key, plan]) => (
                <Card key={key}>
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
                        billingPlan.plan === key ? "primary" : "secondary"
                      }
                      fullWidth
                      disabled={billingPlan.plan === key}
                      onClick={() => handleSelectPlan(key)}
                    >
                      {billingPlan.plan === key
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
