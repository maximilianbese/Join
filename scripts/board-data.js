/**
 * Returns a Firestore collection reference for a user's tasks.
 * @param {string} userId - The authenticated user's ID.
 * @returns {import("firebase/firestore").CollectionReference}
 */
function getTasksRef(userId) {
  return window.fbCollection(window.firebaseDb, "users", userId, "tasks");
}

/**
 * Populates the global tasks array from a Firestore query snapshot.
 * @param {import("firebase/firestore").QuerySnapshot} snapshot - The Firestore snapshot.
 * @returns {void}
 */
function processTasksSnapshot(snapshot) {
  tasks = [];
  snapshot.forEach(function (doc) {
    const data = doc.data();
    if (data.position === undefined) {
      data.position = data.id || Date.now();
    }
    tasks.push(data);
  });
}

/**
 * Loads tasks from Firestore for the current user and then loads triage tickets.
 * @returns {Promise<void>}
 */
async function loadTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const tasksRef = getTasksRef(currentUser.id);
    const snapshot = await window.fbGetDocs(tasksRef);
    processTasksSnapshot(snapshot);
  } catch (error) {
    console.error("Error loading tasks:", error);
    tasks = [];
  }
  await loadTriageTickets();
}

/** Phrases that only appear in n8n confirmation/system emails, never in real requests. */
var CONFIRMATION_PHRASES = [
  "wurde erfolgreich erfasst und wird bearbeitet",
  "feature request bearbeitet",
  "ticket wurde erstellt",
  "ticket wurde angelegt",
  "automatisch analysiert und in unserem triage-backlog",
  "tageslimit erreicht",
  "feature request konnte nicht verarbeitet werden",
];

/**
 * Returns true if the ticket was generated from a system/confirmation email
 * rather than a real stakeholder request. Checks both sender address and
 * known confirmation-email content patterns.
 * @param {Object} data - The raw ticket data object.
 * @returns {boolean}
 */
function isSystemEmail(data) {
  const collectorAddr = typeof ISSUE_COLLECTOR_EMAIL !== "undefined"
    ? ISSUE_COLLECTOR_EMAIL.toLowerCase() : "";
  const sender = (data.senderEmail || "").toLowerCase();
  if (collectorAddr && sender === collectorAddr) return true;
  const text = ((data.title || "") + " " + (data.description || "")).toLowerCase();
  return CONFIRMATION_PHRASES.some(function (p) { return text.includes(p); });
}

/**
 * Parses a single RTDB child snapshot and pushes it to tasks if not a duplicate
 * and not a system-generated confirmation email.
 * @param {import("firebase/database").DataSnapshot} childSnapshot - One RTDB child snapshot.
 * @returns {void}
 */
function processSingleTriageTicket(childSnapshot) {
  let data = childSnapshot.val();
  if (typeof data === "string") {
    try { data = JSON.parse(data.replace(/^=/, "")); } catch (e) { return; }
  }
  if (isSystemEmail(data)) return;
  data._rtdbKey = childSnapshot.key;
  if (!data.id) data.id = Date.now() + Math.floor(Math.random() * 1000);
  if (data.position === undefined) data.position = data.id;
  const alreadyLoaded = tasks.find(function (t) {
    return String(t.id) === String(data.id);
  });
  if (!alreadyLoaded) tasks.push(data);
}

/**
 * Loads AI-generated triage tickets from the Realtime Database into tasks.
 * @returns {Promise<void>}
 */
async function loadTriageTickets() {
  try {
    const ticketsRef = window.fbRtdbRef(window.firebaseRtdb, "tasks");
    const snapshot = await window.fbRtdbGet(ticketsRef);
    if (!snapshot.exists()) return;
    snapshot.forEach(function (childSnapshot) {
      processSingleTriageTicket(childSnapshot);
    });
  } catch (error) {
    console.error("Error loading triage tickets from RTDB:", error);
  }
}

/**
 * Saves all tasks in the global array to Firestore for the current user.
 * @returns {Promise<void>}
 */
async function saveTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    await saveAllTasksToFirestore(currentUser.id);
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

/**
 * Writes every task in the global array to Firestore under the given user ID.
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<void>}
 */
async function saveAllTasksToFirestore(userId) {
  for (let i = 0; i < tasks.length; i++) {
    const taskRef = getTaskRefForUser(userId, tasks[i].id);
    await window.fbSetDoc(taskRef, tasks[i]);
  }
}

/**
 * Saves a single task to either RTDB (AI-generated) or Firestore.
 * @param {Object} task - The task object to persist.
 * @returns {Promise<void>}
 */
async function saveSingleTask(task) {
  if (task.aiGenerated && task._rtdbKey) {
    await saveRtdbTask(task);
  } else {
    await saveFirestoreTask(task);
  }
}

/**
 * Persists a task to the Firebase Realtime Database using its stored key.
 * @param {Object} task - The task object with a _rtdbKey property.
 * @returns {Promise<void>}
 */
async function saveRtdbTask(task) {
  try {
    const taskRef = window.fbRtdbRef(window.firebaseRtdb, "tasks/" + task._rtdbKey);
    const taskData = Object.assign({}, task);
    delete taskData._rtdbKey;
    await window.fbRtdbSet(taskRef, taskData);
  } catch (error) {
    console.error("Error saving RTDB task:", error);
  }
}

/**
 * Persists a task to Firestore under the current user's task collection.
 * @param {Object} task - The task object to save.
 * @returns {Promise<void>}
 */
async function saveFirestoreTask(task) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const taskRef = getTaskRefForUser(currentUser.id, task.id);
    await window.fbSetDoc(taskRef, task);
  } catch (error) {
    console.error("Error saving Firestore task:", error);
  }
}

/**
 * Removes a task from the Firebase Realtime Database by its RTDB key.
 * @param {string} rtdbKey - The RTDB key of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteRtdbTask(rtdbKey) {
  try {
    const taskRef = window.fbRtdbRef(window.firebaseRtdb, "tasks/" + rtdbKey);
    await window.fbRtdbRemove(taskRef);
  } catch (error) {
    console.error("Error deleting RTDB task:", error);
  }
}

/**
 * Returns a Firestore document reference for a specific user task.
 * @param {string} userId - The authenticated user's ID.
 * @param {number|string} taskId - The task ID.
 * @returns {import("firebase/firestore").DocumentReference}
 */
function getTaskRefForUser(userId, taskId) {
  return window.fbDoc(window.firebaseDb, "users", userId, "tasks", String(taskId));
}

/**
 * Finds and returns a task object from the global array by its ID.
 * @param {number|string} taskId - The task ID to look up.
 * @returns {Object|null} The task object or null if not found.
 */
function findTask(taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) return tasks[i];
  }
  return null;
}

/**
 * Resolves the target task ID and relative drop position from a drop event.
 * @param {DragEvent} ev - The drop event.
 * @returns {{ targetTaskId: number|null, relativePos: string }}
 */
function resolveDropIds(ev) {
  const targetCard = ev.target.closest(".task-card");
  let targetTaskId = null;
  let relativePos = "after";
  if (!targetCard) return { targetTaskId, relativePos };
  targetTaskId = getTaskIdFromCard(targetCard);
  const rect = targetCard.getBoundingClientRect();
  if (window.innerWidth <= 780) {
    if (ev.clientX < rect.left + rect.width / 2) relativePos = "before";
  } else {
    if (ev.clientY < rect.top + rect.height / 2) relativePos = "before";
  }
  return { targetTaskId, relativePos };
}

/**
 * Handles a drop event onto a board column, resolving position and calling moveTo.
 * @param {DragEvent} ev - The drop event.
 * @param {string} status - The target column status.
 * @returns {void}
 */
function drop(ev, status) {
  ev.preventDefault();
  removeHighlight(status + "-list");
  if (currentDraggedTaskId === null && ev.dataTransfer) {
    const data = ev.dataTransfer.getData("text/plain");
    if (data) currentDraggedTaskId = Number(data);
  }
  const { targetTaskId, relativePos } = resolveDropIds(ev);
  moveTo(status, targetTaskId, relativePos);
}

/**
 * Assigns position and status to a task based on the drop location.
 * @param {Object} task - The task object to update.
 * @param {string} status - The destination column status.
 * @param {number|null} targetTaskId - The task ID of the drop target card.
 * @param {string} relativePos - Either "before" or "after" relative to targetTaskId.
 * @returns {void}
 */
function applyDropPosition(task, status, targetTaskId, relativePos) {
  task.status = status;
  if (targetTaskId !== null && targetTaskId !== currentDraggedTaskId) {
    task.position = calculateNewPosition(status, targetTaskId, relativePos);
  } else if (targetTaskId === null) {
    task.position = getNewPositionAtEnd(status);
  }
}

/**
 * Moves the currently dragged task to a new column position and saves it.
 * @param {string} status - The destination column status.
 * @param {number|null} [targetTaskId=null] - ID of the card to drop relative to.
 * @param {string} [relativePos="after"] - Drop position relative to targetTaskId.
 * @returns {Promise<void>}
 */
async function moveTo(status, targetTaskId = null, relativePos = "after") {
  const taskIndex = findTaskById(currentDraggedTaskId);
  if (taskIndex !== -1) {
    const task = tasks[taskIndex];
    const oldStatus = task.status;
    applyDropPosition(task, status, targetTaskId, relativePos);
    renderTasks();
    await saveSingleTask(task);
    if (typeof notifyStatusChange === "function") {
      notifyStatusChange(task, oldStatus, status);
    }
  }
  currentDraggedTaskId = null;
}

/**
 * Returns a position value placing a task after all existing tasks in a column.
 * @param {string} status - The column status to compute the end position for.
 * @returns {number} A position value greater than all existing positions in the column.
 */
function getNewPositionAtEnd(status) {
  const columnTasks = tasks.filter(function (t) { return t.status === status; });
  if (columnTasks.length === 0) return Date.now();
  let maxPos = 0;
  for (let i = 0; i < columnTasks.length; i++) {
    if ((columnTasks[i].position || 0) > maxPos) maxPos = columnTasks[i].position;
  }
  return maxPos + 1024;
}

/**
 * Calculates a position value just before the task at targetIndex in the column.
 * @param {Object[]} columnTasks - Sorted array of tasks in the column.
 * @param {number} targetIndex - Index of the target task within columnTasks.
 * @returns {number} The computed position value.
 */
function getPositionBefore(columnTasks, targetIndex) {
  const prevTask = columnTasks[targetIndex - 1];
  const targetTask = columnTasks[targetIndex];
  if (!prevTask) return targetTask.position - 1024;
  return (prevTask.position + targetTask.position) / 2;
}

/**
 * Calculates a position value just after the task at targetIndex in the column.
 * @param {Object[]} columnTasks - Sorted array of tasks in the column.
 * @param {number} targetIndex - Index of the target task within columnTasks.
 * @returns {number} The computed position value.
 */
function getPositionAfter(columnTasks, targetIndex) {
  const targetTask = columnTasks[targetIndex];
  const nextTask = columnTasks[targetIndex + 1];
  if (!nextTask) return targetTask.position + 1024;
  return (targetTask.position + nextTask.position) / 2;
}


/**
 * Calculates the insertion position for a task relative to a target task in a column.
 * @param {string} status - The target column status.
 * @param {number|string} targetTaskId - The ID of the reference task.
 * @param {string} relativePos - Either "before" or "after".
 * @returns {number} The computed position value.
 */
function calculateNewPosition(status, targetTaskId, relativePos) {
  const columnTasks = tasks
    .filter(function (t) { return t.status === status; })
    .sort(function (a, b) { return (a.position || 0) - (b.position || 0); });
  const targetIndex = columnTasks.findIndex(function (t) { return t.id === targetTaskId; });
  if (targetIndex === -1) return getNewPositionAtEnd(status);
  if (relativePos === "before") return getPositionBefore(columnTasks, targetIndex);
  return getPositionAfter(columnTasks, targetIndex);
}
