import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineGrid,
  Text,
  Button,
  Badge,
  InlineStack,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get campaigns
  const campaigns = await prisma.campaign.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  // Get events from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const events = await prisma.campaignEvent.findMany({
    where: {
      shop: session.shop,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Calculate metrics
  const totalEvents = events.length;
  const totalDiscountAmount = events.reduce(
    (sum, e) => sum + Number(e.discountAmount || 0),
    0
  );

  const eventsByType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get billing plan
  const billingPlan = await prisma.billingPlan.findUnique({
    where: { shop: session.shop },
  });

  return json({
    campaigns: campaigns.map((c) => ({
      ...c,
      config: JSON.parse(c.config),
      eventCount: c._count.events,
    })),
    metrics: {
      totalEvents,
      totalDiscountAmount,
      eventsByType,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
    },
    billingPlan: billingPlan || { plan: "free", status: "active" },
  });
};

export default function Index() {
  const { campaigns, metrics, billingPlan } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        <Layout>
          {/* Metrics Overview */}
          <Layout.Section>
            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Active Campaigns
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {metrics.activeCampaigns}
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Total Events (30d)
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {metrics.totalEvents}
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Discounts Given (30d)
                  </Text>
                  <Text as="p" variant="heading2xl">
                    ${(metrics.totalDiscountAmount / 100).toFixed(2)}
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Current Plan
                  </Text>
                  <Text as="p" variant="headingLg">
                    <Badge tone="success">{billingPlan.plan.toUpperCase()}</Badge>
                  </Text>
                  <Button url="/app/billing" variant="plain" size="slim">
                    Upgrade
                  </Button>
                </BlockStack>
              </Card>
            </InlineGrid>
          </Layout.Section>

          {/* Quick Actions */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Create New Campaign
                </Text>
                <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                  <Button
                    url="/app/campaigns/free-gift/new"
                    variant="primary"
                    fullWidth
                  >
                    Free Gift Tier
                  </Button>
                  <Button
                    url="/app/campaigns/bxgy/new"
                    fullWidth
                  >
                    Buy X Get Y
                  </Button>
                  <Button
                    url="/app/campaigns/volume/new"
                    fullWidth
                  >
                    Volume Discount
                  </Button>
                </InlineGrid>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Recent Campaigns */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Recent Campaigns
                  </Text>
                  <Button url="/app/campaigns" variant="plain">
                    View all
                  </Button>
                </InlineStack>

                <Divider />

                {campaigns.length === 0 ? (
                  <Box padding="400">
                    <BlockStack gap="200" align="center">
                      <Text as="p" tone="subdued">
                        No campaigns yet. Create your first one above!
                      </Text>
                    </BlockStack>
                  </Box>
                ) : (
                  <BlockStack gap="300">
                    {campaigns.map((campaign) => (
                      <Box
                        key={campaign.id}
                        padding="400"
                        borderColor="border"
                        borderWidth="025"
                        borderRadius="200"
                      >
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="200">
                            <InlineStack gap="200">
                              <Text as="h3" variant="headingSm" fontWeight="bold">
                                {campaign.title}
                              </Text>
                              <Badge tone={campaign.status === "active" ? "success" : "info"}>
                                {campaign.status}
                              </Badge>
                              <Badge>{campaign.type.replace("_", " ")}</Badge>
                            </InlineStack>
                            <Text as="p" tone="subdued" variant="bodySm">
                              {campaign.eventCount} events
                            </Text>
                          </BlockStack>
                          <Button
                            url={`/app/campaigns/${campaign.type}/${campaign.id}`}
                            variant="plain"
                          >
                            View
                          </Button>
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Event Breakdown */}
          {metrics.totalEvents > 0 && (
            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Event Breakdown (30d)
                  </Text>
                  <BlockStack gap="300">
                    {Object.entries(metrics.eventsByType).map(([type, count]) => (
                      <InlineStack key={type} align="space-between">
                        <Text as="p" variant="bodySm">
                          {type.replace(/_/g, " ")}
                        </Text>
                        <Text as="p" variant="bodyMd" fontWeight="bold">
                          {count}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </BlockStack>
    </Page>
  );
}
