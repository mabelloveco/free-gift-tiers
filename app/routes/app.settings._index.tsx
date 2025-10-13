import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Banner,
  InlineStack,
  Tabs,
  TextField,
  Select,
  Checkbox,
  Divider,
  Box,
  Badge,
  InlineGrid,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getSettings, saveSettings, generateWidgetCode, generateThemeBlockCode } from "../models/settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const settings = await getSettings(session.shop, admin);
  
  // Generate code snippets on the server
  const widgetCode = generateWidgetCode(settings, session.shop);
  const themeBlockCode = generateThemeBlockCode(settings);
  
  return json({ settings, shop: session.shop, widgetCode, themeBlockCode });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "save") {
    try {
      const settings = {
        widgetEnabled: formData.get("widgetEnabled") === "true",
        widgetPosition: formData.get("widgetPosition") as any,
        widgetTheme: formData.get("widgetTheme") as any,
        widgetPrimaryColor: formData.get("widgetPrimaryColor") as string,
        widgetBorderRadius: formData.get("widgetBorderRadius") as string,
        customCSS: formData.get("customCSS") as string,
        customJS: formData.get("customJS") as string,
        orderTaggingEnabled: formData.get("orderTaggingEnabled") === "true",
        orderTagPrefix: formData.get("orderTagPrefix") as string,
        tagCampaignName: formData.get("tagCampaignName") === "true",
        tagGiftProducts: formData.get("tagGiftProducts") === "true",
        autoAddToCart: formData.get("autoAddToCart") === "true",
        showProgressBar: formData.get("showProgressBar") === "true",
        showDiscountMessage: formData.get("showDiscountMessage") === "true",
        themeExtensionEnabled: formData.get("themeExtensionEnabled") === "true",
        progressBarLocation: formData.get("progressBarLocation") as any,
      };

      await saveSettings(session.shop, admin, settings);

      return json({
        success: true,
        message: "Settings saved successfully!",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      return json({
        success: false,
        message: "Failed to save settings. Please try again.",
      });
    }
  }

  return json({ success: false, message: "Invalid action" });
};

export default function Settings() {
  const { settings, shop, widgetCode: initialWidgetCode, themeBlockCode: initialThemeBlockCode } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState(settings);
  const [showBanner, setShowBanner] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Use server-generated code by default
  const widgetCode = initialWidgetCode;
  const themeBlockCode = initialThemeBlockCode;

  // Auto-dismiss success banner
  if (actionData?.success && showBanner) {
    setTimeout(() => setShowBanner(false), 5000);
  }

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    const form = new FormData();
    form.append("_action", "save");
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "id" && key !== "shop" && key !== "createdAt" && key !== "updatedAt") {
        form.append(key, String(value));
      }
    });

    submit(form, { method: "post" });
  }, [formData, submit]);

  const copyToClipboard = useCallback((code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const tabs = [
    { id: "widget", content: "Widget Installation", },
    { id: "appearance", content: "Appearance", },
    { id: "scripts", content: "Custom Scripts", },
    { id: "orders", content: "Order Tagging", },
    { id: "integration", content: "Theme Integration", },
  ];

  const positionOptions = [
    { label: "Bottom Right", value: "bottom-right" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Top Right", value: "top-right" },
    { label: "Top Left", value: "top-left" },
    { label: "Inline (Custom)", value: "inline" },
  ];

  const themeOptions = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "Auto (System)", value: "auto" },
  ];

  const progressBarLocationOptions = [
    { label: "Cart Page", value: "cart-page" },
    { label: "Cart Drawer", value: "cart-drawer" },
    { label: "Both", value: "both" },
  ];

  return (
    <Page>
      <TitleBar title="Settings" />

      {actionData?.message && showBanner && (
        <Layout>
          <Layout.Section>
            <Banner
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
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <Box paddingBlockStart="400">
                {/* Widget Installation Tab */}
                {selectedTab === 0 && (
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Widget Installation
                    </Text>
                    <Text as="p" tone="subdued">
                      Add the FreeGiftTiers widget to your storefront to show progress bars and gift notifications.
                    </Text>

                    <Divider />

                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="h3" variant="headingSm">
                          Installation Code
                        </Text>
                        <Button
                          onClick={() => copyToClipboard(widgetCode, "widget")}
                          variant="primary"
                          size="slim"
                        >
                          {copiedCode === "widget" ? "Copied!" : "Copy Code"}
                        </Button>
                      </InlineStack>

                      <Box
                        background="bg-surface-secondary"
                        padding="400"
                        borderRadius="200"
                        borderColor="border"
                        borderWidth="025"
                      >
                        <pre style={{ overflow: "auto", fontSize: "12px", margin: 0 }}>
                          <code>{widgetCode}</code>
                        </pre>
                      </Box>

                      <Banner tone="info">
                        <BlockStack gap="200">
                          <Text as="p" fontWeight="semibold">
                            Installation Steps:
                          </Text>
                          <Text as="p">
                            1. Copy the code above<br />
                            2. Go to Shopify Admin → Online Store → Themes<br />
                            3. Click "Edit code" on your active theme<br />
                            4. Open <code>theme.liquid</code> file<br />
                            5. Paste the code before the closing <code>&lt;/body&gt;</code> tag<br />
                            6. Save and preview
                          </Text>
                        </BlockStack>
                      </Banner>
                    </BlockStack>

                    <Divider />

                    <BlockStack gap="300">
                      <Text as="h3" variant="headingSm">
                        Widget Status
                      </Text>
                      
                      <Checkbox
                        label="Enable widget"
                        checked={formData.widgetEnabled}
                        onChange={(checked) => handleFieldChange("widgetEnabled", checked)}
                        helpText="Show the gift progress widget on your storefront"
                      />

                      <Checkbox
                        label="Auto-add gifts to cart"
                        checked={formData.autoAddToCart}
                        onChange={(checked) => handleFieldChange("autoAddToCart", checked)}
                        helpText="Automatically add free gifts when threshold is reached"
                      />

                      <Checkbox
                        label="Show progress bar"
                        checked={formData.showProgressBar}
                        onChange={(checked) => handleFieldChange("showProgressBar", checked)}
                        helpText="Display progress towards gift threshold"
                      />

                      <Checkbox
                        label="Show discount messages"
                        checked={formData.showDiscountMessage}
                        onChange={(checked) => handleFieldChange("showDiscountMessage", checked)}
                        helpText="Show messages when discounts are applied"
                      />
                    </BlockStack>
                  </BlockStack>
                )}

                {/* Appearance Tab */}
                {selectedTab === 1 && (
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Widget Appearance
                    </Text>
                    <Text as="p" tone="subdued">
                      Customize how the widget looks on your storefront.
                    </Text>

                    <Divider />

                    <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                      <Select
                        label="Widget Position"
                        options={positionOptions}
                        value={formData.widgetPosition}
                        onChange={(value) => handleFieldChange("widgetPosition", value)}
                        helpText="Where the widget appears on the page"
                      />

                      <Select
                        label="Theme"
                        options={themeOptions}
                        value={formData.widgetTheme}
                        onChange={(value) => handleFieldChange("widgetTheme", value)}
                        helpText="Light, dark, or match system preference"
                      />

                      <TextField
                        label="Primary Color"
                        type="color"
                        value={formData.widgetPrimaryColor}
                        onChange={(value) => handleFieldChange("widgetPrimaryColor", value)}
                        helpText="Main color for buttons and highlights"
                        autoComplete="off"
                      />

                      <TextField
                        label="Border Radius"
                        value={formData.widgetBorderRadius}
                        onChange={(value) => handleFieldChange("widgetBorderRadius", value)}
                        helpText="Rounded corners (e.g., 8px, 12px)"
                        autoComplete="off"
                      />
                    </InlineGrid>

                    <Divider />

                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Preview
                      </Text>
                      <Box
                        background="bg-surface-secondary"
                        padding="400"
                        borderRadius="200"
                      >
                        <div
                          style={{
                            backgroundColor: formData.widgetPrimaryColor,
                            padding: "12px 20px",
                            borderRadius: formData.widgetBorderRadius,
                            color: "white",
                            textAlign: "center",
                          }}
                        >
                          <Text as="span" variant="bodyMd">
                            Widget Preview
                          </Text>
                        </div>
                      </Box>
                    </BlockStack>
                  </BlockStack>
                )}

                {/* Custom Scripts Tab */}
                {selectedTab === 2 && (
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Custom Scripts
                    </Text>
                    <Text as="p" tone="subdued">
                      Add custom CSS and JavaScript to enhance your widget functionality.
                    </Text>

                    <Banner tone="warning">
                      <Text as="p">
                        ⚠️ <strong>Advanced Users Only:</strong> Custom scripts can affect your store's performance and security. 
                        Only add code you trust and understand.
                      </Text>
                    </Banner>

                    <Divider />

                    <BlockStack gap="300">
                      <Text as="h3" variant="headingSm">
                        Custom CSS
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Add custom styles to override default widget appearance
                      </Text>
                      <TextField
                        label=""
                        value={formData.customCSS}
                        onChange={(value) => handleFieldChange("customCSS", value)}
                        multiline={10}
                        placeholder=".gift-widget { background: #f5f5f5; }"
                        autoComplete="off"
                        monospaced
                      />
                    </BlockStack>

                    <Divider />

                    <BlockStack gap="300">
                      <Text as="h3" variant="headingSm">
                        Custom JavaScript
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Add custom JavaScript for advanced widget behavior
                      </Text>
                      <TextField
                        label=""
                        value={formData.customJS}
                        onChange={(value) => handleFieldChange("customJS", value)}
                        multiline={10}
                        placeholder="// Your custom JavaScript here&#10;document.addEventListener('gift-added', function(e) {&#10;  console.log('Gift added:', e.detail);&#10;});"
                        autoComplete="off"
                        monospaced
                      />
                    </BlockStack>

                    <Banner tone="info">
                      <BlockStack gap="200">
                        <Text as="p" fontWeight="semibold">
                          Available Events:
                        </Text>
                        <Text as="p" variant="bodySm">
                          • <code>gift-added</code> - When gift is added to cart<br />
                          • <code>threshold-reached</code> - When spending threshold is met<br />
                          • <code>widget-opened</code> - When widget is opened<br />
                          • <code>widget-closed</code> - When widget is closed
                        </Text>
                      </BlockStack>
                    </Banner>
                  </BlockStack>
                )}

                {/* Order Tagging Tab */}
                {selectedTab === 3 && (
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Order Tagging
                    </Text>
                    <Text as="p" tone="subdued">
                      Automatically tag orders that include campaign discounts for easy tracking and reporting.
                    </Text>

                    <Divider />

                    <BlockStack gap="300">
                      <Checkbox
                        label="Enable order tagging"
                        checked={formData.orderTaggingEnabled}
                        onChange={(checked) => handleFieldChange("orderTaggingEnabled", checked)}
                        helpText="Add tags to orders with campaign discounts"
                      />

                      {formData.orderTaggingEnabled && (
                        <>
                          <TextField
                            label="Tag Prefix"
                            value={formData.orderTagPrefix}
                            onChange={(value) => handleFieldChange("orderTagPrefix", value)}
                            helpText="Prefix for campaign tags (e.g., 'Campaign')"
                            autoComplete="off"
                          />

                          <Checkbox
                            label="Tag campaign name"
                            checked={formData.tagCampaignName}
                            onChange={(checked) => handleFieldChange("tagCampaignName", checked)}
                            helpText={`Add tag like "${formData.orderTagPrefix}: Free Gift"`}
                          />

                          <Checkbox
                            label="Tag gift products"
                            checked={formData.tagGiftProducts}
                            onChange={(checked) => handleFieldChange("tagGiftProducts", checked)}
                            helpText={`Add tag like "Gift: Hoop Earrings"`}
                          />
                        </>
                      )}
                    </BlockStack>

                    <Divider />

                    <Banner tone="info">
                      <BlockStack gap="200">
                        <Text as="p" fontWeight="semibold">
                          Example Tags:
                        </Text>
                        {formData.orderTaggingEnabled ? (
                          <BlockStack gap="100">
                            {formData.tagCampaignName && (
                              <InlineStack gap="200">
                                <Badge>{formData.orderTagPrefix}: Free Gift Over $50</Badge>
                              </InlineStack>
                            )}
                            {formData.tagGiftProducts && (
                              <InlineStack gap="200">
                                <Badge>Gift: Hoop Earrings</Badge>
                              </InlineStack>
                            )}
                          </BlockStack>
                        ) : (
                          <Text as="p" tone="subdued">
                            Order tagging is disabled
                          </Text>
                        )}
                      </BlockStack>
                    </Banner>

                    <Text as="p" variant="bodySm" tone="subdued">
                      Use order tags to create reports, trigger automations, or segment customers based on campaign participation.
                    </Text>
                  </BlockStack>
                )}

                {/* Theme Integration Tab */}
                {selectedTab === 4 && (
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Theme Integration
                    </Text>
                    <Text as="p" tone="subdued">
                      Use theme app extensions for better integration with your Shopify theme.
                    </Text>

                    <Divider />

                    <BlockStack gap="300">
                      <Checkbox
                        label="Enable theme extension"
                        checked={formData.themeExtensionEnabled}
                        onChange={(checked) => handleFieldChange("themeExtensionEnabled", checked)}
                        helpText="Use Shopify's theme app extension system"
                      />

                      <Select
                        label="Progress Bar Location"
                        options={progressBarLocationOptions}
                        value={formData.progressBarLocation}
                        onChange={(value) => handleFieldChange("progressBarLocation", value)}
                        helpText="Where to show the progress bar"
                        disabled={!formData.themeExtensionEnabled}
                      />
                    </BlockStack>

                    <Divider />

                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="h3" variant="headingSm">
                          Theme Block Code
                        </Text>
                        <Button
                          onClick={() => copyToClipboard(themeBlockCode, "theme")}
                          size="slim"
                          disabled={!formData.themeExtensionEnabled}
                        >
                          {copiedCode === "theme" ? "Copied!" : "Copy Code"}
                        </Button>
                      </InlineStack>

                      <Box
                        background="bg-surface-secondary"
                        padding="400"
                        borderRadius="200"
                        borderColor="border"
                        borderWidth="025"
                      >
                        <pre style={{ overflow: "auto", fontSize: "12px", margin: 0 }}>
                          <code>{themeBlockCode}</code>
                        </pre>
                      </Box>
                    </BlockStack>

                    <Banner tone="info">
                      <BlockStack gap="200">
                        <Text as="p" fontWeight="semibold">
                          Theme Editor Integration:
                        </Text>
                        <Text as="p">
                          1. Go to Shopify Admin → Online Store → Themes<br />
                          2. Click "Customize" on your active theme<br />
                          3. Navigate to Cart page or Product page<br />
                          4. Click "Add block" → "Apps" → "Gift Progress Bar"<br />
                          5. Position and configure the block
                        </Text>
                      </BlockStack>
                    </Banner>
                  </BlockStack>
                )}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Sticky Save Button */}
      <Layout>
        <Layout.Section>
          <Box
            background="bg-surface"
            padding="400"
            borderColor="border"
            borderWidth="025"
            borderRadius="200"
          >
            <InlineStack align="space-between" blockAlign="center">
              <Text as="p" tone="subdued">
                Remember to save your changes before leaving this page.
              </Text>
              <Button variant="primary" onClick={handleSave}>
                Save Settings
              </Button>
            </InlineStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

