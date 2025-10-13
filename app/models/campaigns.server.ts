import { prisma } from "../db.server";
import { canCreateCampaign } from "./billing.server";
import type { CampaignType, CampaignConfig } from "../types/gift-tiers";

export interface CreateCampaignData {
  type: CampaignType;
  title: string;
  status: "active" | "paused" | "archived";
  config: any;
}

export async function createCampaign(
  shop: string,
  data: CreateCampaignData
): Promise<CampaignConfig> {
  // Check billing limits
  const canCreate = await canCreateCampaign(shop);
  if (!canCreate) {
    throw new Error("Campaign limit reached. Please upgrade your plan.");
  }

  const campaign = await prisma.campaign.create({
    data: {
      shop,
      type: data.type,
      title: data.title,
      status: data.status,
      config: JSON.stringify(data.config),
    },
  });

  return {
    id: campaign.id,
    type: campaign.type as CampaignType,
    title: campaign.title,
    status: campaign.status as "active" | "paused" | "archived",
    config: JSON.parse(campaign.config),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    endDate: campaign.endDate,
  };
}

export async function getCampaigns(shop: string): Promise<CampaignConfig[]> {
  const campaigns = await prisma.campaign.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  return campaigns.map(campaign => ({
    id: campaign.id,
    type: campaign.type as CampaignType,
    title: campaign.title,
    status: campaign.status as "active" | "paused" | "archived",
    config: JSON.parse(campaign.config),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    endDate: campaign.endDate,
  }));
}

export async function getCampaign(shop: string, id: string): Promise<CampaignConfig | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { shop, id },
  });

  if (!campaign) return null;

  return {
    id: campaign.id,
    type: campaign.type as CampaignType,
    title: campaign.title,
    status: campaign.status as "active" | "paused" | "archived",
    config: JSON.parse(campaign.config),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    endDate: campaign.endDate,
  };
}

export async function updateCampaign(
  shop: string,
  id: string,
  data: Partial<CreateCampaignData>
): Promise<CampaignConfig> {
  const campaign = await prisma.campaign.update({
    where: { id, shop },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.status && { status: data.status }),
      ...(data.config && { config: JSON.stringify(data.config) }),
      updatedAt: new Date(),
    },
  });

  return {
    id: campaign.id,
    type: campaign.type as CampaignType,
    title: campaign.title,
    status: campaign.status as "active" | "paused" | "archived",
    config: JSON.parse(campaign.config),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    endDate: campaign.endDate,
  };
}

export async function deleteCampaign(shop: string, id: string): Promise<void> {
  await prisma.campaign.delete({
    where: { id, shop },
  });
}

export async function getActiveCampaigns(shop: string): Promise<CampaignConfig[]> {
  const campaigns = await prisma.campaign.findMany({
    where: { 
      shop, 
      status: "active",
      config: {
        path: ["enabled"],
        equals: true,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return campaigns.map(campaign => ({
    id: campaign.id,
    type: campaign.type as CampaignType,
    title: campaign.title,
    status: campaign.status as "active" | "paused" | "archived",
    config: JSON.parse(campaign.config),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    endDate: campaign.endDate,
  }));
}

export async function toggleCampaignStatus(
  shop: string,
  id: string
): Promise<CampaignConfig> {
  const campaign = await prisma.campaign.findFirst({
    where: { shop, id },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const newStatus = campaign.status === "active" ? "paused" : "active";
  
  return updateCampaign(shop, id, { status: newStatus });
}
