import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  IndexTable,
  Text,
  Badge,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    #graphql
    query {
      discountNodes(first: 50) {
        edges {
          node {
            id
            discount {
              ... on DiscountAutomaticApp {
                title
                status
                discountClass
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
              }
            }
            metafield(namespace: "$app:gift-tiers", key: "config") {
              value
            }
          }
        }
      }
    }
  `);

  const data = await response.json();
  const discounts = data.data?.discountNodes?.edges || [];

  return json({ discounts });
};

export default function GiftTiersIndex() {
  const { discounts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const resourceName = {
    singular: "discount",
    plural: "discounts",
  };

  const rowMarkup = discounts.map(
    ({ node }: any, index: number) => {
      const config = node.metafield?.value
        ? JSON.parse(node.metafield.value)
        : null;
      const title = node.discount?.title || "Untitled";
      const status = node.discount?.status || "ACTIVE";
      const thresholdDollars = config?.thresholdCents
        ? (config.thresholdCents / 100).toFixed(2)
        : "Not set";

      return (
        <IndexTable.Row id={node.id} key={node.id} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {title}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone={status === "ACTIVE" ? "success" : undefined}>
              {status}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>${thresholdDollars}</IndexTable.Cell>
          <IndexTable.Cell>
            {config?.giftVariantId ? "Configured" : "Not set"}
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  return (
    <Page>
      <TitleBar title="Free Gift Tiers">
        <button variant="primary" onClick={() => navigate("/app/gift-tiers/new")}>
          Create discount
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {discounts.length === 0 ? (
              <EmptyState
                heading="Create your first free gift discount"
                action={{
                  content: "Create discount",
                  onAction: () => navigate("/app/gift-tiers/new"),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Set up automatic free gifts when customers reach a spending
                  threshold.
                </p>
              </EmptyState>
            ) : (
              <IndexTable
                resourceName={resourceName}
                itemCount={discounts.length}
                headings={[
                  { title: "Title" },
                  { title: "Status" },
                  { title: "Threshold" },
                  { title: "Gift Product" },
                ]}
                selectable={false}
              >
                {rowMarkup}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

