let tasks = [];
let currentDraggedTaskId = null;
let isDragging = false;
let touchDragElement = null;
let touchDragClone = null;
let touchStartX = 0;
let touchStartY = 0;
let touchDragTaskId = null;

/**
 * Initializes the board by loading tasks, contacts, and setting up listeners.
 * @returns {Promise<void>}
 */
async function initBoard() {
  checkUser();
  await waitForFirebase();
  initSideMenu("board");
  await loadTasks();
  await loadContacts();
  renderTasks();
  setupTaskAddedListener();
  initTouchDragDrop();
}

/**
 * Listens for the custom taskAdded event and reloads and renders tasks.
 * @returns {void}
 */
function setupTaskAddedListener() {
  window.addEventListener("taskAdded", function () {
    closeAddTaskOverlay();
    loadTasks().then(function () {
      renderTasks();
    });
  });
}

/**
 * Verifies the current user is authenticated and redirects to login if not.
 * @returns {void}
 */
function checkUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  if (document.getElementById("user-initials")) {
    updateHeaderInitials(currentUser);
  }
}

/**
 * Clears the inner HTML of all board column list elements.
 * @returns {void}
 */
function clearAllColumns() {
  if (document.getElementById("triage-list")) {
    document.getElementById("triage-list").innerHTML = "";
  }
  document.getElementById("todo-list").innerHTML = "";
  document.getElementById("inprogress-list").innerHTML = "";
  document.getElementById("awaitfeedback-list").innerHTML = "";
  document.getElementById("done-list").innerHTML = "";
}

/**
 * Sorts tasks by position, renders each card, and renders empty states.
 * @returns {void}
 */
function renderTasks() {
  tasks.sort(function (a, b) { return (a.position || 0) - (b.position || 0); });
  clearAllColumns();
  let counts = { triage: 0, todo: 0, inprogress: 0, awaitfeedback: 0, done: 0 };
  for (let i = 0; i < tasks.length; i++) {
    renderTaskCard(tasks[i], counts);
  }
  renderAllEmptyStates(counts);
}

/**
 * Renders a single task card into the appropriate column list.
 * @param {Object} task - The task object to render.
 * @param {Object} counts - Running count of tasks per status column.
 * @returns {void}
 */
function renderTaskCard(task, counts) {
  const cardHtml = generateTaskCardHtml(task);
  const listId = task.status + "-list";
  const listElement = document.getElementById(listId);
  if (listElement) {
    listElement.innerHTML += cardHtml;
    counts[task.status]++;
  }
}

/**
 * Renders empty-state placeholders for all board columns.
 * @param {Object} counts - Task counts keyed by status name.
 * @returns {void}
 */
function renderAllEmptyStates(counts) {
  renderEmptyState("triage", counts.triage, "No tasks Triage");
  renderEmptyState("todo", counts.todo, "No tasks To do");
  renderEmptyState("inprogress", counts.inprogress, "No tasks In progress");
  renderEmptyState("awaitfeedback", counts.awaitfeedback, "No tasks Await feedback");
  renderEmptyState("done", counts.done, "No tasks Done");
}

/**
 * Inserts a no-tasks template into a column list when it has zero tasks.
 * @param {string} status - The column status identifier.
 * @param {number} count - Number of tasks in the column.
 * @param {string} message - Message to display when the column is empty.
 * @returns {void}
 */
function renderEmptyState(status, count, message) {
  const list = document.getElementById(status + "-list");
  if (count === 0 && list) {
    list.innerHTML = getNoTasksTemplate(message);
  }
}

/**
 * Initiates dragging for a task, storing its ID and setting dataTransfer data.
 * @param {number|string} id - The ID of the task being dragged.
 * @param {DragEvent} ev - The drag event.
 * @returns {void}
 */
function startDragging(id, ev) {
  isDragging = true;
  currentDraggedTaskId = id;
  if (ev && ev.dataTransfer) {
    ev.dataTransfer.setData("text/plain", String(id));
    ev.dataTransfer.effectAllowed = "move";
  }
}

/**
 * Cleans up drag state after a drag operation ends.
 * @returns {void}
 */
function endDragging() {
  currentDraggedTaskId = null;
  setTimeout(function () { isDragging = false; }, 50);
}

/**
 * Prevents the default browser behaviour to allow dropping.
 * @param {DragEvent} ev - The dragover event.
 * @returns {void}
 */
function allowDrop(ev) { ev.preventDefault(); }

/**
 * Adds a visual drag-over highlight to a column container.
 * @param {string} id - The element ID of the column container.
 * @returns {void}
 */
function highlight(id) {
  document.getElementById(id).classList.add("drag-over");
}

/**
 * Removes the visual drag-over highlight from a column container.
 * @param {string} id - The element ID of the column container.
 * @returns {void}
 */
function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-over");
}

/**
 * Finds the index of a task in the global tasks array by its ID.
 * @param {number|string} taskId - The task ID to search for.
 * @returns {number} The index of the task, or -1 if not found.
 */
function findTaskById(taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) return i;
  }
  return -1;
}

/**
 * Reads the data-task-id attribute of a card element and returns it as a number.
 * @param {HTMLElement} card - The task card DOM element.
 * @returns {number|null} The numeric task ID or null if absent.
 */
function getTaskIdFromCard(card) {
  const id = card.getAttribute("data-task-id");
  return id ? Number(id) : null;
}
