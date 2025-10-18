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

    // GDPR Data Request - Customer requests their data
    // We store minimal data in our database, mostly campaign configurations
    // The main customer data is stored in Shopify's systems
    
    const payload = await request.json();
    const customerId = payload.customer?.id;
    
    if (customerId) {
      // Get any campaign events associated with this customer
      const customerEvents = await prisma.campaignEvent.findMany({
        where: {
          customerId: customerId.toString(),
          shop: shop
        },
        include: {
          campaign: true
        }
      });

      // Return the data we have about this customer
      return json({
        customer_id: customerId,
        shop: shop,
        events: customerEvents.map(event => ({
          id: event.id,
          event_type: event.eventType,
          campaign_name: event.campaign.name,
          discount_amount: event.discountAmount,
          created_at: event.createdAt,
          metadata: event.metadata
        })),
        message: "Customer data request processed"
      });
    }

    return json({ message: "No customer data found" });
  } catch (error) {
    console.error("GDPR data request error:", error);
    return json({ error: "Data request processing failed" }, { status: 500 });
  }
};
