/**
 * Initialises the subtask list from a task object, making a deep copy to
 * avoid mutating the original, then renders the list.
 * @param {Object} task - The task data object.
 */
function fillMobileEditSubtasks(task) {
  mobileEditSubtasks =
    task.subtasks && task.subtasks.length > 0
      ? JSON.parse(JSON.stringify(task.subtasks))
      : [];
  renderMobileEditSubtasks();
}

/**
 * Makes the subtask action icons visible in the mobile edit input area.
 */
function showMobileEditSubtaskIcons() {
  const icons = document.getElementById("mobile-edit-subtask-icons-active");
  if (icons) icons.classList.remove("v-hidden");
}

/**
 * Clears the subtask text input and returns focus to it.
 */
function clearMobileEditSubtaskInput() {
  const input = document.getElementById("mobile-edit-subtask-input");
  if (input) {
    input.value = "";
    input.focus();
  }
}

/**
 * Reads the subtask input, pushes a new subtask into mobileEditSubtasks,
 * clears the input, and re-renders the list.
 */
function addMobileEditSubtask() {
  const input = document.getElementById("mobile-edit-subtask-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  mobileEditSubtasks.push({ id: Date.now(), text: text, completed: false });
  input.value = "";
  renderMobileEditSubtasks();
}

/**
 * Handles keyboard shortcuts in the subtask creation input.
 * Enter confirms the new subtask; Escape clears the input.
 * @param {KeyboardEvent} event - The keyboard event from the input field.
 */
function handleMobileEditSubtaskKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addMobileEditSubtask();
  }
  if (event.key === "Escape") {
    clearMobileEditSubtaskInput();
  }
}

/**
 * Switches a rendered subtask row into inline edit mode.
 * @param {number} id - The ID of the subtask to edit.
 */
function editMobileEditSubtask(id) {
  const subtask = findMobileSubtaskById(id);
  if (!subtask) return;
  const container = document.getElementById(`mobile-edit-subtask-item-${id}`);
  if (container) {
    container.innerHTML = getMobileEditSubtaskEditTemplate(subtask);
    setupMobileSubtaskEditFocus(id);
  }
}

/**
 * Moves cursor focus to the inline edit input and places the caret at the end.
 * @param {number} id - The ID of the subtask whose input should receive focus.
 */
function setupMobileSubtaskEditFocus(id) {
  const input = document.getElementById(`mobile-edit-subtask-input-${id}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Finds a subtask in mobileEditSubtasks by its numeric ID.
 * @param {number} id - The subtask ID to search for.
 * @returns {Object|undefined} The matching subtask object, or undefined.
 */
function findMobileSubtaskById(id) {
  return mobileEditSubtasks.find(function (s) { return s.id === id; });
}

/**
 * Returns the HTML string for the inline edit view of a single subtask.
 * @param {Object} subtask - The subtask object containing id and text.
 * @returns {string} HTML markup for the edit row.
 */
function getMobileEditSubtaskEditTemplate(subtask) {
  return `
    <div class="subtask-item-edit">
      <input type="text" class="subtask-edit-input" id="mobile-edit-subtask-input-${subtask.id}" value="${subtask.text}" onkeydown="handleMobileEditSubtaskEditKeydown(${subtask.id}, event)">
      <div class="subtask-icons" style="display: flex;">
        <img src="./assets/icons/delete.svg" class="subtask-icon-small" onclick="removeMobileEditSubtask(${subtask.id})" alt="Delete">
        <div class="subtask-icon-divider"></div>
        <img src="./assets/icons/check-create-icon-black.svg" class="subtask-icon-small" onclick="saveMobileEditSubtask(${subtask.id})" alt="Save">
      </div>
    </div>
  `;
}

/**
 * Reads the inline edit input and either removes the subtask (empty value)
 * or delegates to updateMobileSubtaskText to persist the new text.
 * @param {number} id - The ID of the subtask being saved.
 */
function saveMobileEditSubtask(id) {
  const input = document.getElementById(`mobile-edit-subtask-input-${id}`);
  if (!input) return;
  const newText = input.value.trim();
  if (newText === "") {
    removeMobileEditSubtask(id);
    return;
  }
  updateMobileSubtaskText(id, newText);
}

/**
 * Updates the text property of a subtask in mobileEditSubtasks and re-renders.
 * @param {number} id - The ID of the subtask to update.
 * @param {string} newText - The replacement text value.
 */
function updateMobileSubtaskText(id, newText) {
  const subtask = findMobileSubtaskById(id);
  if (subtask) {
    subtask.text = newText;
    renderMobileEditSubtasks();
  }
}

/**
 * Handles keyboard shortcuts inside an inline subtask edit input.
 * Enter saves the edit; Escape discards it and re-renders the read-only list.
 * @param {number} id - The ID of the subtask being edited.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleMobileEditSubtaskEditKeydown(id, event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveMobileEditSubtask(id);
  } else if (event.key === "Escape") {
    renderMobileEditSubtasks();
  }
}

/**
 * Returns the HTML string for a single read-only subtask list item.
 * @param {Object} subtask - The subtask object containing id and text.
 * @returns {string} HTML markup for the subtask row.
 */
function getMobileEditSubtaskItemTemplate(subtask) {
  return `
    <div class="subtask-item" id="mobile-edit-subtask-item-${subtask.id}" ondblclick="editMobileEditSubtask(${subtask.id})">
      <div class="subtask-content"><span class="subtask-text">${subtask.text}</span></div>
      <div class="subtask-icons">
        <img src="./assets/icons/edit.svg" class="subtask-icon-small" onclick="editMobileEditSubtask(${subtask.id})" alt="Edit">
        <div class="subtask-icon-divider"></div>
        <img src="./assets/icons/delete.svg" class="subtask-icon-small" onclick="removeMobileEditSubtask(${subtask.id})" alt="Delete">
      </div>
    </div>
  `;
}

/**
 * Clears the subtask list container and appends a rendered row for each
 * entry in mobileEditSubtasks using getMobileEditSubtaskItemTemplate.
 */
function renderMobileEditSubtasks() {
  const list = document.getElementById("mobile-edit-subtask-list");
  if (!list) return;
  list.innerHTML = "";
  mobileEditSubtasks.forEach(function (subtask) {
    list.innerHTML += getMobileEditSubtaskItemTemplate(subtask);
  });
}

/**
 * Removes the subtask with the given ID from mobileEditSubtasks and re-renders.
 * @param {number} id - The ID of the subtask to remove.
 */
function removeMobileEditSubtask(id) {
  mobileEditSubtasks = mobileEditSubtasks.filter(function (s) { return s.id !== id; });
  renderMobileEditSubtasks();
}
