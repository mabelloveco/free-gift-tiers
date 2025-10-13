# Shipping Discounts Guide

## Overview
Offer free or discounted shipping based on cart value thresholds to incentivize larger purchases.

---

## Setting Up Free Shipping

### Step 1: Create Shipping Campaign
1. Open **Free Gift Tiers** app
2. Go to **Campaigns** → **Create Campaign**
3. Select **Free Shipping** campaign type
4. Name your campaign (e.g., "Free Shipping over $75")

### Step 2: Configure Threshold
- **Minimum Cart Value**: Set spending threshold (e.g., $75.00)
- **Discount Amount**: Set to match highest shipping cost
- **Apply to**: All shipping methods or specific rates

### Step 3: Advanced Options
**Shipping Methods**:
- All methods
- Standard shipping only
- Exclude express/overnight
- Specific carriers only

**Geographic Restrictions** (optional):
- Apply to all regions
- Domestic only
- International only
- Specific countries/zones

### Step 4: Activate
Set status to **Active** and save.

---

## How Shipping Discounts Calculate

### Standard Free Shipping
**Calculation**: 100% discount on shipping rate

**Process**:
1. Customer reaches cart threshold
2. Shipping discount automatically applies
3. Shows as "Free Shipping" at checkout
4. $0.00 shipping cost

**Example**:
```
Cart: $80 (threshold: $75)
Shipping: Standard ($8.00)
Discount: -$8.00
Shipping Cost: $0.00
```

### Partial Shipping Discount
**Calculation**: Fixed $ or % off shipping

**Process**:
1. Customer reaches threshold
2. Partial discount applies
3. Shows reduced shipping cost

**Example**:
```
Cart: $60 (threshold: $50)
Shipping: Express ($15.00)
Discount: 50% off ($7.50)
Shipping Cost: $7.50
```

---

## Combining with Product Gifts

### Stacking Behavior
By default, shipping discounts stack with product campaigns:

**Scenario 1: Both Active**
```
Cart: $80
Free Gift Campaign: $50 threshold (Gift worth $15)
Free Shipping: $75 threshold

Result:
- Free gift added ✓
- Free shipping applied ✓
- Total savings: $15 + $8 = $23
```

**Scenario 2: Different Thresholds**
```
Cart: $60
Free Gift: $50 threshold ✓ (qualifies)
Free Shipping: $75 threshold ✗ (doesn't qualify)

Result:
- Free gift added ✓
- Shipping charged ($8)
```

### Configure Stacking
**Settings** → **Campaign Stacking** → **Shipping + Product**

Options:
- **Stack both** (default) - Maximum savings
- **Best value only** - Highest $ discount wins
- **Shipping priority** - Free shipping blocks other offers
- **Product priority** - Free gift blocks shipping discount

---

## Regional Shipping Rules

### Domestic vs. International

#### Domestic Free Shipping
**Setup**:
- Threshold: $75
- Apply to: United States only
- All domestic shipping methods included

**Customer Experience**:
- US customers see "Free Shipping" at $75+
- International customers see standard rates

#### International Thresholds
**Setup**:
- Higher threshold for international (e.g., $150)
- Accounts for higher shipping costs
- Can vary by country/zone

**Example**:
```
US: Free shipping at $75
Canada: Free shipping at $100
UK/EU: Free shipping at $125
Rest of World: Free shipping at $150
```

### Zone-Based Configuration
Create separate campaigns for each zone:

**Zone 1: Domestic**
- Threshold: $50
- All methods free

**Zone 2: North America**
- Threshold: $100
- Standard shipping free

**Zone 3: International**
- Threshold: $150
- Standard shipping only

---

## Shipping Method Exclusions

### Why Exclude Express Shipping?
**Reasons**:
- High costs eat into margins
- Encourage standard shipping use
- Reserve express for urgent orders

**How to Exclude**:
1. Campaign settings → **Excluded Methods**
2. Select shipping rates to exclude:
   - Express overnight
   - 2-day expedited
   - Same-day delivery
   - Saturday delivery

**Customer Experience**:
```
Cart: $80 (qualifies for free shipping)

Shipping Options:
✓ Standard (5-7 days): FREE
✗ Express (2-day): $25.00 (not discounted)
✗ Overnight: $45.00 (not discounted)
```

### Including All Methods
**Use Case**: High-margin products, premium brands

**Setup**: Leave "Excluded Methods" empty

**Result**: All shipping options show as free at threshold

---

## Partial Shipping Discounts

### Flat Amount Off
**Setup**:
- Threshold: $50
- Discount: $5 off shipping
- Apply to all methods

**Example**:
```
Cart: $60
Shipping Options:
- Standard ($7): $2 ($7 - $5)
- Express ($20): $15 ($20 - $5)
- Overnight ($40): $35 ($40 - $5)
```

### Percentage Off
**Setup**:
- Threshold: $100
- Discount: 50% off shipping
- Standard shipping only

**Example**:
```
Cart: $120
Standard Shipping: $10 → $5 (50% off)
```

### Tiered Shipping Discounts
Multiple thresholds for progressive discounts:

```
$50: $5 off shipping
$75: $10 off shipping
$100: Free shipping
```

---

## Progress Bar Integration

### Showing Shipping Progress
Widget can display shipping threshold alongside gift thresholds:

**Cart Widget Message**:
```
"Add $15 more for free shipping!"

Progress bar: [████████░░] 80% to free shipping
```

**Configuration**:
- Settings → Widget → Enable shipping progress
- Customize message text
- Choose display priority (shipping vs. gift)

### Multiple Goals Display
Show both gift and shipping thresholds:

**Example**:
```
🎁 Add $10 more for free tote bag
📦 Add $25 more for free shipping

Choose your goal!
```

---

## Analytics & Performance

### Track Shipping Campaign Impact

**Key Metrics** (in Analytics dashboard):
- **Conversion Rate**: Orders with free shipping vs. without
- **AOV Impact**: Average order value before/after campaign
- **Shipping Cost Savings**: Total $ given in free shipping
- **ROI**: Revenue increase vs. shipping cost absorbed

**Example Report**:
```
Campaign: Free Shipping over $75
Duration: 30 days
Orders Qualifying: 1,250
Average Cart Before: $65
Average Cart After: $82 (+26%)
Shipping Cost Absorbed: $9,375
Revenue Increase: $21,250
ROI: 2.27x
```

---

## Best Practices

### 1. Set Threshold Above AOV
**Formula**: Free shipping at 1.2-1.5x your current AOV

**Example**:
```
Current AOV: $55
Free Shipping Threshold: $70-$80
Goal: Lift AOV by 25-45%
```

### 2. Communicate Clearly
**In Cart**:
- "You're $12 away from free shipping!"
- Progress bar showing proximity

**On Product Pages**:
- Banner: "Free Shipping on orders over $75"
- Add urgency: "Add one more item!"

**At Checkout**:
- Confirm free shipping applied
- Show $ saved

### 3. Test Different Thresholds
**A/B Test**:
- Group A: $50 threshold
- Group B: $75 threshold
- Group C: $100 threshold

**Measure**:
- Conversion rate
- Average order value
- Profit margin per order

### 4. Seasonal Adjustments
**Holiday Season**: Lower threshold to compete
**Slow Season**: Raise threshold to protect margins
**Flash Sales**: Temporary free shipping (no threshold)

---

## Common Scenarios

### Scenario 1: Free Shipping + Free Gift
**Goal**: Encourage $100+ orders

**Setup**:
- Free gift at $75
- Free shipping at $100

**Outcome**: Customers add items to reach $100 for both benefits

### Scenario 2: Shipping Discount Tiers
**Goal**: Progressive incentive

**Setup**:
- $50: $5 off shipping
- $75: $10 off shipping
- $100: Free shipping

**Outcome**: Clear path to free shipping encourages incremental adds

### Scenario 3: Express Shipping Discount
**Goal**: Upsell express without full cost

**Setup**:
- Standard: Free at $75
- Express: 50% off at $75

**Outcome**: Some customers upgrade to express at reduced cost

---

## Troubleshooting

### Free shipping not applying?
**Check**:
1. Campaign is Active
2. Cart total meets threshold
3. Customer is in eligible region
4. Shipping method is included
5. No conflicting Shopify shipping rules

### Wrong shipping rate discounted?
**Verify**:
- Included/excluded methods are correct
- Discount amount or percentage is accurate
- Shopify shipping settings don't override

### Threshold not matching cart?
**Common Issues**:
- Taxes included/excluded setting mismatch
- Subscription items counted differently
- Pre-order items excluded from threshold
- Currency conversion rounding

---

## FAQ

**Q: Does free shipping apply to multiple packages?**  
A: Yes, if order qualifies, all packages ship free.

**Q: What about local pickup?**  
A: Typically excluded (no shipping cost to discount).

**Q: Can I offer free returns too?**  
A: Configure separately in Shopify's return settings.

**Q: Does this work with third-party shipping apps?**  
A: Yes, compatible with ShipStation, Shippo, etc.

**Q: Can wholesale customers get different thresholds?**  
A: Yes, create customer segment-specific campaigns.

---

## Related Guides

- [Free Gift Setup](./free-gift-setup.md) - Product gift campaigns
- [Custom Discounts](./custom-discounts.md) - Discount stacking
- [Widget Visibility](./widget-visibility.md) - Show shipping progress

---

## Need Help?

- **Live Chat**: [Support Page](/support)
- **Email**: support@gifttiersapp.com
- **Setup Call**: Book a free consultation

---

**Last Updated**: October 2025  
**Version**: 2.0

