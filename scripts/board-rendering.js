/**
 * Generates the HTML for a task card.
 * @param {Object} task - The task object.
 * @returns {string} The generated HTML string.
 */
function generateTaskCardHtml(task) {
  const catClass = getCategoryClass(task.category);
  const catLabel = getCategoryLabel(task.category);
  return getTaskCardTemplate(
    task,
    catClass,
    catLabel,
    generateProgressHtml(task),
    generateAssigneesHtml(task),
    getPriorityIcon(task.priority),
  );
}

/**
 * Returns the CSS class for a task category.
 * @param {string} category - The category string.
 * @returns {string} The CSS class name.
 */
function getCategoryClass(category) {
  if (!category) return "category-technical";
  const normalized = category.toLowerCase().replace(/\s+/g, "-");
  return normalized === "user-story"
    ? "category-user-story"
    : "category-technical";
}

/**
 * Returns the display label for a task category.
 * @param {string} category - The category string.
 * @returns {string} The category label.
 */
function getCategoryLabel(category) {
  if (!category) return "Technical Task";
  const normalized = category.toLowerCase().replace(/\s+/g, "-");
  return normalized === "user-story" ? "User Story" : "Technical Task";
}

/**
 * Generates the progress bar HTML for a task.
 * @param {Object} task - The task object.
 * @returns {string} The progress bar HTML string, or empty string if no subtasks.
 */
function generateProgressHtml(task) {
  if (task.subtasks && task.subtasks.length > 0) {
    const completed = countCompletedSubtasks(task.subtasks);
    const total = task.subtasks.length;
    return getProgressBarTemplate(completed, total);
  }
  return "";
}

/**
 * Counts the number of completed subtasks.
 * @param {Array} subtasks - Array of subtask objects.
 * @returns {number} The count of completed subtasks.
 */
function countCompletedSubtasks(subtasks) {
  let count = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].completed) {
      count++;
    }
  }
  return count;
}

/**
 * Generates the assignee badges HTML for a task card.
 * @param {Object} task - The task object.
 * @returns {string} The assignees HTML string.
 */
function generateAssigneesHtml(task) {
  if (!task.assignedTo || !Array.isArray(task.assignedTo)) return "";
  let html = addAssigneeBadges(task.assignedTo);
  if (task.assignedTo.length > 3) {
    html += addExtraAssigneesBadge(task.assignedTo.length);
  }
  return html;
}

/**
 * Builds badge HTML for the first three assignees.
 * @param {Array} assignedTo - Array of contact IDs.
 * @returns {string} The badge HTML string.
 */
function addAssigneeBadges(assignedTo) {
  let html = "";
  const displayCount = Math.min(assignedTo.length, 3);
  for (let i = 0; i < displayCount; i++) {
    const contact = findContactById(assignedTo[i]);
    if (contact) {
      const initials = getInitialsFromName(contact.name);
      html += getAssigneeBadgeTemplate(initials, contact.color);
    }
  }
  return html;
}

/**
 * Builds a "+X" overflow badge for additional assignees.
 * @param {number} totalCount - Total number of assignees.
 * @returns {string} The overflow badge HTML string.
 */
function addExtraAssigneesBadge(totalCount) {
  return getAssigneeBadgeTemplate(`+${totalCount - 3}`, "#2A3647");
}

/**
 * Generates the assignee list HTML for the task detail overlay.
 * @param {Object} task - The task object.
 * @returns {string} The assignee detail HTML string.
 */
function buildAssignedToDetailsHtml(task) {
  if (
    !task.assignedTo ||
    !Array.isArray(task.assignedTo) ||
    task.assignedTo.length === 0
  ) {
    return "<span>No one</span>";
  }
  return buildAssigneeDetailItems(task.assignedTo);
}

/**
 * Builds HTML rows for all assigned contacts.
 * @param {Array} assignedIds - Array of contact IDs.
 * @returns {string} The HTML string for all assignee rows.
 */
function buildAssigneeDetailItems(assignedIds) {
  let html = "";
  for (let i = 0; i < assignedIds.length; i++) {
    html += processAssigneeItem(assignedIds[i]);
  }
  return html || "<span>No one</span>";
}

/**
 * Builds the detail HTML for a single assignee.
 * @param {string|number} contactId - The contact ID to look up.
 * @returns {string} The HTML string for this assignee row, or empty string if not found.
 */
function processAssigneeItem(contactId) {
  const contact = findContactById(contactId);
  if (contact) {
    const initials = getInitialsFromName(contact.name);
    return getAssignedToDetailItemTemplate(
      initials,
      contact.color,
      contact.name,
    );
  }
  return "";
}

/**
 * Returns the priority icon HTML for a given priority level.
 * @param {string} priority - The priority level ("urgent", "medium", or "low").
 * @returns {string} The priority icon HTML string.
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") {
    return getUrgentPriorityIcon();
  } else if (priority === "medium") {
    return getMediumPriorityIcon();
  } else {
    return getLowPriorityIcon();
  }
}

/**
 * Generates the subtask list HTML for the task detail overlay.
 * @param {Object} task - The task object.
 * @returns {string} The subtasks HTML string.
 */
function buildSubtasksHtml(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";
  let subtasksHtml = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    subtasksHtml += getSubtaskItemDetailTemplate(task.id, i, task.subtasks[i]);
  }
  return subtasksHtml;
}
