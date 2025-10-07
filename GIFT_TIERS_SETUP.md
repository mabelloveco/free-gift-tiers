# Free Gift Tiers - Setup & Deployment Guide

## 🎯 Overview
This app automatically makes a gift product free when the cart reaches a specified threshold.

## 📋 Prerequisites
- Shopify CLI 3.85+
- Development store: mabeltheme-2.myshopify.com
- Node.js installed

## 🚀 Deployment Steps

### 1. Install Dependencies
```bash
cd ~/free-gift-tiers
npm install
```

### 2. Deploy the Extension
```bash
npm run deploy
```

This will:
- Compile the discount function to WebAssembly
- Upload it to Shopify
- Register the function with your app

### 3. Update App Scopes
The app needs new permissions:
```bash
npm run shopify app config push
```

You'll be prompted to update the app installation with new scopes:
- `write_discounts`
- `read_discounts`

### 4. Start Dev Server
```bash
npm run dev
```

This starts the Remix app with hot reload.

## 🎨 Using the App

### Create a Discount

1. Open the app in your Shopify admin
2. Click "Manage discounts"
3. Click "Create discount"
4. Fill in:
   - **Title**: Internal name (e.g., "Free Gift at $100")
   - **Threshold**: Minimum cart amount (e.g., 100.00)
   - **Gift Product**: Click to select a product variant
5. Click "Save"

### Test the Discount

1. Add products to your cart (total should be below threshold)
2. Add the gift product to cart
3. Note the price
4. Add more products to reach the threshold
5. The gift product should become $0

### Edit/Delete Discounts

1. Click on any discount in the list
2. Update settings as needed
3. Click "Save" or "Delete"

## 📂 Key Files Changed

### Extension Files
- `extensions/gift-tiers/src/run.ts` - Main discount logic
- `extensions/gift-tiers/input.graphql` - Function input query
- `extensions/gift-tiers/shopify.extension.toml` - Extension config
- `extensions/gift-tiers/src/index.ts` - Export entry point

### App Files
- `app/routes/app.gift-tiers._index.tsx` - List all discounts
- `app/routes/app.gift-tiers.new.tsx` - Create new discount
- `app/routes/app.gift-tiers.$functionId.$id.tsx` - Edit discount
- `app/routes/app._index.tsx` - Main app page with link
- `shopify.app.toml` - Updated app scopes

## 🔧 Troubleshooting

### Function not applying discount
- Check the discount is ACTIVE in Shopify admin
- Verify the gift product variant ID is correct
- Ensure cart subtotal meets the threshold
- Check that the gift product is in the cart

### Build errors
```bash
npm run shopify app function build
```

### Type errors in run.ts
The function uses `@ts-nocheck` because it targets the new `purchase.product-discount.run` API. After deploying, Shopify CLI will regenerate the types automatically.

To manually regenerate types:
```bash
npm run shopify app function typegen
```

## 🎯 How It Works

1. **Merchant configures** threshold and gift product via Remix UI
2. **Configuration saved** as JSON in discount's metafield
3. **Function reads** configuration at runtime for each cart evaluation
4. **If cart ≥ threshold** AND gift variant in cart, discount = 100% off that variant
5. **Customer sees** $0 for the gift product at checkout

## 🎨 Architecture

```
┌─────────────────┐
│  Remix UI       │ → Merchant configures
│  (Polaris)      │    threshold & gift variant
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GraphQL API    │ → Saves to discount
│  metafield      │    as JSON
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Shopify Function│ → Reads metafield
│ (WebAssembly)   │    & applies discount
└─────────────────┘
```

## 📝 Notes

- Discounts are automatic (no code needed at checkout)
- The function runs on Shopify's edge network (fast!)
- Configuration is per-discount (create multiple tiers)
- Uses product-specific discounts (not cart-wide)

## 🆘 Support

If you encounter issues:
1. Check Shopify CLI version: `npm run shopify version`
2. View function logs in Partner Dashboard
3. Test in Shopify admin → Discounts
4. Check discount status and configuration

