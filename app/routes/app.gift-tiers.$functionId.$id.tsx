import { useState, useCallback, useEffect } from "react";
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
  InlineStack,
  Badge,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const { id } = params;

  const response = await admin.graphql(
    `
    #graphql
    query GetDiscount($id: ID!) {
      discountNode(id: $id) {
        id
        discount {
          ... on DiscountAutomaticApp {
            title
            status
            discountClass
          }
        }
        metafield(namespace: "$app:gift-tiers", key: "config") {
          value
        }
      }
    }
  `,
    {
      variables: { id: `gid://shopify/DiscountNode/${id}` },
    },
  );

  const data = await response.json();
  const discountNode = data.data?.discountNode;

  if (!discountNode) {
    throw new Response("Discount not found", { status: 404 });
  }

  return json({ discountNode });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const { id } = params;

  const actionType = formData.get("_action");

  if (actionType === "delete") {
    await admin.graphql(
      `
      #graphql
      mutation DeleteDiscount($id: ID!) {
        discountAutomaticDelete(id: $id) {
          deletedAutomaticDiscountId
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        variables: { id: `gid://shopify/DiscountAutomaticApp/${id}` },
      },
    );

    return redirect("/app/gift-tiers");
  }

  const title = String(formData.get("title"));
  const thresholdDollars = String(formData.get("thresholdDollars"));
  const giftVariantId = String(formData.get("giftVariantId"));

  if (!title || !thresholdDollars || !giftVariantId) {
    return json({ error: "All fields are required" }, { status: 400 });
  }

  const thresholdCents = Math.round(parseFloat(thresholdDollars) * 100);

  if (isNaN(thresholdCents) || thresholdCents <= 0) {
    return json({ error: "Invalid threshold amount" }, { status: 400 });
  }

  // Update the discount
  const response = await admin.graphql(
    `
    #graphql
    mutation UpdateAutomaticDiscount($id: ID!, $discount: DiscountAutomaticAppInput!) {
      discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $discount) {
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
        id: `gid://shopify/DiscountAutomaticApp/${id}`,
        discount: {
          title,
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

  if (data.data?.discountAutomaticAppUpdate?.userErrors?.length > 0) {
    return json(
      {
        error:
          data.data.discountAutomaticAppUpdate.userErrors[0]?.message ||
          "Failed to update discount",
      },
      { status: 400 },
    );
  }

  return json({ success: true });
};

export default function EditGiftTier() {
  const { discountNode } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const config = discountNode.metafield?.value
    ? JSON.parse(discountNode.metafield.value)
    : { thresholdCents: 0, giftVariantId: "" };

  const [title, setTitle] = useState(discountNode.discount.title || "");
  const [thresholdDollars, setThresholdDollars] = useState(
    (config.thresholdCents / 100).toFixed(2),
  );
  const [giftVariantId, setGiftVariantId] = useState(
    config.giftVariantId || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Discount updated successfully");
    }
  }, [actionData, shopify]);

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
    submit(formData, { method: "post" });
    setTimeout(() => setIsSubmitting(false), 1000);
  }, [title, thresholdDollars, giftVariantId, submit]);

  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this discount?")) {
      setIsDeleting(true);
      const formData = new FormData();
      formData.append("_action", "delete");
      submit(formData, { method: "post" });
    }
  }, [submit]);

  const isValid = title && thresholdDollars && giftVariantId;

  return (
    <Page
      backAction={{
        content: "Discounts",
        onAction: () => navigate("/app/gift-tiers"),
      }}
      title={title}
      primaryAction={{
        content: "Save",
        disabled: !isValid || isSubmitting,
        loading: isSubmitting,
        onAction: handleSubmit,
      }}
      secondaryActions={[
        {
          content: "Delete",
          destructive: true,
          loading: isDeleting,
          onAction: handleDelete,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {actionData?.error && (
              <Banner tone="critical">
                <p>{actionData.error}</p>
              </Banner>
            )}

            {actionData?.success && (
              <Banner tone="success">
                <p>Discount updated successfully!</p>
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Discount details
                  </Text>
                  <Badge
                    tone={
                      discountNode.discount.status === "ACTIVE"
                        ? "success"
                        : undefined
                    }
                  >
                    {discountNode.discount.status}
                  </Badge>
                </InlineStack>
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
                    Change product variant
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
