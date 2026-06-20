/**
 * Initializes the signup page.
 */
function initSignup() {
  checkFormValidity();
}

/**
 * Applies an error state to an input field and its associated hint element.
 * @param {HTMLElement} input - The input element.
 * @param {HTMLElement} hint - The hint element.
 * @param {string} message - The error message to display.
 */
function applyFieldError(input, hint, message) {
  input.classList.add("input-error");
  hint.textContent = message;
  hint.style.display = "block";
}

/**
 * Removes the error state from an input field and its associated hint element.
 * @param {HTMLElement} input - The input element.
 * @param {HTMLElement} hint - The hint element.
 */
function clearFieldError(input, hint) {
  input.classList.remove("input-error");
  hint.textContent = "";
  hint.style.display = "none";
}

/**
 * Shows or hides a hint message below a form field.
 * @param {string} inputId - The ID of the input element.
 * @param {string|null} message - The message to show, or null to clear.
 */
function setFieldHint(inputId, message) {
  const input = document.getElementById(inputId);
  const hint = document.getElementById("hint-" + inputId);
  if (!input || !hint) return;
  if (message) {
    applyFieldError(input, hint, message);
  } else {
    clearFieldError(input, hint);
  }
}

/**
 * Reads all form field values from the signup form.
 * @returns {{name: string, email: string, pass: string, confirm: string, privacy: boolean}}
 */
function getSignupFormValues() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    pass: document.getElementById("password").value,
    confirm: document.getElementById("confirm-password").value,
    privacy: document.getElementById("privacy-check").checked,
  };
}

/**
 * Validates all signup form fields and returns a validity object.
 * @param {string} name - The name value.
 * @param {string} email - The email value.
 * @param {string} pass - The password value.
 * @param {string} confirm - The confirm-password value.
 * @returns {{nameValid: boolean, emailValid: boolean, passValid: boolean, confirmComplete: boolean}}
 */
function validateSignupFields(name, email, pass, confirm) {
  const nameLetters = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, "");
  return {
    nameValid: nameLetters.length >= 3,
    emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email),
    passValid: pass.length >= 6,
    confirmComplete: confirm.length >= 1 && pass === confirm,
  };
}

/**
 * Shows or clears the name field hint.
 * @param {{name: string}} values
 * @param {{nameValid: boolean}} validity
 */
function showNameHint(values, validity) {
  setFieldHint("name", values.name.length > 0 && !validity.nameValid
    ? "Der Name muss mindestens 3 Buchstaben enthalten." : null);
}

/**
 * Shows or clears the email field hint.
 * @param {{email: string}} values
 * @param {{emailValid: boolean}} validity
 */
function showEmailHint(values, validity) {
  setFieldHint("email", values.email.length > 0 && !validity.emailValid
    ? "Bitte eine gültige E-Mail-Adresse eingeben." : null);
}

/**
 * Shows or clears the password field hint.
 * @param {{pass: string}} values
 * @param {{passValid: boolean}} validity
 */
function showPasswordHint(values, validity) {
  setFieldHint("password", values.pass.length > 0 && !validity.passValid
    ? "Das Passwort muss mindestens 6 Zeichen lang sein." : null);
}

/**
 * Shows or clears the confirm-password field hint.
 * @param {{pass: string, confirm: string}} values
 */
function showConfirmHint(values) {
  setFieldHint("confirm-password", values.confirm.length > 0 && values.pass !== values.confirm
    ? "Die Passwörter stimmen nicht überein." : null);
}

/**
 * Shows validation hints for all signup form fields.
 * @param {Object} values - The current form values.
 * @param {Object} validity - The validity result object.
 */
function showSignupFieldHints(values, validity) {
  showNameHint(values, validity);
  showEmailHint(values, validity);
  showPasswordHint(values, validity);
  showConfirmHint(values);
}

/**
 * Enables or disables the signup submit button based on overall form validity.
 * @param {boolean} allValid - Whether all fields are valid.
 */
function updateSignupSubmitButton(allValid) {
  const btn = document.getElementById("signup-btn");
  btn.disabled = !allValid;
  btn.classList.toggle("btn-disabled", !allValid);
}

/**
 * Returns whether all required fields are complete and valid.
 * @param {Object} validity - The validity result object.
 * @param {boolean} privacy - Whether the privacy checkbox is checked.
 * @returns {boolean}
 */
function isFormComplete(validity, privacy) {
  return validity.nameValid && validity.emailValid &&
    validity.passValid && validity.confirmComplete && privacy;
}

/**
 * Checks overall form validity and updates hints and submit button state.
 */
function checkFormValidity() {
  const values = getSignupFormValues();
  const validity = validateSignupFields(
    values.name, values.email, values.pass, values.confirm,
  );
  showSignupFieldHints(values, validity);
  updateSignupSubmitButton(isFormComplete(validity, values.privacy));
}

/**
 * Reads the raw registration form values.
 * @returns {{name: string, email: string, pass: string, confirm: string}}
 */
function getRegistrationFormValues() {
  return {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    pass: document.getElementById("password").value,
    confirm: document.getElementById("confirm-password").value,
  };
}

/**
 * Attempts to sign up the user and handles success or failure.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} pass - The user's password.
 */
async function attemptSignUp(name, email, pass) {
  const result = await signUpUser(name, email, pass);
  if (result.success) {
    console.log("User registered successfully:", email);
    showSuccessMessageAndRedirect();
  } else {
    console.error("Registration error:", result.error, result.message);
    handleRegistrationError(result);
  }
}

/**
 * Handles the registration form submission.
 * @param {Event} event - The form submit event.
 */
async function handleRegistration(event) {
  event.preventDefault();
  await waitForFirebase();
  const values = getRegistrationFormValues();
  if (values.pass !== values.confirm) {
    showPasswordError();
    return;
  }
  await attemptSignUp(values.name, values.email, values.pass);
}

/**
 * Applies the visual error state for a password mismatch.
 * @param {HTMLElement|null} errorMsg - The error message element.
 * @param {HTMLElement} confirmInput - The confirm-password input element.
 */
function displayPasswordMismatchError(errorMsg, confirmInput) {
  if (errorMsg) errorMsg.classList.remove("v-none");
  confirmInput.classList.add("input-error");
}

/**
 * Displays the password mismatch error and registers a reset listener.
 */
function showPasswordError() {
  const errorMsg = document.getElementById("error-message");
  const confirmPassInput = document.getElementById("confirm-password");
  displayPasswordMismatchError(errorMsg, confirmPassInput);
  const resetError = function () {
    if (errorMsg) errorMsg.classList.add("v-none");
    confirmPassInput.classList.remove("input-error");
    confirmPassInput.removeEventListener("input", resetError);
  };
  confirmPassInput.addEventListener("input", resetError);
}

/**
 * Displays the registration error message and marks the email field if applicable.
 * @param {HTMLElement|null} errorMsg - The error message element.
 * @param {HTMLElement} emailInput - The email input element.
 * @param {{error: string, message: string}} result - The error result object.
 */
function displayRegistrationError(errorMsg, emailInput, result) {
  if (errorMsg) {
    errorMsg.textContent = result.message;
    errorMsg.classList.remove("v-none");
  }
  if (result.error === "duplicate-email" || result.error === "invalid-email") {
    emailInput.classList.add("input-error");
  }
}

/**
 * Handles a registration error by showing a message and registering a reset listener.
 * @param {{error: string, message: string}} result - The error result object.
 */
function handleRegistrationError(result) {
  const errorMsg = document.getElementById("error-message");
  const emailInput = document.getElementById("email");
  displayRegistrationError(errorMsg, emailInput, result);
  const resetError = function () {
    if (errorMsg) errorMsg.classList.add("v-none");
    emailInput.classList.remove("input-error");
    emailInput.removeEventListener("input", resetError);
  };
  emailInput.addEventListener("input", resetError);
}

/**
 * Shows a success message and redirects to the login page after a short delay.
 */
function showSuccessMessageAndRedirect() {
  const msg = document.getElementById("success-message");
  msg.classList.remove("d-none");
  setTimeout(function () {
    window.location.href = "index.html";
  }, 800);
}
