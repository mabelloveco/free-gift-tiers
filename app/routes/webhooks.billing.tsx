import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { 
  createBillingPlan, 
  updateBillingStatus, 
  cancelBillingPlan 
} from "../models/billing.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!session) {
    return json({ error: "No session found" }, { status: 401 });
  }

  try {
    switch (topic) {
      case "APP_SUBSCRIPTIONS_UPDATE": {
        const payload = await request.json();
        const subscription = payload.app_subscription;

        if (subscription.status === "ACTIVE") {
          await createBillingPlan(
            shop,
            subscription.name,
            subscription.id
          );
        } else if (subscription.status === "CANCELLED") {
          await cancelBillingPlan(shop);
        } else {
          await updateBillingStatus(shop, "pending");
        }

        return json({ success: true });
      }

      case "APP_SUBSCRIPTIONS_CANCEL": {
        await cancelBillingPlan(shop);
        return json({ success: true });
      }

      case "APP_SUBSCRIPTIONS_PAUSE": {
        await updateBillingStatus(shop, "cancelled");
        return json({ success: true });
      }

      case "APP_SUBSCRIPTIONS_RESUME": {
        await updateBillingStatus(shop, "active");
        return json({ success: true });
      }

      default:
        return json({ error: "Unhandled webhook topic" }, { status: 400 });
    }
  } catch (error) {
    console.error("Billing webhook error:", error);
    return json({ error: "Webhook processing failed" }, { status: 500 });
  }
};
