import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

// This route creates demo data for testing analytics
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Get an active campaign
  const campaign = await prisma.campaign.findFirst({
    where: { shop: session.shop, status: "active" },
  });
  
  if (!campaign) {
    return json({ 
      success: false, 
      message: "No active campaign found. Please create and activate a campaign first." 
    });
  }
  
  // Sample product data
  const sampleProducts = [
    {
      productId: "gid://shopify/Product/1",
      productTitle: "Hoop Earrings - Gold",
      variantId: "gid://shopify/ProductVariant/101",
      variantTitle: "Medium",
      value: 3600, // $36.00
    },
    {
      productId: "gid://shopify/Product/2",
      productTitle: "Diamond Stud Earrings",
      variantId: "gid://shopify/ProductVariant/102",
      variantTitle: "Small",
      value: 8900, // $89.00
    },
    {
      productId: "gid://shopify/Product/3",
      productTitle: "Pearl Necklace",
      variantId: "gid://shopify/ProductVariant/103",
      variantTitle: "18 inch",
      value: 12500, // $125.00
    },
  ];
  
  const eventTypes = ["gift_added", "threshold_reached", "bxgy_applied", "volume_discount_applied"];
  
  // Create 50 sample events over the past 30 days
  const events = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const product = sampleProducts[i % sampleProducts.length];
    const eventType = eventTypes[i % eventTypes.length];
    
    // Random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    // Random customer ID
    const customerId = `gid://shopify/Customer/${100 + Math.floor(Math.random() * 20)}`;
    
    // Sometimes add order/cart ID
    const orderId = Math.random() > 0.5 ? `gid://shopify/Order/${1000 + i}` : null;
    const cartId = `gid://shopify/Cart/${2000 + i}`;
    
    events.push({
      campaignId: campaign.id,
      shop: session.shop,
      eventType,
      customerId,
      orderId,
      cartId,
      discountAmount: product.value,
      metadata: JSON.stringify({
        productId: product.productId,
        productTitle: product.productTitle,
        variantId: product.variantId,
        variantTitle: product.variantTitle,
        giftVariantId: product.variantId,
      }),
      createdAt,
    });
  }
  
  // Batch create events
  await prisma.campaignEvent.createMany({
    data: events,
  });
  
  return json({ 
    success: true, 
    message: `Created 50 demo events for campaign "${campaign.title}"` 
  });
};

