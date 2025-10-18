import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
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
  Select,
  ButtonGroup,
  Divider,
  InlineGrid,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { canCreateCampaign } from "../models/billing.server";
import type { BXGYFormData } from "../types/gift-tiers";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Users can always create campaigns
  const canCreate = true;
  
  // Check if they can activate a campaign
  const { canActivateCampaign } = await import("../../models/billing.server");
  const canActivate = await canActivateCampaign(session.shop);
  
  // Get current active campaigns count
  const activeCampaignsCount = await prisma.campaign.count({
    where: { shop: session.shop, status: "active" },
  });
  
  return json({ canCreate, canActivate, activeCampaignsCount });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "create") {
    try {
      const title = formData.get("title") as string;
      const enabled = formData.get("enabled") === "true";
      const endDateStr = formData.get("endDate") as string | null;
      const buyMinQty = parseInt(formData.get("buyMinQty") as string);
      const getVariantIds = (formData.get("getVariantIds") as string)
        .split(",")
        .map(id => id.trim())
        .filter(id => id);
      const discountType = formData.get("discountType") as "FREE" | "PERCENT";
      const percentOff = parseFloat(formData.get("percentOff") as string);

      // Check if they can activate this campaign
      if (enabled) {
        const { canActivateCampaign } = await import("../../models/billing.server");
        const canActivate = await canActivateCampaign(session.shop);
        
        if (!canActivate) {
          return json({
            success: false,
            message: "You've reached your active campaign limit. Please pause another campaign or upgrade your plan.",
          });
        }
      }

      // Validate fields
      const errors: Record<string, string> = {};
      if (!title.trim()) {
        errors.title = "Campaign title is required";
      }
      if (isNaN(buyMinQty) || buyMinQty <= 0) {
        errors.buyMinQty = "Buy quantity must be a positive number";
      }
      if (getVariantIds.length === 0) {
        errors.getVariantIds = "At least one gift variant ID is required";
      }
      if (discountType === "PERCENT" && (isNaN(percentOff) || percentOff <= 0 || percentOff > 100)) {
        errors.percentOff = "Percentage must be between 1 and 100";
      }

      // Validate end date if provided
      let endDate: Date | null = null;
      if (endDateStr) {
        endDate = new Date(endDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (endDate < today) {
          errors.endDate = "End date must be today or in the future";
        }
      }

      if (Object.keys(errors).length > 0) {
        return json({ errors, success: false });
      }

      // Create campaign configuration
      const config = {
        enabled,
        title: title.trim(),
        buyMinQty,
        getVariantIds,
        discountType,
        ...(discountType === "PERCENT" && { percentOff }),
      };

      // Create campaign in database
      const campaign = await prisma.campaign.create({
        data: {
          shop: session.shop,
          type: "bxgy",
          title: title.trim(),
          status: enabled ? "active" : "paused",
          config: JSON.stringify(config),
          ...(endDate && { endDate }),
        },
      });

      return json({
        success: true,
        message: "BXGY campaign created successfully!",
        campaignId: campaign.id,
      });
    } catch (error) {
      console.error("Error creating BXGY campaign:", error);
      return json({
        success: false,
        message: "Failed to create campaign. Please try again.",
      });
    }
  }

  return json({ success: false, message: "Invalid action" });
};

export default function NewBXGYCampaign() {
  const { canCreate, canActivate, activeCampaignsCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [formData, setFormData] = useState<BXGYFormData>({
    enabled: canActivate,
    title: "",
    buyMinQty: "2",
    getVariantIds: "",
    discountType: "FREE",
    percentOff: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBanner, setShowBanner] = useState(true);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");

  // Auto-dismiss success banners after 5 seconds
  if (actionData?.success && showBanner) {
    setTimeout(() => setShowBanner(false), 5000);
  }

  const handleFieldChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors],
  );

  const handleCreate = useCallback(() => {
    const form = new FormData();
    form.append("_action", "create");
    form.append("title", formData.title);
    form.append("enabled", formData.enabled.toString());
    form.append("buyMinQty", formData.buyMinQty);
    form.append("getVariantIds", formData.getVariantIds);
    form.append("discountType", formData.discountType);
    
    if (formData.discountType === "PERCENT") {
      form.append("percentOff", formData.percentOff);
    }
    
    // Add end date if enabled
    if (hasEndDate && endDate) {
      form.append("endDate", endDate);
    }

    submit(form, { method: "post" });
  }, [formData, submit, hasEndDate, endDate]);

  const isLoading = navigation.state === "submitting";
  const displayErrors = actionData?.errors || errors;

  return (
    <Page>
      <TitleBar title="Create BXGY Campaign" />
      
      {!canActivate && formData.enabled && (
        <Layout>
          <Layout.Section>
            <Banner tone="warning">
              <p>
                You have {activeCampaignsCount} active campaign(s). To activate this campaign, 
                please pause another campaign first or save this one as paused.
              </p>
            </Banner>
          </Layout.Section>
        </Layout>
      )}

      {actionData?.message && showBanner && (
        <Layout>
          <Layout.Section>
            <Banner
              title={actionData.success ? "Success" : "Error"}
              tone={actionData.success ? "success" : "critical"}
              onDismiss={() => setShowBanner(false)}
            >
              <p>{actionData.message}</p>
              {actionData.success && actionData.campaignId && (
                <Button url="/app/campaigns" variant="plain">
                  View all campaigns
                </Button>
              )}
            </Banner>
          </Layout.Section>
        </Layout>
      )}

      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Buy X Get Y Campaign Configuration
              </Text>

              <FormLayout>
                <Checkbox
                  label="Enable Campaign"
                  checked={formData.enabled}
                  onChange={(checked) => handleFieldChange("enabled", checked)}
                  helpText={
                    !canActivate && formData.enabled
                      ? "⚠️ You've reached your active campaign limit. This campaign will be saved as paused."
                      : formData.enabled
                      ? "Campaign will be active immediately after creation."
                      : "Campaign will be saved as paused. You can activate it later."
                  }
                />

                <Checkbox
                  label="Set end date"
                  checked={hasEndDate}
                  onChange={setHasEndDate}
                  helpText={
                    hasEndDate
                      ? "Campaign will pause automatically on the selected date."
                      : "Campaign runs indefinitely until manually paused."
                  }
                />

                {hasEndDate && (
                  <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={setEndDate}
                    error={displayErrors.endDate}
                    helpText="Campaign will automatically pause at midnight on this date"
                    autoComplete="off"
                  />
                )}

                <TextField
                  label="Campaign Title"
                  value={formData.title}
                  onChange={(value) => handleFieldChange("title", value)}
                  error={displayErrors.title}
                  placeholder="e.g., Buy 2 Get 1 Free"
                  autoComplete="off"
                />

                <TextField
                  label="Buy Quantity"
                  type="number"
                  value={formData.buyMinQty}
                  onChange={(value) => handleFieldChange("buyMinQty", value)}
                  error={displayErrors.buyMinQty}
                  placeholder="2"
                  helpText="Minimum quantity customer must buy"
                  autoComplete="off"
                />

                <TextField
                  label="Get Variant IDs (comma-separated)"
                  value={formData.getVariantIds}
                  onChange={(value) => handleFieldChange("getVariantIds", value)}
                  error={displayErrors.getVariantIds}
                  placeholder="gid://shopify/ProductVariant/123456789, gid://shopify/ProductVariant/987654321"
                  helpText="Product variants that will be discounted"
                  autoComplete="off"
                />

                <Select
                  label="Discount Type"
                  options={[
                    { label: "Free", value: "FREE" },
                    { label: "Percentage Off", value: "PERCENT" },
                  ]}
                  value={formData.discountType}
                  onChange={(value) => handleFieldChange("discountType", value)}
                />

                {formData.discountType === "PERCENT" && (
                  <TextField
                    label="Percentage Off"
                    type="number"
                    value={formData.percentOff}
                    onChange={(value) => handleFieldChange("percentOff", value)}
                    error={displayErrors.percentOff}
                    placeholder="50"
                    suffix="%"
                    autoComplete="off"
                  />
                )}
              </FormLayout>

              <InlineStack gap="200">
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isLoading}
                  disabled={!formData.title.trim()}
                >
                  Create BXGY Campaign
                </Button>

                <Button url="/app/campaigns">
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                BXGY Campaign Info
              </Text>
              
              <BlockStack gap="200">
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Buy X Get Y</Text>
                  <Badge tone="info">Quantity-based</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Offer discounts when customers buy a minimum quantity of specific products.
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                <Text as="h4" variant="headingSm">Examples</Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  • Buy 2 Get 1 Free
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  • Buy 3 Get 50% Off
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  • Buy 4 Get 2 Free
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
