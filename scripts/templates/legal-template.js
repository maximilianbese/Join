/**
 * Generates the logo image HTML for the public sidebar.
 * @returns {string} The HTML string for the sidebar logo.
 */
function getPublicSidebarLogoHtml() {
  return `<img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" class="sidebar-logo"/>`;
}

/**
 * Generates the navigation and legal links HTML for the public sidebar.
 * @param {string} isPrivacyActive - The active CSS class for the privacy policy link.
 * @param {string} isLegalActive - The active CSS class for the legal notice link.
 * @returns {string} The HTML string for the sidebar links section.
 */
function getPublicSidebarLinksHtml(isPrivacyActive, isLegalActive) {
  const navHtml = `<div class="nav-links"><a href="index.html" class="login-link">` +
    `<img src="./assets/privacy-policy-page/back-to-login.svg" alt="Log In" class="back-arrow-icon">` +
    `<span class="login-text">Log In</span></a></div>`;
  const legalHtml = `<div class="legal-links">` +
    `<a href="privacypolicy.html" class="${isPrivacyActive}">Privacy Policy</a>` +
    `<a href="legalnotice.html" class="${isLegalActive}">Legal notice</a></div>`;
  return `<div class="sidebar-content-wrapper">${navHtml}${legalHtml}</div>`;
}

/**
 * Generates the full HTML template for the sidebar in public (not logged in) mode.
 * @returns {string} The HTML string for the public sidebar.
 */
function getPublicSidebarTemplate() {
  const isPrivacyActive = window.location.pathname.includes("privacypolicy") ? "active" : "";
  const isLegalActive = window.location.pathname.includes("legalnotice") ? "active" : "";
  return getPublicSidebarLogoHtml() + getPublicSidebarLinksHtml(isPrivacyActive, isLegalActive);
}

/**
 * Generates the HTML template for the mobile back arrow link.
 * @param {string} backHref - The link destination URL.
 * @returns {string} The HTML string for the back arrow.
 */
function getMobileBackArrowTemplate(backHref) {
  return `
    <a href="${backHref}" class="mobile-back-arrow">
      <img src="./assets/icons/arrow-left-blue.png" alt="Back">
    </a>
  `;
}
