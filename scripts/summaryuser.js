/**
 * Initializes the summary page for logged-in users.
 */
async function initSummaryUser() {
  await waitForFirebase();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  updateUserName(currentUser);
  updateUserInitials(currentUser);
  updateGreeting();
  await updateTaskMetrics(currentUser);
  checkMobileGreeting();
}

/**
 * Updates the username display on the page.
 * @param {Object} user - The user object.
 */
function updateUserName(user) {
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
}

/**
 * Updates the user initials in the header.
 * @param {Object} user - The user object.
 */
function updateUserInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitials(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Generates initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The generated initials.
 */
function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

/**
 * Returns the appropriate greeting word based on the hour of day.
 * @param {number} hour - The current hour (0-23).
 * @returns {string} "Good morning", "Good afternoon", or "Good evening".
 */
function getGreetingWord(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Updates the greeting message based on time of day and guest status.
 */
function updateGreeting() {
  const hour = new Date().getHours();
  const currentUser = getCurrentUser();
  const isGuest = currentUser && currentUser.isGuest === true;
  const greeting = getGreetingWord(hour) + (isGuest ? "!" : ",");
  const greetingElement = document.getElementById("greeting-text");
  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
}

/**
 * Displays the calculated task metrics on the summary page.
 * @param {Object} metrics - The metrics object.
 */
function displayTaskMetrics(metrics) {
  document.getElementById("count-todo").textContent = metrics.todo;
  document.getElementById("count-done").textContent = metrics.done;
  document.getElementById("count-urgent").textContent = metrics.urgent;
  document.getElementById("count-board").textContent = metrics.board;
  document.getElementById("count-progress").textContent = metrics.progress;
  document.getElementById("count-awaiting").textContent = metrics.awaiting;
  const deadlineElement = document.getElementById("next-deadline");
  if (metrics.nextDeadline) {
    deadlineElement.textContent = metrics.nextDeadline;
  } else {
    deadlineElement.textContent = "No upcoming deadline";
  }
}

/**
 * Loads user tasks, calculates metrics, and renders them on the summary page.
 * @param {Object} user - The user object.
 */
async function updateTaskMetrics(user) {
  const userTasks = await getUserTasks(user.id);
  const metrics = calculateTaskMetrics(userTasks);
  displayTaskMetrics(metrics);
  await updateEmailRequestsCount();
}

const EMAIL_REQUESTS_SYSTEM_PHRASES = [
  "wurde erfolgreich erfasst und wird bearbeitet",
  "feature request bearbeitet",
  "ticket wurde erstellt",
  "ticket wurde angelegt",
  "automatisch analysiert und in unserem triage-backlog",
  "tageslimit erreicht",
  "feature request konnte nicht verarbeitet werden",
];

/**
 * Extracts and normalises the sender email address from a raw senderEmail field.
 * @param {string} raw - Raw senderEmail value from the ticket.
 * @returns {string} Lowercased email address.
 */
function extractSenderEmail(raw) {
  const match = raw.match(/[\w.+\-]+@[\w\-]+\.[\w.]+/);
  return (match ? match[0] : raw.replace(/^["'\s<>]+|["'\s<>]+$/g, "")).toLowerCase();
}

/**
 * Returns true if the ticket is a system-generated or collector email.
 * @param {Object} t - Raw ticket object from RTDB.
 * @param {string} collectorEmail - Lowercased collector address to filter.
 * @returns {boolean}
 */
function isSystemTicket(t, collectorEmail) {
  if (!t || t.status !== "triage") return true;
  if (extractSenderEmail(t.senderEmail || "") === collectorEmail) return true;
  const text = ((t.title || "") + " " + (t.description || "")).toLowerCase();
  return EMAIL_REQUESTS_SYSTEM_PHRASES.some(function (p) { return text.includes(p); });
}

/**
 * Counts valid triage tickets from a snapshot and writes the result to the DOM.
 * @param {import("firebase/database").DataSnapshot} snapshot - RTDB snapshot of /tasks.
 */
function renderEmailRequestsCount(snapshot) {
  const collectorEmail = typeof ISSUE_COLLECTOR_EMAIL !== "undefined"
    ? ISSUE_COLLECTOR_EMAIL.toLowerCase() : "join.issue.collector@gmail.com";
  let count = 0;
  if (snapshot.exists()) {
    snapshot.forEach(function (child) {
      if (!isSystemTicket(child.val(), collectorEmail)) count++;
    });
  }
  const el = document.getElementById("count-email-requests");
  if (el) el.textContent = count;
}

/**
 * Subscribes to the Realtime Database tasks node and keeps the email-requests
 * counter on the summary page in sync.
 */
function updateEmailRequestsCount() {
  try {
    const ticketsRef = window.fbRtdbRef(window.firebaseRtdb, "tasks");
    window.fbRtdbOnValue(ticketsRef, renderEmailRequestsCount);
  } catch (error) {
    console.error("Error loading email requests count:", error);
  }
}

/**
 * Builds the Firestore collection reference for a user's tasks.
 * @param {string} userId - The user ID.
 * @returns {CollectionReference} The Firestore collection reference.
 */
function buildTasksRef(userId) {
  return window.fbCollection(window.firebaseDb, "users", userId, "tasks");
}

/**
 * Fetches the tasks for a given user from Firestore.
 * @param {string} userId - The user ID.
 * @returns {Promise<Array>} Array of task data objects.
 */
async function getUserTasks(userId) {
  try {
    const tasksRef = buildTasksRef(userId);
    const snapshot = await window.fbGetDocs(tasksRef);
    const tasks = [];
    snapshot.forEach(function (doc) {
      tasks.push(doc.data());
    });
    return tasks;
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
}

/**
 * Processes a single task into the metrics object and returns the updated nearest deadline.
 * @param {Object} task - The task object.
 * @param {Object} metrics - The metrics object to update.
 * @param {string|null} nearestDeadline - The current nearest deadline.
 * @returns {string|null} The updated nearest deadline.
 */
function updateNearestDeadlineForTask(task, metrics, nearestDeadline) {
  processTaskStatus(task, metrics);
  countUrgentTasks(task, metrics);
  if (task.status !== "done") {
    return trackNearestDeadline(task, nearestDeadline);
  }
  return nearestDeadline;
}

/**
 * Calculates task metrics from an array of tasks.
 * @param {Array} tasks - Array of task objects.
 * @returns {Object} Object containing calculated metrics.
 */
function calculateTaskMetrics(tasks) {
  const metrics = createInitialMetrics();
  if (!tasks || tasks.length === 0) return metrics;
  let nearestDeadline = null;
  for (let i = 0; i < tasks.length; i++) {
    nearestDeadline = updateNearestDeadlineForTask(tasks[i], metrics, nearestDeadline);
  }
  metrics.board = tasks.length;
  if (nearestDeadline) metrics.nextDeadline = formatDeadline(nearestDeadline);
  return metrics;
}

/**
 * Returns a fresh metrics object with all counts set to zero.
 * @returns {Object} Initial metrics object.
 */
function createInitialMetrics() {
  return {
    todo: 0,
    done: 0,
    urgent: 0,
    board: 0,
    progress: 0,
    awaiting: 0,
    nextDeadline: null,
  };
}

/**
 * Increments the appropriate status counter in the metrics object.
 * @param {Object} task - The task object.
 * @param {Object} metrics - The metrics object to update.
 */
function processTaskStatus(task, metrics) {
  const statusMap = { todo: "todo", done: "done", inprogress: "progress", awaitfeedback: "awaiting" };
  const key = statusMap[task.status];
  if (key) metrics[key]++;
}

/**
 * Increments the urgent task counter if the task priority is urgent.
 * @param {Object} task - The task object.
 * @param {Object} metrics - The metrics object to update.
 */
function countUrgentTasks(task, metrics) {
  if (task.priority === "urgent") {
    metrics.urgent++;
  }
}

/**
 * Tracks the nearest upcoming deadline across tasks.
 * @param {Object} task - The task object.
 * @param {string|null} nearestDeadline - The currently nearest deadline string.
 * @returns {string|null} The updated nearest deadline string.
 */
function trackNearestDeadline(task, nearestDeadline) {
  if (task.dueDate) {
    const taskDate = new Date(task.dueDate);
    if (!nearestDeadline || taskDate < new Date(nearestDeadline)) {
      nearestDeadline = task.dueDate;
    }
  }
  return nearestDeadline;
}

/**
 * Formats a deadline date string for display.
 * @param {string} deadline - The deadline as an ISO date string.
 * @returns {string} The formatted deadline string.
 */
function formatDeadline(deadline) {
  const date = new Date(deadline);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Logs out the current user and redirects to the login page.
 */
async function logoutFromSummary() {
  await logoutUser();
  window.location.href = "index.html";
}

/**
 * Initializes the summary page (legacy support).
 */
function initSummary() {
  updateGreeting();
  renderTaskMetrics();
}

/**
 * Returns the default element ID-to-value map for the metrics display.
 * @returns {Object} Map of element IDs to their default string values.
 */
function getDefaultMetricsElements() {
  return {
    "count-todo": "0",
    "count-done": "0",
    "count-urgent": "0",
    "count-board": "0",
    "count-progress": "0",
    "count-awaiting": "0",
    "next-deadline": "No upcoming deadline",
  };
}

/**
 * Renders default task metrics on the page (fallback or guest view).
 */
function renderTaskMetrics() {
  const elements = getDefaultMetricsElements();
  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = value;
    }
  }
}

/**
 * Removes the greeting flag from sessionStorage.
 */
function removeMobileGreetingFlag() {
  sessionStorage.removeItem("showJoinGreeting");
}

/**
 * Starts the fade-out animation for the greeting overlay.
 * @param {HTMLElement} greetingContainer - The greeting container element.
 */
function startGreetingFadeOut(greetingContainer) {
  setTimeout(function () {
    greetingContainer.classList.add("fade-out");
    setTimeout(function () {
      greetingContainer.classList.remove("mobile-greeting-overlay");
      greetingContainer.classList.remove("fade-out");
    }, 500);
  }, 1500);
}

/**
 * Shows the mobile greeting overlay and starts the fade-out animation.
 * @param {HTMLElement} greetingContainer - The greeting container element.
 */
function showMobileGreetingOverlay(greetingContainer) {
  greetingContainer.classList.add("mobile-greeting-overlay");
  startGreetingFadeOut(greetingContainer);
}

/**
 * Checks whether the mobile greeting animation should be shown.
 * The sessionStorage flag is removed after the first call to prevent re-display on reload.
 */
function checkMobileGreeting() {
  const showGree