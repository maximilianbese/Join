/**
 * Toggles the category dropdown open or closed.
 */
function toggleCategoryDropdown() {
  const wrapper = document.getElementById("category-wrapper");
  const options = document.getElementById("category-options");
  wrapper.classList.toggle("open");
  options.classList.toggle("d-none");
}

/**
 * Updates the visible category label and the hidden category input value.
 * @param {string} category - The selected category value.
 */
function updateCategoryDisplay(category) {
  document.getElementById("selected-category-text").textContent = category;
  document.getElementById("category").value = category;
}

/**
 * Closes the category dropdown.
 */
function closeCategoryDropdown() {
  const wrapper = document.getElementById("category-wrapper");
  const options = document.getElementById("category-options");
  wrapper.classList.remove("open");
  options.classList.add("d-none");
}

/**
 * Selects a category, updates the display, closes the dropdown, and validates the form.
 * @param {string} category - The selected category value.
 * @param {Event} event - The click event.
 */
function selectCategory(category, event) {
  event.stopPropagation();
  updateCategoryDisplay(category);
  closeCategoryDropdown();
  validateForm();
}

// Closes the category dropdown when clicking outside of it.
document.addEventListener(
  "click",
  function (event) {
    const wrapper = document.getElementById("category-wrapper");
    if (wrapper && !wrapper.contains(event.target)) {
      wrapper.classList.remove("open");
      const options = document.getElementById("category-options");
      if (options) options.classList.add("d-none");
    }
  },
  true,
);

/**
 * Resets the category dropdown to its default (unselected) state.
 */
function resetCategoryDropdown() {
  const categoryText = document.getElementById("selected-category-text");
  if (categoryText) categoryText.textContent = "Select task category";
  const categoryInput = document.getElementById("category");
  if (categoryInput) categoryInput.value = "";
  const catWrapper = document.getElementById("category-wrapper");
  if (catWrapper) catWrapper.classList.remove("open");
  const catOptions = document.getElementById("category-options");
  if (catOptions) catOptions.classList.add("d-none");
}

/**
 * Resets the assigned-to dropdown to its default (closed) state.
 */
function resetAssignedToDropdown() {
  const assignedWrapper = document.getElementById("assigned-to-wrapper");
  if (assignedWrapper) assignedWrapper.classList.remove("open");
  const assignedOptions = document.getElementById("assigned-to-options");
  if (assignedOptions) assignedOptions.classList.add("d-none");
}

/**
 * Resets all board form dropdowns after an overlay is closed.
 */
function resetBoardDropdowns() {
  resetCategoryDropdown();
  resetAssignedToDropdown();
}
