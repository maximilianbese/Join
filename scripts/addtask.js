let selectedPriority = "medium";
let subtasks = [];
let allContacts = [];
let selectedContacts = [];

/**
 * Loads contacts and validates the form after Firebase is ready.
 */
async function setupTaskForm() {
  setMinimumDate();
  await loadContacts();
  validateForm();
  checkForEditMode();
}

/**
 * Initializes the add-task page, loads contacts, and checks for edit mode.
 */
async function initAddTask() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    updateHeaderInitials(currentUser);
  }
  await waitForFirebase();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  await setupTaskForm();
}

/**
 * Validates the form and enables or disables the submit button.
 */
function validateForm() {
  const title = document.getElementById("title").value.trim();
  const dueDate = document.getElementById("due-date").value;
  const category = document.getElementById("category").value;
  const submitBtn = document.getElementById("create-task-btn");
  if (title && dueDate && category) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

/**
 * Finalizes task creation: saves to Firestore, shows toast, dispatches event, clears form.
 * @param {Object} currentUser - The currently logged-in user.
 * @param {Object} task - The task object to save.
 */
async function finalizeTaskCreation(currentUser, task) {
  await saveTask(currentUser.id, task);
  showToast("Task added to board");
  dispatchTaskAddedEvent(task);
  clearForm();
}

/**
 * Handles the add-task form submission — saves the task, shows toast, and redirects.
 * @param {Event} event - The form submit event.
 */
async function handleAddTask(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) { alert("Please log in to create tasks"); return; }
  const task = buildTask(currentUser);
  await finalizeTaskCreation(currentUser, task);
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("back") === "board") {
    redirectToBoard();
  } else {
    setTimeout(redirectToBoard, 1500);
  }
}

/**
 * Redirects to the board page if not already on it.
 */
function redirectToBoard() {
  if (!window.location.pathname.includes("board.html")) {
    setTimeout(function () {
      window.location.href = "board.html";
    }, 1000);
  }
}

/**
 * Builds a task object from the current form state and selected contacts.
 * @param {Object} currentUser - The currently logged-in user.
 * @returns {Object} The assembled task object.
 */
function buildTask(currentUser) {
  const assignedToIds = selectedContacts.map(function (c) {
    return c.id;
  });
  const formData = getTaskFormData();
  return createTaskObject(currentUser, assignedToIds, formData);
}

/**
 * Reads the task form fields and returns them as a plain data object.
 * @returns {{ title: string, description: string, dueDate: string, category: string }}
 */
function getTaskFormData() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: document.getElementById("due-date").value,
    category: document.getElementById("category").value,
  };
}

/**
 * Returns the base task object fields that are not sourced from the form.
 * @param {Object} currentUser - The currently logged-in user.
 * @param {Array} assignedToIds - Array of assigned contact IDs.
 * @returns {Object} The base task object.
 */
function buildBaseTaskObject(currentUser, assignedToIds) {
  return {
    id: Date.now(),
    priority: selectedPriority,
    assignedTo: assignedToIds,
    subtasks: copySubtasks(),
    status: "triage",
    position: Date.now(),
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
    creatorName: currentUser.name || currentUser.email || "Intern",
    aiGenerated: false,
  };
}

/**
 * Creates the final task object with default status "triage" merged with form data.
 * @param {Object} currentUser - The currently logged-in user.
 * @param {Array} assignedToIds - Array of assigned contact IDs.
 * @param {Object} formData - The form field data object.
 * @returns {Object} The complete task object.
 */
function createTaskObject(currentUser, assignedToIds, formData) {
  return Object.assign(buildBaseTaskObject(currentUser, assignedToIds), formData);
}

/**
 * Dispatches a custom "taskAdded" event on the window.
 * @param {Object} task - The task that was added.
 */
function dispatchTaskAddedEvent(task) {
  window.dispatchEvent(
    new CustomEvent("taskAdded", { detail: { task: task } }),
  );
}

/**
 * Saves a task to Firestore under the user's tasks collection.
 * @param {string} userId - The user ID.
 * @param {Object} task - The task object to save.
 */
async function saveTask(userId, task) {
  try {
    const taskRef = window.fbDoc(
      window.firebaseDb,
      "users",
      userId,
      "tasks",
      String(task.id),
    );
    await window.fbSetDoc(taskRef, task);
  } catch (error) {
    console.error("Error saving task:", error);
  }
}

/**
 * Resets the add-task form and all module-level state.
 */
function clearForm() {
  const form = document.getElementById("add-task-form");
  if (form) form.reset();
  selectPriority("medium");
  subtasks = [];
  selectedContacts = [];
  renderAssignedToOptions();
  renderSelectedInitials();
  renderSubtasks();
  validateForm();
}

/**
 * Checks the URL for an edit task ID and triggers edit mode if found.
 */
async function checkForEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const editTaskId = urlParams.get("edit");
  if (editTaskId) {
    await loadTaskForEdit(editTaskId);
  }
}

/**
 * Fetches the Firestore document snapshot for the given user's task.
 * @param {string} userId - The user ID.
 * @param {string} taskId - The task ID.
 * @returns {Promise<DocumentSnapshot>} The Firestore document snapshot.
 */
function fetchTaskSnapshot(userId, taskId) {
  const taskRef = window.fbDoc(window.firebaseDb, "users", userId, "tasks", taskId);
  return window.fbGetDoc(taskRef);
}

/**
 * Loads a task from Firestore for editing and populates the form.
 * @param {string} taskId - The task ID to load.
 */
async function loadTaskForEdit(taskId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const docSnap = await fetchTaskSnapshot(currentUser.id, taskId);
    processLoadedTask(docSnap, taskId);
  } catch (error) {
    console.error("Error loading task for edit:", error);
  }
}

/**
 * Processes a loaded Firestore document and fills the form if it exists.
 * @param {DocumentSnapshot} docSnap - The Firestore document snapshot.
 * @param {string} taskId - The task ID.
 */
function processLoadedTask(docSnap, taskId) {
  if (docSnap.exists()) {
    const task = docSnap.data();
    fillFormWithTaskData(task);
    setupFormForEdit(taskId);
  }
}

/**
 * Fills the basic text fields of the form with task data.
 * @param {Object} task - The task object.
 */
function fillBasicTaskFields(task) {
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("due-date").value = task.dueDate;
}

/**
 * Fills the category field and its display text with task data.
 * @param {Object} task - The task object.
 */
function fillCategoryField(task) {
  const categoryInput = document.getElementById("category");
  if (categoryInput) categoryInput.value = task.category;
  const categoryText = document.getElementById("selected-category-text");
  if (categoryText) {
    categoryText.textContent =
      task.category === "user-story" ? "User Story" : "Technical Task";
  }
}

/**
 * Fills the entire form with task data including category, priority, assignees, and subtasks.
 * @param {Object} task - The task object.
 */
function fillFormWithTaskData(task) {
  fillBasicTaskFields(task);
  fillCategoryField(task);
  selectPriority(task.priority);
  loadAssigneesForEdit(task);
  subtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
  renderSubtasks();
  validateForm();
}

/**
 * Sets the form heading to "Edit Task".
 */
function setEditFormTitle() {
  const titleHeader = document.querySelector(".add-task-title");
  if (titleHeader) titleHeader.textContent = "Edit Task";
}

/**
 * Updates the submit button label to "Save Changes".
 */
function setEditFormButton() {
  const submitBtn = document.getElementById("create-task-btn");
  if (submitBtn) {
    submitBtn.innerHTML =
      'Save Changes <img src="./assets/icons/check-create-icon.svg" alt="Save Changes" />';
  }
}

/**
 * Sets the form's submit handler to the edit task handler for the given task ID.
 * @param {string} taskId - The task ID being edited.
 */
function setEditFormSubmitHandler(taskId) {
  const form = document.getElementById("add-task-form");
  if (form) {
    form.onsubmit = function (event) {
      handleEditTask(event, taskId);
    };
  }
}

/**
 * Hides the clear button when in edit mode.
 */
function hideFormClearButton() {
  const clearBtn = document.querySelector(".btn-clear");
  if (clearBtn) {
    clearBtn.style.display = "none";
  }
}

/**
 * Configures the form for edit mode — updates title, button, submit handler, and hides clear button.
 * @param {string} taskId - The task ID being edited.
 */
function setupFormForEdit(taskId) {
  setEditFormTitle();
  setEditFormButton();
  setEditFormSubmitHandler(taskId);
  hideFormClearButton();
}

/**
 * Handles the edit task form submission while preserving the original status.
 * @param {Event} event - The submit event.
 * @param {string} taskId - The task ID being updated.
 */
async function handleEditTask(event, taskId) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const task = buildTask(currentUser);
  task.id = Number(taskId);
  await executeTaskUpdate(currentUser, taskId, task);
}

/**
 * Executes the Firestore update for an edited task.
 * @param {Object} currentUser - The currently logged-in user.
 * @param {string} taskId - The task ID.
 * @param {Object} task - The updated task object.
 */
async function executeTaskUpdate(currentUser, taskId, task) {
  try {
    const taskRef = getTaskRef(currentUser.id, taskId);
    task.status = await getOriginalTaskStatus(taskRef);
    await updateExistingTask(taskRef, task);
    showToast("Task updated successfully");
    redirectToBoard();
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

/**
 * Returns a Firestore document reference for a task.
 * @param {string} userId - The user ID.
 * @param {string} taskId - The task ID.
 * @returns {DocumentReference} The Firestore document reference.
 */
function getTaskRef(userId, taskId) {
  return window.fbDoc(
    window.firebaseDb,
    "users",
    userId,
    "tasks",
    String(taskId),
  );
}

/**
 * Fetches and returns the original status of a task from Firestore.
 * @param {DocumentReference} taskRef - The Firestore document reference.
 * @returns {Promise<string>} The original status string, defaulting to "triage".
 */
async function getOriginalTaskStatus(taskRef) {
  const oldTaskSnap = await window.fbGetDoc(taskRef);
  if (oldTaskSnap.exists()) {
    return oldTaskSnap.data().status;
  }
  return "triage";
}

/**
 * Writes a task object to its Firestore document reference.
 * @param {DocumentReference} taskRef - The Firestore document reference.
 * @param {Object} task - The task data to write.
 */
async function updateExistingTask(taskRef, task) {
  await window.fbSetDoc(taskRef, task);
}
