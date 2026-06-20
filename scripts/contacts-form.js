/**
 * Sets the overlay HTML, activates it, and locks scrolling.
 * @param {string} html - The HTML for the overlay content.
 */
function activateContactOverlay(html) {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.innerHTML = html;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

/**
 * Opens the add contact dialog and initializes form validation.
 */
function openAddContactDialog() {
  activateContactOverlay(getAddContactDialogTemplate());
  checkContactFormValidity(
    "new-contact-name",
    "new-contact-email",
    "new-contact-phone",
    "add-contact-submit",
  );
}

/**
 * Opens the edit contact dialog for the given contact ID and initializes form validation.
 * @param {string|number} id - The contact ID to edit.
 */
function openEditContactDialog(id) {
  activateContactOverlay(getEditContactDialogTemplate(findContactById(id)));
  checkContactFormValidity(
    "edit-contact-name",
    "edit-contact-email",
    "edit-contact-phone",
    "edit-contact-submit",
  );
}

/**
 * Closes the contact dialog overlay and clears its content after the transition.
 */
function closeAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
  setTimeout(function () {
    overlay.innerHTML = "";
  }, 300);
}

/**
 * Validates the name field of a contact form.
 * @param {string} nameId - The ID of the name input field.
 * @returns {boolean} True if the field is valid.
 */
function validateNameField(nameId) {
  const name = document.getElementById(nameId).value.trim();
  const nameLetters = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, "");
  if (nameLetters.length < 3) {
    showFieldError(nameId, "Der Name muss mindestens 3 Buchstaben enthalten.");
    return false;
  }
  clearFieldError(nameId);
  return true;
}

/**
 * Validates the email field of a contact form.
 * @param {string} emailId - The ID of the email input field.
 * @returns {boolean} True if the field is valid.
 */
function validateEmailField(emailId) {
  const email = document.getElementById(emailId).value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    showFieldError(emailId, "Bitte eine gültige E-Mail-Adresse eingeben.");
    return false;
  }
  clearFieldError(emailId);
  return true;
}

/**
 * Validates the phone field of a contact form.
 * @param {string} phoneId - The ID of the phone input field.
 * @returns {boolean} True if the field is valid.
 */
function validatePhoneField(phoneId) {
  const phone = document.getElementById(phoneId).value.trim();
  if (phone.length < 6) {
    showFieldError(
      phoneId,
      "Bitte eine gültige Telefonnummer eingeben (mind. 6 Ziffern).",
    );
    return false;
  }
  clearFieldError(phoneId);
  return true;
}

/**
 * Validates the full contact form (name >= 3 letters, valid email format, phone >= 6 digits).
 * @param {string} nameId - The ID of the name input field.
 * @param {string} emailId - The ID of the email input field.
 * @param {string} phoneId - The ID of the phone input field.
 * @returns {boolean} True if all fields are valid.
 */
function validateContactForm(nameId, emailId, phoneId) {
  const nameValid = validateNameField(nameId);
  const emailValid = validateEmailField(emailId);
  const phoneValid = validatePhoneField(phoneId);
  return nameValid && emailValid && phoneValid;
}

/**
 * Shows a validation error message for a form field.
 * @param {string} inputId - The ID of the input element.
 * @param {string} message - The error message to display.
 */
function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const group = input.closest(".input-group");
  input.classList.add("input-error");
  let errorEl = group.querySelector(".field-error-msg");
  if (!errorEl) {
    errorEl = document.createElement("span");
    errorEl.className = "field-error-msg";
    group.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

/**
 * Clears the validation error state for a form field.
 * @param {string} inputId - The ID of the input element.
 */
function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  const group = input.closest(".input-group");
  input.classList.remove("input-error");
  if (group) {
    const errorEl = group.querySelector(".field-error-msg");
    if (errorEl) errorEl.remove();
  }
}

/**
 * Reads and validates the name, email, and phone fields, returning a validity object.
 * @param {string} nameId - The ID of the name input field.
 * @param {string} emailId - The ID of the email input field.
 * @param {string} phoneId - The ID of the phone input field.
 * @returns {{ nameValid: boolean, emailValid: boolean, phoneValid: boolean,
 *             name: string, email: string, phone: string }}
 */
function buildFieldValidations(nameId, emailId, phoneId) {
  const name = document.getElementById(nameId).value.trim();
  const email = document.getElementById(emailId).value.trim();
  const phone = document.getElementById(phoneId).value.trim();
  const nameValid = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, "").length >= 3;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const phoneValid = phone.length >= 11;
  return { nameValid, emailValid, phoneValid, name, email, phone };
}

/**
 * Validates all contact form fields, updates field feedback, and enables or disables the submit button.
 * @param {string} nameId - The ID of the name input field.
 * @param {string} emailId - The ID of the email input field.
 * @param {string} phoneId - The ID of the phone input field.
 * @param {string} buttonId - The ID of the submit button.
 */
function checkContactFormValidity(nameId, emailId, phoneId, buttonId) {
  const v = buildFieldValidations(nameId, emailId, phoneId);
  updateContactFieldFeedback(nameId, v.name, v.nameValid, "Der Name muss mindestens 3 Buchstaben enthalten.");
  updateContactFieldFeedback(emailId, v.email, v.emailValid, "Bitte eine gültige E-Mail-Adresse eingeben.");
  updateContactFieldFeedback(phoneId, v.phone, v.phoneValid, "Bitte eine gültige Telefonnummer eingeben (mind. 11 Ziffern).");
  const allValid = v.nameValid && v.emailValid && v.phoneValid;
  const btn = document.getElementById(buttonId);
  btn.disabled = !allValid;
  btn.classList.toggle("btn-disabled", !allValid);
}

/**
 * Shows or clears the error state for a field based on its current value and validity.
 * @param {string} inputId - The ID of the input field.
 * @param {string} value - The current trimmed value of the field.
 * @param {boolean} isValid - Whether the value passes validation.
 * @param {string} errorMessage - The error message to display when invalid.
 */
function updateContactFieldFeedback(inputId, value, isValid, errorMessage) {
  if (value.length > 0) {
    if (isValid) {
      clearFieldError(inputId);
    } else {
      showFieldError(inputId, errorMessage);
    }
  } else {
    clearFieldError(inputId);
  }
}

/**
 * Handles the create contact form submission.
 * @param {Event} e - The submit event.
 */
function createContact(e) {
  e.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const ids = ["new-contact-name", "new-contact-email", "new-contact-phone"];
  if (!validateContactForm(ids[0], ids[1], ids[2])) return;
  const name = document.getElementById(ids[0]).value.trim();
  saveNewContactToFirestore(currentUser, buildNewContactObject(name));
}

/**
 * Builds a new contact object from the add contact form values.
 * @param {string} name - The contact's name.
 * @returns {Object} The new contact object.
 */
function buildNewContactObject(name) {
  const colors = ["#AB47BC", "#FF9800", "#5C6BC0", "#26A69A"];
  const randomColor = colors[Math.floor(Math.random() * 4)];
  return {
    id: String(Date.now()),
    name: name,
    email: document.getElementById("new-contact-email").value,
    phone: document.getElementById("new-contact-phone").value,
    color: randomColor,
    initials: getInitials(name),
  };
}

/**
 * Finalizes contact creation by updating the local list and refreshing the UI.
 * @param {Object} newContact - The newly created contact object.
 */
function finalizeContactCreation(newContact) {
  contacts.push(newContact);
  renderContactList();
  closeAddContactDialog();
  showSuccessAlert();
}

/**
 * Handles the edit contact form submission.
 * @param {Event} e - The submit event.
 * @param {string|number} id - The contact ID being edited.
 */
function saveContact(e, id) {
  e.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const ids = ["edit-contact-name", "edit-contact-email", "edit-contact-phone"];
  if (!validateContactForm(ids[0], ids[1], ids[2])) return;
  const contact = findContactById(id);
  if (!contact) return;
  updateContactFromForm(contact);
  persistContactToFirestore(currentUser, contact, id);
}

/**
 * Updates a contact object with values from the edit form.
 * @param {Object} contact - The contact object to update.
 */
function updateContactFromForm(contact) {
  contact.name = document.getElementById("edit-contact-name").value;
  contact.email = document.getElementById("edit-contact-email").value;
  contact.phone = document.getElementById("edit-contact-phone").value;
  contact.initials = getInitials(contact.name);
}

/**
 * Finalizes a contact update by re-rendering the list and details view.
 * @param {Object} contact - The updated contact object.
 */
function finalizeContactUpdate(contact) {
  renderContactList();
  const content = document.getElementById("contact-details-content");
  content.innerHTML = getContactDetailsTemplate(contact);
  closeAddContactDialog();
}

/**
 * Deletes a contact by ID from Firestore.
 * @param {string|number} id - The contact ID to delete.
 */
function deleteContact(id) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  removeContactFromFirestore(currentUser, id);
}

/**
 * Finalizes contact deletion by removing it locally and refreshing the UI.
 * @param {string|number} id - The deleted contact ID.
 */
function finalizeContactDeletion(id) {
  removeContactFromLocal(id);
  renderContactList();
  closeContactDetails();
}

/**
 * Removes a contact from the local contacts array by ID.
 * @param {string|number} id - The contact ID to remove.
 */
function removeContactFromLocal(id) {
  contacts = contacts.filter(function (c) {
    return String(c.id) !== String(id);
  });
}
