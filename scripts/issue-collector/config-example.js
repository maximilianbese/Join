/**
 * Issue Collector Configuration – EXAMPLE FILE
 * Copy this file to config.js and fill in your real values.
 * IMPORTANT: config.js is listed in .gitignore — never commit it!
 *
 * Setup:
 * 1. ISSUE_COLLECTOR_EMAIL  → the Gmail address stakeholders send their requests to
 * 2. N8N_STATUS_WEBHOOK_URL → n8n webhook URL for status-change notifications
 */

const ISSUE_COLLECTOR_EMAIL = "YOUR_ISSUES_ADDRESS@gmail.com";

const N8N_STATUS_WEBHOOK_URL =
  "https://YOUR-SUBDOMAIN.app.n8n.cloud/webhook/ticket-status-changed";
