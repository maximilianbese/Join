/**
 * Returns the HTML for the add-task overlay.
 * @returns {string} HTML string for the add-task overlay.
 */
function getAddTaskOverlayHTML() {
  return `
    <div
      class="overlay-container"
      id="add-task-overlay"
      onclick="closeAddTaskOverlay()"
      role="dialog"
      aria-modal="true"
      aria-label="Add Task"
    >
      <div
        class="overlay-content add-task-overlay-card"
        onclick="event.stopPropagation()"
      >
        <div class="close-btn-container">
          <button
            type="button"
            title="Close add task overlay"
            onclick="closeAddTaskOverlay()"
            class="btn-close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12L18 18M18 6L12 12L18 6ZM12 12L6 18L12 12ZM12 12L6 6L12 12Z"
                stroke="#2A3647"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <h1 class="add-task-title">Add Task</h1>

        <form id="add-task-form" onsubmit="handleAddTask(event)">
          <div class="form-container">
            <div class="form-column">
              <div class="form-group">
                <label for="title">Title<span class="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  placeholder="Enter a title"
                  oninput="validateForm()"
                  required
                />
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Enter a Description"
                  rows="5"
                  oninput="validateForm()"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="due-date"
                  >Due date<span class="required">*</span></label
                >
                <input
                  type="date"
                  id="due-date"
                  oninput="validateForm()"
                  required
                />
              </div>
            </div>

            <div class="form-column">
              <div class="form-group">
                <label>Priority</label>
                <div class="priority-buttons">
                  <button
                    type="button"
                    class="priority-btn"
                    data-priority="urgent"
                    onclick="selectPriority('urgent')"
                  >
                    Urgent
                    <img
                      src="./assets/icons/urgent-iconAddTask.png"
                      alt="Urgent"
                    />
                  </button>
                  <button
                    type="button"
                    class="priority-btn active"
                    data-priority="medium"
                    onclick="selectPriority('medium')"
                  >
                    Medium
                    <img
                      src="./assets/icons/medium-iconAddTask.png"
                      alt="Medium"
                    />
                  </button>
                  <button
                    type="button"
                    class="priority-btn"
                    data-priority="low"
                    onclick="selectPriority('low')"
                  >
                    Low
                    <img src="./assets/icons/low-iconAddTask.png" alt="Low" />
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Assigned to</label>
                <div class="custom-select-wrapper" id="assigned-to-wrapper">
                  <div
                    class="custom-select-header"
                    onclick="toggleAssignedToDropdown()"
                  >
                    <span>Select contacts to assign</span>
                    <div class="dropdown-arrow-icon"></div>
                  </div>
                  <div
                    class="custom-select-options d-none"
                    id="assigned-to-options"
                  >
                    </div>
                </div>
                <div
                  id="selected-contacts-initials"
                  class="selected-contacts-initials"
                ></div>
              </div>

              <div class="form-group">
                <label for="category"
                  >Category<span class="required">*</span></label
                >
                <div class="custom-select-wrapper" id="category-wrapper">
                  <div
                    class="custom-select-header"
                    onclick="toggleCategoryDropdown()"
                  >
                    <span id="selected-category-text"
                      >Select task category</span
                    >
                    <div class="dropdown-arrow-icon"></div>
                  </div>
                  <div
                    class="custom-select-options d-none"
                    id="category-options"
                  >
                    <div
                      class="contact-option"
                      onclick="selectCategory('Technical Task', event)"
                    >
                      <span class="contact-name">Technical Task</span>
                    </div>
                    <div
                      class="contact-option"
                      onclick="selectCategory('User Story', event)"
                    >
                      <span class="contact-name">User Story</span>
                    </div>
                  </div>
                </div>
                <input type="hidden" id="category" value="" />
              </div>

              <div class="form-group">
                <label>Subtasks</label>
                <div
                  class="subtask-input-wrapper"
                  id="subtask-wrapper"
                  onclick="document.getElementById('subtask-input').focus()"
                >
                  <input
                    type="text"
                    id="subtask-input"
                    placeholder="Add new subtask"
                    onfocus="showSubtaskIcons()"
                    onkeydown="handleSubtaskKeydown(event)"
                  />
                  <div
                    class="subtask-icons-active v-hidden"
                    id="subtask-icons-active"
                  >
                    <img
                      src="./assets/icons/clear-X-icon.svg"
                      alt="Clear"
                      onclick="clearSubtaskInput()"
                      class="subtask-icon"
                    />
                    <div class="subtask-divider"></div>
                    <img
                      src="./assets/icons/check-create-icon-black.svg"
                      alt="Save"
                      onclick="addSubtask()"
                      class="subtask-icon"
                    />
                  </div>
                </div>
                <ul id="subtask-list" class="subtask-list"></ul>
              </div>
            </div>
          </div>

          <footer class="form-footer">
            <p class="required-note">
              <span class="required">*</span>This field is required
            </p>
            <div class="form-actions">
              <button type="button" class="btn-clear" onclick="clearForm()">
                Clear
                <img src="./assets/icons/clear-X-icon.svg" alt="Clear" />
              </button>
              <button
                type="submit"
                id="create-task-btn"
                class="btn-create"
                disabled
              >
                Create Task
                <img
                  src="./assets/icons/check-create-icon.svg"
                  alt="Create Task"
                />
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
`;
}
