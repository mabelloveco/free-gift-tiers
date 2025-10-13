import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { exportAnalytics } from "../models/analytics.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const timeRange = url.searchParams.get("range") || "30";
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case "7":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "365":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "all":
      startDate.setFullYear(2020, 0, 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }
  
  const csv = await exportAnalytics(session.shop, startDate, endDate);
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="analytics-${timeRange}days-${Date.now()}.csv"`,
    },
  });
};

