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
  CalloutCard,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { canActivateCampaign } from "../models/billing.server";
import type { VolumeDiscountFormData } from "../types/gift-tiers";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    throw new Response("Campaign ID is required", { status: 400 });
  }

  // Get campaign
  const campaign = await prisma.campaign.findFirst({
    where: { 
      id, 
      shop: session.shop,
      type: "volume_discount"
    },
  });

  if (!campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Check if they can activate campaigns
  const canActivate = await canActivateCampaign(session.shop);
  
  // Get current active campaigns count
  const activeCampaignsCount = await prisma.campaign.count({
    where: { shop: session.shop, status: "active" },
  });

  return json({ 
    campaign, 
    canActivate, 
    activeCampaignsCount 
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (!id) {
    return json({ success: false, message: "Campaign ID is required" });
  }

  if (action === "update") {
    try {
      const title = formData.get("title") as string;
      const enabled = formData.get("enabled") === "true";
      const endDateStr = formData.get("endDate") as string | null;
      const targetProducts = (formData.get("targetProducts") as string)
        .split(",")
        .map(id => id.trim())
        .filter(id => id);
      
      // Parse tiers
      const tiers = [];
      const tierCount = parseInt(formData.get("tierCount") as string) || 0;
      
      for (let i = 0; i < tierCount; i++) {
        const quantity = parseInt(formData.get(`tier_${i}_quantity`) as string);
        const discountPercentage = parseFloat(formData.get(`tier_${i}_discount`) as string);
        
        if (!isNaN(quantity) && !isNaN(discountPercentage) && quantity > 0 && discountPercentage > 0) {
          tiers.push({ quantity, discountPercentage });
        }
      }

      // Check if they can activate this campaign
      if (enabled) {
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
      if (tiers.length === 0) {
        errors.tiers = "At least one discount tier is required";
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
        targetProducts,
        tiers,
      };

      // Update campaign in database
      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          title: title.trim(),
          status: enabled ? "active" : "paused",
          config: JSON.stringify(config),
          ...(endDate && { endDate }),
        },
      });

      return json({
        success: true,
        message: "Volume discount campaign updated successfully!",
        campaign: updatedCampaign,
      });
    } catch (error) {
      console.error("Error updating volume discount campaign:", error);
      return json({
        success: false,
        message: "Failed to update campaign. Please try again.",
      });
    }
  }

  if (action === "delete") {
    try {
      await prisma.campaign.delete({
        where: { id },
      });

      return redirect("/app/campaigns");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return json({
        success: false,
        message: "Failed to delete campaign. Please try again.",
      });
    }
  }

  return json({ success: false, message: "Invalid action" });
};

export default function VolumeDiscountCampaignDetails() {
  const { campaign, canActivate, activeCampaignsCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const config = JSON.parse(campaign.config) as VolumeDiscountFormData;

  const [formData, setFormData] = useState<VolumeDiscountFormData>({
    enabled: campaign.status === "active",
    title: campaign.title,
    targetProducts: config.targetProducts?.join(", ") || "",
    tiers: config.tiers || [{ quantity: "2", discountPercentage: "10" }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBanner, setShowBanner] = useState(true);
  const [hasEndDate, setHasEndDate] = useState(!!campaign.endDate);
  const [endDate, setEndDate] = useState(
    campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : ""
  );

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

  const handleTierChange = useCallback((index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      if (prev.tiers && Array.isArray(prev.tiers)) {
        const newTiers = [...prev.tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        return { ...prev, tiers: newTiers };
      }
      return prev;
    });
  }, []);

  const addTier = useCallback(() => {
    setFormData((prev: any) => {
      if (prev.tiers && Array.isArray(prev.tiers)) {
        return {
          ...prev,
          tiers: [...prev.tiers, { quantity: "", discountPercentage: "" }],
        };
      }
      return prev;
    });
  }, []);

  const removeTier = useCallback((index: number) => {
    if (formData.tiers.length > 1) {
      setFormData((prev: any) => {
        if (prev.tiers && Array.isArray(prev.tiers)) {
          const newTiers = prev.tiers.filter((_: any, i: number) => i !== index);
          return { ...prev, tiers: newTiers };
        }
        return prev;
      });
    }
  }, [formData.tiers.length]);

  const handleUpdate = useCallback(() => {
    const form = new FormData();
    form.append("_action", "update");
    form.append("title", formData.title);
    form.append("enabled", formData.enabled.toString());
    form.append("targetProducts", formData.targetProducts);
    form.append("tierCount", formData.tiers.length.toString());
    formData.tiers.forEach((tier, index) => {
      form.append(`tier_${index}_quantity`, tier.quantity);
      form.append(`tier_${index}_discount`, tier.discountPercentage);
    });
    
    // Add end date if enabled
    if (hasEndDate && endDate) {
      form.append("endDate", endDate);
    }

    submit(form, { method: "post" });
  }, [formData, submit, hasEndDate, endDate]);

  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      const form = new FormData();
      form.append("_action", "delete");
      submit(form, { method: "post" });
    }
  }, [submit]);

  const isLoading = navigation.state === "submitting";
  const displayErrors = actionData?.errors || errors;

  return (
    <Page>
      <TitleBar title={`Edit Volume Discount Campaign: ${campaign.title}`} />
      
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
            </Banner>
          </Layout.Section>
        </Layout>
      )}

      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Volume Discount Campaign Configuration
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
                      ? "Campaign will be active immediately after saving."
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
                  placeholder="e.g., Volume Discounts"
                  autoComplete="off"
                />

                <TextField
                  label="Target Products (comma-separated IDs)"
                  value={formData.targetProducts}
                  onChange={(value) => handleFieldChange("targetProducts", value)}
                  placeholder="gid://shopify/Product/123456789, gid://shopify/ProductVariant/987654321"
                  helpText="Leave empty to apply to all products"
                  autoComplete="off"
                />

                <Divider />

                <Text as="h3" variant="headingSm">Discount Tiers</Text>
                
                {formData.tiers.map((tier, index) => (
                  <InlineGrid key={index} columns={{ xs: 1, sm: 3 }} gap="300">
                    <TextField
                      label="Quantity"
                      type="number"
                      value={tier.quantity}
                      onChange={(value) => handleTierChange(index, "quantity", value)}
                      placeholder="2"
                      autoComplete="off"
                    />
                    <TextField
                      label="Discount %"
                      type="number"
                      value={tier.discountPercentage}
                      onChange={(value) => handleTierChange(index, "discountPercentage", value)}
                      placeholder="10"
                      suffix="%"
                      autoComplete="off"
                    />
                    <InlineStack align="end">
                      <Button
                        variant="plain"
                        tone="critical"
                        onClick={() => removeTier(index)}
                        disabled={formData.tiers.length <= 1}
                      >
                        Remove
                      </Button>
                    </InlineStack>
                  </InlineGrid>
                ))}

                <Button variant="secondary" onClick={addTier}>
                  Add Tier
                </Button>
              </FormLayout>

              <InlineStack gap="200">
                <Button
                  variant="primary"
                  onClick={handleUpdate}
                  loading={isLoading}
                  disabled={!formData.title.trim()}
                >
                  Update Campaign
                </Button>

                <Button url="/app/campaigns">
                  Cancel
                </Button>

                <Button
                  variant="plain"
                  tone="critical"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete Campaign
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Campaign Details
              </Text>
              
              <BlockStack gap="200">
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Status</Text>
                  <Badge tone={campaign.status === "active" ? "success" : "info"}>
                    {campaign.status}
                  </Badge>
                </InlineStack>
                
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Type</Text>
                  <Badge tone="info">Volume Discount</Badge>
                </InlineStack>
                
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Created</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </Text>
                </InlineStack>
              </BlockStack>

              <Divider />

              <CalloutCard
                title="Campaign Preview"
                illustration="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
              >
                <BlockStack gap="200">
                  {formData.tiers.map((tier, index) => (
                    <Text key={index} as="p" variant="bodyMd">
                      Buy {tier.quantity}+ get {tier.discountPercentage}% off
                    </Text>
                  ))}
                </BlockStack>
              </CalloutCard>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
