import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState, useCallback } from "react";
import { Link } from "@remix-run/react";
import styles from "./support._index/styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // No authentication required - public page
  return json({});
};

const faqSections = [
  {
    title: "Free Gift Setup",
    icon: "🎁",
    color: "success",
    questions: [
      {
        q: "How do I create a free gift campaign?",
        a: "Navigate to Campaigns → Create Campaign → Select 'Free Gift'. Set your spending threshold and choose the gift variant ID from your Shopify products. The gift automatically adds to cart when customers reach the threshold.",
      },
      {
        q: "Where do I find the gift variant ID?",
        a: "In Shopify Admin, go to Products → Select your gift product → Click on the variant → The ID appears in the URL as 'variants/[ID]' or check the variant details in your product inventory.",
      },
      {
        q: "Can I offer multiple free gifts at different thresholds?",
        a: "Yes. Create separate campaigns with different thresholds. Each campaign runs independently, and customers receive gifts when they meet each threshold amount.",
      },
      {
        q: "What happens if a customer's cart total drops below the threshold?",
        a: "The free gift automatically removes from cart. The progress bar updates in real-time to show remaining spend needed.",
      },
    ],
  },
  {
    title: "BOGO (Buy X Get Y)",
    icon: "🛍️",
    color: "info",
    questions: [
      {
        q: "How does Buy X Get Y work?",
        a: "Set a minimum purchase quantity (X) for specific products. When customers add that quantity, they receive a discount on other products (Y). Choose between percentage discounts or free items.",
      },
      {
        q: "Can I make it truly 'free' in BOGO?",
        a: "Absolutely. Select 'FREE' as the discount type when configuring your BXGY campaign. The Y products automatically apply at 100% discount when conditions are met.",
      },
      {
        q: "How do I target specific collections for BOGO?",
        a: "Enter product variant IDs for both X (buy) and Y (get) products. Use collection filters in your Shopify admin to gather variant IDs efficiently.",
      },
      {
        q: "Can customers choose which Y product they get?",
        a: "Yes. List multiple variant IDs in the 'Get' field (comma-separated). Customers can add any of those variants to receive the discount.",
      },
    ],
  },
  {
    title: "Widget Visibility & Theme Integration",
    icon: "🎨",
    color: "attention",
    questions: [
      {
        q: "How do I add the progress bar to my theme?",
        a: "Go to Shopify Admin → Online Store → Themes → Customize → Add Block → Search 'gift-progress-motivators' → Place it on cart, product, or any page. It reads your active campaigns automatically.",
      },
      {
        q: "Can I customize the progress bar design?",
        a: "The progress bar inherits your theme's colors and fonts. For advanced customization, access the theme editor and adjust the 'Gift Progress Motivators' block settings.",
      },
      {
        q: "Where should I place the progress bar for best results?",
        a: "Cart page drives highest conversions. Product pages and sticky headers also perform well. Test multiple placements using your analytics dashboard.",
      },
      {
        q: "The widget isn't showing up. What should I check?",
        a: "Verify: 1) Campaign is active, 2) Gift variant ID is correct, 3) Theme supports app blocks (Online Store 2.0), 4) Block is enabled in theme editor.",
      },
    ],
  },
  {
    title: "Custom Discounts",
    icon: "💰",
    color: "warning",
    questions: [
      {
        q: "How are custom discounts calculated?",
        a: "Custom discounts apply per campaign logic: percentage off for volume tiers, fixed amount for free gifts (100% off), or BXGY percentage. All calculations happen at checkout via Shopify Functions.",
      },
      {
        q: "Can I combine multiple discount campaigns?",
        a: "Yes, if your plan allows multiple active campaigns. Each campaign evaluates independently. Use Settings to prioritize discount stacking rules.",
      },
      {
        q: "Do custom discounts work with Shopify discount codes?",
        a: "By default, they stack. Use Settings → Discount Behavior to control whether campaigns combine with manual codes or override them.",
      },
      {
        q: "How do I prevent discount abuse?",
        a: "Set minimum order quantities, limit campaign duration, or restrict specific products. Use Analytics to monitor unusual patterns.",
      },
    ],
  },
  {
    title: "Shipping Discounts",
    icon: "📦",
    color: "info",
    questions: [
      {
        q: "Can I offer free shipping with gift tiers?",
        a: "Yes. In Campaign settings, enable 'Shipping Discount' and set your threshold. Free shipping applies automatically when customers qualify.",
      },
      {
        q: "How do shipping discounts combine with product gifts?",
        a: "They stack by default. Customers can receive both a free product and free shipping if you've configured both campaign types.",
      },
      {
        q: "Can I set regional shipping discounts?",
        a: "Currently, shipping discounts apply store-wide. For regional rules, use Shopify's native shipping zones combined with our thresholds.",
      },
    ],
  },
  {
    title: "Gift as Cart Discount",
    icon: "🏷️",
    color: "success",
    questions: [
      {
        q: "What's the difference between gift as product vs. discount?",
        a: "Gift as product adds a free item to cart (shows as line item). Gift as discount applies a price reduction (no physical line item). Choose based on your inventory tracking needs.",
      },
      {
        q: "How do I configure gift as a cart discount?",
        a: "Create a Free Gift campaign → Advanced Settings → Toggle 'Apply as cart discount instead of product'. Set the discount amount equal to your gift's value.",
      },
      {
        q: "Which method is better for my store?",
        a: "Use product method if you track inventory for gifts. Use discount method for no-inventory gifts (e.g., samples) or to simplify cart display.",
      },
    ],
  },
];

const quickLinks = [
  { title: "Get Started", url: "/" },
  { title: "View Pricing", url: "/pricing" },
  { title: "Install App", url: "/" },
];

export default function SupportIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I'm here to help you with campaign setup, troubleshooting, and best practices. Ask me anything.",
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const toggleSection = useCallback((title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  const filteredSections = faqSections.map((section) => ({
    ...section,
    questions: section.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.questions.length > 0);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setCurrentMessage("");
    setIsChatLoading(true);

    // Simulate AI response based on FAQ data
    setTimeout(() => {
      let response = "I understand you're asking about that topic. ";

      // Simple keyword matching for demo
      const lowerQuery = userMessage.toLowerCase();
      
      if (lowerQuery.includes("free gift") || lowerQuery.includes("threshold")) {
        response = "To create a free gift campaign, go to Campaigns → Create Campaign → Select 'Free Gift'. Set your spending threshold and add the gift variant ID. The gift automatically adds when customers reach your threshold. Need help finding variant IDs?";
      } else if (lowerQuery.includes("bogo") || lowerQuery.includes("buy") || lowerQuery.includes("get")) {
        response = "BOGO campaigns let you reward purchases with discounts. Set a minimum quantity (X), choose get products (Y), and select discount type (free or percentage). You can target specific products by variant ID. Want to learn more about variant IDs?";
      } else if (lowerQuery.includes("widget") || lowerQuery.includes("progress bar") || lowerQuery.includes("theme")) {
        response = "Add the progress bar via Shopify Admin → Themes → Customize → Add Block → 'Gift Progress Motivators'. Place it on your cart or product pages for best conversion. Having trouble seeing it?";
      } else if (lowerQuery.includes("shipping") || lowerQuery.includes("delivery")) {
        response = "Enable shipping discounts in your campaign settings. They stack with product gifts by default. Set thresholds just like free gift campaigns. Need help with shipping zones?";
      } else if (lowerQuery.includes("discount") || lowerQuery.includes("combine") || lowerQuery.includes("stack")) {
        response = "Discounts can stack across campaigns if your plan allows. Control stacking rules in Settings → Discount Behavior. Each campaign evaluates independently at checkout. Want to see examples?";
      } else if (lowerQuery.includes("variant id") || lowerQuery.includes("product id")) {
        response = "Find variant IDs in Shopify Admin → Products → Select product → Click variant. The ID appears in the URL as 'variants/[ID]'. Copy just the numbers. Still can't find it?";
      } else if (lowerQuery.includes("analytics") || lowerQuery.includes("report") || lowerQuery.includes("stats")) {
        response = "View campaign performance in Analytics. Track conversions, revenue impact, and customer behavior. Export reports for deeper analysis. Want help interpreting your data?";
      } else if (lowerQuery.includes("install") || lowerQuery.includes("setup") || lowerQuery.includes("start")) {
        response = "Getting started is easy! Install the app from Shopify App Store, create your first campaign, add the progress bar widget to your theme, and you're ready to go. Need step-by-step guidance?";
      } else {
        response = "I'm here to help! You can ask me about setting up campaigns (free gifts, BOGO, volume discounts), theme integration, troubleshooting, analytics, or best practices. What specific challenge are you facing?";
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsChatLoading(false);
    }, 1200);
  }, [currentMessage]);

  return (
    <div className={styles.publicPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🎁</span>
            <span className={styles.logoText}>Free Gift Tiers</span>
          </Link>
          <nav className={styles.nav}>
            <a href="/" className={styles.navLink}>Home</a>
            <a href="/support" className={styles.navLink + " " + styles.navLinkActive}>Support</a>
            <a href="/" className={styles.navButton}>Get Started</a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              How can we help you today?
            </h1>
            <p className={styles.heroSubtitle}>
              Everything you need to create, launch, and optimize your campaigns
            </p>
            
            <div className={styles.searchBar}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className={styles.quickStart}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Quick Start</h2>
            <div className={styles.quickLinks}>
              {quickLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  className={styles.quickLink}
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className={styles.content}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {/* FAQ Sections */}
              <div className={styles.faqColumn}>
                {filteredSections.length === 0 && searchQuery && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>🔍</div>
                    <h3 className={styles.emptyStateTitle}>No results found for "{searchQuery}"</h3>
                    <p className={styles.emptyStateText}>
                      Try different keywords or ask the AI assistant
                    </p>
                  </div>
                )}

                {filteredSections.map((section) => (
                  <div key={section.title} className={styles.faqCard}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionIcon}>{section.icon}</span>
                      <h2 className={styles.sectionTitle}>{section.title}</h2>
                      <span className={styles.badge}>
                        {section.questions.length} {section.questions.length === 1 ? "topic" : "topics"}
                      </span>
                    </div>

                    <div className={styles.questionsContainer}>
                      {section.questions.map((item, index) => (
                        <div key={index} className={styles.questionItem}>
                          <button
                            className={styles.questionButton}
                            onClick={() => toggleSection(`${section.title}-${index}`)}
                            aria-expanded={openSections[`${section.title}-${index}`] || false}
                          >
                            <span className={styles.questionText}>{item.q}</span>
                            <span className={styles.questionIcon}>
                              {openSections[`${section.title}-${index}`] ? "▲" : "▼"}
                            </span>
                          </button>

                          {openSections[`${section.title}-${index}`] && (
                            <div className={styles.answer}>
                              {item.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Chat Assistant */}
              <div className={styles.chatColumn}>
                <div className={styles.chatContainer}>
                  <div className={styles.chatHeader}>
                    <span className={styles.chatIcon}>💬</span>
                    <h3 className={styles.chatTitle}>Ask AI Assistant</h3>
                  </div>

                  <div className={styles.chatMessages}>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`${styles.message} ${
                          msg.role === "assistant" ? styles.messageAssistant : styles.messageUser
                        }`}
                      >
                        <div className={styles.messageRole}>
                          {msg.role === "assistant" ? "AI Assistant" : "You"}
                        </div>
                        <div className={styles.messageContent}>{msg.content}</div>
                      </div>
                    ))}
                    
                    {isChatLoading && (
                      <div className={`${styles.message} ${styles.messageAssistant}`}>
                        <div className={styles.messageRole}>AI Assistant</div>
                        <div className={styles.messageContent}>
                          <span className={styles.loadingDots}>Thinking</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.chatInput}>
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask about setup, troubleshooting, best practices..."
                      className={styles.chatTextarea}
                      rows={3}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      className={styles.sendButton}
                      onClick={handleSendMessage}
                      disabled={isChatLoading || !currentMessage.trim()}
                    >
                      {isChatLoading ? "Sending..." : "Send Message"}
                    </button>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoTitle}>AI-powered by your FAQ</div>
                    <div className={styles.infoText}>
                      Trained on setup guides, troubleshooting steps, and best practices
                    </div>
                  </div>
                </div>

                {/* Additional Resources */}
                <div className={styles.resourcesCard}>
                  <h3 className={styles.resourcesTitle}>Still need help?</h3>
                  <p className={styles.resourcesText}>
                    Contact our support team for personalized assistance
                  </p>
                  <a
                    href="mailto:support@gifttiersapp.com"
                    className={styles.resourcesLink}
                  >
                    Email Support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            © 2025 Free Gift Tiers. Built for Shopify merchants.
          </p>
          <div className={styles.footerLinks}>
            <a href="/" className={styles.footerLink}>Home</a>
            <a href="/support" className={styles.footerLink}>Support</a>
            <a href="mailto:support@gifttiersapp.com" className={styles.footerLink}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

