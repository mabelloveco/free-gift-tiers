import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({});
};

export default function TermsOfService() {
  return (
    <Page title="Terms of Service">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Terms of Service
              </Text>
              
              <Text as="p">
                <strong>Last updated:</strong> January 2025
              </Text>

              <Text variant="headingMd" as="h3">
                Acceptance of Terms
              </Text>
              <Text as="p">
                By installing and using FreeGiftTiers, you agree to be bound by these Terms of Service.
              </Text>

              <Text variant="headingMd" as="h3">
                Service Description
              </Text>
              <Text as="p">
                FreeGiftTiers provides discount campaign management services for Shopify stores, 
                including free gift promotions, volume discounts, and BXGY campaigns.
              </Text>

              <Text variant="headingMd" as="h3">
                User Responsibilities
              </Text>
              <Text as="p">
                Users are responsible for:
              </Text>
              <ul>
                <li>Compliance with Shopify's Terms of Service</li>
                <li>Proper configuration of campaigns</li>
                <li>Monitoring campaign performance</li>
                <li>Payment of subscription fees (if applicable)</li>
              </ul>

              <Text variant="headingMd" as="h3">
                Service Availability
              </Text>
              <Text as="p">
                We strive for 99.9% uptime but cannot guarantee uninterrupted service. 
                We reserve the right to modify or discontinue services with notice.
              </Text>

              <Text variant="headingMd" as="h3">
                Limitation of Liability
              </Text>
              <Text as="p">
                FreeGiftTiers is provided "as is" without warranties. We are not liable for 
                any damages arising from use of our services.
              </Text>

              <Text variant="headingMd" as="h3">
                Termination
              </Text>
              <Text as="p">
                Either party may terminate this agreement at any time. Upon termination, 
                access to the service will be discontinued.
              </Text>

              <Text variant="headingMd" as="h3">
                Contact Information
              </Text>
              <Text as="p">
                For questions about these terms, contact us at:{" "}
                <a href="mailto:legal@gifttiersapp.com">legal@gifttiersapp.com</a>
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
