/**
 * Handles a click on a task card and opens the task details if not dragging.
 * @param {number} taskId - The ID of the task.
 * @param {MouseEvent} event - The mouse event.
 */
function handleCardClick(taskId, event) {
  if (isDragging) return;
  openTaskDetails(taskId);
}

/**
 * Opens the add-task overlay. On mobile (<=780px) redirects to addtask.html.
 * @returns {void}
 */
function openAddTaskOverlay() {
  if (window.innerWidth <= 780) {
    window.location.href = "addtask.html";
    return;
  }
  document.getElementById("add-task-overlay").classList.add("active");
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
}

/**
 * Closes the add-task overlay and resets the form to add mode.
 * @returns {void}
 */
function closeAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.remove("active");
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
  resetFormToAddMode();
}

/**
 * Sets the overlay content and makes it visible with scroll lock.
 * @param {HTMLElement} overlayElement - The overlay container element.
 * @param {HTMLElement} contentElement - The element to inject HTML into.
 * @param {Object} task - The task object to render.
 * @returns {void}
 */
function activateTaskDetailsOverlay(overlayElement, contentElement, task) {
  contentElement.innerHTML = buildTaskDetailsHtml(task);
  overlayElement.style.display = "flex";
  overlayElement.classList.add("active");
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
}

/**
 * Returns the task detail overlay containers, or null if either is missing.
 * @returns {{ content: HTMLElement, overlay: HTMLElement } | null}
 */
function getTaskDetailsContainers() {
  const content = document.getElementById("task-details-content");
  const overlay = document.getElementById("task-details-overlay");
  if (!content || !overlay) {
    alert("Error: HTML containers not found in board.html!");
    return null;
  }
  return { content, overlay };
}

/**
 * Opens the task detail view for the given task ID.
 * @param {number} taskId - The ID of the task to display.
 */
function openTaskDetails(taskId) {
  const task = findTask(taskId);
  if (!task) { console.error("openTaskDetails: task not found for id", taskId, typeof taskId); return; }
  const els = getTaskDetailsContainers();
  if (!els) return;
  activateTaskDetailsOverlay(els.overlay, els.content, task);
}

/**
 * Builds the full HTML string for the task detail view.
 * @param {Object} task - The task object.
 * @returns {string} The HTML markup for the detail view.
 */
function buildTaskDetailsHtml(task) {
  return getTaskDetailsTemplate(
    task,
    buildSubtasksHtml(task),
    getPriorityIcon(task.priority),
    getCategoryClass(task.category),
    getCategoryLabel(task.category),
    buildAssignedToDetailsHtml(task),
  );
}

/**
 * Closes the task detail overlay and removes the scroll lock.
 * @returns {void}
 */
function closeTaskDetails() {
  const overlayElement = document.getElementById("task-details-overlay");
  if (overlayElement) {
    overlayElement.style.display = "none";
    overlayElement.classList.remove("active");
  }
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
}

/**
 * Toggles the checked CSS class on a subtask checkbox in the DOM.
 * @param {NodeList} subtaskItems - The subtask item elements in the detail view.
 * @param {number} subtaskIndex - The index of the subtask.
 * @returns {void}
 */
function toggleSubtaskCheckboxInDom(subtaskItems, subtaskIndex) {
  if (subtaskItems[subtaskIndex]) {
    const checkbox = subtaskItems[subtaskIndex].querySelector(".subtask-checkbox");
    if (checkbox) checkbox.classList.toggle("checked");
  }
}

/**
 * Inverts the completed state of a subtask on the task object.
 * @param {Object} task - The task object.
 * @param {number} subtaskIndex - The index of the subtask to toggle.
 * @returns {void}
 */
function updateSubtaskCompletedState(task, subtaskIndex) {
  task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
}

/**
 * Toggles a subtask's completion state and persists the change.
 * @param {number} taskId - The ID of the parent task.
 * @param {number} subtaskIndex - The index of the subtask to toggle.
 * @returns {Promise<void>}
 */
async function toggleSubtask(taskId, subtaskIndex) {
  const task = findTask(taskId);
  if (!task) return;
  const subtaskItems = document.querySelectorAll(".subtask-item-detail");
  toggleSubtaskCheckboxInDom(subtaskItems, subtaskIndex);
  updateSubtaskCompletedState(task, subtaskIndex);
  updateTaskCardProgress(task);
  await saveSingleTask(task);
}

/**
 * Calculates subtask progress data for a task.
 * @param {Array} subtasks - The subtask list of the task.
 * @returns {{ completed: number, total: number, percent: number }} Progress data object.
 */
function getSubtaskProgressData(subtasks) {
  const completed = countCompletedSubtasks(subtasks);
  const total = subtasks.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return { completed, total, percent };
}

/**
 * Sets the width of a progress bar element.
 * @param {HTMLElement} progressBar - The progress bar element.
 * @param {number} percent - The percentage value (0-100).
 * @returns {void}
 */
function applyProgressBarWidth(progressBar, percent) {
  if (progressBar) progressBar.style.width = `${percent}%`;
}

/**
 * Sets the progress text label on a task card.
 * @param {HTMLElement} progressText - The text element to update.
 * @param {number} completed - Number of completed subtasks.
 * @param {number} total - Total number of subtasks.
 * @returns {void}
 */
function applyProgressText(progressText, completed, total) {
  if (progressText) progressText.innerText = `${completed}/${total} Subtasks`;
}

/**
 * Updates the progress bar and text on a task card in the board.
 * @param {Object} task - The task object with subtasks.
 * @returns {void}
 */
function updateTaskCardProgress(task) {
  const card = document.querySelector(`.task-card[data-task-id="${task.id}"]`);
  if (!card) return;
  const subtaskContainer = card.querySelector(".task-subtasks");
  if (!subtaskContainer) return;
  const { completed, total, percent } = getSubtaskProgressData(task.subtasks);
  const progressBar = subtaskContainer.querySelector(".progress-bar");
  const progressText = subtaskContainer.querySelector("span");
  applyProgressBarWidth(progressBar, percent);
  applyProgressText(progressText, completed, total);
}

/**
 * Deletes a task from Firestore.
 * @param {number} taskId - The ID of the task to delete.
 * @param {string} userId - The ID of the current user.
 * @returns {Promise<void>}
 */
async function deleteTaskFromFirestore(taskId, userId) {
  const taskRef = window.fbDoc(window.firebaseDb, "users", userId, "tasks", String(taskId));
  await window.fbDeleteDoc(taskRef);
}

/**
 * Removes a task from the local array, re-renders the board and closes the detail view.
 * @param {number} taskId - The ID of the task to remove.
 * @returns {void}
 */
function removeTaskFromBoard(taskId) {
  tasks = filterOutTask(taskId);
  renderTasks();
  closeTaskDetails();
}

/**
 * Deletes an AI-generated task from RTDB or a regular task from Firestore.
 * @param {Object} task - The task object to delete.
 * @param {number} taskId - The ID of the task.
 * @returns {Promise<void>}
 */
async function deleteAiOrFirestoreTask(task, taskId) {
  if (task.aiGenerated && task._rtdbKey) {
    await deleteRtdbTask(task._rtdbKey);
  } else {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    try {
      await deleteTaskFromFirestore(taskId, currentUser.id);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }
}

/**
 * Deletes a task — AI tasks from RTDB, regular tasks from Firestore.
 * @param {number} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  await deleteAiOrFirestoreTask(task, taskId);
  removeTaskFromBoard(taskId);
}

/**
 * Filters a task out of the tasks array by ID.
 * @param {number} taskId - The ID of the task to remove.
 * @returns {Array} The filtered tasks array without the specified task.
 */
function filterOutTask(taskId) {
  const filtered = [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== taskId) filtered.push(tasks[i]);
  }
  return filtered;
}

/**
 * Searches all task cards against the current search input value.
 * @returns {void}
 */
function searchTasks() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const cards = document.querySelectorAll(".task-card");
  for (let i = 0; i < cards.length; i++) {
    filterCard(cards[i], query);
  }
}

/**
 * Shows or hides a task card based on whether the query matches title or description.
 * @param {HTMLElement} card - The task card element.
 * @param {string} query - The search query string.
 * @returns {void}
 */
function filterCard(card, query) {
  const title = card.querySelector(".task-title").innerText.toLowerCase();
  const desc = card.querySelector(".task-description").innerText.toLowerCase();
  if (title.includes(query) || desc.includes(query)) {
    card.style.display = "flex";
  } else {
    card.style.display = "none";
  }
}
