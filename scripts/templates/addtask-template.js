/**
 * Generates the HTML template for a subtask item in normal (read) view.
 * @param {Object} subtask - The subtask object.
 * @returns {string} The HTML string for the subtask item.
 */
function getSubtaskItemTemplate(subtask) {
  return `
    <div class="subtask-item" id="subtask-item-${subtask.id}" ondblclick="editSubtask(${subtask.id})">
      <div class="subtask-content">
        <span class="subtask-text">${subtask.text}</span>
      </div>
      <div class="subtask-icons">
        <img src="./assets/icons/edit.svg" class="subtask-icon-small" onclick="editSubtask(${subtask.id})" alt="Edit">
        <div class="subtask-icon-divider"></div>
        <img src="./assets/icons/delete.svg" class="subtask-icon-small" onclick="removeSubtask(${subtask.id})" alt="Delete">
      </div>
    </div>
  `;
}

/**
 * Generates the HTML template for a subtask item in edit mode.
 * @param {Object} subtask - The subtask object.
 * @returns {string} The HTML string for the subtask edit form.
 */
function getSubtaskEditTemplate(subtask) {
  return `
    <div class="subtask-item-edit">
      <input type="text" class="subtask-edit-input" id="subtask-input-${subtask.id}" value="${subtask.text}" onkeydown="handleSubtaskEditKeydown(${subtask.id}, event)">
      <div class="subtask-icons" style="display: flex;">
        <img src="./assets/icons/delete.svg" class="subtask-icon-small" onclick="removeSubtask(${subtask.id})" alt="Delete">
        <div class="subtask-icon-divider"></div>
        <img src="./assets/icons/check-create-icon-black.svg" class="subtask-icon-small" onclick="saveEditSubtask(${subtask.id})" alt="Save">
      </div>
    </div>
  `;
}

/**
 * Generates the avatar HTML for a contact option in the assigned-to dropdown.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the contact avatar element.
 */
function getContactAvatarHtml(contact) {
  return `
    <div class="contact-avatar" style="background-color: ${contact.color}">
      ${contact.initials}
    </div>
  `;
}

/**
 * Generates the label HTML for a contact option, including a "(You)" suffix if applicable.
 * @param {Object} contact - The contact object.
 * @param {boolean} isYou - Whether this contact represents the current user.
 * @returns {string} The HTML string for the contact name label.
 */
function getContactLabelHtml(contact, isYou) {
  const nameSuffix = isYou ? " (You)" : "";
  return `<span class="contact-name">${contact.name}${nameSuffix}</span>`;
}

/**
 * Generates the HTML template for a contact option in the assigned-to dropdown.
 * @param {Object} contact - The contact object.
 * @param {boolean} isSelected - Whether the contact is currently selected.
 * @returns {string} The HTML string for the contact option.
 */
function getContactOptionTemplate(contact, isSelected) {
  const selectedClass = isSelected ? "selected" : "";
  return `
    <div class="contact-option ${selectedClass}" onclick="toggleContactSelection('${contact.id}', event)">
      <div class="contact-info">
        ${getContactAvatarHtml(contact)}
        ${getContactLabelHtml(contact, contact.isYou)}
      </div>
      <div class="contact-checkbox"></div>
    </div>
  `;
}

/**
 * Generates the HTML template for a selected contact's initials avatar.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the initials circle.
 */
function getSelectedContactInitialsTemplate(contact) {
  return `
    <div class="selected-avatar" style="background-color: ${contact.color}">
      ${contact.initials}
    </div>
  `;
}

/**
 * Generates the HTML template for a toast notification message.
 * @param {string} message - The message to display.
 * @returns {string} The HTML string for the toast content.
 */
function getToastTemplate(message) {
  return `
    <span>${message}</span>
    <img src="./assets/summary-page/board-icon.svg" style="filter: brightness(0) invert(1); margin-left: 20px;" alt="">
  `;
}
