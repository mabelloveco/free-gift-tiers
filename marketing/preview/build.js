#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read config
const configPath = join(__dirname, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Read STORE_LISTING.md
const listingPath = join(__dirname, '..', '..', 'STORE_LISTING.md');
const markdownContent = readFileSync(listingPath, 'utf8');

// Parse markdown to HTML
const htmlContent = marked(markdownContent);

// Get screenshots
const screenshotsDir = join(__dirname, '..', 'screenshots');
const screenshotFiles = readdirSync(screenshotsDir)
  .filter(file => file.match(/\.(png|jpg|jpeg|gif|webp)$/i))
  .sort()
  .map(file => ({
    filename: file,
    name: basename(file, '.png').replace(/^\d+-/, '').replace(/-/g, ' '),
    path: `../screenshots/${file}`
  }));

// Generate HTML template
const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title} - Shopify App Store Preview</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="hero">
        <div class="hero-content">
            <div class="hero-image">
                <img src="../cover/cover-1600x900.png" alt="${config.title} app interface" />
            </div>
            <div class="hero-text">
                <div class="app-icon">
                    <img src="../icons/icon-512x512.png" alt="${config.title} icon" />
                </div>
                <h1 class="app-title">${config.title}</h1>
                <p class="app-tagline">${config.tagline}</p>
                <div class="app-meta">
                    <div class="meta-item">
                        <span class="meta-label">Developer:</span>
                        <span class="meta-value">${config.developer}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${config.category} > ${config.subcategory}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Works with:</span>
                        <span class="meta-value">${config.worksWith.join(', ')}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Languages:</span>
                        <span class="meta-value">${config.languages.join(', ')}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Support:</span>
                        <span class="meta-value">${config.supportEmail}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="main-content">
            <div class="left-column">
                <div class="pricing-section">
                    <h2>Pricing Plans</h2>
                    <div class="pricing-table">
                        ${config.pricing.map(plan => `
                            <div class="pricing-card">
                                <div class="plan-name">${plan.name}</div>
                                <div class="plan-price">${plan.price}</div>
                                <div class="plan-notes">${plan.notes}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="right-column">
                <div class="description-section">
                    <h2>About this app</h2>
                    <div class="markdown-content">
                        ${htmlContent}
                    </div>
                </div>
            </div>
        </div>

        <div class="screenshots-section">
            <h2>Screenshots</h2>
            <div class="screenshots-grid">
                ${screenshotFiles.map(screenshot => `
                    <div class="screenshot-card">
                        <div class="screenshot-image">
                            <img src="${screenshot.path}" alt="${screenshot.name} screenshot" />
                        </div>
                        <div class="screenshot-caption">${screenshot.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

// Write the generated HTML
const outputPath = join(__dirname, 'index.html');
writeFileSync(outputPath, template);

console.log('✅ Generated preview at marketing/preview/index.html');
console.log(`📸 Found ${screenshotFiles.length} screenshots`);
console.log('🚀 Run: npm run preview:listing');
