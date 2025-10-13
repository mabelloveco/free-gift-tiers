# BOGO (Buy X Get Y) Setup Guide

## Overview
Create quantity-based promotions where customers receive discounts when they purchase a minimum quantity of specific products.

---

## How BXGY Works

### The Formula
**Buy X products** → **Get Y products at discount**

Examples:
- Buy 2, Get 1 Free
- Buy 3, Get 1 at 50% off
- Buy 5, Get 2 Free
- Buy 1, Get 1 at 20% off

---

## Creating a BXGY Campaign

### Step 1: Navigate to Campaign Creation
1. Open **Free Gift Tiers** app
2. Click **Campaigns** → **Create Campaign**
3. Select **Buy X Get Y (BXGY)** type

### Step 2: Configure "Buy" Products (X)
- **Minimum Quantity**: How many items customer must buy (e.g., 2)
- **Product Variant IDs**: Which products qualify for the "buy" requirement
- Enter comma-separated variant IDs: `123456, 234567, 345678`

### Step 3: Configure "Get" Products (Y)
- **Product Variant IDs**: Which products receive the discount
- Can be same as "Buy" products or different
- **Quantity**: How many Y products get discounted (default: 1)

### Step 4: Set Discount Type
Choose one:
- **FREE** (100% off) - Most popular for BOGO
- **Percentage Off** - Enter custom % (e.g., 50% for half off)
- **Fixed Amount** - Enter dollar amount off

### Step 5: Activate
- Set status to **Active**
- Campaign goes live immediately

---

## Making It Truly "FREE" (BOGO)

For a true "Buy One Get One Free":

```
Buy Products: [Variant ID of Product A]
Buy Quantity: 1
Get Products: [Variant ID of Product A]
Get Quantity: 1
Discount Type: FREE (100%)
```

The second item automatically applies at $0.00 when customer adds 2+ to cart.

---

## Targeting Specific Collections

### Method 1: Manual Variant IDs
1. Go to Shopify Admin → Products
2. Filter by collection
3. Export product list
4. Extract variant IDs
5. Paste into BXGY config (comma-separated)

### Method 2: Using Shopify Bulk Editor
1. Select all products in collection
2. Note down variant IDs
3. Enter in campaign setup

**Pro Tip**: Use spreadsheet formulas to format large lists:
```
=CONCATENATE(A1, ", ", A2, ", ", A3, ...)
```

---

## Customer Product Selection

### Allowing Choice
List multiple "Get" product variant IDs:
```
Get Products: 111, 222, 333, 444
```

Customers can add ANY of these to receive the discount. First eligible item added gets the discount.

### Restricting Choice
List single variant ID:
```
Get Products: 123456
```

Only that specific product qualifies for discount.

---

## Advanced Scenarios

### Mix and Match BOGO
**Goal**: Buy any 3 from Collection A, get any 1 from Collection B free

**Setup**:
- Buy Products: [All Collection A variant IDs]
- Buy Quantity: 3
- Get Products: [All Collection B variant IDs]
- Discount: FREE

### Tiered BOGO
**Goal**: Buy 2 get 10% off, buy 4 get 20% off, buy 6 get 30% off

**Setup**: Create 3 separate campaigns:
- Campaign 1: Buy 2 → 10% off next item
- Campaign 2: Buy 4 → 20% off next item  
- Campaign 3: Buy 6 → 30% off next item

Only the highest tier applies (configured in Settings).

### Cross-Product BOGO
**Goal**: Buy Product A, get Product B free

**Setup**:
- Buy Products: [Product A variant ID]
- Buy Quantity: 1
- Get Products: [Product B variant ID]
- Discount: FREE

---

## Inventory Management

### Stock Considerations
- BXGY campaigns don't affect inventory counts differently than normal sales
- "Get" products still decrement inventory when added to cart
- Ensure sufficient stock of "Get" products before activating campaign

### Low Stock Warnings
Set up notifications:
1. Go to Settings → Notifications
2. Enable "Low Stock Alert" for BXGY products
3. Set threshold (e.g., alert at <20 units)

---

## Discount Calculation Examples

### Example 1: Buy 2 Get 1 Free
- Customer adds 3 shirts @ $30 each
- Subtotal: $90
- Discount: -$30 (lowest priced item free)
- **Total: $60**

### Example 2: Buy 3 Get 1 at 50% Off
- Customer adds 4 pants @ $50 each
- Subtotal: $200
- Discount: -$25 (50% off lowest priced item)
- **Total: $175**

### Example 3: Mix and Match
- Customer adds 2 shoes @ $80, 1 boot @ $120
- Qualifies for "Buy 3 Get 1 Free"
- Subtotal: $280
- Discount: -$80 (lowest priced item free)
- **Total: $200**

---

## Testing Your BXGY Campaign

### Pre-Launch Checklist
- [ ] Variant IDs are correct for "Buy" products
- [ ] Variant IDs are correct for "Get" products
- [ ] Minimum quantity is accurate
- [ ] Discount type and amount are correct
- [ ] Campaign name is descriptive
- [ ] Status set to Paused for testing

### Test Scenarios
1. Add exactly minimum quantity → discount should apply
2. Add below minimum → no discount
3. Add above minimum → verify correct quantity gets discount
4. Remove items → discount should remove when below minimum
5. Mix and match products → verify eligible combinations

---

## Troubleshooting

### Discount not applying?
**Check**:
1. Customer has minimum "Buy" quantity in cart
2. "Get" product variant ID is correct
3. Campaign is Active
4. No conflicting campaigns with higher priority
5. Discount codes aren't overriding BXGY

### Wrong product getting discount?
- Verify "Get" product variant IDs
- Check for typos or extra spaces
- Ensure products are published and available

### Discount applying to wrong quantity?
- Review "Get Quantity" setting
- Check if multiple BXGY campaigns overlap
- Verify priority rules in Settings

---

## Best Practices

### 1. Clear Communication
Tell customers about the deal:
- Add to product pages
- Show in cart with progress indicator
- Mention in checkout

### 2. Strategic Pairings
- High margin "Buy" + Lower margin "Get"
- Popular item "Buy" + Overstocked "Get"
- Complementary products (shampoo + conditioner)

### 3. Minimum Quantities
- Start with buy 1 get 1 for simplicity
- Test buy 2+ for higher margins
- Monitor conversion rates

### 4. Seasonal Campaigns
- Back to school: Buy 3 notebooks, get 1 free
- Holidays: Buy 2 gifts, get wrapping free
- Summer: Buy 2 swimsuits, get beach bag free

---

## FAQ

**Q: Can the "Get" product be different from "Buy"?**  
A: Yes! This is called cross-product BOGO.

**Q: Can I do "Buy 2 Get 2 Free"?**  
A: Yes, set Get Quantity to 2.

**Q: Does this work with discount codes?**  
A: Yes, configure stacking behavior in Settings.

**Q: Can customers add more than the "Get" quantity?**  
A: They can add more, but only the specified quantity receives discount.

**Q: How do returns work?**  
A: If customer returns "Buy" items below minimum, "Get" item refund is processed at discounted price paid.

---

## Related Guides

- [Free Gift Setup](./free-gift-setup.md) - Threshold-based gifts
- [Volume Discounts](./custom-discounts.md) - Tiered pricing
- [Widget Visibility](./widget-visibility.md) - Show BXGY progress

---

## Need Help?

- **Live Chat**: [Support Page](/support)
- **Email**: support@gifttiersapp.com
- **Video Tutorial**: [Watch Setup Guide](https://example.com/videos/bxgy)

---

**Last Updated**: October 2025  
**Version**: 2.0

