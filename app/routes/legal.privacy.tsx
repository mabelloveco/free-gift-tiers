import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({});
};

export default function PrivacyPolicy() {
  return (
    <Page title="Privacy Policy">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Privacy Policy
              </Text>
              
              <Text as="p">
                <strong>Last updated:</strong> January 2025
              </Text>

              <Text variant="headingMd" as="h3">
                Information We Collect
              </Text>
              <Text as="p">
                FreeGiftTiers collects minimal data necessary to provide our services:
              </Text>
              <ul>
                <li>Campaign configuration data stored in Shopify metafields</li>
                <li>Analytics data for campaign performance tracking</li>
                <li>Shop information required for app functionality</li>
              </ul>

              <Text variant="headingMd" as="h3">
                How We Use Your Information
              </Text>
              <Text as="p">
                We use collected information solely to:
              </Text>
              <ul>
                <li>Provide and maintain our discount campaign services</li>
                <li>Generate analytics and performance reports</li>
                <li>Improve our app functionality</li>
                <li>Provide customer support</li>
              </ul>

              <Text variant="headingMd" as="h3">
                Data Storage and Security
              </Text>
              <Text as="p">
                All data is stored securely using Shopify's infrastructure and metafields system. 
                We implement appropriate security measures to protect your information.
              </Text>

              <Text variant="headingMd" as="h3">
                Your Rights
              </Text>
              <Text as="p">
                You have the right to:
              </Text>
              <ul>
                <li>Access your personal data</li>
                <li>Request data deletion</li>
                <li>Opt out of data collection</li>
                <li>Contact us with privacy concerns</li>
              </ul>

              <Text variant="headingMd" as="h3">
                Contact Us
              </Text>
              <Text as="p">
                For privacy-related questions, contact us at:{" "}
                <a href="mailto:privacy@gifttiersapp.com">privacy@gifttiersapp.com</a>
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
