/**
 * Generates the footer HTML for a task card.
 * @param {string} assigneesHtml - The HTML string for the assignee badges.
 * @param {string} priorityIcon - The HTML string for the priority icon.
 * @returns {string} The HTML string for the task card footer.
 */
function getTaskCardFooterHtml(assigneesHtml, priorityIcon) {
  return `<div class="task-footer"><div class="task-assignees">${assigneesHtml}</div><div class="task-priority">${priorityIcon}</div></div>`;
}

/**
 * Generates the HTML template for a task card on the board.
 * @param {Object} task - The task object.
 * @param {string} categoryClass - The CSS class for the category badge.
 * @param {string} categoryLabel - The display label for the category.
 * @param {string} progressHtml - The HTML string for the progress bar.
 * @param {string} assigneesHtml - The HTML string for the assignee badges.
 * @param {string} priorityIcon - The HTML string for the priority icon.
 * @returns {string} The HTML string for the task card.
 */
function getTaskCardTemplate(task, categoryClass, categoryLabel, progressHtml, assigneesHtml, priorityIcon) {
  const attrs = `draggable="true" data-task-id="${task.id}" ondragstart="startDragging(${task.id}, event)" ondragend="endDragging()" onmouseup="handleCardClick(${task.id}, event)"`;
  const tag = `<div class="category-tag ${categoryClass}">${categoryLabel}</div>`;
  const body = `<h3 class="task-title">${task.title}</h3><p class="task-description">${task.description}</p>`;
  return `<div class="task-card" ${attrs}>${tag}${body}${progressHtml}${getTaskCardFooterHtml(assigneesHtml, priorityIcon)}</div>`;
}

/**
 * Generates the HTML template for a subtask progress bar.
 * @param {number} completed - Number of completed subtasks.
 * @param {number} total - Total number of subtasks.
 * @returns {string} The HTML string for the progress bar.
 */
function getProgressBarTemplate(completed, total) {
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return `
    <div class="task-subtasks">
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
      <span>${completed}/${total} Subtasks</span>
    </div>
  `;
}

/**
 * Generates the HTML for an assignee avatar badge.
 * @param {string} initials - The initials to display.
 * @param {string} color - The background color.
 * @returns {string} The HTML string for the assignee badge.
 */
function getAssigneeBadgeTemplate(initials, color) {
  const backgroundColor = color || "#00bee8";
  return `<div class="assignee-badge" style="background-color: ${backgroundColor};">${initials}</div>`;
}

/**
 * Generates the HTML for an empty column placeholder.
 * @param {string} message - The message to display.
 * @returns {string} The HTML string for the empty state.
 */
function getNoTasksTemplate(message) {
  return `<div class="no-tasks">${message}</div>`;
}

/**
 * Generates the HTML for a subtask item in the detail view.
 * @param {number} taskId - The ID of the parent task.
 * @param {number} index - The index of the subtask.
 * @param {Object} st - The subtask object.
 * @returns {string} The HTML string for the subtask item.
 */
function getSubtaskItemDetailTemplate(taskId, index, st) {
  const checkedClass = st.completed ? "checked" : "";
  return `
    <div class="subtask-item-detail" onclick="toggleSubtask(${taskId}, ${index})">
      <div class="subtask-checkbox ${checkedClass}"></div>
      <span>${st.text}</span>
    </div>
  `;
}

/**
 * Generates the header section HTML for the task detail overlay.
 * @param {Object} task - The task object.
 * @param {string} categoryClass - The CSS class for the category badge.
 * @param {string} categoryLabel - The display label for the category.
 * @returns {string} The HTML string for the detail header.
 */
function getTaskDetailsHeaderHtml(task, categoryClass, categoryLabel) {
  const aiB = task.aiGenerated ? '<span class="ai-ticket-badge">🤖 KI-Ticket</span>' : '';
  const tags = `<div class="task-details-header-tags"><div class="category-tag ${categoryClass}">${categoryLabel}</div>${aiB}</div>`;
  const closeBtn = `<button class="task-details-close" onclick="closeTaskDetails()"><img src="./assets/icons/clear-X-icon.svg" alt="Close"></button>`;
  return `<div class="task-details-header">${tags}${closeBtn}</div>`;
}

/**
 * Generates the due date and priority section HTML for the task detail overlay.
 * @param {Object} task - The task object.
 * @param {string} priorityIcon - The HTML string for the priority icon.
 * @returns {string} The HTML string for date and priority rows.
 */
function getTaskDetailsPriorityHtml(task, priorityIcon) {
  const raw = (task.priority || '').toLowerCase();
  const normalized = (raw === 'high') ? 'urgent' : raw;
  const label = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '–';
  const dueDate = `<div class="task-details-info"><span class="task-details-label">Due date:</span><span>${task.dueDate || '–'}</span></div>`;
  const priority = `<div class="task-details-info"><span class="task-details-label">Priority:</span><div class="task-details-priority"><span>${label}</span>${priorityIcon}</div></div>`;
  return dueDate + priority;
}

/**
 * Generates the creator info section HTML for the task detail overlay.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string for the creator row.
 */
function getTaskDetailsCreatorHtml(task) {
  const raw = task.senderEmail || '';
  const emailMatch = raw.match(/[\w.+\-]+@[\w\-]+\.[\w.]+/);
  const cleanEmail = emailMatch ? emailMatch[0] : raw.replace(/^["'\s<>]+|["'\s<>]+$/g, '').trim();
  const badge = `<span class="creator-badge creator-${task.aiGenerated ? "extern" : "intern"}">${task.aiGenerated ? "Extern" : "Intern"}</span>`;
  const name = `<span class="creator-name">${task.aiGenerated && cleanEmail ? cleanEmail : (task.creatorName || '–')}</span>`;
  const emailLink = task.aiGenerated && cleanEmail ? `<a href="mailto:${cleanEmail}" class="creator-email-link" title="Send email"><img src="./assets/icons/mail.svg" alt="Email" onerror="this.style.display='none'"> E-Mail</a>` : '';
  return `<div class="task-details-info"><span class="task-details-label">Creator:</span><div class="task-creator-info">${badge}${name}${emailLink}</div></div>`;
}

/**
 * Generates the action buttons HTML for the task detail overlay.
 * @param {number} taskId - The ID of the task.
 * @returns {string} The HTML string for the action buttons row.
 */
function getTaskDetailsActionsHtml(taskId) {
  const deleteBtn = `<button onclick="deleteTask(${taskId})" class="task-action-btn"><img src="./assets/icons/delete.svg" alt="Delete"> Delete</button>`;
  const editBtn = `<button onclick="editTask(${taskId})" class="task-action-btn"><img src="./assets/icons/edit.svg" alt="Edit"> Edit</button>`;
  return `<div class="task-details-actions">${deleteBtn}<div class="task-action-separator"></div>${editBtn}</div>`;
}

/**
 * Generates the full HTML template for the task detail overlay.
 * @param {Object} task - The task object.
 * @param {string} subtasksHtml - The HTML string for the subtask list.
 * @param {string} priorityIcon - The HTML string for the priority icon.
 * @param {string} categoryClass - The CSS class for the category badge.
 * @param {string} categoryLabel - The display label for the category.
 * @param {string} assignedToHtml - The HTML string for the assignee list.
 * @returns {string} The full HTML string for the task detail overlay.
 */
function getTaskDetailsTemplate(task, subtasksHtml, priorityIcon, categoryClass, categoryLabel, assignedToHtml) {
  const assignees = `<div class="task-details-info task-details-assignees"><span class="task-details-label">Assigned To:</span><div class="assignee-details-list">${assignedToHtml}</div></div>`;
  const subtasks = `<div class="subtasks-section"><p class="subtasks-heading">Subtasks</p><div class="subtasks-list-details">${subtasksHtml}</div></div>`;
  const body = `<h1 class="task-details-title">${task.title}</h1><p class="task-description task-description-full">${task.description}</p>`;
  return getTaskDetailsHeaderHtml(task, categoryClass, categoryLabel) + body + getTaskDetailsPriorityHtml(task, priorityIcon) + assignees + getTaskDetailsCreatorHtml(task) + subtasks + getTaskDetailsActionsHtml(task.id);
}

/**
 * Generates the HTML for an assigned contact row in the task detail view.
 * @param {string} initials - The contact's initials.
 * @param {string} color - The badge background color.
 * @param {string} name - The contact's full name.
 * @returns {string} The HTML string for the assignee detail row.
 */
function getAssignedToDetailItemTemplate(initials, color, name) {
  return `
    <div class="assignee-detail-item">
      <div class="assignee-badge" style="background-color: ${color};">${initials}</div>
      <span class="assignee-detail-name">${name}</span>
    </div>
  `;
}

/**
 * Generates the HTML icon for urgent priority.
 * @returns {string} The HTML string for the urgent icon.
 */
function getUrgentPriorityIcon() {
  return `<img src="./assets/icons/urgent-iconAddTask.png" alt="Urgent">`;
}

/**
 * Generates the HTML icon for medium priority.
 * @returns {string} The HTML string for the medium icon.
 */
function getMediumPriorityIcon() {
  return `<img src="./assets/icons/medium-iconAddTask.png" alt="Medium">`;
}

/**
 * Generates the HTML icon for low priority.
 * @returns {string} The HTML string for the low icon.
 */
function getLowPriorityIcon() {
  return `<img src="./assets/icons/low-iconAddTask.png" alt="Low">`;
}
