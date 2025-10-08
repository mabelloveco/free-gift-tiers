import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  TextField,
  Button,
  Banner,
  Text,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Query for available discount functions
  const response = await admin.graphql(`
    #graphql
    query {
      shopifyFunctions(first: 25) {
        nodes {
          id
          apiType
          title
          appKey
        }
      }
    }
  `);

  const data = await response.json();
  const functions = data.data?.shopifyFunctions?.nodes || [];

  // Find our gift-tiers function
  const giftTiersFunction = functions.find(
    (fn: any) =>
      fn.apiType === "product_discounts" || fn.appKey?.includes("gift-tiers"),
  );

  return json({
    functionId: giftTiersFunction?.id,
    functions,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = String(formData.get("title"));
  const thresholdDollars = String(formData.get("thresholdDollars"));
  const giftVariantId = String(formData.get("giftVariantId"));
  const functionId = String(formData.get("functionId"));

  // Validate inputs
  if (!title || !thresholdDollars || !giftVariantId || !functionId) {
    return json(
      {
        error:
          "All fields are required. Please refresh the page if function ID is missing.",
      },
      { status: 400 },
    );
  }

  const thresholdCents = Math.round(parseFloat(thresholdDollars) * 100);

  if (isNaN(thresholdCents) || thresholdCents <= 0) {
    return json({ error: "Invalid threshold amount" }, { status: 400 });
  }

  const response = await admin.graphql(
    `
    #graphql
    mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
      discountAutomaticAppCreate(automaticAppDiscount: $discount) {
        automaticAppDiscount {
          discountId
          title
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        discount: {
          title,
          functionId,
          combinesWith: {
            orderDiscounts: false,
            productDiscounts: false,
            shippingDiscounts: false,
          },
          startsAt: new Date().toISOString(),
          metafields: [
            {
              namespace: "$app:gift-tiers",
              key: "config",
              type: "json",
              value: JSON.stringify({
                thresholdCents,
                giftVariantId,
              }),
            },
          ],
        },
      },
    },
  );

  const data = await response.json();

  if (data.data?.discountAutomaticAppCreate?.userErrors?.length > 0) {
    return json(
      {
        error:
          data.data.discountAutomaticAppCreate.userErrors[0]?.message ||
          "Failed to create discount",
      },
      { status: 400 },
    );
  }

  return redirect("/app/gift-tiers");
};

export default function NewGiftTier() {
  const actionData = useActionData<typeof action>();
  const { functionId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const [title, setTitle] = useState("");
  const [thresholdDollars, setThresholdDollars] = useState("");
  const [giftVariantId, setGiftVariantId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVariantPicker = useCallback(async () => {
    const selection = await shopify.resourcePicker({
      type: "variant",
      multiple: false,
    });

    if (selection && selection.length > 0) {
      setGiftVariantId(selection[0].id);
    }
  }, [shopify]);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("thresholdDollars", thresholdDollars);
    formData.append("giftVariantId", giftVariantId);
    formData.append("functionId", functionId || "");
    submit(formData, { method: "post" });
  }, [title, thresholdDollars, giftVariantId, functionId, submit]);

  const isValid = title && thresholdDollars && giftVariantId;

  return (
    <Page
      backAction={{
        content: "Discounts",
        onAction: () => navigate("/app/gift-tiers"),
      }}
      title="Create free gift discount"
      primaryAction={{
        content: "Save",
        disabled: !isValid || isSubmitting,
        loading: isSubmitting,
        onAction: handleSubmit,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {!functionId && (
              <Banner tone="warning">
                <p>
                  Function not found. Make sure the discount function is
                  deployed. Try running: npm run deploy
                </p>
              </Banner>
            )}

            {actionData?.error && (
              <Banner tone="critical">
                <p>{actionData.error}</p>
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Discount details
                </Text>
                <TextField
                  label="Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="e.g., Free Gift at $100"
                  autoComplete="off"
                  helpText="This will appear in the Shopify admin"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Threshold
                </Text>
                <TextField
                  label="Minimum cart amount"
                  type="number"
                  value={thresholdDollars}
                  onChange={setThresholdDollars}
                  prefix="$"
                  placeholder="100.00"
                  autoComplete="off"
                  helpText="When the cart subtotal reaches this amount, the gift becomes free"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Free gift product
                </Text>
                <BlockStack gap="200">
                  <Button onClick={handleVariantPicker}>
                    {giftVariantId
                      ? "Change product variant"
                      : "Select product variant"}
                  </Button>
                  {giftVariantId && (
                    <Text as="p" variant="bodySm" tone="subdued">
                      Selected: {giftVariantId}
                    </Text>
                  )}
                  <Text as="p" variant="bodySm" tone="subdued">
                    This product variant will become $0 when the threshold is
                    met
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
