import { prisma } from "../db.server";

export interface AppSettings {
  id: string;
  shop: string;
  
  // Widget Settings
  widgetEnabled: boolean;
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "inline";
  widgetTheme: "light" | "dark" | "auto";
  widgetPrimaryColor: string;
  widgetBorderRadius: string;
  
  // Custom Scripts
  customCSS: string;
  customJS: string;
  
  // Order Tagging
  orderTaggingEnabled: boolean;
  orderTagPrefix: string;
  tagCampaignName: boolean;
  tagGiftProducts: boolean;
  
  // Cart Integration
  autoAddToCart: boolean;
  showProgressBar: boolean;
  showDiscountMessage: boolean;
  
  // Theme Integration
  themeExtensionEnabled: boolean;
  progressBarLocation: "cart-page" | "cart-drawer" | "both";
  
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SETTINGS: Partial<AppSettings> = {
  widgetEnabled: true,
  widgetPosition: "bottom-right",
  widgetTheme: "light",
  widgetPrimaryColor: "#008060",
  widgetBorderRadius: "8px",
  customCSS: "",
  customJS: "",
  orderTaggingEnabled: true,
  orderTagPrefix: "Campaign",
  tagCampaignName: true,
  tagGiftProducts: true,
  autoAddToCart: true,
  showProgressBar: true,
  showDiscountMessage: true,
  themeExtensionEnabled: true,
  progressBarLocation: "both",
};

// Since we don't have a Settings table in Prisma yet, we'll use metafields
export async function getSettings(shop: string, admin: any): Promise<AppSettings> {
  try {
    const response = await admin.graphql(
      `#graphql
        query getAppSettings {
          shop {
            metafield(namespace: "app_settings", key: "config") {
              value
            }
          }
        }
      `
    );

    const data = await response.json();
    const metafieldValue = data?.data?.shop?.metafield?.value;

    if (metafieldValue) {
      const settings = JSON.parse(metafieldValue);
      return {
        id: "settings",
        shop,
        ...DEFAULT_SETTINGS,
        ...settings,
        createdAt: new Date(settings.createdAt || Date.now()),
        updatedAt: new Date(settings.updatedAt || Date.now()),
      } as AppSettings;
    }

    return {
      id: "settings",
      shop,
      ...DEFAULT_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AppSettings;
  } catch (error) {
    console.error("Error loading settings:", error);
    return {
      id: "settings",
      shop,
      ...DEFAULT_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AppSettings;
  }
}

export async function saveSettings(
  shop: string,
  admin: any,
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  const currentSettings = await getSettings(shop, admin);
  const newSettings = {
    ...currentSettings,
    ...settings,
    shop,
    updatedAt: new Date(),
  };

  const settingsData = {
    widgetEnabled: newSettings.widgetEnabled,
    widgetPosition: newSettings.widgetPosition,
    widgetTheme: newSettings.widgetTheme,
    widgetPrimaryColor: newSettings.widgetPrimaryColor,
    widgetBorderRadius: newSettings.widgetBorderRadius,
    customCSS: newSettings.customCSS,
    customJS: newSettings.customJS,
    orderTaggingEnabled: newSettings.orderTaggingEnabled,
    orderTagPrefix: newSettings.orderTagPrefix,
    tagCampaignName: newSettings.tagCampaignName,
    tagGiftProducts: newSettings.tagGiftProducts,
    autoAddToCart: newSettings.autoAddToCart,
    showProgressBar: newSettings.showProgressBar,
    showDiscountMessage: newSettings.showDiscountMessage,
    themeExtensionEnabled: newSettings.themeExtensionEnabled,
    progressBarLocation: newSettings.progressBarLocation,
    createdAt: newSettings.createdAt,
    updatedAt: newSettings.updatedAt,
  };

  try {
    const response = await admin.graphql(
      `#graphql
        mutation setAppSettings($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          metafields: [
            {
              namespace: "app_settings",
              key: "config",
              type: "json",
              value: JSON.stringify(settingsData),
              ownerId: `gid://shopify/Shop/${shop}`,
            },
          ],
        },
      }
    );

    const result = await response.json();
    
    if (result?.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("Metafield errors:", result.data.metafieldsSet.userErrors);
    }

    return newSettings;
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}

export function generateWidgetCode(settings: AppSettings, shop: string): string {
  return `<!-- FreeGiftTiers Widget -->
<script>
  window.freeGiftTiersConfig = {
    shop: "${shop}",
    enabled: ${settings.widgetEnabled},
    position: "${settings.widgetPosition}",
    theme: "${settings.widgetTheme}",
    primaryColor: "${settings.widgetPrimaryColor}",
    borderRadius: "${settings.widgetBorderRadius}",
    showProgressBar: ${settings.showProgressBar},
    showDiscountMessage: ${settings.showDiscountMessage},
    autoAddToCart: ${settings.autoAddToCart}
  };
</script>
<script src="https://cdn.yourdomain.com/widget.js" defer></script>

${settings.customCSS ? `<style>
${settings.customCSS}
</style>` : ''}

${settings.customJS ? `<script>
${settings.customJS}
</script>` : ''}`;
}

export function generateThemeBlockCode(settings: AppSettings): string {
  return `{% # FreeGiftTiers Progress Bar %}
{% render 'gift-tiers-progress-bar', 
  enabled: ${settings.showProgressBar},
  theme: '${settings.widgetTheme}',
  primary_color: '${settings.widgetPrimaryColor}'
%}`;
}

