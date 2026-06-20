/**
 * Opens the edit overlay for a task on desktop.
 * @param {Object} task - The task object to edit.
 * @param {number} taskId - The ID of the task.
 * @returns {void}
 */
function openEditOverlay(task, taskId) {
  closeTaskDetails();
  fillFormWithTaskData(task);
  openAddTaskOverlay();
  setupFormForEdit(taskId);
}

/**
 * Opens the edit mode for a task, routing to mobile overlay when appropriate.
 * @param {number} taskId - The ID of the task to edit.
 * @returns {void}
 */
function editTask(taskId) {
  if (window.innerWidth <= 780) {
    openMobileEditOverlay(taskId);
    return;
  }
  const task = findTask(taskId);
  if (!task) return;
  openEditOverlay(task, taskId);
}

/**
 * Sets the form title heading to "Edit Task".
 * @returns {void}
 */
function setBoardEditTitle() {
  const title = document.querySelector(".add-task-title");
  if (title) title.textContent = "Edit Task";
}

/**
 * Updates the submit button label and icon for edit mode.
 * @returns {void}
 */
function setBoardEditButton() {
  const submitBtn = document.getElementById("create-task-btn");
  if (submitBtn) {
    submitBtn.innerHTML = `Save Changes <img src="./assets/icons/check-create-icon.svg" alt="Save Changes" />`;
  }
}

/**
 * Attaches a submit handler to the form that calls updateTask for the given task.
 * @param {number} taskId - The ID of the task to update on submit.
 * @returns {void}
 */
function setBoardEditSubmitHandler(taskId) {
  const form = document.getElementById("add-task-form");
  if (form) {
    form.onsubmit = function (event) {
      event.preventDefault();
      updateTask(taskId);
    };
  }
}

/**
 * Configures the form title, button, and submit handler for edit mode.
 * @param {number} taskId - The ID of the task being edited.
 * @returns {void}
 */
function setupFormForEdit(taskId) {
  setBoardEditTitle();
  setBoardEditButton();
  setBoardEditSubmitHandler(taskId);
}

/**
 * Writes current form values back into the task object.
 * @param {Object} task - The task object to update with form data.
 * @returns {void}
 */
function applyFormDataToTask(task) {
  task.title = document.getElementById("title").value.trim();
  task.description = document.getElementById("description").value.trim();
  task.dueDate = document.getElementById("due-date").value;
  task.priority = selectedPriority;
  task.assignedTo = selectedContacts.map(function (c) { return c.id; });
  task.category = document.getElementById("category").value;
  task.subtasks = JSON.parse(JSON.stringify(subtasks));
}

/**
 * Re-renders the board, resets the form, closes the overlay, and shows a success toast.
 * @returns {void}
 */
function finalizeTaskUpdate() {
  renderTasks();
  resetFormToAddMode();
  closeAddTaskOverlay();
  showToast("Task updated successfully");
}

/**
 * Applies form data to the task, saves it, and finalizes the update.
 * @param {number} taskId - The ID of the task to update.
 * @returns {Promise<void>}
 */
async function updateTask(taskId) {
  const taskIndex = findTaskById(taskId);
  if (taskIndex === -1) return;
  applyFormDataToTask(tasks[taskIndex]);
  await saveSingleTask(tasks[taskIndex]);
  finalizeTaskUpdate();
}

/**
 * Sets the form title heading back to "Add Task".
 * @returns {void}
 */
function setAddFormTitle() {
  const title = document.querySelector(".add-task-title");
  if (title) title.textContent = "Add Task";
}

/**
 * Resets the submit button label and icon to "Create Task".
 * @returns {void}
 */
function setAddFormButton() {
  const submitBtn = document.getElementById("create-task-btn");
  if (submitBtn) {
    submitBtn.innerHTML = `Create Task <img src="./assets/icons/check-create-icon.svg" alt="Create Task" />`;
  }
}

/**
 * Resets the form submit handler to the default add-task handler.
 * @returns {void}
 */
function setAddFormSubmitHandler() {
  const form = document.getElementById("add-task-form");
  if (form) form.onsubmit = handleAddTask;
}

/**
 * Resets the form to add mode by restoring title, button, handler, and clearing fields.
 * @returns {void}
 */
function resetFormToAddMode() {
  setAddFormTitle();
  setAddFormButton();
  setAddFormSubmitHandler();
  clearForm();
  resetBoardDropdowns();
}
