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

    // GDPR Customer Redact - Customer requests data deletion
    const payload = await request.json();
    const customerId = payload.customer?.id;
    
    if (customerId) {
      // Delete all campaign events associated with this customer
      await prisma.campaignEvent.deleteMany({
        where: {
          customerId: customerId.toString(),
          shop: shop
        }
      });

      console.log(`Deleted customer data for customer ${customerId} in shop ${shop}`);
      
      return json({
        customer_id: customerId,
        shop: shop,
        message: "Customer data redacted successfully"
      });
    }

    return json({ message: "No customer data to redact" });
  } catch (error) {
    console.error("GDPR customer redact error:", error);
    return json({ error: "Customer redaction failed" }, { status: 500 });
  }
};
