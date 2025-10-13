# Free Gift Setup Guide

## Overview
Create automated free gift campaigns that reward customers when they reach a spending threshold.

---

## How to Create a Free Gift Campaign

### Step 1: Navigate to Campaigns
1. Log into your Shopify admin
2. Open the **Free Gift Tiers** app
3. Click **Campaigns** → **Create Campaign**
4. Select **Free Gift** campaign type

### Step 2: Configure Your Campaign
- **Campaign Name**: Give your campaign a descriptive name (e.g., "Summer Free Gift Promo")
- **Spending Threshold**: Set the minimum cart value (e.g., $50.00)
- **Gift Product**: Enter the variant ID of the free gift product
- **Status**: Set to Active to launch immediately, or Paused to save as draft

### Step 3: Find Gift Variant ID
To find your gift product's variant ID:

1. Go to **Shopify Admin** → **Products**
2. Select your gift product
3. Click on the specific variant
4. The variant ID appears in the URL: `variants/[ID]`
5. Copy just the numbers (e.g., `gid://shopify/ProductVariant/123456789`)

**Example URLs:**
```
https://admin.shopify.com/store/my-store/products/123/variants/456789
                                                                  ^^^^^^
                                                            This is your ID
```

---

## Multiple Gift Thresholds

### Can I offer multiple free gifts at different thresholds?
**Yes!** Create separate campaigns with different thresholds:

- Campaign 1: $50 threshold → Free sample
- Campaign 2: $100 threshold → Free full-size product
- Campaign 3: $150 threshold → Free premium gift

Each campaign evaluates independently. Customers receive all gifts they qualify for.

---

## Cart Behavior

### What happens if cart total drops below threshold?
The free gift **automatically removes** from the cart. The progress bar updates in real-time showing:
- Current cart total
- Amount remaining to qualify
- Gift product preview

### Does the gift count toward the threshold?
**No.** The free gift is added at $0.00 and does not affect the cart subtotal calculation.

---

## Advanced Configuration

### Gift Quantity Limits
Set how many times a customer can receive the gift:
- **Once per order** (default)
- **Multiple times** (if they reach 2x, 3x threshold)

### Product Exclusions
Exclude certain products from counting toward the threshold:
- Sale items
- Gift cards
- Digital products

### Customer Segmentation
Target specific customer groups:
- First-time buyers
- VIP customers
- Email subscribers

---

## Testing Your Campaign

### Before Going Live
1. Set campaign to **Paused**
2. Add test products to cart
3. Verify threshold calculation
4. Check gift adds correctly
5. Test removal when below threshold

### Test Checklist
- [ ] Gift variant ID is correct
- [ ] Threshold amount is accurate
- [ ] Gift adds automatically at threshold
- [ ] Gift removes when cart drops below
- [ ] Progress bar displays correctly
- [ ] Mobile experience is smooth

---

## Troubleshooting

### Gift not adding to cart?
**Check:**
1. Campaign is set to **Active**
2. Gift variant ID is valid
3. Gift product is published
4. Inventory is available
5. No conflicting discount rules

### Wrong gift variant adding?
- Verify variant ID matches intended product
- Check for typos in variant ID field
- Confirm product has correct variant selected

### Threshold not calculating correctly?
- Ensure excluded products are configured
- Check if taxes/shipping are included in threshold
- Verify currency conversion settings

---

## Best Practices

### 1. Choose the Right Threshold
- **Too low**: Hurts margins
- **Too high**: Fewer conversions
- **Sweet spot**: 20-30% above average order value

### 2. Select Compelling Gifts
- High perceived value
- Complements main products
- Limited availability creates urgency

### 3. Promote Your Campaign
- Add progress bar to cart page
- Mention in product descriptions
- Highlight in email campaigns
- Feature on homepage banner

### 4. Test Before Launch
- Verify on desktop and mobile
- Test with different cart scenarios
- Check gift inventory levels

### 5. Monitor Performance
- Track conversion rates
- Analyze average order value impact
- Adjust threshold based on data

---

## FAQ

**Q: Can customers choose their free gift?**  
A: Set up multiple campaigns with different gifts, or list variant IDs for all gift options.

**Q: Does this work with discount codes?**  
A: Yes, by default. Control stacking in Settings → Discount Behavior.

**Q: Can I schedule campaigns?**  
A: Not yet, but coming soon. For now, manually activate/pause campaigns.

**Q: Does this work internationally?**  
A: Yes, thresholds convert to customer's currency automatically.

**Q: Can I offer free shipping instead?**  
A: Yes! See [Shipping Discounts Guide](./shipping-discounts.md).

---

## Related Guides

- [BOGO Setup](./bxgy-setup.md) - Buy X Get Y campaigns
- [Widget Visibility](./widget-visibility.md) - Add progress bars to your theme
- [Custom Discounts](./custom-discounts.md) - Discount stacking rules
- [Gift as Cart Discount](./gift-as-cart-discount.md) - Alternative to product method

---

## Need Help?

- **Live Chat**: Ask our AI assistant on the [Support Page](/support)
- **Email**: support@gifttiersapp.com
- **Community**: Join our Shopify partners forum

---

**Last Updated**: October 2025  
**Version**: 2.0

