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
