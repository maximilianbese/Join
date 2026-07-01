/**
 * Issue Collector Configuration
 * IMPORTANT: This file contains sensitive data — never commit it to the Git repo!
 *
 * Setup:
 * 1. ISSUE_COLLECTOR_EMAIL  → the Gmail address stakeholders send their requests to
 * 2. N8N_STATUS_WEBHOOK_URL → n8n webhook URL for status-change notifications
 */

const ISSUE_COLLECTOR_EMAIL = "join.issue.collector@gmail.com";

const N8N_STATUS_WEBHOOK_URL =
  "https://maximilianbese.app.n8n.cloud/webhook/ticket-status-changed";
