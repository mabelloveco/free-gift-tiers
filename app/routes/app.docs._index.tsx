import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  List,
  Button,
  Divider,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export default function DocsIndex() {
  return (
    <Page>
      <TitleBar title="Theme Integration" />

      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Progress Bar Theme Block
              </Text>

              <Text as="p" variant="bodyMd">
                Add a progress bar to your theme that shows customers how close
                they are to receiving their free gift. This block automatically
                reads your campaign configuration and displays the current
                progress.
              </Text>

              <Divider />

              <Text as="h3" variant="headingSm">
                Installation Steps
              </Text>

              <List type="number">
                <List.Item>
                  Go to your Shopify Admin → Online Store → Themes
                </List.Item>
                <List.Item>Click "Customize" on your active theme</List.Item>
                <List.Item>
                  Navigate to the page where you want to add the progress bar
                  (e.g., Cart page)
                </List.Item>
                <List.Item>
                  Click "Add block" and search for "gift-progress-motivators"
                </List.Item>
                <List.Item>
                  Add the "Gift Progress Motivators" block to your desired
                  section
                </List.Item>
                <List.Item>Save your changes</List.Item>
              </List>

              <Divider />

              <Text as="h3" variant="headingSm">
                How it works
              </Text>

              <Text as="p" variant="bodyMd" tone="subdued">
                The progress bar block automatically:
              </Text>

              <List>
                <List.Item>
                  Reads your campaign configuration from the gift_tiers.config
                  metafield
                </List.Item>
                <List.Item>
                  Shows the current cart total and remaining amount needed
                </List.Item>
                <List.Item>
                  Displays the gift product that will be added
                </List.Item>
                <List.Item>
                  Updates in real-time as customers add items to their cart
                </List.Item>
              </List>

              <Box
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  💡 Pro tip: Place the progress bar on your cart page or
                  product pages to encourage customers to reach the free gift
                  threshold.
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Need help?
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                If you're having trouble with the theme integration, make sure:
              </Text>
              <List>
                <List.Item>Your campaign is configured and enabled</List.Item>
                <List.Item>The gift variant ID is correct</List.Item>
                <List.Item>Your theme supports app blocks</List.Item>
              </List>

              <Button url="/app/campaigns" variant="primary">
                Configure Campaign
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
