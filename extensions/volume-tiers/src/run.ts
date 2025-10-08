// @ts-nocheck
/**
 * Volume / Tiered Discount Function
 * Apply progressive discounts based on quantity
 * Example: Buy 2+ get 10% off, Buy 4+ get 20% off
 */

export function run(input) {
  // Parse configuration
  let config = {
    targetProducts: [], // ["gid://shopify/Product/123"] - empty = all products
    tiers: [
      // { quantity: 2, discountPercentage: 10 },
      // { quantity: 4, discountPercentage: 20 },
    ],
  };

  try {
    const metafieldValue = input.discountNode?.metafield?.value;
    if (metafieldValue) {
      config = { ...config, ...JSON.parse(metafieldValue) };
    }
  } catch (e) {
    console.error("Failed to parse volume configuration:", e);
    return { discounts: [] };
  }

  if (!config.tiers || config.tiers.length === 0) {
    return { discounts: [] };
  }

  // Sort tiers by quantity descending to find the best tier first
  const sortedTiers = [...config.tiers].sort((a, b) => b.quantity - a.quantity);

  const discounts = [];

  input.cart.lines.forEach((line) => {
    if (line.merchandise.__typename !== "ProductVariant") return;

    const productId = line.merchandise.product.id;
    const variantId = line.merchandise.id;

    // Check if this product qualifies (if targetProducts is empty, all products qualify)
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
        message: `Volume discount: ${applicableTier.discountPercentage}% off (${line.quantity} items)`,
      });
    }
  });

  return { discounts };
}
