import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
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
import type { 
  CampaignType, 
  FreeGiftFormData, 
  BXGYFormData, 
  VolumeDiscountFormData 
} from "../types/gift-tiers";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Check if user can create more campaigns
  const canCreate = await canCreateCampaign(session.shop);
  
  return json({ canCreate });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "create") {
    try {
      const campaignType = formData.get("campaignType") as CampaignType;
      const title = formData.get("title") as string;
      const enabled = formData.get("enabled") === "true";

      // Check billing limits
      const canCreate = await canCreateCampaign(session.shop);
      if (!canCreate) {
        return json({
          success: false,
          message: "You've reached your campaign limit. Please upgrade your plan.",
        });
      }

      // Validate common fields
      const errors: Record<string, string> = {};
      if (!title.trim()) {
        errors.title = "Campaign title is required";
      }

      if (Object.keys(errors).length > 0) {
        return json({ errors, success: false });
      }

      // Parse campaign-specific configuration
      let config: any = { enabled, title: title.trim() };

      switch (campaignType) {
        case "free_gift": {
          const threshold = parseFloat(formData.get("threshold") as string);
          const giftVariantId = formData.get("giftVariantId") as string;

          if (isNaN(threshold) || threshold <= 0) {
            errors.threshold = "Threshold must be a positive number";
          }
          if (!giftVariantId.trim()) {
            errors.giftVariantId = "Gift variant ID is required";
          }

          config = {
            ...config,
            thresholdCents: Math.round(threshold * 100),
            giftVariantId: giftVariantId.trim(),
          };
          break;
        }

        case "bxgy": {
          const buyMinQty = parseInt(formData.get("buyMinQty") as string);
          const getVariantIds = (formData.get("getVariantIds") as string)
            .split(",")
            .map(id => id.trim())
            .filter(id => id);
          const discountType = formData.get("discountType") as "FREE" | "PERCENT";
          const percentOff = parseFloat(formData.get("percentOff") as string);

          if (isNaN(buyMinQty) || buyMinQty <= 0) {
            errors.buyMinQty = "Buy quantity must be a positive number";
          }
          if (getVariantIds.length === 0) {
            errors.getVariantIds = "At least one gift variant ID is required";
          }
          if (discountType === "PERCENT" && (isNaN(percentOff) || percentOff <= 0 || percentOff > 100)) {
            errors.percentOff = "Percentage must be between 1 and 100";
          }

          config = {
            ...config,
            buyMinQty,
            getVariantIds,
            discountType,
            ...(discountType === "PERCENT" && { percentOff }),
          };
          break;
        }

        case "volume_discount": {
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

          if (tiers.length === 0) {
            errors.tiers = "At least one discount tier is required";
          }

          config = {
            ...config,
            targetProducts,
            tiers,
          };
          break;
        }
      }

      if (Object.keys(errors).length > 0) {
        return json({ errors, success: false });
      }

      // Create campaign in database
      const campaign = await prisma.campaign.create({
        data: {
          shop: session.shop,
          type: campaignType,
          title: title.trim(),
          status: enabled ? "active" : "paused",
          config: JSON.stringify(config),
        },
      });

      return json({
        success: true,
        message: "Campaign created successfully!",
        campaignId: campaign.id,
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      return json({
        success: false,
        message: "Failed to create campaign. Please try again.",
      });
    }
  }

  return json({ success: false, message: "Invalid action" });
};

export default function NewCampaign() {
  const { canCreate } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [campaignType, setCampaignType] = useState<CampaignType>("free_gift");
  const [formData, setFormData] = useState<FreeGiftFormData | BXGYFormData | VolumeDiscountFormData>({
    enabled: true,
    threshold: "",
    giftVariantId: "",
    title: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tierCount, setTierCount] = useState(1);

  const campaignTypeOptions = [
    { label: "Free Gift with Purchase", value: "free_gift" },
    { label: "Buy X Get Y (BXGY)", value: "bxgy" },
    { label: "Volume Discounts", value: "volume_discount" },
  ];

  const handleCampaignTypeChange = useCallback((value: string) => {
    setCampaignType(value as CampaignType);
    setFormData({
      enabled: true,
      title: "",
      ...(value === "free_gift" ? { threshold: "", giftVariantId: "" } : {}),
      ...(value === "bxgy" ? { buyMinQty: "2", getVariantIds: "", discountType: "FREE", percentOff: "" } : {}),
      ...(value === "volume_discount" ? { targetProducts: "", tiers: [{ quantity: "2", discountPercentage: "10" }] } : {}),
    });
    setErrors({});
  }, []);

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
    setFormData((prev) => {
      if (prev.type === "volume_discount") {
        const newTiers = [...prev.tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        return { ...prev, tiers: newTiers };
      }
      return prev;
    });
  }, []);

  const addTier = useCallback(() => {
    setTierCount(prev => prev + 1);
    setFormData((prev) => {
      if (prev.type === "volume_discount") {
        return {
          ...prev,
          tiers: [...prev.tiers, { quantity: "", discountPercentage: "" }],
        };
      }
      return prev;
    });
  }, []);

  const removeTier = useCallback((index: number) => {
    if (tierCount > 1) {
      setTierCount(prev => prev - 1);
      setFormData((prev) => {
        if (prev.type === "volume_discount") {
          const newTiers = prev.tiers.filter((_, i) => i !== index);
          return { ...prev, tiers: newTiers };
        }
        return prev;
      });
    }
  }, [tierCount]);

  const handleCreate = useCallback(() => {
    const form = new FormData();
    form.append("_action", "create");
    form.append("campaignType", campaignType);
    form.append("title", formData.title);
    form.append("enabled", formData.enabled.toString());

    // Add campaign-specific fields
    if (campaignType === "free_gift") {
      form.append("threshold", formData.threshold);
      form.append("giftVariantId", formData.giftVariantId);
    } else if (campaignType === "bxgy") {
      form.append("buyMinQty", formData.buyMinQty);
      form.append("getVariantIds", formData.getVariantIds);
      form.append("discountType", formData.discountType);
      if (formData.discountType === "PERCENT") {
        form.append("percentOff", formData.percentOff);
      }
    } else if (campaignType === "volume_discount") {
      form.append("targetProducts", formData.targetProducts);
      form.append("tierCount", formData.tiers.length.toString());
      formData.tiers.forEach((tier, index) => {
        form.append(`tier_${index}_quantity`, tier.quantity);
        form.append(`tier_${index}_discount`, tier.discountPercentage);
      });
    }

    submit(form, { method: "post" });
  }, [campaignType, formData, submit]);

  const isLoading = navigation.state === "submitting";
  const displayErrors = actionData?.errors || errors;

  if (!canCreate) {
    return (
      <Page>
        <TitleBar title="Create New Campaign" />
        <Layout>
          <Layout.Section>
            <Banner tone="warning">
              <p>You've reached your campaign limit. Please upgrade your plan to create more campaigns.</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar title="Create New Campaign" />
      
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
              <Text as="h2" variant="headingMd">
                Campaign Configuration
              </Text>

              <FormLayout>
                <Select
                  label="Campaign Type"
                  options={campaignTypeOptions}
                  value={campaignType}
                  onChange={handleCampaignTypeChange}
                />

                <Checkbox
                  label="Enable Campaign"
                  checked={formData.enabled}
                  onChange={(checked) => handleFieldChange("enabled", checked)}
                />

                <TextField
                  label="Campaign Title"
                  value={formData.title}
                  onChange={(value) => handleFieldChange("title", value)}
                  error={displayErrors.title}
                  placeholder="e.g., Free Gift Over $50"
                  autoComplete="off"
                />

                {/* Free Gift Configuration */}
                {campaignType === "free_gift" && (
                  <>
                    <TextField
                      label="Threshold ($)"
                      type="number"
                      value={formData.threshold}
                      onChange={(value) => handleFieldChange("threshold", value)}
                      error={displayErrors.threshold}
                      placeholder="50.00"
                      prefix="$"
                      autoComplete="off"
                    />

                    <TextField
                      label="Gift Product Variant ID"
                      value={formData.giftVariantId}
                      onChange={(value) => handleFieldChange("giftVariantId", value)}
                      error={displayErrors.giftVariantId}
                      placeholder="gid://shopify/ProductVariant/123456789"
                      helpText="Find this in your product's variant details in Shopify Admin"
                      autoComplete="off"
                    />
                  </>
                )}

                {/* BXGY Configuration */}
                {campaignType === "bxgy" && (
                  <>
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
                  </>
                )}

                {/* Volume Discount Configuration */}
                {campaignType === "volume_discount" && (
                  <>
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
                            disabled={tierCount <= 1}
                          >
                            Remove
                          </Button>
                        </InlineStack>
                      </InlineGrid>
                    ))}

                    <Button variant="secondary" onClick={addTier}>
                      Add Tier
                    </Button>
                  </>
                )}
              </FormLayout>

              <InlineStack gap="200">
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isLoading}
                  disabled={!formData.title.trim()}
                >
                  Create Campaign
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
                Campaign Types
              </Text>
              
              <BlockStack gap="200">
                <InlineStack gap="200" align="space-between">
                  <Text as="p" variant="bodyMd">Free Gift</Text>
                  <Badge tone="info">Threshold-based</Badge>
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
                  <Badge tone="info">Tiered pricing</Badge>
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
