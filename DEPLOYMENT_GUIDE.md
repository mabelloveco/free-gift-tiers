# FreeGiftTiers - Production Deployment Guide

## 🚀 Deployment Checklist

### 1. Production Domain Setup
- [ ] **Replace placeholder URLs** in `shopify.app.toml`:
  - Change `https://your-production-domain.com` to your actual domain
  - Update `redirect_urls` with your production domain
- [ ] **Configure DNS** for your production domain
- [ ] **Set up SSL certificate** (automatic with Fly.io)

### 2. Fly.io Deployment
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
fly auth login

# Launch your app
fly launch

# Deploy
fly deploy
```

### 3. Environment Variables
Set these in Fly.io dashboard or via CLI:
```bash
fly secrets set SHOPIFY_API_KEY=your_api_key
fly secrets set SHOPIFY_API_SECRET=your_api_secret
fly secrets set SCOPES=read_customer_events,read_discounts,read_metaobjects,read_orders,read_themes,write_cart_transforms,write_customers,write_discounts,write_metaobjects,write_products
fly secrets set HOST=your-production-domain.com
```

### 4. Database Setup
```bash
# Run migrations
fly ssh console
npm run setup
```

### 5. Update Shopify App Configuration
1. Go to your Shopify Partner Dashboard
2. Update app URLs to your production domain
3. Update webhook URLs
4. Test webhook delivery

## 🔧 Configuration Files

### fly.toml
- ✅ Created with health check endpoint
- ✅ Configured for production
- ✅ Auto-scaling enabled

### shopify.app.toml
- ✅ GDPR webhooks added
- ✅ OAuth scopes configured
- ⚠️ **TODO**: Replace placeholder URLs with production domain

## 📋 Pre-Launch Checklist

### Technical Requirements
- [ ] Production domain configured
- [ ] SSL certificate active
- [ ] Database migrations complete
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] Webhooks tested

### Legal Requirements
- [ ] Privacy Policy live at `/legal/privacy`
- [ ] Terms of Service live at `/legal/terms`
- [ ] GDPR webhooks implemented
- [ ] Legal links in app navigation

### App Store Requirements
- [ ] App URLs point to production domain
- [ ] All webhooks functional
- [ ] Billing system tested
- [ ] Support documentation complete

## 🚨 Critical Actions Before Submission

1. **Replace URLs**: Update `shopify.app.toml` with your production domain
2. **Deploy to Fly.io**: Follow deployment steps above
3. **Test Everything**: Verify all features work in production
4. **Update Partner Dashboard**: Set production URLs in Shopify Partners
5. **Submit for Review**: App is ready for Shopify App Store submission

## 📞 Support

For deployment issues:
- Email: support@gifttiersapp.com
- Documentation: Check `/support` pages in app
- GitHub: Create issue for technical problems
