import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useCallback } from "react";
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
  ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getCampaignAnalytics } from "../models/analytics.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { campaignId } = params;
  
  if (!campaignId) {
    throw new Response("Campaign ID required", { status: 400 });
  }
  
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
      startDate.setFullYear(2020, 0, 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }
  
  const analytics = await getCampaignAnalytics(session.shop, campaignId, startDate, endDate);
  
  if (!analytics) {
    throw new Response("Campaign not found", { status: 404 });
  }
  
  return json({ analytics, timeRange, campaignId });
};

export default function CampaignAnalytics() {
  const { analytics, timeRange } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const getCampaignTypeBadge = (type: string) => {
    switch (type) {
      case "free_gift": return { tone: "success" as const, label: "Free Gift" };
      case "bxgy": return { tone: "info" as const, label: "BXGY" };
      case "volume_discount": return { tone: "attention" as const, label: "Volume" };
      default: return { tone: "info" as const, label: type };
    }
  };

  // Product performance table
  const productRows = analytics.topProducts.map((product) => [
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
  ]);

  return (
    <Page
      backAction={{ url: "/app/analytics" }}
      title={analytics.campaignTitle}
      subtitle="Campaign Performance"
    >
      <TitleBar title={`Analytics: ${analytics.campaignTitle}`} />
      
      <BlockStack gap="500">
        {/* Header with Time Range */}
        <Layout>
          <Layout.Section>
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="300" blockAlign="center">
                  <Badge {...getCampaignTypeBadge(analytics.campaignType)} />
                  <Text as="h2" variant="headingMd">
                    Performance Metrics
                  </Text>
                </InlineStack>
                <Select
                  label="Time range"
                  labelInline
                  options={timeRangeOptions}
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                />
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>

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
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Conversion Rate
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {analytics.conversionRate.toFixed(1)}%
                  </Text>
                </BlockStack>
              </Card>
            </InlineGrid>
          </Layout.Section>
        </Layout>

        {/* Products Performance */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Product Performance
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Products included in this campaign
                </Text>
                <Divider />
                {productRows.length > 0 ? (
                  <DataTable
                    columnContentTypes={["text", "numeric", "numeric", "text"]}
                    headings={["Product", "Gifts Given", "Total Value", "% of Total"]}
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

        {/* Revenue Impact & Event Breakdown */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Revenue Impact
                </Text>
                <Divider />
                <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Total Discounts
                    </Text>
                    <Text as="p" variant="headingLg">
                      ${(analytics.revenueImpact.totalDiscounts / 100).toFixed(2)}
                    </Text>
                  </BlockStack>
                  
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Estimated Revenue Generated
                    </Text>
                    <Text as="p" variant="headingLg">
                      ${(analytics.revenueImpact.estimatedRevenue / 100).toFixed(2)}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Based on 3:1 return ratio
                    </Text>
                  </BlockStack>
                  
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Estimated ROI
                    </Text>
                    <Text as="p" variant="headingLg">
                      {analytics.revenueImpact.roi}%
                    </Text>
                  </BlockStack>
                </InlineGrid>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Event Breakdown
                </Text>
                <Divider />
                <BlockStack gap="300">
                  {Object.entries(analytics.eventBreakdown).map(([type, count]) => (
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
        </Layout>

        {/* Insights Banner */}
        <Layout>
          <Layout.Section>
            <Banner tone="info">
              <BlockStack gap="200">
                <Text as="p" fontWeight="semibold">
                  💡 Campaign Insights
                </Text>
                <Text as="p">
                  This campaign has reached <strong>{analytics.uniqueCustomers}</strong> unique customers 
                  with a <strong>{analytics.conversionRate.toFixed(1)}%</strong> conversion rate.
                  {analytics.topProducts.length > 0 && (
                    <> The top performing product is <strong>{analytics.topProducts[0].productTitle}</strong> 
                    with {analytics.topProducts[0].totalGiftsGiven} gifts given.</>
                  )}
                </Text>
              </BlockStack>
            </Banner>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

