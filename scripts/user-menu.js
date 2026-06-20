/**
 * Inserts a help link into the dropdown on mobile viewports (≤780px) if not already present.
 * @param {HTMLElement} dropdown - The dropdown menu element.
 */
function insertMobileHelpLink(dropdown) {
  if (window.innerWidth <= 780 && !document.getElementById("dropdown-help-link")) {
    const helpLink = document.createElement("a");
    helpLink.id = "dropdown-help-link";
    helpLink.href = "help.html";
    helpLink.textContent = "Help";
    helpLink.className = "dropdown-help-mobile";
    dropdown.insertBefore(helpLink, dropdown.firstChild);
  }
}

/**
 * Toggles the user dropdown menu. On mobile (≤780px) also inserts a help link.
 */
function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown");
  insertMobileHelpLink(dropdown);
  dropdown.classList.toggle("active");
}

/**
 * Closes the dropdown when a click occurs outside of it.
 * @param {Event} event - The click event.
 */
function handleClickOutside(event) {
  const dropdown = document.getElementById("user-dropdown");
  const userInitials = document.getElementById("user-initials");
  if (
    dropdown &&
    dropdown.classList.contains("active") &&
    !userInitials.contains(event.target) &&
    !dropdown.contains(event.target)
  ) {
    dropdown.classList.remove("active");
  }
}

/**
 * Logs out the current user and redirects to the login page.
 */
async function handleLogout() {
  await waitForFirebase();
  await logoutUser();
  window.location.href = "index.html";
}

/**
 * Registers the document-level click listener for closing the dropdown.
 */
function setupClickOutsideListener() {
  document.addEventListener("click", handleClickOutside, true);
}

document.addEventListener("DOMContentLoaded", setupClickOutsideListener);
