import { prisma } from "../db.server";
import type { CampaignType } from "../types/gift-tiers";

export interface ProductPerformance {
  productId: string;
  productTitle?: string;
  variantId: string;
  variantTitle?: string;
  totalGiftsGiven: number;
  totalValue: number;
  percentageOfTotal: number;
  conversionRate: number;
  campaigns: string[];
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignTitle: string;
  campaignType: CampaignType;
  totalEvents: number;
  totalValue: number;
  uniqueCustomers: number;
  conversionRate: number;
  eventBreakdown: Record<string, number>;
  topProducts: ProductPerformance[];
  revenueImpact: {
    totalDiscounts: number;
    estimatedRevenue: number;
    roi: number;
  };
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalValue: number;
  totalGiftsGiven: number;
  uniqueCustomers: number;
  topPerformingCampaigns: Array<{
    id: string;
    title: string;
    events: number;
    value: number;
  }>;
  topPerformingProducts: ProductPerformance[];
  eventsByType: Record<string, number>;
  trendsData: Array<{
    date: string;
    events: number;
    value: number;
  }>;
}

export async function getAnalyticsSummary(
  shop: string,
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsSummary> {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
  const end = endDate || new Date();

  // Get all events in date range
  const events = await prisma.campaignEvent.findMany({
    where: {
      shop,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      campaign: true,
    },
  });

  // Calculate metrics
  const totalEvents = events.length;
  const totalValue = events.reduce((sum, e) => sum + Number(e.discountAmount || 0), 0);
  const totalGiftsGiven = events.filter(e => e.eventType === "gift_added").length;
  const uniqueCustomers = new Set(events.map(e => e.customerId).filter(Boolean)).size;

  // Event breakdown
  const eventsByType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top campaigns
  const campaignStats = events.reduce((acc, event) => {
    if (!acc[event.campaignId]) {
      acc[event.campaignId] = {
        id: event.campaignId,
        title: event.campaign.title,
        events: 0,
        value: 0,
      };
    }
    acc[event.campaignId].events++;
    acc[event.campaignId].value += Number(event.discountAmount || 0);
    return acc;
  }, {} as Record<string, any>);

  const topPerformingCampaigns = Object.values(campaignStats)
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  // Top products (from metadata)
  const productStats = events.reduce((acc, event) => {
    if (!event.metadata) return acc;
    
    try {
      const meta = JSON.parse(event.metadata);
      const variantId = meta.variantId || meta.giftVariantId;
      
      if (variantId) {
        if (!acc[variantId]) {
          acc[variantId] = {
            productId: meta.productId || "unknown",
            productTitle: meta.productTitle,
            variantId,
            variantTitle: meta.variantTitle,
            totalGiftsGiven: 0,
            totalValue: 0,
            percentageOfTotal: 0,
            conversionRate: 0,
            campaigns: new Set(),
          };
        }
        acc[variantId].totalGiftsGiven++;
        acc[variantId].totalValue += Number(event.discountAmount || 0);
        acc[variantId].campaigns.add(event.campaign.title);
      }
    } catch (e) {
      // Invalid JSON, skip
    }
    
    return acc;
  }, {} as Record<string, any>);

  const topPerformingProducts = Object.values(productStats)
    .map((p: any) => ({
      ...p,
      campaigns: Array.from(p.campaigns),
      percentageOfTotal: totalValue > 0 ? (p.totalValue / totalValue) * 100 : 0,
      conversionRate: 0, // Would need more data to calculate
    }))
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, 10);

  // Trends data (group by day)
  const trendsMap = events.reduce((acc, event) => {
    const date = event.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, events: 0, value: 0 };
    }
    acc[date].events++;
    acc[date].value += Number(event.discountAmount || 0);
    return acc;
  }, {} as Record<string, any>);

  const trendsData = Object.values(trendsMap).sort((a: any, b: any) => 
    a.date.localeCompare(b.date)
  );

  return {
    totalEvents,
    totalValue,
    totalGiftsGiven,
    uniqueCustomers,
    topPerformingCampaigns,
    topPerformingProducts,
    eventsByType,
    trendsData,
  };
}

export async function getCampaignAnalytics(
  shop: string,
  campaignId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CampaignAnalytics | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { shop, id: campaignId },
  });

  if (!campaign) return null;

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate || new Date();

  const events = await prisma.campaignEvent.findMany({
    where: {
      campaignId,
      shop,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const totalEvents = events.length;
  const totalValue = events.reduce((sum, e) => sum + Number(e.discountAmount || 0), 0);
  const uniqueCustomers = new Set(events.map(e => e.customerId).filter(Boolean)).size;

  // Event breakdown
  const eventBreakdown = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Product performance for this campaign
  const productStats = events.reduce((acc, event) => {
    if (!event.metadata) return acc;
    
    try {
      const meta = JSON.parse(event.metadata);
      const variantId = meta.variantId || meta.giftVariantId;
      
      if (variantId) {
        if (!acc[variantId]) {
          acc[variantId] = {
            productId: meta.productId || "unknown",
            productTitle: meta.productTitle,
            variantId,
            variantTitle: meta.variantTitle,
            totalGiftsGiven: 0,
            totalValue: 0,
            percentageOfTotal: 0,
            conversionRate: 0,
            campaigns: [campaign.title],
          };
        }
        acc[variantId].totalGiftsGiven++;
        acc[variantId].totalValue += Number(event.discountAmount || 0);
      }
    } catch (e) {
      // Invalid JSON, skip
    }
    
    return acc;
  }, {} as Record<string, any>);

  const topProducts = Object.values(productStats)
    .map((p: any) => ({
      ...p,
      percentageOfTotal: totalValue > 0 ? (p.totalValue / totalValue) * 100 : 0,
    }))
    .sort((a: any, b: any) => b.totalValue - a.totalValue);

  // Calculate conversion rate (simplified - would need order data for accuracy)
  const giftAddedCount = eventBreakdown.gift_added || eventBreakdown.threshold_reached || 0;
  const checkoutCount = events.filter(e => e.orderId).length;
  const conversionRate = giftAddedCount > 0 ? (checkoutCount / giftAddedCount) * 100 : 0;

  return {
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    campaignType: campaign.type as CampaignType,
    totalEvents,
    totalValue,
    uniqueCustomers,
    conversionRate,
    eventBreakdown,
    topProducts,
    revenueImpact: {
      totalDiscounts: totalValue,
      estimatedRevenue: totalValue * 3, // Rough estimate: $1 discount = $3 revenue
      roi: 200, // Placeholder
    },
  };
}

export async function getProductAnalytics(
  shop: string,
  variantId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ProductPerformance | null> {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate || new Date();

  const events = await prisma.campaignEvent.findMany({
    where: {
      shop,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      campaign: true,
    },
  });

  // Filter events for this specific variant
  const relevantEvents = events.filter(event => {
    if (!event.metadata) return false;
    try {
      const meta = JSON.parse(event.metadata);
      return meta.variantId === variantId || meta.giftVariantId === variantId;
    } catch (e) {
      return false;
    }
  });

  if (relevantEvents.length === 0) return null;

  const totalValue = relevantEvents.reduce((sum, e) => sum + Number(e.discountAmount || 0), 0);
  const campaigns = new Set(relevantEvents.map(e => e.campaign.title));

  // Get product info from first event
  let productTitle = "Unknown Product";
  let variantTitle = "Unknown Variant";
  let productId = "unknown";
  
  try {
    const firstMeta = JSON.parse(relevantEvents[0].metadata || "{}");
    productTitle = firstMeta.productTitle || productTitle;
    variantTitle = firstMeta.variantTitle || variantTitle;
    productId = firstMeta.productId || productId;
  } catch (e) {
    // Keep defaults
  }

  // Calculate percentage of total
  const allEventsTotal = events.reduce((sum, e) => sum + Number(e.discountAmount || 0), 0);

  return {
    productId,
    productTitle,
    variantId,
    variantTitle,
    totalGiftsGiven: relevantEvents.length,
    totalValue,
    percentageOfTotal: allEventsTotal > 0 ? (totalValue / allEventsTotal) * 100 : 0,
    conversionRate: 0, // Would need order tracking
    campaigns: Array.from(campaigns),
  };
}

export async function exportAnalytics(
  shop: string,
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const summary = await getAnalyticsSummary(shop, startDate, endDate);
  
  // Generate CSV
  const csv: string[] = [];
  
  // Header
  csv.push("Analytics Export");
  csv.push(`Period: ${startDate?.toLocaleDateString() || "30 days ago"} to ${endDate?.toLocaleDateString() || "Today"}`);
  csv.push("");
  
  // Summary
  csv.push("Summary");
  csv.push("Metric,Value");
  csv.push(`Total Events,${summary.totalEvents}`);
  csv.push(`Total Value,$${(summary.totalValue / 100).toFixed(2)}`);
  csv.push(`Total Gifts Given,${summary.totalGiftsGiven}`);
  csv.push(`Unique Customers,${summary.uniqueCustomers}`);
  csv.push("");
  
  // Top Products
  csv.push("Top Performing Products");
  csv.push("Product,Variant,Gifts Given,Total Value,% of Total");
  summary.topPerformingProducts.forEach(p => {
    csv.push(`"${p.productTitle || 'Unknown'}","${p.variantTitle || 'Unknown'}",${p.totalGiftsGiven},$${(p.totalValue / 100).toFixed(2)},${p.percentageOfTotal.toFixed(1)}%`);
  });
  csv.push("");
  
  // Top Campaigns
  csv.push("Top Performing Campaigns");
  csv.push("Campaign,Events,Total Value");
  summary.topPerformingCampaigns.forEach(c => {
    csv.push(`"${c.title}",${c.events},$${(c.value / 100).toFixed(2)}`);
  });
  
  return csv.join("\n");
}

