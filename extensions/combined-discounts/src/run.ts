// @ts-nocheck
/**
 * Combined Discount Function
 * Handles multiple campaign types: Free Gift, BXGY, Volume Discounts
 * This function checks all active campaigns and applies the best discounts
 */

export function run(input) {
  // Get all active campaigns from metafields
  let activeCampaigns = [];

  try {
    const metafieldValue = input.discountNode?.metafield?.value;
    if (metafieldValue) {
      activeCampaigns = JSON.parse(metafieldValue);
    }
  } catch (e) {
    console.error("Failed to parse campaigns:", e);
    return { discounts: [] };
  }

  if (!Array.isArray(activeCampaigns) || activeCampaigns.length === 0) {
    return { discounts: [] };
  }

  const allDiscounts = [];

  // Process each campaign type
  for (const campaign of activeCampaigns) {
    if (!campaign.enabled || campaign.status !== "active") continue;

    switch (campaign.type) {
      case "free_gift":
        const freeGiftDiscounts = processFreeGift(input, campaign);
        allDiscounts.push(...freeGiftDiscounts);
        break;

      case "bxgy":
        const bxgyDiscounts = processBXGY(input, campaign);
        allDiscounts.push(...bxgyDiscounts);
        break;

      case "volume_discount":
        const volumeDiscounts = processVolumeDiscount(input, campaign);
        allDiscounts.push(...volumeDiscounts);
        break;
    }
  }

  return {
    discounts: allDiscounts,
    discountApplicationStrategy: "FIRST",
  };
}

function processFreeGift(input, campaign) {
  const thresholdCents = campaign.config.thresholdCents || Number.MAX_SAFE_INTEGER;
  const giftVariantId = campaign.config.giftVariantId;

  if (!giftVariantId) return [];

  const subtotalCents = Math.round(
    Number(input.cart.cost.subtotalAmount.amount) * 100,
  );

  const qualifies = subtotalCents >= thresholdCents;
  const validVariant =
    typeof giftVariantId === "string" &&
    giftVariantId.startsWith("gid://shopify/ProductVariant/");

  if (qualifies && validVariant) {
    return [{
      message: `🎁 ${campaign.title}`,
      targets: [{ productVariant: { id: giftVariantId } }],
      value: {
        percentage: { value: 100 },
      },
    }];
  }

  return [];
}

function processBXGY(input, campaign) {
  const config = campaign.config;
  const lines = input.cart.lines || [];
  
  if (!config.getVariantIds || config.getVariantIds.length === 0) return [];

  const qtyTotal = lines.reduce((s, l) => s + (l.quantity || 0), 0);

  if (qtyTotal < (config.buyMinQty || 1)) return [];

  // Find target "get" items present in cart
  const targetLineIds = [];
  for (const line of lines) {
    const vid = line.merchandise?.__typename === "ProductVariant" 
      ? line.merchandise?.id 
      : null;
    if (vid && config.getVariantIds.includes(vid)) {
      targetLineIds.push(line.id);
    }
  }

  if (targetLineIds.length === 0) return [];

  const targets = targetLineIds.map(id => ({ cartLine: { id } }));

  let value;
  if (config.discountType === "FREE") {
    value = { percentage: { value: 100 } };
  } else {
    const pct = Math.max(0, Math.min(100, Number(config.percentOff ?? 100)));
    value = { percentage: { value: pct } };
  }

  return [{
    message: config.discountType === "FREE" ? `🎁 ${campaign.title}` : `💰 ${campaign.title}`,
    targets,
    value,
  }];
}

function processVolumeDiscount(input, campaign) {
  const config = campaign.config;
  
  if (!config.tiers || config.tiers.length === 0) return [];

  const sortedTiers = [...config.tiers].sort((a, b) => b.quantity - a.quantity);
  const discounts = [];

  input.cart.lines.forEach((line) => {
    if (line.merchandise.__typename !== "ProductVariant") return;

    const productId = line.merchandise.product.id;
    const variantId = line.merchandise.id;

    // Check if this product qualifies
    const qualifies =
      config.targetProducts.length === 0 ||
      config.targetProducts.includes(productId) ||
      config.targetProducts.includes(variantId);

    if (!qualifies) return;

    // Find the highest tier this line qualifies for
    const applicableTier = sortedTiers.find(
      (tier) => line.quantity >= tier.quantity,
    );

    if (applicableTier) {
      discounts.push({
        targets: [{ productVariant: { id: variantId } }],
        value: {
          percentage: {
            value: applicableTier.discountPercentage,
          },
        },
        message: `📊 ${campaign.title}: ${applicableTier.discountPercentage}% off (${line.quantity} items)`,
      });
    }
  });

  return discounts;
}
