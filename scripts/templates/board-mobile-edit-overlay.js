/**
 * Returns the HTML for the mobile task-edit overlay.
 * @returns {string} HTML string for the mobile edit overlay.
 */
function getMobileEditOverlayHTML() {
  return `
      class="mobile-edit-overlay"
      id="mobile-edit-overlay"
      onclick="closeMobileEditOverlay()"
    >
      <div class="mobile-edit-card" onclick="event.stopPropagation()">
        <div class="mobile-edit-header">
          <button class="mobile-edit-close" onclick="closeMobileEditOverlay()">
            <img src="./assets/icons/clear-X-icon.svg" alt="Close" />
          </button>
        </div>

        <div class="mobile-edit-body">
          <div class="form-group">
            <label for="mobile-edit-title"
              >Title<span class="required">*</span></label
            >
            <input
              type="text"
              id="mobile-edit-title"
              placeholder="Enter a title"
              oninput="validateMobileEditForm()"
            />
          </div>

          <div class="form-group">
            <label for="mobile-edit-description">Description</label>
            <textarea
              id="mobile-edit-description"
              placeholder="Enter a Description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="mobile-edit-due-date"
              >Due date<span class="required">*</span></label
            >
            <input
              type="date"
              id="mobile-edit-due-date"
              oninput="validateMobileEditForm()"
            />
          </div>

          <div class="form-group">
            <label>Priority</label>
            <div class="priority-buttons">
              <button
                type="button"
                class="priority-btn"
                data-priority="urgent"
                onclick="selectMobileEditPriority('urgent')"
              >
                Urgent
                <img src="./assets/icons/urgent-iconAddTask.png" alt="Urgent" />
              </button>
              <button
                type="button"
                class="priority-btn"
                data-priority="medium"
                onclick="selectMobileEditPriority('medium')"
              >
                Medium
                <img src="./assets/icons/medium-iconAddTask.png" alt="Medium" />
              </button>
              <button
                type="button"
                class="priority-btn"
                data-priority="low"
                onclick="selectMobileEditPriority('low')"
              >
                Low <img src="./assets/icons/low-iconAddTask.png" alt="Low" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Assigned to</label>
            <div
              class="custom-select-wrapper"
              id="mobile-edit-assigned-to-wrapper"
            >
              <div
                class="custom-select-header"
                onclick="toggleMobileEditAssignedToDropdown()"
              >
                <span>Select contacts to assign</span>
                <div class="dropdown-arrow-icon"></div>
              </div>
              <div
                class="custom-select-options d-none"
                id="mobile-edit-assigned-to-options"
              ></div>
            </div>
            <div
              id="mobile-edit-selected-contacts-initials"
              class="selected-contacts-initials"
            ></div>
          </div>

          <div class="form-group">
            <label>Subtasks</label>
            <div
              class="subtask-input-wrapper"
              onclick="
                document.getElementById('mobile-edit-subtask-input').focus()
              "
            >
              <input
                type="text"
                id="mobile-edit-subtask-input"
                placeholder="Add new subtask"
                onfocus="showMobileEditSubtaskIcons()"
                onkeydown="handleMobileEditSubtaskKeydown(event)"
              />
              <div
                class="subtask-icons-active v-hidden"
                id="mobile-edit-subtask-icons-active"
              >
                <img
                  src="./assets/icons/clear-X-icon.svg"
                  alt="Clear"
                  onclick="clearMobileEditSubtaskInput()"
                  class="subtask-icon"
                />
                <div class="subtask-divider"></div>
                <img
                  src="./assets/icons/check-create-icon-black.svg"
                  alt="Save"
                  onclick="addMobileEditSubtask()"
                  class="subtask-icon"
                />
              </div>
            </div>
            <ul id="mobile-edit-subtask-list" class="subtask-list"></ul>
          </div>
        </div>

        <div class="mobile-edit-footer">
          <button
            class="btn-create"
            id="mobile-edit-save-btn"
            onclick="saveMobileEditTask()"
          >
            Ok <img src="./assets/icons/check-create-icon.svg" alt="Save" />
          </button>
        </div>
      </div>
    </div>

    <nav class="mobile-nav d-none-desktop" aria-label="Mobile navigation">
      <a href="summaryuser.html" class="nav-item">
        <img src="./assets/summary-page/summary-icon.svg" alt="" />
        <span>Summary</span>
      </a>
      <a href="addtask.html" class="nav-item">
        <img src="./assets/summary-page/add-task-icon.svg" alt="" />
        <span>Add Task</span>
      </a>
      <a href="board.html" class="nav-item active">
        <img src="./assets/summary-page/board-icon.svg" alt="" />
        <span>Board</span>
      </a>
      <a href="contacts.html" class="nav-item">
        <img src="./assets/summary-page/contacts-icon.svg" alt="" />
        <span>Contacts</span>
      </a>
    </nav>
`;
}

/**
 * Injects both board overlays into the DOM mount point.
 * Runs synchronously so overlays exist before script initialisation.
 */
function mountBoardOverlays() {
  document.getElementById("board-overlays-mount").innerHTML =
    getAddTaskOverlayHTML() + getMobileEditOverlayHTML();
}

mountBoardOverlays();
