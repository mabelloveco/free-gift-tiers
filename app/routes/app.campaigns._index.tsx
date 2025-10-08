import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Checkbox,
  Button,
  Banner,
  BlockStack,
  Text,
  InlineStack,
  DataTable,
  Badge,
  ButtonGroup,
  EmptyState,
  InlineGrid,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getConfig, saveConfig } from "../models/giftTiers.server";
import { getUsageStats } from "../models/billing.server";
import { prisma } from "../db.server";
import type { GiftTiersConfig, GiftTiersFormData, CampaignType } from "../types/gift-tiers";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  // Get legacy config for backward compatibility
  const config = await getConfig(admin);
  
  // Get all campaigns from database
  const campaigns = await prisma.campaign.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  // Get usage stats
  const usageStats = await getUsageStats(session.shop);

  return json({ 
    config, 
    campaigns: campaigns.map(c => ({
      ...c,
      config: JSON.parse(c.config),
    })),
    usageStats 
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "save") {
    try {
      const enabled = formData.get("enabled") === "true";
      const threshold = formData.get("threshold") as string;
      const giftVariantId = formData.get("giftVariantId") as string;
      const title = formData.get("title") as string;

      // Validation
      const errors: Record<string, string> = {};

      if (!title.trim()) {
        errors.title = "Campaign title is required";
      }

      if (!giftVariantId.trim()) {
        errors.giftVariantId = "Gift variant ID is required";
      }

      const thresholdValue = parseFloat(threshold);
      if (isNaN(thresholdValue) || thresholdValue <= 0) {
        errors.threshold = "Threshold must be a positive number";
      }

      if (Object.keys(errors).length > 0) {
        return json({ errors, success: false });
      }

      const config: GiftTiersConfig = {
        enabled,
        thresholdCents: Math.round(thresholdValue * 100),
        giftVariantId: giftVariantId.trim(),
        title: title.trim(),
      };

      await saveConfig(admin, config);

      return json({
        success: true,
        message: "Campaign configuration saved successfully!",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      return json({
        success: false,
        message: "Failed to save configuration. Please try again.",
      });
    }
  }

  if (action === "test") {
    try {
      const giftVariantId = formData.get("giftVariantId") as string;

      if (!giftVariantId.trim()) {
        return json({
          success: false,
          message: "Please enter a gift variant ID to test",
        });
      }

      // Import the validation function
      const { validateGiftVariant } = await import(
        "../models/giftTiers.server"
      );
      const isValid = await validateGiftVariant(admin, giftVariantId.trim());

      if (isValid) {
        return json({
          success: true,
          message: "Gift variant is valid and exists in your store!",
        });
      } else {
        return json({
          success: false,
          message: "Gift variant not found. Please check the variant ID.",
        });
      }
    } catch (error) {
      console.error("Error testing variant:", error);
      return json({
        success: false,
        message: "Failed to validate gift variant. Please try again.",
      });
    }
  }

  return json({ success: false, message: "Invalid action" });
};

export default function CampaignsIndex() {
  const { config, campaigns, usageStats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [formData, setFormData] = useState<GiftTiersFormData>({
    enabled: config?.enabled ?? false,
    threshold: config ? (config.thresholdCents / 100).toString() : "",
    giftVariantId: config?.giftVariantId ?? "",
    title: config?.title ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback(
    (field: keyof GiftTiersFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors],
  );

  const handleSave = useCallback(() => {
    const form = new FormData();
    form.append("_action", "save");
    form.append("enabled", formData.enabled.toString());
    form.append("threshold", formData.threshold);
    form.append("giftVariantId", formData.giftVariantId);
    form.append("title", formData.title);

    submit(form, { method: "post" });
  }, [formData, submit]);

  const handleTest = useCallback(() => {
    const form = new FormData();
    form.append("_action", "test");
    form.append("giftVariantId", formData.giftVariantId);

    submit(form, { method: "post" });
  }, [formData.giftVariantId, submit]);

  const isLoading = navigation.state === "submitting";
  const displayErrors = actionData?.errors || errors;

  const getCampaignTypeLabel = (type: CampaignType) => {
    switch (type) {
      case "free_gift": return "Free Gift";
      case "bxgy": return "Buy X Get Y";
      case "volume_discount": return "Volume Discount";
      default: return type;
    }
  };

  const getCampaignTypeBadge = (type: CampaignType) => {
    switch (type) {
      case "free_gift": return { tone: "success" as const, label: "Free Gift" };
      case "bxgy": return { tone: "info" as const, label: "BXGY" };
      case "volume_discount": return { tone: "attention" as const, label: "Volume" };
      default: return { tone: "info" as const, label: type };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return { tone: "success" as const, label: "Active" };
      case "paused": return { tone: "warning" as const, label: "Paused" };
      case "archived": return { tone: "critical" as const, label: "Archived" };
      default: return { tone: "info" as const, label: status };
    }
  };

  const campaignRows = campaigns.map((campaign) => [
    campaign.title,
    <Badge key="type" {...getCampaignTypeBadge(campaign.type)} />,
    <Badge key="status" {...getStatusBadge(campaign.status)} />,
    new Date(campaign.createdAt).toLocaleDateString(),
    <ButtonGroup key="actions">
      <Button size="slim" variant="plain">
        Edit
      </Button>
      <Button size="slim" variant="plain" tone="critical">
        Delete
      </Button>
    </ButtonGroup>,
  ]);

  return (
    <Page>
      <TitleBar title="Campaigns" />

      {actionData?.message && (
        <Layout>
          <Layout.Section>
            <Banner
              title={actionData.success ? "Success" : "Error"}
              tone={actionData.success ? "success" : "critical"}
              onDismiss={() => {}}
            >
              <p>{actionData.message}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      )}

      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Campaigns ({campaigns.length})
                </Text>
                <ButtonGroup>
                  <Button url="/app/campaigns/new" variant="primary">
                    Create Campaign
                  </Button>
                </ButtonGroup>
              </InlineStack>

              {campaigns.length === 0 ? (
                <EmptyState
                  heading="No campaigns yet"
                  action={{
                    content: "Create your first campaign",
                    url: "/app/campaigns/new",
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Create campaigns to offer free gifts, BXGY deals, and volume discounts to your customers.</p>
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text"]}
                  headings={["Title", "Type", "Status", "Created", "Actions"]}
                  rows={campaignRows}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Campaign Usage
              </Text>
              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" tone="subdued">Active Campaigns</Text>
                  <Text as="p" variant="headingLg">
                    {campaigns.filter(c => c.status === "active").length} / {usageStats.campaigns.limit === Infinity ? '∞' : usageStats.campaigns.limit}
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" tone="subdued">Total Campaigns</Text>
                  <Text as="p" variant="headingLg">{campaigns.length}</Text>
                </BlockStack>
              </InlineGrid>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Campaign Types
              </Text>
              
              <BlockStack gap="200">
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Free Gift</Text>
                  <Badge tone="success">Threshold-based</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Give customers a free product when they spend over a certain amount.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Buy X Get Y</Text>
                  <Badge tone="info">Quantity-based</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Offer discounts when customers buy a minimum quantity of specific products.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Volume Discounts</Text>
                  <Badge tone="attention">Tiered pricing</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Progressive discounts based on quantity purchased.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
