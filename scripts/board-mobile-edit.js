let mobileEditTaskId = null;
let mobileEditSelectedContacts = [];
let mobileEditSubtasks = [];
let mobileEditSelectedPriority = "medium";

/**
 * Opens the mobile edit overlay for the given task.
 * @param {string|number} taskId - The ID of the task to edit.
 */
function openMobileEditOverlay(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  mobileEditTaskId = taskId;
  fillMobileEditForm(task);
  document.getElementById("mobile-edit-overlay").classList.add("active");
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
}

/**
 * Closes the mobile edit overlay and resets all module-level state.
 */
function closeMobileEditOverlay() {
  document.getElementById("mobile-edit-overlay").classList.remove("active");
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
  mobileEditTaskId = null;
  mobileEditSelectedContacts = [];
  mobileEditSubtasks = [];
}

/**
 * Populates every section of the mobile edit form from the given task object.
 * @param {Object} task - The task data object.
 */
function fillMobileEditForm(task) {
  fillMobileEditBasicInfo(task);
  selectMobileEditPriority(task.priority || "medium");
  fillMobileEditSubtasks(task);
  fillMobileEditContacts(task);
  renderMobileEditAssignedToOptions();
  renderMobileEditSelectedInitials();
  validateMobileEditForm();
}

/**
 * Writes title, description, and due-date values into their input fields.
 * @param {Object} task - The task data object.
 */
function fillMobileEditBasicInfo(task) {
  document.getElementById("mobile-edit-title").value = task.title || "";
  document.getElementById("mobile-edit-description").value = task.description || "";
  document.getElementById("mobile-edit-due-date").value = task.dueDate || "";
}

/**
 * Resolves each assigned-contact ID to a full contact object and stores the
 * result in the module-level mobileEditSelectedContacts array.
 * @param {Object} task - The task data object.
 */
function fillMobileEditContacts(task) {
  mobileEditSelectedContacts = [];
  if (Array.isArray(task.assignedTo)) {
    task.assignedTo.forEach(function (id) {
      const contact = allContacts.find(function (c) {
        return String(c.id) === String(id);
      });
      if (contact) mobileEditSelectedContacts.push(contact);
    });
  }
}

/**
 * Activates the matching priority button and saves the selection.
 * @param {string} priority - One of "low", "medium", or "urgent".
 */
function selectMobileEditPriority(priority) {
  mobileEditSelectedPriority = priority;
  const btns = document.querySelectorAll("#mobile-edit-overlay .priority-btn");
  btns.forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.priority === priority);
  });
}

/**
 * Re-renders the full list of contact options inside the assignee dropdown.
 */
function renderMobileEditAssignedToOptions() {
  const container = document.getElementById("mobile-edit-assigned-to-options");
  if (!container) return;
  container.innerHTML = "";
  allContacts.forEach(function (contact) {
    const isSelected = mobileEditSelectedContacts.some(function (c) {
      return c.id === contact.id;
    });
    container.innerHTML += getMobileEditContactOptionTemplate(contact, isSelected);
  });
}

/**
 * Returns the HTML string for a single assignee option row.
 * @param {Object} contact - A contact object from allContacts.
 * @param {boolean} isSelected - Whether the contact is currently selected.
 * @returns {string} HTML markup for the contact option.
 */
function getMobileEditContactOptionTemplate(contact, isSelected) {
  const selectedClass = isSelected ? "selected" : "";
  const nameSuffix = contact.isYou ? " (You)" : "";
  return `
    <div class="contact-option ${selectedClass}" onclick="toggleMobileEditContactSelection('${contact.id}', event)">
      <div class="contact-info">
        <div class="contact-avatar" style="background-color: ${contact.color}">${contact.initials}</div>
        <span class="contact-name">${contact.name}${nameSuffix}</span>
      </div>
      <div class="contact-checkbox"></div>
    </div>
  `;
}

/**
 * Toggles a contact's selection state and refreshes the UI accordingly.
 * @param {string|number} contactId - The ID of the contact to toggle.
 * @param {Event} event - The originating click event (used to stop propagation).
 */
function toggleMobileEditContactSelection(contactId, event) {
  event.stopPropagation();
  const contact = allContacts.find(function (c) {
    return String(c.id) === String(contactId);
  });
  if (!contact) return;
  updateMobileSelectedContacts(contactId, contact);
  renderMobileEditAssignedToOptions();
  renderMobileEditSelectedInitials();
}

/**
 * Adds or removes a contact from mobileEditSelectedContacts based on current state.
 * @param {string|number} contactId - The ID of the contact.
 * @param {Object} contact - The full contact object to add if not present.
 */
function updateMobileSelectedContacts(contactId, contact) {
  const index = mobileEditSelectedContacts.findIndex(function (c) {
    return String(c.id) === String(contactId);
  });
  if (index > -1) {
    mobileEditSelectedContacts.splice(index, 1);
  } else {
    mobileEditSelectedContacts.push(contact);
  }
}

/**
 * Renders avatar initials for every currently selected contact.
 */
function renderMobileEditSelectedInitials() {
  const container = document.getElementById("mobile-edit-selected-contacts-initials");
  if (!container) return;
  container.innerHTML = "";
  mobileEditSelectedContacts.forEach(function (contact) {
    container.innerHTML += `<div class="selected-avatar" style="background-color: ${contact.color}">${contact.initials}</div>`;
  });
}

/**
 * Toggles the open/closed state of the assignee dropdown.
 */
function toggleMobileEditAssignedToDropdown() {
  const wrapper = document.getElementById("mobile-edit-assigned-to-wrapper");
  const options = document.getElementById("mobile-edit-assigned-to-options");
  wrapper.classList.toggle("open");
  options.classList.toggle("d-none");
}

document.addEventListener("click", function (event) {
  const wrapper = document.getElementById("mobile-edit-assigned-to-wrapper");
  if (wrapper && !wrapper.contains(event.target)) {
    wrapper.classList.remove("open");
    const options = document.getElementById("mobile-edit-assigned-to-options");
    if (options) options.classList.add("d-none");
  }
}, true);

/**
 * Enables or disables the save button depending on whether title and due-date are filled.
 */
function validateMobileEditForm() {
  const title = document.getElementById("mobile-edit-title").value.trim();
  const dueDate = document.getElementById("mobile-edit-due-date").value;
  const btn = document.getElementById("mobile-edit-save-btn");
  if (btn) btn.disabled = !(title && dueDate);
}

/**
 * Persists the edited task data to storage and refreshes the board UI.
 * @returns {Promise<void>}
 */
async function saveMobileEditTask() {
  if (!mobileEditTaskId) return;
  const taskIndex = findTaskById(mobileEditTaskId);
  if (taskIndex === -1) return;
  const task = tasks[taskIndex];
  updateTaskDataFromMobileEdit(task);
  await saveSingleTask(task);
  finalizeMobileEditSave();
}

/**
 * Copies all form values and module-level state back onto the task object.
 * @param {Object} task - The task object to mutate in place.
 */
function updateTaskDataFromMobileEdit(task) {
  task.title = document.getElementById("mobile-edit-title").value.trim();
  task.description = document.getElementById("mobile-edit-description").value.trim();
  task.dueDate = document.getElementById("mobile-edit-due-date").value;
  task.priority = mobileEditSelectedPriority;
  task.assignedTo = mobileEditSelectedContacts.map(function (c) { return c.id; });
  task.subtasks = JSON.parse(JSON.stringify(mobileEditSubtasks));
}

/**
 * Re-renders the board, closes all overlays, and shows a success toast.
 */
function finalizeMobileEditSave() {
  renderTasks();
  closeMobileEditOverlay();
  closeTaskDetails();
  showToast("Task updated successfully");
}
