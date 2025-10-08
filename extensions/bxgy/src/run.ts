// @ts-nocheck
/**
 * BXGY / Free Gift Discount Function
 * Config expected in function configuration JSON:
 * {
 *   "getVariantIds": ["gid://shopify/ProductVariant/YYY"],
 *   "buyMinQty": 2,                // e.g., buy 2 get 1 free
 *   "discountType": "FREE"         // "FREE" | "PERCENT"
 *   "percentOff": 100              // if PERCENT
 * }
 */

export function run(input) {
  const cfg = (input as any).discountNode?.metafield?.value
    ? JSON.parse((input as any).discountNode.metafield.value)
    : {
        getVariantIds: [],
        buyMinQty: 1,
        discountType: "FREE",
      };

  const lines = input.cart.lines || [];
  const qtyTotal = lines.reduce(
    (s: number, l: any) => s + (l.quantity || 0),
    0,
  );

  // Not eligible if cart doesn't meet minimum quantity
  if (
    qtyTotal < (cfg.buyMinQty || 1) ||
    !cfg.getVariantIds ||
    cfg.getVariantIds.length === 0
  ) {
    return { discounts: [] };
  }

  // Find target "get" items present in cart
  const targetLineIds: string[] = [];
  for (const line of lines) {
    const vid =
      line.merchandise?.__typename === "ProductVariant"
        ? line.merchandise?.id
        : null;
    if (vid && cfg.getVariantIds.includes(vid)) {
      targetLineIds.push(line.id);
    }
  }

  if (targetLineIds.length === 0) {
    return { discounts: [] };
  }

  // Build discount for those target lines
  const targets = targetLineIds.map((id: string) => ({
    cartLine: { id },
  }));

  let value: any;
  if (cfg.discountType === "FREE") {
    // 100% off to make it free
    value = { percentage: { value: 100 } };
  } else {
    const pct = Math.max(0, Math.min(100, Number(cfg.percentOff ?? 100)));
    value = { percentage: { value: pct } };
  }

  return {
    discounts: [
      {
        targets,
        value,
        message: cfg.discountType === "FREE" ? "Free gift" : "Promotion",
      },
    ],
  };
}
