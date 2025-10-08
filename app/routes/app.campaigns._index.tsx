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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getConfig, saveConfig } from "../models/giftTiers.server";
import type { GiftTiersConfig, GiftTiersFormData } from "../types/gift-tiers";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const config = await getConfig(admin);

  return json({ config });
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
  const { config } = useLoaderData<typeof loader>();
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

  return (
    <Page>
      <TitleBar title="Free Gift Tiers Campaign" />

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
                <Checkbox
                  label="Enable Free Gift Campaign"
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
                  onChange={(value) =>
                    handleFieldChange("giftVariantId", value)
                  }
                  error={displayErrors.giftVariantId}
                  placeholder="gid://shopify/ProductVariant/123456789"
                  helpText="Find this in your product's variant details in Shopify Admin"
                  autoComplete="off"
                />
              </FormLayout>

              <InlineStack gap="200">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={
                    isLoading && navigation.formData?.get("_action") === "save"
                  }
                  disabled={
                    !formData.title.trim() ||
                    !formData.giftVariantId.trim() ||
                    !formData.threshold.trim()
                  }
                >
                  Save Configuration
                </Button>

                <Button
                  onClick={handleTest}
                  loading={
                    isLoading && navigation.formData?.get("_action") === "test"
                  }
                  disabled={!formData.giftVariantId.trim()}
                >
                  Test Campaign
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                How it works
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                When customers add items to their cart that meet or exceed your
                threshold, they'll automatically receive the specified gift
                product for free.
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                The campaign runs automatically through Shopify Functions and
                doesn't require any additional setup once configured.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
