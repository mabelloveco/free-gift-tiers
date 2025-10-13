# Support Page - Feature Guide

## Overview
A comprehensive customer FAQ and support page with AI-powered chat assistant for the Free Gift Tiers Shopify app.

## Location
**Route:** `/app/support`  
**File:** `app/routes/app.support._index.tsx`  
**Styles:** `app/routes/app.support._index/styles.module.css`

---

## Features

### 1. **Hero Section with Search**
- Bold, welcoming headline
- Real-time FAQ search functionality
- Filters all sections and questions dynamically
- Warm gradient background with hover effects

### 2. **Quick Start Links**
- Direct access to key features:
  - Create Your First Campaign
  - Theme Integration Guide
  - View Analytics
  - Configure Settings
- Styled with brand colors and smooth transitions

### 3. **Comprehensive FAQ Sections**

#### **Free Gift Setup** 🎁
- Creating campaigns
- Finding gift variant IDs
- Multiple gift thresholds
- Cart threshold behavior

#### **BOGO (Buy X Get Y)** 🛍️
- How BXGY works
- Setting up free offers
- Targeting collections
- Customer product selection

#### **Widget Visibility & Theme Integration** 🎨
- Adding progress bar to theme
- Design customization
- Best placement strategies
- Troubleshooting visibility

#### **Custom Discounts** 💰
- Discount calculations
- Campaign combinations
- Shopify discount code stacking
- Preventing discount abuse

#### **Shipping Discounts** 📦
- Free shipping setup
- Combining with product gifts
- Regional considerations

#### **Gift as Cart Discount** 🏷️
- Product vs discount methods
- Configuration steps
- Choosing the right approach

### 4. **AI Chat Assistant**
- Contextual responses based on FAQ content
- Keyword matching for intelligent replies
- Topics covered:
  - Free gifts and thresholds
  - BOGO campaigns
  - Widget and theme integration
  - Shipping discounts
  - Discount stacking
  - Variant ID lookup
  - Analytics and reporting
- Real-time typing indicators
- Smooth message animations
- Sticky sidebar for easy access

### 5. **Additional Support Resources**
- Email support link
- Context-aware AI info card

---

## Design Principles Applied

### Typography
- **Bold hierarchy:** Large hero (2.25rem), section titles (1.5rem), body (0.9375rem)
- **Letter-spacing:** Tightened for headlines (-0.02em), expanded for labels (0.05em)
- **Font weights:** 700 for headings, 600 for emphasis, 400 for body

### Color Palette (Warm & Accessible)
- **Primary:** `#e85d37` (warm orange-red)
- **Accent gradient:** `#e85d37` → `#d84a28`
- **Background gradients:** `#fef3f2` → `#fff5f0`
- **Text contrast:** `#1a1a1a` primary, `#6b6b6b` secondary (WCAG AA compliant)

### Spacing & Layout
- **Generous whitespace:** 600px padding on hero, 500px on cards
- **Consistent gaps:** 300-600 between sections
- **Rounded corners:** 16px on cards, 12px on buttons/inputs, 8px on badges

### Motion & Transitions
- **Duration:** 150-250ms (following brand guidelines)
- **Easing:** `ease` for natural feel
- **Hover effects:** Subtle lifts (translateY -2px), shadow increases
- **Animations:** Message slide-in (200ms), loading dots

### Accessibility Features
- **Focus states:** 2-3px solid outline with offset
- **Keyboard navigation:** Full support with visible focus indicators
- **ARIA labels:** `aria-expanded` on collapsible sections
- **Reduced motion:** Respects `prefers-reduced-motion` media query
- **Color contrast:** Meets WCAG AA standards
- **Base font size:** 16px minimum
- **Screen reader friendly:** Semantic HTML structure

### Interactive Elements
- **Collapsible FAQ items:** Expand/collapse with arrow indicators
- **Smooth transitions:** 200ms ease on all state changes
- **Hover states:** Color shifts, shadow elevation, micro-translations
- **Active states:** Button press feedback
- **Loading states:** Animated dots for chat

---

## AI Chat Logic

The AI assistant uses keyword matching to provide contextual responses:

### Keyword Triggers
- **"free gift", "threshold"** → Free gift campaign setup
- **"bogo", "buy", "get"** → BXGY campaign details
- **"widget", "progress bar", "theme"** → Theme integration
- **"shipping", "delivery"** → Shipping discount info
- **"discount", "combine", "stack"** → Discount stacking rules
- **"variant id", "product id"** → How to find variant IDs
- **"analytics", "report", "stats"** → Analytics dashboard help

### Default Response
If no keywords match, prompts user to ask about specific topics with suggestions.

### Response Timing
- Simulated 1.2-second delay to feel natural
- Loading state with animated dots
- Message animations on appearance

---

## Integration with App

### Navigation
Added to main app navigation in `app/routes/app.tsx`:
```tsx
<Link to="/app/support">Support</Link>
```

### Route Structure
- Parent: `app.tsx` (with navigation)
- Child: `app.support._index.tsx` (support page)
- Styles: Co-located in `app.support._index/styles.module.css`

---

## Customization

### Updating FAQ Content
Edit the `faqSections` array in `app.support._index.tsx`:
```typescript
const faqSections = [
  {
    title: "Your Section",
    icon: "🎯",
    color: "success",
    questions: [
      { q: "Question?", a: "Answer." }
    ]
  }
]
```

### Styling Adjustments
All custom styles in `styles.module.css`:
- Colors: Update gradients, text colors
- Spacing: Adjust padding/gaps
- Typography: Change font sizes, weights
- Motion: Modify transition durations

### AI Response Logic
Update keyword matching in `handleSendMessage` function:
```typescript
if (lowerQuery.includes("your-keyword")) {
  response = "Your custom response";
}
```

---

## Performance Considerations

### Optimizations
- **No layout shift:** Fixed heights where needed
- **GPU-friendly transforms:** `translateY` for hover effects
- **Lazy animations:** Animations only on interaction
- **Efficient search:** Client-side filtering with simple string matching
- **Minimal re-renders:** Memoized callbacks, local state

### Bundle Size
- **No external dependencies:** Uses Shopify Polaris components
- **Single CSS module:** ~250 lines, minimal footprint
- **Inline logic:** AI responses generated client-side

---

## Testing Checklist

### Functionality
- [ ] Search filters all FAQ sections correctly
- [ ] Collapsible sections expand/collapse smoothly
- [ ] Quick links navigate to correct pages
- [ ] AI chat accepts and responds to messages
- [ ] Chat scroll works for long conversations
- [ ] Email support link opens mail client

### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces section states
- [ ] Color contrast passes WCAG AA
- [ ] Reduced motion preference respected

### Visual Design
- [ ] Hero gradient renders correctly
- [ ] Hover effects smooth and consistent
- [ ] Typography hierarchy clear and readable
- [ ] Spacing feels generous and balanced
- [ ] Chat messages align properly
- [ ] Icons and badges display correctly

### Responsive
- [ ] Layout adapts on mobile (<768px)
- [ ] Text remains readable at all sizes
- [ ] Chat sidebar moves to bottom on mobile
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll

---

## Future Enhancements

### Potential Features
1. **Real AI Integration:** Connect to OpenAI or custom LLM
2. **Video Tutorials:** Embed setup guides in FAQ sections
3. **Live Chat:** Connect to support ticketing system
4. **Search Analytics:** Track most-searched topics
5. **Multi-language:** i18n support for global merchants
6. **Dark Mode:** Theme toggle for user preference
7. **Feedback System:** "Was this helpful?" on each FAQ item
8. **Bookmark Favorites:** Let users save frequently referenced items

---

## Code Structure

### Component Architecture
```
app.support._index.tsx
├── Hero Section (search + title)
├── Quick Links (CTAs)
├── Layout (two-column)
│   ├── FAQ Sections (left, 2/3 width)
│   │   ├── Section Cards
│   │   │   └── Collapsible Q&A Items
│   └── AI Chat Assistant (right, 1/3 width, sticky)
│       ├── Chat Messages
│       ├── Chat Input
│       └── Support Resources
└── Additional Help Links
```

### State Management
- `searchQuery`: Controls FAQ filtering
- `openSections`: Tracks expanded/collapsed FAQ items
- `chatMessages`: Array of user/assistant messages
- `currentMessage`: Current chat input value
- `isChatLoading`: Loading state for AI responses

### Key Functions
- `toggleSection()`: Expand/collapse FAQ items
- `handleSendMessage()`: Process and respond to chat messages
- `filteredSections`: Computed FAQ sections based on search

---

## Support & Maintenance

### Common Issues

**"No results found" appears too easily**
- Adjust search sensitivity in filtering logic
- Add fuzzy matching for better results

**Chat responses feel too slow/fast**
- Modify `setTimeout` delay in `handleSendMessage` (currently 1200ms)

**Styles not applying**
- Verify CSS module import path
- Check for CSS class name typos
- Clear browser cache

**Navigation link not showing**
- Ensure `app.tsx` includes support link
- Check route file for proper configuration

---

## Credits

Built with:
- **Remix** - Full-stack React framework
- **Shopify Polaris** - UI component library
- **CSS Modules** - Scoped styling
- **TypeScript** - Type safety

Design follows brand guidelines for emotional, fashion-forward UI with accessibility-first approach.

---

**Last Updated:** October 11, 2025  
**Maintained By:** Free Gift Tiers Team

