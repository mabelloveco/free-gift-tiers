# Widget Visibility & Theme Integration Guide

## Overview
Add progress bars and motivational widgets to your Shopify theme to show customers how close they are to earning free gifts or discounts.

---

## Installing the Progress Bar Widget

### Step 1: Access Theme Editor
1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Customize** on your active theme
3. Navigate to the page where you want the widget (Cart, Product, Home)

### Step 2: Add the Block
1. Click **Add block** or **Add section**
2. Search for **"Gift Progress Motivators"** or **"gift-progress-motivators"**
3. Drag it to your desired position
4. The block appears immediately

### Step 3: Configure Settings
Available settings in theme editor:
- **Display Style**: Bar, Circle, Text-only
- **Show Gift Preview**: Display product image
- **Color Scheme**: Match your theme
- **Text Size**: Small, Medium, Large
- **Animation**: Enable/disable progress animation

### Step 4: Save
Click **Save** in the top-right corner. Widget is now live!

---

## Widget Behavior

### Automatic Data Reading
The progress bar automatically:
- Reads your active campaign configuration
- Calculates current cart total
- Shows remaining amount needed
- Displays the gift product preview
- Updates in real-time as cart changes

### No Configuration Needed
Once added to your theme, the widget:
- Pulls data from your campaigns
- Switches between campaigns based on customer cart
- Updates immediately when you edit campaigns

---

## Best Placement Strategies

### 1. Cart Page (Highest Conversion)
**Why**: Customers are already reviewing their order  
**Impact**: 15-25% increase in AOV  
**How**: Add to cart template main section

### 2. Product Pages
**Why**: Encourages adding more items  
**Impact**: 10-15% increase in items per order  
**How**: Add below "Add to Cart" button

### 3. Sticky Header
**Why**: Visible throughout shopping experience  
**Impact**: Constant reminder, passive motivation  
**How**: Add to header section, enable sticky positioning

### 4. Checkout (Shopify Plus only)
**Why**: Last chance to increase order value  
**Impact**: 5-10% checkout upsell  
**How**: Requires checkout.liquid editing

### 5. Collection Pages
**Why**: Shows rewards while browsing  
**Impact**: Higher add-to-cart rates  
**How**: Add to collection template sidebar

---

## Customizing Widget Design

### Using Theme Editor
**Color Options**:
- Progress bar fill color
- Background color
- Text color
- Border style

**Typography**:
- Font family (inherits from theme)
- Font size
- Font weight
- Letter spacing

**Layout**:
- Horizontal bar (default)
- Vertical bar
- Circular progress
- Text with icon

### Advanced CSS Customization

Add to your theme's `custom.css`:

```css
/* Progress bar container */
.gift-progress-widget {
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Progress bar fill */
.gift-progress-bar-fill {
  background: linear-gradient(90deg, #e85d37, #d84a28);
  border-radius: 8px;
  transition: width 0.3s ease;
}

/* Text styling */
.gift-progress-text {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
}

/* Gift product preview */
.gift-progress-product {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 0.5rem;
}
```

---

## Troubleshooting Widget Visibility

### Widget Not Showing Up?

#### Check 1: Theme Compatibility
**Requirement**: Theme must support App Blocks (Online Store 2.0)

**How to check**:
1. Go to Themes → Your theme
2. Look for "Online Store 2.0" badge
3. If missing, update theme or use legacy integration

**Legacy themes**: Contact support for manual integration code.

#### Check 2: Campaign Status
**Requirement**: At least one campaign must be Active

**How to fix**:
1. Go to Free Gift Tiers app
2. Open Campaigns
3. Set status to "Active" on at least one campaign
4. Refresh storefront

#### Check 3: Gift Variant ID
**Requirement**: Gift product must exist and be published

**How to fix**:
1. Verify variant ID in campaign settings
2. Check product is published (not draft/archived)
3. Ensure inventory > 0
4. Test with different variant ID

#### Check 4: Block Enabled
**Requirement**: Block must be enabled in theme editor

**How to fix**:
1. Go to Theme Customizer
2. Find "Gift Progress Motivators" block
3. Check visibility toggle is ON
4. Ensure not hidden by display conditions

#### Check 5: JavaScript Errors
**Requirement**: No conflicting scripts

**How to check**:
1. Open browser console (F12)
2. Look for red error messages
3. Check for conflicts with other apps
4. Temporarily disable other apps to isolate issue

---

## Mobile Optimization

### Responsive Design
Widget automatically adjusts for mobile:
- Stacks vertically on narrow screens
- Enlarges touch targets
- Simplifies text for readability
- Collapses gift preview on very small screens

### Mobile-Specific Settings
Configure in theme editor:
- **Hide on Mobile**: Option to show only on desktop
- **Compact Mode**: Smaller version for mobile
- **Tap to Expand**: Collapsed by default, expands on tap

### Testing Mobile Experience
1. Use Chrome DevTools mobile emulator
2. Test on actual devices (iOS & Android)
3. Check different screen sizes (320px - 768px)
4. Verify touch interactions work smoothly

---

## Multiple Widgets on Same Page

### Can I add multiple progress bars?
**Yes**, but consider:

**Good Use Cases**:
- Different campaigns for different product types
- Tiered rewards (show multiple thresholds)
- A/B testing different placements

**How to Set Up**:
1. Add multiple "Gift Progress Motivators" blocks
2. Each can be configured independently
3. Use display conditions to show relevant campaign

**Example**:
- Widget 1: Free gift at $50 (cart page)
- Widget 2: Free shipping at $75 (cart page)
- Widget 3: VIP discount at $100 (checkout)

---

## Analytics & Performance Tracking

### Widget Engagement Metrics
Track in Analytics dashboard:
- **Impression Rate**: How often widget is seen
- **Interaction Rate**: Clicks/taps on widget
- **Conversion Impact**: AOV before/after widget install
- **Campaign Attribution**: Which widget drove conversion

### A/B Testing Placement
Test different positions:
1. Create duplicate theme
2. Place widget in different location
3. Split traffic 50/50
4. Run for 2 weeks minimum
5. Compare AOV and conversion rate

---

## Advanced Configurations

### Conditional Display Rules
Show widget only when:
- Cart total is within $10 of threshold
- Customer is logged in
- Specific products are in cart
- Customer is first-time visitor

**How to Set Up**:
1. Go to Settings → Widget Display
2. Enable conditional logic
3. Set trigger conditions
4. Save and test

### Multi-Language Support
Widget text automatically translates if:
- Shopify Markets is enabled
- Theme uses Shopify translation system
- Translations provided in app settings

**To customize translations**:
1. Go to Settings → Translations
2. Select language
3. Edit widget text strings
4. Save changes

### Custom Messages
Override default progress messages:
- "You're $15 away from a free gift!"
- "Add $25 more to unlock free shipping"
- "Congrats! You've earned a free sample"

**How to Customize**:
1. Settings → Widget Text
2. Edit message templates
3. Use variables: `{amount}`, `{product}`, `{threshold}`

---

## FAQ

**Q: Does the widget slow down my site?**  
A: No, it's optimized and loads asynchronously (<10kb).

**Q: Can I hide the widget on specific pages?**  
A: Yes, use theme editor display conditions.

**Q: Does it work with slide-out carts?**  
A: Yes, supports all major cart apps (Rebuy, Slide Cart, etc.).

**Q: Can I trigger the widget with JavaScript?**  
A: Yes, see developer docs for API reference.

**Q: Does it work in headless/custom frontends?**  
A: Yes, API available for custom implementations.

---

## Related Guides

- [Free Gift Setup](./free-gift-setup.md) - Create campaigns
- [BXGY Setup](./bxgy-setup.md) - Configure promotions
- [Custom Discounts](./custom-discounts.md) - Discount rules

---

## Need Help?

- **Live Chat**: [Support Page](/support)
- **Email**: support@gifttiersapp.com
- **Video Tutorial**: [Watch Widget Setup](https://example.com/videos/widget)
- **Developer Docs**: [API Reference](https://docs.gifttiersapp.com)

---

**Last Updated**: October 2025  
**Version**: 2.0

