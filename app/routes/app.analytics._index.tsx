import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useSubmit, useActionData } from "@remix-run/react";
import { useState, useCallback } from "react";
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
  DataTable,
  Select,
  Divider,
  Banner,
  EmptyState,
  ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getAnalyticsSummary } from "../models/analytics.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const timeRange = url.searchParams.get("range") || "30";
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case "7":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "365":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "all":
      startDate.setFullYear(2020, 0, 1); // Far back date
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }
  
  const analytics = await getAnalyticsSummary(session.shop, startDate, endDate);
  
  return json({ analytics, timeRange, shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { prisma } = await import("../db.server");
  
  // Get an active campaign
  const campaign = await prisma.campaign.findFirst({
    where: { shop: session.shop, status: "active" },
  });
  
  if (!campaign) {
    return json({ 
      success: false, 
      message: "No active campaign found. Please create and activate a campaign first." 
    });
  }
  
  // Sample product data
  const sampleProducts = [
    {
      productId: "gid://shopify/Product/1",
      productTitle: "Hoop Earrings - Gold",
      variantId: "gid://shopify/ProductVariant/101",
      variantTitle: "Medium",
      value: 3600, // $36.00
    },
    {
      productId: "gid://shopify/Product/2",
      productTitle: "Diamond Stud Earrings",
      variantId: "gid://shopify/ProductVariant/102",
      variantTitle: "Small",
      value: 8900, // $89.00
    },
    {
      productId: "gid://shopify/Product/3",
      productTitle: "Pearl Necklace",
      variantId: "gid://shopify/ProductVariant/103",
      variantTitle: "18 inch",
      value: 12500, // $125.00
    },
  ];
  
  const eventTypes = ["gift_added", "threshold_reached", "bxgy_applied"];
  
  // Create 50 sample events over the past 30 days
  const events = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const product = sampleProducts[i % sampleProducts.length];
    const eventType = eventTypes[i % eventTypes.length];
    
    // Random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    // Random customer ID
    const customerId = `gid://shopify/Customer/${100 + Math.floor(Math.random() * 20)}`;
    
    // Sometimes add order/cart ID
    const orderId = Math.random() > 0.5 ? `gid://shopify/Order/${1000 + i}` : null;
    const cartId = `gid://shopify/Cart/${2000 + i}`;
    
    events.push({
      campaignId: campaign.id,
      shop: session.shop,
      eventType,
      customerId,
      orderId,
      cartId,
      discountAmount: product.value,
      metadata: JSON.stringify({
        productId: product.productId,
        productTitle: product.productTitle,
        variantId: product.variantId,
        variantTitle: product.variantTitle,
        giftVariantId: product.variantId,
      }),
      createdAt,
    });
  }
  
  // Batch create events
  await prisma.campaignEvent.createMany({
    data: events,
  });
  
  return json({ 
    success: true, 
    message: `Created 50 demo events for campaign "${campaign.title}". Refresh to see analytics!` 
  });
};

export default function AnalyticsIndex() {
  const { analytics, timeRange } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  const timeRangeOptions = [
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
    { label: "Last year", value: "365" },
    { label: "All time", value: "all" },
  ];

  const handleTimeRangeChange = useCallback((value: string) => {
    setSearchParams({ range: value });
  }, [setSearchParams]);

  const handleExport = useCallback(async () => {
    // Trigger download
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = `/app/analytics/export?range=${timeRange}`;
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }, [timeRange]);

  const handleGenerateDemoData = useCallback(() => {
    const form = new FormData();
    submit(form, { method: "post" });
  }, [submit]);

  // Product performance table
  const productRows = analytics.topPerformingProducts.map((product) => [
    <BlockStack key="product" gap="100">
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {product.productTitle || "Unknown Product"}
      </Text>
      <Text as="span" variant="bodySm" tone="subdued">
        {product.variantTitle || "Default Variant"}
      </Text>
    </BlockStack>,
    <Text key="gifts" as="span" variant="bodyMd" alignment="end">
      {product.totalGiftsGiven}
    </Text>,
    <Text key="value" as="span" variant="bodyMd" alignment="end">
      ${(product.totalValue / 100).toFixed(2)}
    </Text>,
    <BlockStack key="percentage" gap="100">
      <Text as="span" variant="bodySm" alignment="end">
        {product.percentageOfTotal.toFixed(1)}%
      </Text>
      <ProgressBar progress={product.percentageOfTotal} size="small" />
    </BlockStack>,
    <BlockStack key="campaigns" gap="100">
      {product.campaigns.slice(0, 2).map((campaign, i) => (
        <Badge key={i} tone="info">{campaign}</Badge>
      ))}
      {product.campaigns.length > 2 && (
        <Text as="span" variant="bodySm" tone="subdued">
          +{product.campaigns.length - 2} more
        </Text>
      )}
    </BlockStack>,
  ]);

  // Campaign performance table
  const campaignRows = analytics.topPerformingCampaigns.map((campaign) => [
    <Text key="title" as="span" variant="bodyMd" fontWeight="semibold">
      {campaign.title}
    </Text>,
    <Text key="events" as="span" variant="bodyMd" alignment="end">
      {campaign.events}
    </Text>,
    <Text key="value" as="span" variant="bodyMd" alignment="end">
      ${(campaign.value / 100).toFixed(2)}
    </Text>,
    <Button key="view" url={`/app/analytics/campaign/${campaign.id}?range=${timeRange}`} variant="plain" size="slim">
      View Details
    </Button>,
  ]);

  const hasData = analytics.totalEvents > 0;

  return (
    <Page>
      <TitleBar title="Analytics & Insights" />
      
      <BlockStack gap="500">
        {/* Time Range Selector */}
        <Layout>
          <Layout.Section>
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Performance Overview
                </Text>
                <InlineStack gap="300">
                  <Select
                    label="Time range"
                    labelInline
                    options={timeRangeOptions}
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                  />
                  <Button onClick={handleExport} disabled={!hasData}>
                    Export CSV
                  </Button>
                </InlineStack>
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>

        {actionData?.message && (
          <Layout>
            <Layout.Section>
              <Banner
                tone={actionData.success ? "success" : "critical"}
                onDismiss={() => {}}
              >
                <p>{actionData.message}</p>
              </Banner>
            </Layout.Section>
          </Layout>
        )}

        {!hasData ? (
          <Layout>
            <Layout.Section>
              <Card>
                <EmptyState
                  heading="No analytics data yet"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{
                    content: "Generate Demo Data",
                    onAction: handleGenerateDemoData,
                  }}
                  secondaryAction={{
                    content: "Create Campaign",
                    url: "/app/campaigns/new",
                  }}
                >
                  <p>
                    Once your campaigns start generating events (gifts added, checkouts, etc.), 
                    you'll see detailed analytics here showing product performance, revenue impact, and customer insights.
                  </p>
                  <br />
                  <Banner tone="info">
                    <BlockStack gap="200">
                      <p>
                        <strong>Testing:</strong> Click "Generate Demo Data" to create 50 sample events with products like Hoop Earrings, Diamond Studs, and Pearl Necklaces.
                      </p>
                      <p>
                        <strong>Production:</strong> Event tracking will be logged automatically when customers interact with your campaigns.
                      </p>
                    </BlockStack>
                  </Banner>
                </EmptyState>
              </Card>
            </Layout.Section>
          </Layout>
        ) : (
          <>
            {/* Key Metrics */}
            <Layout>
              <Layout.Section>
                <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm" tone="subdued">
                        Total Events
                      </Text>
                      <Text as="p" variant="heading2xl">
                        {analytics.totalEvents.toLocaleString()}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        All campaign interactions
                      </Text>
                    </BlockStack>
                  </Card>

                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm" tone="subdued">
                        Gifts Given
                      </Text>
                      <Text as="p" variant="heading2xl">
                        {analytics.totalGiftsGiven.toLocaleString()}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Free products awarded
                      </Text>
                    </BlockStack>
                  </Card>

                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm" tone="subdued">
                        Total Value
                      </Text>
                      <Text as="p" variant="heading2xl">
                        ${(analytics.totalValue / 100).toFixed(2)}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Discounts provided
                      </Text>
                    </BlockStack>
                  </Card>

                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm" tone="subdued">
                        Unique Customers
                      </Text>
                      <Text as="p" variant="heading2xl">
                        {analytics.uniqueCustomers.toLocaleString()}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Customers reached
                      </Text>
                    </BlockStack>
                  </Card>
                </InlineGrid>
              </Layout.Section>
            </Layout>

            {/* Top Performing Products */}
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Top Performing Products
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Products that generate the most value and engagement
                    </Text>
                    <Divider />
                    {productRows.length > 0 ? (
                      <DataTable
                        columnContentTypes={["text", "numeric", "numeric", "text", "text"]}
                        headings={["Product", "Gifts Given", "Total Value", "% of Total", "Campaigns"]}
                        rows={productRows}
                      />
                    ) : (
                      <Text as="p" tone="subdued" alignment="center">
                        No product data available yet
                      </Text>
                    )}
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>

            {/* Top Performing Campaigns */}
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Top Performing Campaigns
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Campaigns generating the highest value
                    </Text>
                    <Divider />
                    {campaignRows.length > 0 ? (
                      <DataTable
                        columnContentTypes={["text", "numeric", "numeric", "text"]}
                        headings={["Campaign", "Events", "Total Value", "Actions"]}
                        rows={campaignRows}
                      />
                    ) : (
                      <Text as="p" tone="subdued" alignment="center">
                        No campaign data available yet
                      </Text>
                    )}
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>

            {/* Event Breakdown */}
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Event Breakdown
                    </Text>
                    <Divider />
                    <BlockStack gap="300">
                      {Object.entries(analytics.eventsByType).map(([type, count]) => (
                        <InlineStack key={type} align="space-between">
                          <Text as="p" variant="bodyMd">
                            {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                          <Badge>{count}</Badge>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Layout.Section>

              {/* Quick Insights */}
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Quick Insights
                    </Text>
                    <Divider />
                    <BlockStack gap="300">
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Average Gift Value
                        </Text>
                        <Text as="p" variant="heading2xl">
                          ${analytics.totalGiftsGiven > 0 
                            ? ((analytics.totalValue / analytics.totalGiftsGiven) / 100).toFixed(2)
                            : "0.00"
                          }
                        </Text>
                      </BlockStack>
                      
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Events per Customer
                        </Text>
                        <Text as="p" variant="heading2xl">
                          {analytics.uniqueCustomers > 0
                            ? (analytics.totalEvents / analytics.uniqueCustomers).toFixed(1)
                            : "0.0"
                          }
                        </Text>
                      </BlockStack>

                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Gift Conversion Rate
                        </Text>
                        <Text as="p" variant="heading2xl">
                          {analytics.totalEvents > 0
                            ? ((analytics.totalGiftsGiven / analytics.totalEvents) * 100).toFixed(1)
                            : "0.0"
                          }%
                        </Text>
                      </BlockStack>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </>
        )}
      </BlockStack>
    </Page>
  );
}

