import {Page, Card, Text, ProgressBar, InlineStack, BlockStack, Badge} from "@shopify/polaris";
export default function Preview(){
  const current=128, tiers=[90,150,200];
  const next=tiers.find(t=>current<t)??null;
  const pct=next?Math.min(100,Math.round((current/next)*100)):100;
  return (
    <Page title="Free Gift Progress (Preview)">
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <Text as="h2" variant="headingMd">Subtotal</Text>
            <Text as="span" variant="bodyMd">${current}</Text>
          </InlineStack>
          <div style={{height:16}}><ProgressBar progress={pct} size="large" /></div>
          <InlineStack gap="200">
            {tiers.map((t,i)=><Badge key={t} tone={current>=t?"success":"attention"}>{i+1} @ ${t}</Badge>)}
          </InlineStack>
        </BlockStack>
      </Card>
    </Page>
  );
}
