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

  if (action === "toggle") {
    try {
      const campaignId = formData.get("campaignId") as string;
      const currentStatus = formData.get("currentStatus") as string;
      const newStatus = currentStatus === "active" ? "paused" : "active";

      // If activating, check if they can activate
      if (newStatus === "active") {
        const { canActivateCampaign } = await import("../models/billing.server");
        const canActivate = await canActivateCampaign(session.shop);
        
        if (!canActivate) {
          return json({
            success: false,
            message: "You've reached your active campaign limit. Please pause another campaign or upgrade your plan.",
          });
        }
      }

      await prisma.campaign.update({
        where: { id: campaignId, shop: session.shop },
        data: { status: newStatus },
      });

      return json({
        success: true,
        message: `Campaign ${newStatus === "active" ? "activated" : "paused"} successfully!`,
      });
    } catch (error) {
      console.error("Error toggling campaign:", error);
      return json({
        success: false,
        message: "Failed to update campaign status. Please try again.",
      });
    }
  }

  if (action === "delete") {
    try {
      const campaignId = formData.get("campaignId") as string;

      await prisma.campaign.delete({
        where: { id: campaignId, shop: session.shop },
      });

      return json({
        success: true,
        message: "Campaign deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return json({
        success: false,
        message: "Failed to delete campaign. Please try again.",
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
  const [showBanner, setShowBanner] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused" | "archived">("all");

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

  const handleToggle = useCallback((campaignId: string, currentStatus: string) => {
    const form = new FormData();
    form.append("_action", "toggle");
    form.append("campaignId", campaignId);
    form.append("currentStatus", currentStatus);
    submit(form, { method: "post" });
  }, [submit]);

  const handleDelete = useCallback((campaignId: string) => {
    if (confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      const form = new FormData();
      form.append("_action", "delete");
      form.append("campaignId", campaignId);
      submit(form, { method: "post" });
    }
  }, [submit]);

  const handleDuplicate = useCallback((campaign: any) => {
    const form = new FormData();
    form.append("_action", "create");
    form.append("campaignType", campaign.type);
    form.append("title", `${campaign.title} (Copy)`);
    form.append("enabled", "false"); // Duplicates start paused
    
    // Copy campaign-specific fields
    const config = campaign.config;
    if (campaign.type === "free_gift") {
      form.append("threshold", (config.thresholdCents / 100).toString());
      form.append("giftVariantId", config.giftVariantId);
    } else if (campaign.type === "bxgy") {
      form.append("buyMinQty", config.buyMinQty.toString());
      form.append("getVariantIds", config.getVariantIds.join(","));
      form.append("discountType", config.discountType);
      if (config.percentOff) {
        form.append("percentOff", config.percentOff.toString());
      }
    } else if (campaign.type === "volume_discount") {
      form.append("targetProducts", config.targetProducts.join(","));
      form.append("tierCount", config.tiers.length.toString());
      config.tiers.forEach((tier: any, index: number) => {
        form.append(`tier_${index}_quantity`, tier.quantity.toString());
        form.append(`tier_${index}_discount`, tier.discountPercentage.toString());
      });
    }
    
    submit(form, { method: "post" });
  }, [submit]);

  // Auto-dismiss success banners
  const [, startTransition] = useState(false);
  if (actionData?.success && showBanner) {
    setTimeout(() => setShowBanner(false), 5000);
  }

  // Filter campaigns by status
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filterStatus === "all") return true;
    return campaign.status === filterStatus;
  });

  const getCampaignSummary = (campaign: any) => {
    const config = campaign.config;
    if (campaign.type === "free_gift") {
      return `Free gift over $${(config.thresholdCents / 100).toFixed(2)}`;
    } else if (campaign.type === "bxgy") {
      return `Buy ${config.buyMinQty}, get ${config.discountType === "FREE" ? "free" : `${config.percentOff}% off`}`;
    } else if (campaign.type === "volume_discount") {
      return `${config.tiers.length} tier${config.tiers.length > 1 ? "s" : ""}`;
    }
    return "";
  };

  const campaignRows = filteredCampaigns.map((campaign) => [
    <BlockStack key="title" gap="100">
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {campaign.title}
      </Text>
      <Text as="span" variant="bodySm" tone="subdued">
        {getCampaignSummary(campaign)}
      </Text>
    </BlockStack>,
    <Badge key="type" {...getCampaignTypeBadge(campaign.type)} />,
    <Badge key="status" {...getStatusBadge(campaign.status)} />,
    new Date(campaign.createdAt).toLocaleDateString(),
    <ButtonGroup key="actions">
      {campaign.status !== "archived" && (
        <Button 
          size="slim" 
          variant="plain"
          onClick={() => handleToggle(campaign.id, campaign.status)}
          loading={navigation.state === "submitting"}
        >
          {campaign.status === "active" ? "Pause" : "Activate"}
        </Button>
      )}
      <Button 
        size="slim" 
        variant="plain"
        onClick={() => handleDuplicate(campaign)}
      >
        Duplicate
      </Button>
      <Button 
        size="slim" 
        variant="plain" 
        tone="critical"
        onClick={() => handleDelete(campaign.id)}
      >
        Delete
      </Button>
    </ButtonGroup>,
  ]);

  return (
    <Page>
      <TitleBar title="Campaigns" />

      {actionData?.message && showBanner && (
        <Layout>
          <Layout.Section>
            <Banner
              title={actionData.success ? "Success" : "Error"}
              tone={actionData.success ? "success" : "critical"}
              onDismiss={() => setShowBanner(false)}
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
                  Campaigns ({filteredCampaigns.length})
                </Text>
                <ButtonGroup>
                  <Button url="/app/campaigns/new" variant="primary">
                    Create Campaign
                  </Button>
                </ButtonGroup>
              </InlineStack>

              {/* Filter Tabs */}
              <InlineStack gap="200">
                <Button
                  variant={filterStatus === "all" ? "primary" : "secondary"}
                  size="slim"
                  onClick={() => setFilterStatus("all")}
                >
                  All ({campaigns.length})
                </Button>
                <Button
                  variant={filterStatus === "active" ? "primary" : "secondary"}
                  size="slim"
                  onClick={() => setFilterStatus("active")}
                >
                  Active ({campaigns.filter(c => c.status === "active").length})
                </Button>
                <Button
                  variant={filterStatus === "paused" ? "primary" : "secondary"}
                  size="slim"
                  onClick={() => setFilterStatus("paused")}
                >
                  Paused ({campaigns.filter(c => c.status === "paused").length})
                </Button>
                <Button
                  variant={filterStatus === "archived" ? "primary" : "secondary"}
                  size="slim"
                  onClick={() => setFilterStatus("archived")}
                >
                  Archived ({campaigns.filter(c => c.status === "archived").length})
                </Button>
              </InlineStack>

              {filteredCampaigns.length === 0 ? (
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
