/**
 * Sets the minimum selectable date on the due-date field to today.
 */
function setMinimumDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("due-date").setAttribute("min", today);
}

/**
 * Activates the selected priority button and deactivates all others.
 * @param {string} priority - The priority to select ("urgent", "medium", or "low").
 */
function selectPriority(priority) {
  const buttons = document.querySelectorAll(".priority-btn");
  removeActiveFromAll(buttons);
  addActiveToSelected(priority);
}

/**
 * Removes the active class from all priority buttons.
 * @param {NodeList} buttons - The list of priority button elements.
 */
function removeActiveFromAll(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }
}

/**
 * Adds the active class to the priority button matching the given priority.
 * @param {string} priority - The priority value to activate.
 */
function addActiveToSelected(priority) {
  const selectedBtn = document.querySelector(
    '[data-priority="' + priority + '"]',
  );
  if (selectedBtn) {
    selectedBtn.classList.add("active");
    selectedPriority = priority;
  }
}

/**
 * Shows a toast notification message.
 * @param {string} message - The message to display.
 */
function showToast(message) {
  let toast = document.getElementById("toast-message");
  if (!toast) {
    toast = createToastElement();
  }
  toast.innerHTML = getToastTemplate(message);
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.classList.remove("d-none");
  hideToastAfterDelay(toast);
}

/**
 * Creates and appends a toast element to the document body.
 * @returns {HTMLElement} The created toast element.
 */
function createToastElement() {
  const toast = document.createElement("div");
  toast.id = "toast-message";
  toast.className = "toast-message d-none";
  document.body.appendChild(toast);
  return toast;
}

/**
 * Hides the toast element after a 3-second delay.
 * @param {HTMLElement} toast - The toast element to hide.
 */
function hideToastAfterDelay(toast) {
  setTimeout(function () {
    toast.classList.add("d-none");
  }, 3000);
}
