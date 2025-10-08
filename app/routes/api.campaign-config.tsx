import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getConfig, saveConfig } from "../models/giftTiers.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  
  try {
    const config = await getConfig(admin);
    return json({ success: true, config });
  } catch (error) {
    console.error("Error loading campaign config:", error);
    return json({ success: false, error: "Failed to load configuration" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  
  try {
    const formData = await request.formData();
    const configData = JSON.parse(formData.get("config") as string);
    
    await saveConfig(admin, configData);
    return json({ success: true, message: "Configuration saved successfully" });
  } catch (error) {
    console.error("Error saving campaign config:", error);
    return json({ success: false, error: "Failed to save configuration" }, { status: 500 });
  }
}
