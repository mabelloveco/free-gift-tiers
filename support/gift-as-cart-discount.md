# Gift as Cart Discount Guide

## Overview
Understand the difference between adding a free gift product vs. applying a cart discount, and when to use each method.

---

## Two Methods Explained

### Method 1: Gift as Product (Default)
**How it works**:
- Physical product added to cart as line item
- Shows product name, image, and original price
- Displays as $0.00 with strikethrough
- Decrements inventory
- Appears on packing slip

**Visual in Cart**:
```
Subtotal: $75.00

Free Gift:
[Image] Deluxe Tote Bag
Price: $15.00 $0.00

Total: $75.00
```

### Method 2: Gift as Discount
**How it works**:
- No product added to cart
- Discount line item shows instead
- Reduces cart total by gift value
- No inventory impact
- No packing slip entry

**Visual in Cart**:
```
Subtotal: $75.00
Discount (Free Gift): -$15.00

Total: $60.00
```

---

## When to Use Each Method

### Use "Gift as Product" When:

#### 1. You Track Gift Inventory
**Scenario**: Limited-edition samples, promotional items

**Benefit**: Automatic inventory management
- Inventory decrements when gift added
- Out-of-stock prevents gift from adding
- Restock notifications work normally

**Example**: 
```
Gift: Limited Edition Lip Gloss
Inventory: 500 units
As orders placed: 500 → 499 → 498...
When empty: Campaign auto-pauses
```

#### 2. You Want Fulfillment Visibility
**Scenario**: Gift must be packed with order

**Benefit**: Appears on packing slip
- Warehouse sees gift item listed
- Pickers know to include gift
- Reduces fulfillment errors

**Example**:
```
Packing Slip for Order #1234:
- Black T-Shirt (M) x1
- Blue Jeans (32) x1
- FREE: Sample Pack x1 ← Visible to pickers
```

#### 3. Customer Needs Product Details
**Scenario**: Gift has ingredients, warnings, or specs

**Benefit**: Full product page available
- Customers can click through
- See product details
- Read reviews
- Add to wish list

### Use "Gift as Discount" When:

#### 1. No Inventory to Track
**Scenario**: Digital downloads, services, credit

**Benefit**: Simplified management
- No inventory to maintain
- No stock-outs
- Always available

**Example**:
```
Gift: $15 store credit
No physical product
Applied as discount code
```

#### 2. You Want Clean Cart Display
**Scenario**: Streamlined checkout experience

**Benefit**: Fewer line items
- Cart looks simpler
- Reduces cart abandonment
- Faster checkout flow

**Comparison**:
```
As Product (3 items):        As Discount (2 items):
- Shirt                       - Shirt
- Pants                       - Pants
- FREE: Tote ($0.00)         Discount: -$15.00

More visual clutter          Cleaner appearance
```

#### 3. Gift is Variable/Flexible
**Scenario**: Customer chooses gift at fulfillment

**Benefit**: No specific product constraint
- Discount applied
- Warehouse picks appropriate gift
- Flexibility based on stock

**Example**:
```
Cart shows: "$15 Gift - Choice of sample"
Warehouse: Picks from available samples
```

---

## Configuring Gift as Cart Discount

### Step 1: Create Free Gift Campaign
1. Go to **Campaigns** → **Create Campaign**
2. Select **Free Gift** type
3. Name your campaign

### Step 2: Enable Discount Mode
1. In campaign settings → **Advanced Options**
2. Toggle **"Apply as cart discount instead of product"**
3. Set discount amount (equal to gift value)

### Step 3: Configure Discount Details
**Discount Name**: How it appears in cart
- "Free Gift"
- "Free Sample"
- "Promotional Credit"
- "$15 Gift with Purchase"

**Discount Amount**: Fixed dollar value
- Match gift product value
- Or set custom amount

**Display Message** (optional):
- "Your free gift will be added during fulfillment"
- "Gift selection made by our team"

### Step 4: Save and Activate

---

## Visual Comparison

### Customer Cart View

#### Method 1: Product
```
┌─────────────────────────────────────┐
│ Your Cart (3 items)                 │
├─────────────────────────────────────┤
│ [IMG] Black T-Shirt       $29.99    │
│ [IMG] Blue Jeans          $45.00    │
│ [IMG] FREE: Tote Bag       $0.00    │
│       Original: $15.00              │
├─────────────────────────────────────┤
│ Subtotal               $74.99       │
│ Shipping               $5.00        │
│ ────────────────────────────────── │
│ Total                  $79.99       │
└─────────────────────────────────────┘
```

#### Method 2: Discount
```
┌─────────────────────────────────────┐
│ Your Cart (2 items)                 │
├─────────────────────────────────────┤
│ [IMG] Black T-Shirt       $29.99    │
│ [IMG] Blue Jeans          $45.00    │
├─────────────────────────────────────┤
│ Subtotal               $74.99       │
│ Discount (Free Gift)   -$15.00      │
│ Shipping               $5.00        │
│ ────────────────────────────────── │
│ Total                  $64.99       │
└─────────────────────────────────────┘
```

---

## Inventory Management

### Product Method Inventory

**Automatic Tracking**:
```
Initial Stock: 1000 units
Order 1: 999 (-1)
Order 2: 998 (-1)
Order 3: 997 (-1)
...
Stock at 0: Campaign pauses automatically
```

**Low Stock Warnings**:
- Set alert threshold (e.g., 50 units)
- Email notification sent
- Time to restock before campaign pauses

**Restocking**:
- Update inventory in Shopify
- Campaign automatically resumes
- No configuration changes needed

### Discount Method Inventory

**Manual Tracking**:
```
No automatic tracking
Warehouse manually monitors gift stock
Update campaign when running low
Pause campaign when out of stock
```

**Fulfillment Note**:
- Add note in campaign settings
- "Include [Gift Name] with all qualifying orders"
- Warehouse follows manual process

---

## Fulfillment Workflow

### Product Method Workflow

**For Warehouse**:
1. Order comes in
2. Packing slip lists all items including FREE gift
3. Picker scans/collects all items
4. Packs and ships

**Advantages**:
- Clear picking instructions
- Automatic inventory sync
- Standard fulfillment process

**Disadvantages**:
- Tied to specific product/variant
- Can't substitute if out of stock
- Requires product setup in Shopify

### Discount Method Workflow

**For Warehouse**:
1. Order comes in with discount
2. Manual check: Does order qualify for gift?
3. Refer to fulfillment note
4. Select appropriate gift from stock
5. Add to package

**Advantages**:
- Flexibility in gift selection
- Can substitute similar items
- No product setup required

**Disadvantages**:
- Manual process (more errors)
- No inventory tracking
- Requires staff training

---

## Tax & Reporting Implications

### Product Method Taxes
**Calculation**: 
- Gift product added at $0.00
- Tax calculated on $0.00
- No tax impact

**Reports**:
- Shows as line item in order
- Counts toward "items sold"
- Appears in product reports

**Example**:
```
Order #1234
- Shirt: $50.00 + $4.00 tax
- Gift: $0.00 + $0.00 tax
Total Tax: $4.00
```

### Discount Method Taxes
**Calculation**:
- Discount reduces subtotal
- Tax calculated on reduced amount
- May lower total tax

**Reports**:
- Shows as discount in order
- Counts toward "discounts given"
- Appears in discount reports

**Example**:
```
Order #1234
- Shirt: $50.00
- Discount: -$15.00
Taxable: $35.00 + $2.80 tax
Total Tax: $2.80 (less than product method)
```

**Note**: Tax treatment varies by jurisdiction. Consult accountant.

---

## Customer Experience Differences

### Product Method Experience

**Pros**:
- Clear what gift is (name, image, details)
- Can click through to product page
- Feels like receiving actual product
- Transparent pricing (shows original value)

**Cons**:
- Clutters cart with extra line item
- May confuse customers ("Why $0?")
- Can be accidentally removed from cart
- Takes up visual space

### Discount Method Experience

**Pros**:
- Clean, simple cart display
- Obvious savings amount
- Reduces cart complexity
- Faster checkout perception

**Cons**:
- No visual of what gift is
- Customer doesn't see gift product details
- Less tangible until delivery
- May forget gift is included

---

## Switching Between Methods

### From Product to Discount

**Steps**:
1. Pause existing campaign
2. Go to campaign settings
3. Advanced → Enable "Apply as cart discount"
4. Set discount amount
5. Reactivate campaign

**Impact**:
- Future orders use discount method
- Existing orders unchanged
- Inventory no longer auto-tracks

### From Discount to Product

**Steps**:
1. Pause campaign
2. Disable "Apply as cart discount"
3. Add gift variant ID
4. Verify inventory available
5. Reactivate

**Impact**:
- Future orders use product method
- Inventory tracking begins
- May need to create product if not exists

---

## Best Practices by Business Type

### E-commerce Fashion/Beauty
**Recommendation**: Product method

**Why**:
- Samples have specific ingredients/details
- Customers want to see product
- Inventory management critical
- Packing accuracy important

### Digital Products/Services
**Recommendation**: Discount method

**Why**:
- No physical inventory
- Flexibility in what "gift" entails
- Cleaner checkout
- May apply credit vs. specific item

### Wholesale/B2B
**Recommendation**: Discount method

**Why**:
- Flexible gift selection
- Bulk orders benefit from % discount
- Negotiated terms easier
- Less complexity in cart

### Subscription Boxes
**Recommendation**: Product method

**Why**:
- Curated experience important
- Specific products planned
- Packing lists essential
- Inventory forecasting needed

---

## FAQ

**Q: Can I use both methods simultaneously?**  
A: No, each campaign uses one method.

**Q: Do customers see a difference in order confirmations?**  
A: Yes - product method shows item, discount method shows discount line.

**Q: Which is better for my profit margin?**  
A: Identical if discount amount = product value. Tax treatment may differ.

**Q: Can I change methods mid-campaign?**  
A: Yes, but only affects future orders. Pause campaign first.

**Q: Does this affect Shopify's discount stacking?**  
A: Product method: no conflict. Discount method: may conflict with codes (configure stacking rules).

**Q: What about returns?**  
A: Product method: gift must be returned. Discount method: discount already applied, no return needed.

---

## Related Guides

- [Free Gift Setup](./free-gift-setup.md) - Core configuration
- [Custom Discounts](./custom-discounts.md) - Discount behavior
- [Shipping Discounts](./shipping-discounts.md) - Alternative offers

---

## Need Help?

- **Live Chat**: [Support Page](/support)
- **Email**: support@gifttiersapp.com
- **Decision Guide**: Not sure which method? Chat with us!

---

**Last Updated**: October 2025  
**Version**: 2.0

