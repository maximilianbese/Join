/**
 * Issue Collector Configuration – EXAMPLE FILE
 * Copy this file to config.js and fill in your real values.
 * IMPORTANT: config.js is listed in .gitignore — never commit it!
 *
 * Setup:
 * 1. ISSUE_COLLECTOR_EMAIL    → the Gmail address stakeholders send their requests to
 * 2. N8N_STATUS_WEBHOOK_URL   → n8n webhook URL for status-change notifications
 * 3. EMAILJS_PUBLIC_KEY       → EmailJS account → Account → Public Key
 * 4. EMAILJS_SERVICE_ID       → EmailJS → Email Services → Service ID
 * 5. EMAILJS_TEMPLATE_ID      → EmailJS → Email Templates → Template ID
 */

const ISSUE_COLLECTOR_EMAIL = "YOUR_ISSUES_ADDRESS@gmail.com";

const N8N_STATUS_WEBHOOK_URL =
  "https://YOUR-SUBDOMAIN.app.n8n.cloud/webhook/ticket-status-changed";

const EMAILJS_PUBLIC_KEY   = "YOUR_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID   = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID  = "YOUR_EMAILJS_TEMPLATE_ID";
