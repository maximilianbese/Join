/**
 * Initializes the Legal Notice or Privacy Policy page.
 * Distinguishes between public access (not logged in) and internal access.
 */
function initLegalPrivacy() {
  const urlParams = new URLSearchParams(window.location.search);
  const isPublic = urlParams.get("public") === "true";
  const currentUser =
    typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (isPublic || !currentUser) {
    setupPublicView();
  } else {
    setupUserView(currentUser);
  }

  setupMobileBackArrow(isPublic, currentUser);
}

/**
 * Configures the view for unauthenticated or public access.
 */
function setupPublicView() {
  const sidebar = document.querySelector(".sidebar");
  const headerIcons = document.getElementById("header-icons");

  if (sidebar) {
    sidebar.innerHTML = getPublicSidebarTemplate();
  }

  if (headerIcons) {
    headerIcons.style.display = "none";
  }
}

/**
 * Configures the view for authenticated users.
 * @param {Object} currentUser - The current user object.
 */
function setupUserView(currentUser) {
  document.body.classList.add("is-logged-in");

  if (currentUser.isGuest) {
    if (typeof displayGuestInitials === "function") displayGuestInitials();
  } else {
    if (typeof displayUserInitials === "function")
      displayUserInitials(currentUser.name);
  }
}

/**
 * Configures the mobile back arrow based on the access context.
 * @param {boolean} isPublic - Whether the page is accessed publicly.
 * @param {Object|null} currentUser - The current user, or null if not logged in.
 */
function setupMobileBackArrow(isPublic, currentUser) {
  const contentTitle = document.querySelector("h1");
  if (!contentTitle || contentTitle.querySelector(".mobile-back-arrow")) return;

  const backHref = isPublic || !currentUser ? "index.html" : "summaryuser.html";
  contentTitle.innerHTML += getMobileBackArrowTemplate(backHref);
}
