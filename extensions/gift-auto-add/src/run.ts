// @ts-nocheck
/**
 * Cart Transform Function - Auto Add/Remove Free Gifts
 * Config expected in function configuration JSON:
 * { "thresholdCents": 10000, "giftVariantId": "gid://shopify/ProductVariant/XXXX" }
 */

export function run(input) {
  // Read from configuration (passed directly to function)
  const cfg = (input as any).configuration || { thresholdCents: 0, giftVariantId: "" };
  const giftId = cfg.giftVariantId;
  const thr = cfg.thresholdCents;

  const subtotalCents = Math.round(
    Number(input.cart.cost.subtotalAmount.amount) *
      Math.pow(10, input.cart.cost.subtotalAmount.currencyCode === "JPY" ? 0 : 2)
  ) || 0;

  const hasGiftLine = input.cart.lines.find(
    (line) => line.merchandise?.__typename === "ProductVariant" && line.merchandise?.id === giftId
  );

  const operations = [];

  // Add gift if eligible and not present
  if (subtotalCents >= thr && !hasGiftLine && giftId) {
    operations.push({
      add: {
        variantId: giftId,
        quantity: 1,
      },
    });
  }

  // Remove gift if no longer eligible
  if (subtotalCents < thr && hasGiftLine) {
    operations.push({
      remove: {
        cartLineId: hasGiftLine.id,
      },
    });
  }

  // Cap gift to quantity 1
  if (hasGiftLine && hasGiftLine.quantity > 1) {
    operations.push({
      update: {
        cartLineId: hasGiftLine.id,
        quantity: 1,
      },
    });
  }

  return { operations };
}

