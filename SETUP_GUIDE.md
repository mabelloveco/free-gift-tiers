# FreeGiftTiers Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18.20+ or 20.10+
- Shopify Partner Account
- Test Store (Development or Plus Sandbox)
- Shopify CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mabelloveco/free-gift-tiers.git
   cd free-gift-tiers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Shopify app credentials
   ```

4. **Initialize database**
   ```bash
   npm run setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables
```bash
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=your_app_url
SESSION_SECRET=your_session_secret
DATABASE_URL=your_database_url
```

### Shopify App Setup
1. Create app in Shopify Partner Dashboard
2. Configure OAuth redirect URLs
3. Set required scopes:
   - `write_products`
   - `write_discounts`
   - `read_discounts`
   - `read_orders`
   - `write_cart_transforms`

## 📱 App Features

### Campaign Types
- **Free Gift Campaigns**: Automatic free gifts at spending thresholds
- **BOGO Campaigns**: Buy X Get Y promotions
- **Volume Discounts**: Tiered pricing based on quantity
- **Progress Widgets**: Motivational progress bars

### Theme Integration
1. Install the app in your Shopify store
2. Navigate to the app dashboard
3. Configure your first campaign
4. Add progress bar blocks to your theme

## 🎨 Marketing Assets

### Preview App Store Listing
```bash
npm run preview:listing:auto
```
Opens a local preview at `http://localhost:7788`

### Required Assets
- App icon (512x512)
- Cover image (1600x900)
- 4 screenshots (1280x800)
- All assets go in `/marketing/` directory

## 🚀 Deployment

### Production Setup
1. **Database**: Set up PostgreSQL for production
2. **Hosting**: Deploy to Vercel, Heroku, or similar
3. **Environment**: Configure production environment variables
4. **Domain**: Set up custom domain for app URL

### Shopify App Store Submission
1. Complete all marketing assets
2. Test thoroughly in production
3. Submit to Shopify Partner Dashboard
4. Monitor approval process

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview:listing` - Preview App Store listing
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Shopify

### Project Structure
```
├── app/                    # Remix app routes
├── extensions/             # Shopify Functions
├── marketing/              # App Store assets
├── prisma/                 # Database schema
└── public/                 # Static assets
```

## 📚 Documentation

- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Release Notes](./RELEASE_NOTES.md)
- [Store Listing](./STORE_LISTING.md)
- [Submission Checklist](./SUBMISSION_CHECKLIST.md)

## 🆘 Support

For issues and questions:
- **Email**: orders@mabelloveco.com
- **GitHub**: Create an issue in the repository
- **Documentation**: Check the guides above

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] App deployed to production
- [ ] Marketing assets created
- [ ] App Store listing submitted
- [ ] Monitoring set up
- [ ] Support processes in place
