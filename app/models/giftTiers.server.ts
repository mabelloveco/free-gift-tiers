import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { GiftTiersConfig } from "../types/gift-tiers";

const METAFIELD_NAMESPACE = "gift_tiers";
const METAFIELD_KEY = "config";

export async function getConfig(admin: AdminApiContext): Promise<GiftTiersConfig | null> {
  try {
    const response = await admin.graphql(`
      query getGiftTiersConfig {
        shop {
          metafield(namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
            id
            value
            type
          }
        }
      }
    `);

    const data = await response.json();
    const metafield = data.data?.shop?.metafield;

    if (!metafield?.value) {
      return null;
    }

    return JSON.parse(metafield.value) as GiftTiersConfig;
  } catch (error) {
    console.error("Error fetching gift tiers config:", error);
    return null;
  }
}

export async function saveConfig(admin: AdminApiContext, config: GiftTiersConfig): Promise<void> {
  try {
    const response = await admin.graphql(`
      mutation upsertGiftTiersConfig($metafield: MetafieldInput!) {
        metafieldSet(metafield: $metafield) {
          metafield {
            id
            value
            type
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        metafield: {
          namespace: METAFIELD_NAMESPACE,
          key: METAFIELD_KEY,
          value: JSON.stringify(config),
          type: "json",
          ownerId: `gid://shopify/Shop/${admin.session.shopId}`,
        },
      },
    });

    const data = await response.json();
    
    if (data.data?.metafieldSet?.userErrors?.length > 0) {
      throw new Error(`Metafield errors: ${data.data.metafieldSet.userErrors.map((e: any) => e.message).join(", ")}`);
    }
  } catch (error) {
    console.error("Error saving gift tiers config:", error);
    throw error;
  }
}

export async function validateGiftVariant(admin: AdminApiContext, variantId: string): Promise<boolean> {
  try {
    const response = await admin.graphql(`
      query validateGiftVariant($id: ID!) {
        productVariant(id: $id) {
          id
          title
          product {
            id
            title
          }
        }
      }
    `, {
      variables: { id: variantId },
    });

    const data = await response.json();
    return !!data.data?.productVariant;
  } catch (error) {
    console.error("Error validating gift variant:", error);
    return false;
  }
}
