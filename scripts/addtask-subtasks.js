/**
 * Adds a new subtask from the subtask input field.
 */
function addSubtask() {
  const input = document.getElementById("subtask-input");
  const subtaskText = input.value.trim();
  if (subtaskText === "") {
    hideSubtaskIcons();
    return;
  }
  processNewSubtask(subtaskText);
  input.value = "";
  renderSubtasks();
  hideSubtaskIcons();
}

/**
 * Creates a subtask object from text and pushes it to the subtasks array.
 * @param {string} text - The subtask text.
 */
function processNewSubtask(text) {
  const subtask = createSubtask(text);
  subtasks.push(subtask);
}

/**
 * Shows the subtask action icons (clear and save) by removing hidden classes.
 */
function showSubtaskIcons() {
  const activeIcons = document.getElementById("subtask-icons-active");
  if (activeIcons) {
    activeIcons.classList.remove("v-hidden");
    activeIcons.classList.remove("d-none");
  }
}

/**
 * Hides the subtask action icons (clear and save).
 */
function hideSubtaskIcons() {
  const activeIcons = document.getElementById("subtask-icons-active");
  if (activeIcons) activeIcons.classList.add("v-hidden");
}

/**
 * Clears the subtask input field and hides the icons.
 */
function clearSubtaskInput() {
  const input = document.getElementById("subtask-input");
  if (input) input.value = "";
  hideSubtaskIcons();
}

// Global click handler that hides subtask icons when clicking outside the subtask wrapper.
document.addEventListener("click", function (event) {
  const wrapper = document.getElementById("subtask-wrapper");
  const input = document.getElementById("subtask-input");
  if (wrapper && input && !wrapper.contains(event.target)) {
    if (input.value.trim() === "") {
      hideSubtaskIcons();
    }
  }
});

/**
 * Prevents form submission on Enter in the subtask input field, adding the subtask instead.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleSubtaskKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtask();
  }
}

/**
 * Creates a new subtask data object.
 * @param {string} text - The subtask text.
 * @returns {Object} The subtask object with id, text, and completed fields.
 */
function createSubtask(text) {
  return {
    id: Date.now(),
    text: text,
    completed: false,
  };
}

/**
 * Renders the current subtasks array as list items in the DOM.
 */
function renderSubtasks() {
  const list = document.getElementById("subtask-list");
  if (!list) return;
  list.innerHTML = "";
  for (let i = 0; i < subtasks.length; i++) {
    const li = document.createElement("li");
    li.innerHTML = getSubtaskItemTemplate(subtasks[i]);
    list.appendChild(li);
  }
}

/**
 * Switches a subtask into edit mode by replacing its DOM content.
 * @param {number} id - The subtask ID.
 */
function editSubtask(id) {
  const subtask = findSubtaskById(id);
  if (!subtask) return;
  const container = document.getElementById(`subtask-item-${id}`);
  if (container && container.parentElement) {
    container.parentElement.innerHTML = getSubtaskEditTemplate(subtask);
    setupSubtaskEditFocus(id);
  }
}

/**
 * Focuses the subtask edit input and places the cursor at the end.
 * @param {number} id - The subtask ID.
 */
function setupSubtaskEditFocus(id) {
  const input = document.getElementById(`subtask-input-${id}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Saves the edited text for a subtask, or removes it if the text is empty.
 * @param {number} id - The subtask ID.
 */
function saveEditSubtask(id) {
  const input = document.getElementById(`subtask-input-${id}`);
  if (!input) return;
  const newText = input.value.trim();
  if (newText === "") {
    removeSubtask(id);
    return;
  }
  updateSubtaskText(id, newText);
}

/**
 * Updates the text of a subtask and re-renders the list.
 * @param {number} id - The subtask ID.
 * @param {string} newText - The new text value.
 */
function updateSubtaskText(id, newText) {
  const subtask = findSubtaskById(id);
  if (subtask) {
    subtask.text = newText;
    renderSubtasks();
  }
}

/**
 * Handles keyboard input in the subtask edit field — saves on Enter, cancels on Escape.
 * @param {number} id - The subtask ID.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleSubtaskEditKeydown(id, event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveEditSubtask(id);
  } else if (event.key === "Escape") {
    renderSubtasks();
  }
}

/**
 * Removes a subtask from the array by ID and re-renders.
 * @param {number} id - The subtask ID to remove.
 */
function removeSubtask(id) {
  subtasks = subtasks.filter(function (s) {
    return s.id !== id;
  });
  renderSubtasks();
}

/**
 * Returns a shallow copy of the subtasks array.
 * @returns {Array} A copy of the subtasks array.
 */
function copySubtasks() {
  const copy = [];
  for (let i = 0; i < subtasks.length; i++) {
    copy.push(subtasks[i]);
  }
  return copy;
}

/**
 * Finds a subtask in the subtasks array by its ID.
 * @param {number} id - The subtask ID.
 * @returns {Object|undefined} The matching subtask or undefined.
 */
function findSubtaskById(id) {
  return subtasks.find(function (s) {
    return s.id === id;
  });
}
