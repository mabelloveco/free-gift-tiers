// @ts-nocheck
/**
 * Discount function for free gift tiers
 * Target: purchase.product-discount.run
 */

export function run(input) {
  // Parse configuration from metafield
  let cfg = {};

  try {
    const metafieldValue = input.discountNode?.metafield?.value;
    if (metafieldValue) {
      cfg = JSON.parse(metafieldValue);
    }
  } catch (e) {
    console.error("Failed to parse configuration:", e);
  }

  const thresholdCents =
    typeof cfg?.thresholdCents === "number"
      ? cfg.thresholdCents
      : Number.MAX_SAFE_INTEGER;
  const giftVariantId = cfg?.giftVariantId ?? "";

  const subtotalCents = Math.round(
    Number(input.cart.cost.subtotalAmount.amount) * 100,
  );

  const qualifies = subtotalCents >= thresholdCents;
  const validVariant =
    typeof giftVariantId === "string" &&
    giftVariantId.startsWith("gid://shopify/ProductVariant/");

  // Return discount if conditions are met
  if (qualifies && validVariant) {
    return {
      discounts: [
        {
          message: "🎁 Free gift unlocked!",
          targets: [{ productVariant: { id: giftVariantId } }],
          value: {
            percentage: {
              value: 100,
            },
          },
        },
      ],
      discountApplicationStrategy: "FIRST",
    };
  }

  return {
    discounts: [],
    discountApplicationStrategy: "FIRST",
  };
}
