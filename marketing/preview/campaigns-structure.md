# FreeGiftTiers Campaigns Page - Component Structure

## 🎨 **Live Preview Available**
**URL**: `http://localhost:8080/campaigns-preview.html`

## 📱 **Page Layout Structure**

```
┌─────────────────────────────────────────────────────────────┐
│                    FreeGiftTiers Campaign                  │
│                    (Dark Header)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Success: Campaign configuration saved successfully!     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│  │                                 │ │                     │ │
│  │     Campaign Configuration      │ │   How it works      │ │
│  │                                 │ │                     │ │
│  │  ☑ Enable Free Gift Campaign   │ │                     │ │
│  │                                 │ │  When customers     │ │
│  │  Campaign Title:                │ │  add items to       │ │
│  │  [Free Gift Over $50        ]  │ │  their cart that    │ │
│  │                                 │ │  meet or exceed     │ │
│  │  Threshold ($):                 │ │  your threshold,    │ │
│  │  [$50.00                    ]  │ │  they'll auto-      │ │
│  │                                 │ │  matically receive │ │
│  │  Gift Product Variant ID:       │ │  the specified     │ │
│  │  [gid://shopify/ProductVariant/] │ │  gift product for  │ │
│  │  [123456789                ]  │ │  free.             │ │
│  │                                 │ │                     │ │
│  │  [Save Configuration] [Test]    │ │  The campaign runs  │ │
│  │                                 │ │  automatically     │ │
│  └─────────────────────────────────┘ │  through Shopify    │ │
│                                      │  Functions and      │ │
│                                      │  doesn't require    │ │
│                                      │  any additional     │ │
│                                      │  setup once        │ │
│                                      │  configured.        │ │
│                                      └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 **Polaris Components Used**

### **Layout Components**
- `Page` - Main page wrapper with title bar
- `Layout` - Two-column responsive layout
- `Layout.Section` - Left (2/3) and right (1/3) sections
- `Card` - White background containers with borders

### **Form Components**
- `FormLayout` - Structured form field layout
- `TextField` - Text inputs with labels and validation
- `Checkbox` - Toggle for enabling/disabling campaign
- `Button` - Primary and secondary action buttons

### **Content Components**
- `BlockStack` - Vertical spacing between elements
- `InlineStack` - Horizontal button grouping
- `Text` - Typography with variants (headingMd, bodyMd)
- `Banner` - Success/error message display

### **Interactive Features**
- **Real-time validation** - Form fields show errors on blur
- **Loading states** - Buttons show "Saving..." / "Testing..." states
- **Success feedback** - Green banner appears after save
- **Error handling** - Red error messages for invalid inputs

## 🎯 **Key Features**

### **Form Validation**
- Required field validation
- Number format validation for threshold
- Gift variant ID format checking
- Real-time error clearing

### **User Experience**
- **Intuitive layout** - Clear two-column design
- **Helpful guidance** - "How it works" sidebar
- **Visual feedback** - Loading states and success messages
- **Accessibility** - Proper labels and focus management

### **Responsive Design**
- **Desktop**: Two-column layout (2/3 + 1/3)
- **Mobile**: Stacked single-column layout
- **Polaris spacing** - Consistent gap and padding

## 🚀 **Live Preview Features**

The preview includes:
- **Interactive form** - Try typing in fields
- **Button animations** - Click to see loading states
- **Validation feedback** - Leave fields empty to see errors
- **Success simulation** - Save button shows success message

**Open**: `http://localhost:8080/campaigns-preview.html` to see the live preview!
