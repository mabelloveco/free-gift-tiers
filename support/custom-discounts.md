# Custom Discounts Guide

## Overview
Understand how discounts are calculated, combined, and prioritized across different campaign types in Free Gift Tiers.

---

## How Discounts Are Calculated

### Free Gift Campaigns
**Calculation**: 100% discount on gift product variant

**Process**:
1. Customer reaches spending threshold
2. System adds gift product to cart
3. Gift line item shows $0.00
4. Original price shown as strikethrough
5. Cart subtotal excludes gift value

**Example**:
```
Cart: $52.00 (threshold: $50)
Gift: Tote Bag (value $15.00)
Discount: -$15.00 (100% off gift)
Subtotal: $52.00 (gift doesn't count)
```

### BXGY Campaigns
**Calculation**: Percentage or fixed amount off "Get" products

**Process**:
1. Customer adds minimum "Buy" quantity
2. System identifies eligible "Get" products
3. Discount applies to specified quantity
4. Lowest priced items discounted first (default)

**Example**:
```
Buy 2 Get 1 Free
Cart: 3 shirts @ $30, $35, $40
Discount: -$30 (lowest priced free)
Subtotal: $75
```

### Volume Discounts
**Calculation**: Progressive percentage off based on quantity

**Process**:
1. Customer adds products to cart
2. System counts qualifying items
3. Highest eligible tier applies
4. Discount applied to all qualifying items

**Example**:
```
Tier 1: 5+ items = 10% off
Tier 2: 10+ items = 20% off
Tier 3: 20+ items = 30% off

Cart: 12 items @ $20 each = $240
Qualifying Tier: 20% off (Tier 2)
Discount: -$48
Subtotal: $192
```

---

## Combining Multiple Campaigns

### Stacking Behavior
Configure in **Settings** → **Discount Behavior**

#### Option 1: Independent Evaluation (Default)
Each campaign evaluates separately:
- Free gift at $50
- BXGY on specific products
- Volume discount on quantities

Customer can receive ALL applicable discounts.

**Example**:
```
Cart: $75 (qualifies for free gift)
+ Buy 3 get 1 free (BXGY applies)
+ 10 items (volume discount applies)

Result: All three discounts active
```

#### Option 2: Best Discount Only
System applies highest-value discount:
- Calculates all eligible discounts
- Applies the one with highest $ value
- Others are ignored

**Example**:
```
Option A: Free gift ($15 value)
Option B: BXGY ($20 value)
Option C: Volume 20% off ($18 value)

Result: BXGY applies ($20), others ignored
```

#### Option 3: Priority Order
You set priority rankings:
1. Free Gift (highest)
2. BXGY
3. Volume (lowest)

First qualifying discount applies, others are suppressed.

---

## Discount Codes vs. Automatic Discounts

### Default Behavior: Stacking Allowed
Manual discount codes combine with Free Gift Tiers campaigns:

**Example**:
```
Cart: $100
Free Gift Tiers: -$20 (automatic)
Code "SAVE10": -$10 (10% off)
Total Savings: -$30
```

### Preventing Stacking
Configure in **Settings** → **Discount Behavior** → **Code Interaction**

**Options**:
- **Allow stacking** (default)
- **Block codes when campaign active**
- **Campaign overrides codes**
- **Codes override campaigns**

**Use Cases**:
- **Allow**: Maximize savings, reward loyalty
- **Block**: Protect margins, prevent abuse
- **Override**: Control which discount applies

---

## Preventing Discount Abuse

### Common Abuse Patterns

#### 1. Cart Manipulation
**Problem**: Add items to reach threshold, remove after gift adds

**Solution**: Enable "Lock Cart" feature
- Gift product locked until threshold maintained
- Removing items removes gift automatically
- Warning message shows when threshold not met

#### 2. Multiple Accounts
**Problem**: Same customer creates multiple accounts to get multiple gifts

**Solution**: Limit by email/IP
- Settings → Anti-Abuse → Enable duplicate detection
- Blocks same email from multiple campaigns
- Optional IP tracking for repeat offenders

#### 3. Return Fraud
**Problem**: Buy products to get gift, return products, keep gift

**Solution**: Automatic gift return requirements
- Settings → Returns → Link gift to purchase
- If order items returned, gift must return too
- Or charge gift value to refund

### Setting Limits

**Per-Customer Limits**:
- One free gift per day
- Max 3 BXGY uses per month
- Volume discounts for quantities 5-100 only

**Per-Order Limits**:
- Maximum $100 in combined discounts
- Only one campaign per order
- Requires minimum margin (e.g., 20%)

**Product Exclusions**:
- Exclude sale items from counting toward threshold
- Exclude gift cards
- Exclude digital products

---

## Discount Priority Rules

### When Multiple Campaigns Qualify

**Priority Factors** (in order):
1. **Customer Segment** (VIP > Regular > New)
2. **Campaign Type** (Free Gift > BXGY > Volume)
3. **Discount Value** (Higher $ value wins)
4. **Creation Date** (Newer campaigns win)
5. **Manual Priority** (Set in campaign settings)

**Example Scenario**:
```
Customer: VIP member with $100 cart
Campaign A: Free gift at $50 (VIP only)
Campaign B: BXGY 30% off (All customers)
Campaign C: Volume 20% off (Regular customers)

Result: Campaign A applies (VIP priority)
```

### Override Priority
Manually set in campaign settings:
- Priority 1 (Highest)
- Priority 2
- Priority 3 (Lowest)

Overrides all automatic priority rules.

---

## Analytics & Monitoring

### Discount Performance Metrics
Track in **Analytics** dashboard:

**By Campaign**:
- Total discount $ given
- Number of redemptions
- Average discount per order
- ROI (revenue increase vs. discount cost)

**By Discount Type**:
- Free gifts: How many claimed
- BXGY: Conversion rate
- Volume: Average quantity purchased

**Abuse Detection**:
- Flagged orders (suspicious patterns)
- High-frequency users
- Return rate for discounted orders

---

## Advanced Discount Strategies

### 1. Tiered Free Gifts
Increase gift value with cart value:
```
$50: Free sample
$100: Free full-size product
$150: Free premium gift set
```

### 2. Time-Based Discounts
Different discounts by time:
- Weekday: BXGY campaigns
- Weekend: Free gift promotions
- Flash sales: Volume discounts

### 3. Product-Specific Campaigns
Target specific categories:
- Beauty: Free gift with $75 beauty products
- Apparel: BXGY on clothing only
- Electronics: Volume discount on accessories

### 4. Seasonal Stacking
Allow multiple discounts during holidays:
- Black Friday: All campaigns active
- Cyber Monday: Best discount only
- Clearance: Volume discounts + codes allowed

---

## Testing Discount Logic

### Pre-Launch Testing

**Test Scenarios**:
1. Cart exactly at threshold
2. Cart $0.01 below threshold
3. Cart well above threshold
4. Multiple products qualifying for different campaigns
5. Discount code + automatic discount
6. High-value order with multiple discounts

**Test Checklist**:
- [ ] Correct discount $ calculated
- [ ] Discount shows in cart clearly
- [ ] Discount appears on order confirmation
- [ ] Shopify admin shows discount correctly
- [ ] Analytics track discount properly
- [ ] Customer receives correct confirmation

### Staging Environment
Test in development before going live:
1. Clone production to staging
2. Create test campaigns
3. Process test orders
4. Verify discount calculations
5. Check reporting accuracy
6. Deploy to production

---

## Troubleshooting

### Discount not applying?
**Check**:
1. Campaign is Active
2. Customer meets all requirements
3. Products are eligible
4. No conflicting campaigns with higher priority
5. Discount codes not blocking automatic discounts

### Wrong discount amount?
**Verify**:
- Correct percentage or $ amount in settings
- Tax calculation (before/after discount)
- Shipping inclusion/exclusion
- Currency conversion (international)

### Customer not seeing discount?
**Ensure**:
- Cart updates after items added
- Discount line appears in cart drawer
- Mobile experience matches desktop
- Discount shows on checkout page

---

## FAQ

**Q: Do discounts include tax?**  
A: Discounts apply to pre-tax subtotal by default. Configure in Settings.

**Q: Can I offer free shipping as a discount?**  
A: Yes! See [Shipping Discounts Guide](./shipping-discounts.md).

**Q: What if discount exceeds order value?**  
A: Minimum order value configured prevents over-discounting.

**Q: Do discounts work internationally?**  
A: Yes, currency conversion is automatic.

**Q: Can wholesale customers get additional discounts?**  
A: Yes, create customer segment-specific campaigns.

---

## Related Guides

- [Free Gift Setup](./free-gift-setup.md) - Threshold campaigns
- [BXGY Setup](./bxgy-setup.md) - Buy X Get Y
- [Shipping Discounts](./shipping-discounts.md) - Free shipping rules
- [Gift as Cart Discount](./gift-as-cart-discount.md) - Alternative methods

---

## Need Help?

- **Live Chat**: [Support Page](/support)
- **Email**: support@gifttiersapp.com
- **Community**: Join our merchant forum

---

**Last Updated**: October 2025  
**Version**: 2.0

