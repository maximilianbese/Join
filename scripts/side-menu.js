/**
 * Initializes the sidebar navigation and marks the active page link.
 * @param {string} currentPage - The identifier of the currently active page.
 */
function initSideMenu(currentPage) {
  const navLinks = document.querySelectorAll(".sidebar .nav-links a");
  for (let i = 0; i < navLinks.length; i++) {
    processNavLink(navLinks[i], currentPage);
  }
}

/**
 * Removes and conditionally re-applies the active class on a nav link.
 * @param {HTMLElement} link - The anchor element to process.
 * @param {string} currentPage - The identifier of the currently active page.
 */
function processNavLink(link, currentPage) {
  link.classList.remove("active");
  const href = link.getAttribute("href");
  if (href && href.includes(currentPage)) {
    link.classList.add("active");
  }
}

/**
 * Navigates to the given page.
 * @param {string} pageName - The target page filename (e.g. "board.html").
 */
function navigateTo(pageName) {
  window.location.href = pageName;
}

/**
 * Displays the guest "G" initials in the header and applies the guest avatar style.
 */
function displayGuestInitials() {
  const initialsElement = document.getElementById("user-initials");
  if (!initialsElement) return;
  initialsElement.textContent = "G";
  initialsElement.classList.add("guest-avatar");
}
