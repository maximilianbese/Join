let autoScrollInterval;
let scrollDirection = 0; // 1 for down, -1 for up, 0 for none
let horizontalAutoScrollInterval;
let scrollDirectionX = 0; // 1 for right, -1 for left, 0 for none
let currentScrollingList = null;

/**
 * Initializes touch drag-and-drop for mobile devices.
 */
function initTouchDragDrop() {
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
}

/**
 * Handles the touchstart event on a task card.
 * @param {TouchEvent} ev - The touch event.
 */
function handleTouchStart(ev) {
  const card = ev.target.closest(".task-card");
  if (!card) return;
  const touch = ev.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchDragTaskId = getTaskIdFromCard(card);
  touchDragElement = card;
}

/**
 * Handles touchmove events during a drag operation.
 * @param {TouchEvent} ev - The touch event.
 */
function handleTouchMove(ev) {
  if (!touchDragElement) return;
  const touch = ev.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartX);
  const deltaY = Math.abs(touch.clientY - touchStartY);
  if (!touchDragClone && (deltaX > 10 || deltaY > 10)) {
    createTouchDragClone(touch);
  }
  if (touchDragClone) {
    updateDragClonePosition(ev, touch);
  }
}

/**
 * Creates a visual clone of the card for touch dragging.
 * @param {Touch} touch - The touch object.
 */
function createTouchDragClone(touch) {
  touchDragClone = touchDragElement.cloneNode(true);
  touchDragClone.style.position = "fixed";
  touchDragClone.style.zIndex = "10000";
  touchDragClone.style.width = touchDragElement.offsetWidth + "px";
  touchDragClone.style.opacity = "0.8";
  touchDragClone.style.pointerEvents = "none";
  touchDragClone.style.transform = "rotate(3deg)";
  document.body.appendChild(touchDragClone);
  document.body.style.overflow = "hidden";
  document.body.classList.add("no-select");
  touchDragElement.style.opacity = "0.3";
  isDragging = true;
}

/**
 * Updates the clone position and triggers column highlight and auto-scroll checks.
 * @param {TouchEvent} ev - The touch event.
 * @param {Touch} touch - The current touch point.
 */
function updateDragClonePosition(ev, touch) {
  if (ev.cancelable) ev.preventDefault();
  touchDragClone.style.left =
    touch.clientX - touchDragClone.offsetWidth / 2 + "px";
  touchDragClone.style.top = touch.clientY - 30 + "px";
  highlightColumnUnderTouch(touch.clientX, touch.clientY);
  updateAutoScroll(touch.clientY);
  updateHorizontalAutoScroll(touch.clientX, touch.clientY);
}

/**
 * Resets touchDragElement and touchDragTaskId and schedules isDragging to false.
 */
function resetTouchDragState() {
  touchDragElement = null;
  touchDragTaskId = null;
  setTimeout(function () {
    isDragging = false;
  }, 0);
}

/**
 * Handles the touchend event — stops scrolls, runs cleanup, then resets drag state.
 * @param {TouchEvent} ev - The touch event.
 */
function handleTouchEnd(ev) {
  stopAutoScroll();
  stopHorizontalAutoScroll();
  document.body.style.overflow = "";
  document.body.classList.remove("no-select");
  if (!touchDragElement) return;
  if (touchDragClone) {
    performTouchDrop(ev);
    cleanupTouchDragState();
  }
  resetTouchDragState();
}

/**
 * Resolves the target card at drop coordinates and returns drop position info.
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 * @param {Element|null} element - The element under the touch point.
 * @returns {{ targetTaskId: number|null, relativePos: string }}
 */
function resolveTargetCard(x, y, element) {
  const targetCard = element ? element.closest(".task-card") : null;
  let targetTaskId = null;
  let relativePos = "after";
  if (targetCard && targetCard !== touchDragElement) {
    targetTaskId = getTaskIdFromCard(targetCard);
    const rect = targetCard.getBoundingClientRect();
    if (x < rect.left + rect.width / 2) relativePos = "before";
  }
  return { targetTaskId, relativePos };
}

/**
 * Executes the drop into the column under the touch point.
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 * @param {Element|null} column - The column element under the touch point.
 */
function dropIntoColumn(x, y, column) {
  currentDraggedTaskId = touchDragTaskId;
  const status = getStatusFromColumnId(column.id);
  const element = document.elementFromPoint(x, y);
  const { targetTaskId, relativePos } = resolveTargetCard(x, y, element);
  if (status) {
    moveTo(status, targetTaskId, relativePos);
  }
}

/**
 * Executes the drop — gets touch coords, finds the column, calls dropIntoColumn.
 * @param {TouchEvent} ev - The touch event.
 */
function performTouchDrop(ev) {
  const touch = ev.changedTouches[0];
  const x = touch.clientX;
  const y = touch.clientY;
  const column = getColumnUnderPoint(x, y);
  if (column && touchDragTaskId !== null) {
    dropIntoColumn(x, y, column);
  }
}

/**
 * Removes the drag clone, restores card opacity, and clears column highlights.
 */
function cleanupTouchDragState() {
  touchDragClone.remove();
  touchDragClone = null;
  touchDragElement.style.opacity = "";
  removeAllHighlights();
}

/**
 * Updates the vertical auto-scroll direction based on the touch y position.
 * @param {number} y - The y coordinate of the touch.
 */
function updateAutoScroll(y) {
  const scrollThreshold = 100;
  const windowHeight = window.innerHeight;
  if (y < scrollThreshold) {
    scrollDirection = -1;
    startAutoScroll();
  } else if (y > windowHeight - scrollThreshold) {
    scrollDirection = 1;
    startAutoScroll();
  } else {
    stopAutoScroll();
  }
}

/**
 * Starts the vertical auto-scroll interval.
 */
function startAutoScroll() {
  if (autoScrollInterval) return;
  autoScrollInterval = setInterval(function () {
    window.scrollBy(0, scrollDirection * 15);
  }, 20);
}

/**
 * Stops the vertical auto-scroll interval and resets direction.
 */
function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  scrollDirection = 0;
}

/**
 * Returns the horizontal scroll direction based on touch proximity to list edges.
 * @param {number} x - The x coordinate of the touch.
 * @param {DOMRect} rect - The bounding rect of the task list.
 * @param {number} threshold - The pixel threshold from each edge.
 * @returns {-1|0|1} -1 for left, 1 for right, 0 for none.
 */
function getHorizontalScrollDirection(x, rect, threshold) {
  if (x < rect.left + threshold) return -1;
  if (x > rect.right - threshold) return 1;
  return 0;
}

/**
 * Updates horizontal auto-scroll based on touch position in a column's task list.
 * @param {number} x - The x coordinate of the touch.
 * @param {number} y - The y coordinate of the touch.
 */
function updateHorizontalAutoScroll(x, y) {
  const column = getColumnUnderPoint(x, y);
  if (!column) { stopHorizontalAutoScroll(); return; }
  const list = column.querySelector(".task-list");
  if (!list) { stopHorizontalAutoScroll(); return; }
  const rect = list.getBoundingClientRect();
  const dir = getHorizontalScrollDirection(x, rect, 50);
  if (dir !== 0) {
    scrollDirectionX = dir;
    startHorizontalAutoScroll(list);
  } else {
    stopHorizontalAutoScroll();
  }
}

/**
 * Starts the horizontal auto-scroll interval for a specific task list.
 * @param {HTMLElement} list - The scrollable task list element.
 */
function startHorizontalAutoScroll(list) {
  if (horizontalAutoScrollInterval && currentScrollingList === list) return;
  stopHorizontalAutoScroll();
  currentScrollingList = list;
  horizontalAutoScrollInterval = setInterval(function () {
    if (currentScrollingList) {
      currentScrollingList.scrollLeft += scrollDirectionX * 15;
    }
  }, 20);
}

/**
 * Stops the horizontal auto-scroll interval and resets horizontal scroll state.
 */
function stopHorizontalAutoScroll() {
  if (horizontalAutoScrollInterval) {
    clearInterval(horizontalAutoScrollInterval);
    horizontalAutoScrollInterval = null;
  }
  scrollDirectionX = 0;
  currentScrollingList = null;
}

/**
 * Finds the board column element under a given point.
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 * @returns {HTMLElement|null} The column element or null.
 */
function getColumnUnderPoint(x, y) {
  const columns = document.querySelectorAll(".board-column");
  for (let i = 0; i < columns.length; i++) {
    const rect = columns[i].getBoundingClientRect();
    const inX = x >= rect.left && x <= rect.right;
    const inY = y >= rect.top && y <= rect.bottom;
    if (inX && inY) {
      return columns[i];
    }
  }
  return null;
}

/**
 * Returns the status string for a given column element ID.
 * @param {string} columnId - The HTML ID of the column element.
 * @returns {string|null} The status string or null if unrecognized.
 */
function getStatusFromColumnId(columnId) {
  if (columnId === "column-todo") return "todo";
  if (columnId === "column-inprogress") return "inprogress";
  if (columnId === "column-awaitfeedback") return "awaitfeedback";
  if (columnId === "column-done") return "done";
  return null;
}

/**
 * Highlights the board column under the current touch point.
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 */
function highlightColumnUnderTouch(x, y) {
  removeAllHighlights();
  const column = getColumnUnderPoint(x, y);
  if (column) {
    const list = column.querySelector(".task-list");
    if (list) {
      list.classList.add("drag-over");
    }
  }
}

/**
 * Removes all drag-over highlight classes from task lists.
 */
function removeAllHighlights() {
  const lists = document.querySelectorAll(".task-list");
  for (let i = 0; i < lists.length; i++) {
    lists[i].classList.remove("drag-over");
  }
}
