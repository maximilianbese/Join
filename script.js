/**
 * Initializes the login page.
 */
function initLogin() {}

/**
 * Handles the login form submission.
 * @param {Event} event - The form submit event.
 */
async function handleLogin(event) {
  event.preventDefault();
  await waitForFirebase();
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const result = await loginUser(emailInput.value, passwordInput.value);
  if (result.success) {
    window.location.href = "summaryuser.html";
  } else {
    showLoginError();
  }
}

/**
 * Performs a guest login and redirects on success.
 */
async function guestLogin() {
  await waitForFirebase();
  const result = await guestLoginUser();
  if (result.success) {
    window.location.href = "summaryguest.html";
  } else {
    showLoginError(result.message);
  }
}

/**
 * Sets the error message text and makes the error element visible.
 * @param {HTMLElement} errorMsg - The error message element.
 * @param {string} message - The message to display.
 */
function applyLoginErrorMessage(errorMsg, message) {
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("v-none");
  }
}

/**
 * Returns a reset function that clears the error state on any input event.
 * @param {HTMLElement} errorMsg - The error message element.
 * @param {HTMLElement} emailInput - The email input element.
 * @param {HTMLElement} passwordInput - The password input element.
 * @returns {Function} The reset function.
 */
function createLoginErrorReset(errorMsg, emailInput, passwordInput) {
  return function resetError() {
    if (errorMsg) errorMsg.classList.add("v-none");
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    emailInput.removeEventListener("input", resetError);
    passwordInput.removeEventListener("input", resetError);
  };
}

/**
 * Displays a login error message and marks the input fields as invalid.
 * @param {string} message - The error message to display.
 */
function showLoginError(
  message = "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
) {
  const errorMsg = document.getElementById("login-error");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  applyLoginErrorMessage(errorMsg, message);
  emailInput.classList.add("input-error");
  passwordInput.classList.add("input-error");
  const resetError = createLoginErrorReset(errorMsg, emailInput, passwordInput);
  emailInput.addEventListener("input", resetError);
  passwordInput.addEventListener("input", resetError);
}

/**
 * Toggles the visibility of a password input field.
 * @param {string} inputId - The ID of the password input element.
 * @param {HTMLElement} iconElement - The visibility toggle icon element.
 */
function togglePasswordVisibility(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    iconElement.src = "./assets/login-screen/visibility.svg";
  } else {
    input.type = "password";
    iconElement.src = "./assets/login-screen/visibility_off.svg";
  }
}

/**
 * Initializes the summary page for authenticated users.
 */
function initSummary() {
  initSideMenu("summary");
  const currentUser = getCurrentUser();
  if (currentUser) {
    displayUserInitials(currentUser.name);
  } else {
    window.location.href = "index.html";
  }
}

/**
 * Initializes the summary page for guest users.
 */
async function initSummaryGuest() {
  await waitForFirebase();
  initSideMenu("summary");
  displayGuestInitials();
  updateGreeting();

  const currentUser = getCurrentUser();
  if (currentUser) {
    await updateTaskMetrics(currentUser);
  }

  checkMobileGreeting();
}
