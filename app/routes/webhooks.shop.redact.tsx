import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!session) {
    return json({ error: "No session found" }, { status: 401 });
  }

  try {
    console.log(`Received ${topic} webhook for ${shop}`);

    // GDPR Shop Redact - Shop requests complete data deletion
    // This is typically triggered when a shop is deleted or requests complete data removal
    
    // Delete all data associated with this shop
    await prisma.campaignEvent.deleteMany({
      where: { shop: shop }
    });

    await prisma.campaign.deleteMany({
      where: { shop: shop }
    });

    await prisma.billingPlan.deleteMany({
      where: { shop: shop }
    });

    // Note: Sessions are already handled by the app/uninstalled webhook
    // but we'll ensure they're cleaned up here too
    await prisma.session.deleteMany({
      where: { shop: shop }
    });

    console.log(`Deleted all data for shop ${shop}`);
    
    return json({
      shop: shop,
      message: "Shop data redacted successfully"
    });
  } catch (error) {
    console.error("GDPR shop redact error:", error);
    return json({ error: "Shop redaction failed" }, { status: 500 });
  }
};
