export type CampaignType = "free_gift" | "bxgy" | "volume_discount";

export interface FreeGiftConfig {
  enabled: boolean;
  thresholdCents: number;
  giftVariantId: string;
  title: string;
}

export interface BXGYConfig {
  enabled: boolean;
  buyMinQty: number;
  getVariantIds: string[];
  discountType: "FREE" | "PERCENT";
  percentOff?: number;
  title: string;
}

export interface VolumeDiscountConfig {
  enabled: boolean;
  targetProducts: string[]; // Product or variant IDs
  tiers: Array<{
    quantity: number;
    discountPercentage: number;
  }>;
  title: string;
}

export interface CampaignConfig {
  id: string;
  type: CampaignType;
  title: string;
  status: "active" | "paused" | "archived";
  config: FreeGiftConfig | BXGYConfig | VolumeDiscountConfig;
  createdAt: Date;
  updatedAt: Date;
  endDate?: Date | null;
}

export interface GiftTiersConfig {
  enabled: boolean;
  thresholdCents: number;
  giftVariantId: string;
  title: string;
}

export interface GiftTiersFormData {
  enabled: boolean;
  threshold: string; // Dollar amount as string
  giftVariantId: string;
  title: string;
}

// New form data interfaces for different campaign types
export interface FreeGiftFormData {
  enabled: boolean;
  threshold: string;
  giftVariantId: string;
  title: string;
}

export interface BXGYFormData {
  enabled: boolean;
  buyMinQty: string;
  getVariantIds: string;
  discountType: "FREE" | "PERCENT";
  percentOff: string;
  title: string;
}

export interface VolumeDiscountFormData {
  enabled: boolean;
  targetProducts: string;
  tiers: Array<{
    quantity: string;
    discountPercentage: string;
  }>;
  title: string;
}
