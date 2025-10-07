import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Button,
  EmptyState,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const campaigns = await prisma.campaign.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  return json({
    campaigns: campaigns.map((c) => ({
      ...c,
      eventCount: c._count.events,
    })),
  });
};

export default function CampaignsIndex() {
  const { campaigns } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const resourceName = {
    singular: "campaign",
    plural: "campaigns",
  };

  const rowMarkup = campaigns.map((campaign, index) => (
    <IndexTable.Row
      id={campaign.id}
      key={campaign.id}
      position={index}
      onClick={() => navigate(`/app/campaigns/${campaign.type}/${campaign.id}`)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {campaign.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={campaign.status === "active" ? "success" : "info"}>
          {campaign.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge>{campaign.type.replace("_", " ")}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>{campaign.eventCount}</IndexTable.Cell>
      <IndexTable.Cell>
        {new Date(campaign.createdAt).toLocaleDateString()}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page>
      <TitleBar title="All Campaigns">
        <button
          variant="primary"
          onClick={() => navigate("/app")}
        >
          Create campaign
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {campaigns.length === 0 ? (
              <EmptyState
                heading="Create your first campaign"
                action={{
                  content: "Create campaign",
                  onAction: () => navigate("/app"),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Set up automatic discounts and free gifts for your store.</p>
              </EmptyState>
            ) : (
              <IndexTable
                resourceName={resourceName}
                itemCount={campaigns.length}
                headings={[
                  { title: "Title" },
                  { title: "Status" },
                  { title: "Type" },
                  { title: "Events" },
                  { title: "Created" },
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

