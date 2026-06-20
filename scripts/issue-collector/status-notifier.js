/**
 * n8n status notification integration.
 * Sends a webhook to n8n when a ticket moves to a different column.
 * Called from board.js after a drag-and-drop operation completes.
 */

/**
 * Returns the configured n8n webhook URL, or null if not configured, with a console warning.
 * @returns {string|null} The webhook URL or null.
 */
function getWebhookUrl() {
  const url = typeof N8N_STATUS_WEBHOOK_URL !== "undefined" ? N8N_STATUS_WEBHOOK_URL : null;
  if (!url || url.includes("DEIN-SUBDOMAIN")) {
    console.warn("n8n webhook URL not configured — update config.js");
    return null;
  }
  return url;
}

/**
 * Builds the JSON payload object for a status change webhook.
 * @param {Object} task - The task object.
 * @param {string} oldStatus - The previous column status (e.g. "triage").
 * @param {string} newStatus - The new column status (e.g. "inprogress").
 * @returns {Object} The payload object.
 */
function buildStatusPayload(task, oldStatus, newStatus) {
  return {
    title: task.title,
    senderEmail: task.senderEmail,
    oldStatus: oldStatus,
    newStatus: newStatus,
    taskId: task.id,
    timestamp: new Date().toISOString(),
  };
}

/**
 * POSTs the status payload to the webhook URL and logs errors on failure.
 * @param {string} url - The webhook URL.
 * @param {Object} payload - The payload object to send.
 * @returns {Promise<void>}
 */
async function sendStatusWebhook(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("n8n webhook error:", response.status);
    }
  } catch (error) {
    console.error("Status notification failed:", error);
  }
}

/**
 * Notifies n8n of a task status change via webhook.
 * Only fires for AI-generated tasks that have a sender email address.
 * @param {Object} task - The task object.
 * @param {string} oldStatus - The previous column status (e.g. "triage").
 * @param {string} newStatus - The new column status (e.g. "inprogress").
 */
async function notifyStatusChange(task, oldStatus, newStatus) {
  if (!task.aiGenerated || !task.senderEmail) return;
  const url = getWebhookUrl();
  if (!url) return;
  const payload = buildStatusPayload(task, oldStatus, newStatus);
  await sendStatusWebhook(url, payload);
}
