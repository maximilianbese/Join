/**
 * Generates the HTML template for a contact list item.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the list item.
 */
function getContactItemTemplate(contact) {
  return `
    <div class="contact-item" onclick="showContactDetails(${contact.id})" data-id="${contact.id}">
      <div class="contact-avatar" style="background-color: ${contact.color};">${contact.initials}</div>
      <div class="contact-info-list">
        <span class="contact-name-list">${contact.name}</span>
        <span class="contact-email-list">${contact.email}</span>
      </div>
    </div>
  `;
}

/**
 * Returns the appropriate contact details template based on screen width.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the contact details view.
 */
function getContactDetailsTemplate(contact) {
  if (window.innerWidth <= 780) {
    return getMobileContactDetailsTemplate(contact);
  } else {
    return getDesktopContactDetailsTemplate(contact);
  }
}

/**
 * Generates the avatar and name header HTML for the desktop contact details view.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the contact header section.
 */
function getContactHeaderHtml(contact) {
  const avatar = `<div class="contact-avatar-large" style="background-color: ${contact.color}">${contact.initials}</div>`;
  const editBtn = `<button class="btn-text-icon" onclick="openEditContactDialog(${contact.id})"><img src="./assets/icons/edit.svg" alt="Edit"> Edit</button>`;
  const delBtn = `<button class="btn-text-icon" onclick="deleteContact(${contact.id})"><img src="./assets/icons/delete.svg" alt="Delete"> Delete</button>`;
  const nameSection = `<div class="contact-name-section"><h1 class="contact-name-details">${contact.name}</h1><div class="contact-actions">${editBtn}${delBtn}</div></div>`;
  return `<div class="contact-header-details">${avatar}${nameSection}</div>`;
}

/**
 * Generates the email and phone info HTML for the desktop contact details view.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the contact info section.
 */
function getContactActionsHtml(contact) {
  const emailRow = `<div class="info-group"><span class="info-label">Email</span><a href="mailto:${contact.email}" class="contact-email-list">${contact.email}</a></div>`;
  const phoneRow = `<div class="info-group"><span class="info-label">Phone</span><span>${contact.phone}</span></div>`;
  return `<div class="contact-information-header">Contact Information</div><div class="contact-info-details">${emailRow}${phoneRow}</div>`;
}

/**
 * Generates the desktop contact details template.
 * @param {Object} contact - The contact object.
 * @returns {string} The full HTML string for the desktop details view.
 */
function getDesktopContactDetailsTemplate(contact) {
  return getContactHeaderHtml(contact) + getContactActionsHtml(contact);
}

/**
 * Generates the mobile header section for the contact details view.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the mobile header.
 */
function getMobileContactHeaderHtml(contact) {
  const backArrow = `<img src="./assets/login-screen/arrow-left.svg" class="back-arrow-mobile" onclick="closeContactDetails()">`;
  const header = `<div class="details-header-mobile"><div><h1>Contacts</h1><p>Better with a team</p><div class="blue-line-horizontal"></div></div>${backArrow}</div>`;
  const initials = `<div class="initials-large" style="background-color: ${contact.color}">${contact.initials}</div>`;
  const contactView = `<div class="contact-view-title">${initials}<div class="contact-name-large">${contact.name}</div></div>`;
  const infoHead = `<div class="info-headline-container"><span>Contact Information</span></div>`;
  const emailInfo = `<div class="info-label">Email</div><a href="mailto:${contact.email}" class="info-value-email">${contact.email}</a>`;
  const phoneInfo = `<div class="info-label">Phone</div><div class="info-value">${contact.phone}</div>`;
  return header + contactView + infoHead + emailInfo + phoneInfo;
}

/**
 * Generates the mobile action menu for the contact details view.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the mobile action menu.
 */
function getMobileContactActionsHtml(contact) {
  const editItem = `<div class="menu-item" onclick="openEditContactDialog(${contact.id})"><img src="./assets/icons/edit.svg" alt="Edit"> Edit</div>`;
  const delItem = `<div class="menu-item" onclick="deleteContact(${contact.id}); closeContactDetails();"><img src="./assets/icons/delete.svg" alt="Delete"> Delete</div>`;
  const menuBox = `<div id="contact-menu-box" class="contact-menu-box" onclick="event.stopPropagation()">${editItem}${delItem}</div>`;
  return `<div class="mobile-menu-btn" onclick="toggleContactMenu(event)"><img src="./assets/icons/more_vert.svg">${menuBox}</div>`;
}

/**
 * Generates the mobile contact details template.
 * @param {Object} contact - The contact object.
 * @returns {string} The full HTML string for the mobile details view.
 */
function getMobileContactDetailsTemplate(contact) {
  return getMobileContactHeaderHtml(contact) + getMobileContactActionsHtml(contact);
}

/**
 * Returns the appropriate edit contact dialog template based on screen width.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the edit dialog.
 */
function getEditContactDialogTemplate(contact) {
  if (window.innerWidth <= 780) {
    return getMobileEditContactTemplate(contact);
  } else {
    return getDesktopEditContactTemplate(contact);
  }
}

/**
 * Generates the form fields HTML for the desktop edit contact dialog.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the edit form fields.
 */
function getEditContactFormHtml(contact) {
  const v = `checkContactFormValidity('edit-contact-name', 'edit-contact-email', 'edit-contact-phone', 'edit-contact-submit')`;
  const nameInput = `<div class="input-group"><div class="input-wrapper"><input type="text" value="${contact.name}" id="edit-contact-name" placeholder="Name" oninput="${v}"><img src="./assets/login-screen/person.svg" class="input-icon"></div></div>`;
  const emailInput = `<div class="input-group"><div class="input-wrapper"><input type="email" value="${contact.email}" id="edit-contact-email" placeholder="Email" oninput="${v}"><img src="./assets/login-screen/mail.svg" class="input-icon"></div></div>`;
  const phoneInput = `<div class="input-group"><div class="input-wrapper"><input type="tel" value="${contact.phone}" id="edit-contact-phone" placeholder="Phone" oninput="this.value = this.value.replace(/[^0-9]/g, ''); ${v}"><img src="./assets/icons/phone.svg" class="input-icon"></div></div>`;
  const actions = `<div class="form-actions-dialog"><button type="button" class="btn-cancel" onclick="deleteContact(${contact.id}); closeAddContactDialog();">Delete</button><button type="submit" class="btn-create-submit" id="edit-contact-submit">Save <img src="./assets/icons/check-icon.png" alt="check" style="filter: brightness(0) invert(1);"></button></div>`;
  const avatar = `<div class="contact-form-avatar" style="background-color: ${contact.color}; margin: 0;">${contact.initials}</div>`;
  return `<div class="edit-content-container">${avatar}<form onsubmit="saveContact(event, ${contact.id})" class="edit-form-fields" novalidate>${nameInput}${emailInput}${phoneInput}${actions}</form></div>`;
}

/**
 * Generates the left panel and dialog-right opening HTML for the desktop edit contact dialog.
 * @returns {string} The HTML string for the dialog left panel and dialog-right open tag.
 */
function getEditContactActionsHtml() {
  const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12L18 18M18 6L12 12L18 6ZM12 12L6 18L12 12ZM12 12L6 6L12 12Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const closeBtn = `<div class="close-btn-container"><button onclick="closeAddContactDialog()" class="btn-close">${svg}</button></div>`;
  const leftPanel = `<div class="dialog-left"><img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" style="width: 55px; margin-bottom: 12px;"><h1 class="dialog-title-white">Edit contact</h1><div class="blue-line-horizontal" style="width: 90px; height: 3px; background-color: #29ABE2;"></div></div>`;
  return leftPanel + `<div class="dialog-right">${closeBtn}`;
}

/**
 * Generates the desktop edit contact dialog template.
 * @param {Object} contact - The contact object.
 * @returns {string} The full HTML string for the desktop edit dialog.
 */
function getDesktopEditContactTemplate(contact) {
  return `<div class="slide-in-dialog active" onclick="event.stopPropagation()">${getEditContactActionsHtml()}${getEditContactFormHtml(contact)}</div></div>`;
}

/**
 * Generates the form fields HTML for the mobile edit contact dialog.
 * @param {Object} contact - The contact object.
 * @returns {string} The HTML string for the mobile edit form.
 */
function getMobileEditFormHtml(contact) {
  const v = `checkContactFormValidity('edit-contact-name', 'edit-contact-email', 'edit-contact-phone', 'edit-contact-submit')`;
  const nameInput = `<div class="input-group"><div class="input-wrapper"><input type="text" value="${contact.name}" id="edit-contact-name" placeholder="Name" oninput="${v}"><img src="./assets/login-screen/person.svg" class="input-icon"></div></div>`;
  const emailInput = `<div class="input-group"><div class="input-wrapper"><input type="email" value="${contact.email}" id="edit-contact-email" placeholder="Email" oninput="${v}"><img src="./assets/login-screen/mail.svg" class="input-icon"></div></div>`;
  const phoneInput = `<div class="input-group"><div class="input-wrapper"><input type="tel" value="${contact.phone}" id="edit-contact-phone" placeholder="Phone" oninput="this.value = this.value.replace(/[^0-9]/g, ''); ${v}"><img src="./assets/icons/phone.svg" class="input-icon"></div></div>`;
  const actions = `<div class="form-actions-mobile"><button type="button" class="btn-delete-outline" onclick="deleteContact(${contact.id}); closeAddContactDialog();">Delete</button><button type="submit" class="btn-save-dark" id="edit-contact-submit">Save</button></div>`;
  const avatar = `<div class="contact-form-avatar-center" style="background-color: ${contact.color}">${contact.initials}</div>`;
  return `<div class="dialog-content-white">${avatar}<form onsubmit="saveContact(event, ${contact.id})" class="edit-form-mobile" novalidate>${nameInput}${emailInput}${phoneInput}${actions}</form></div>`;
}

/**
 * Generates the mobile edit contact dialog template.
 * @param {Object} contact - The contact object.
 * @returns {string} The full HTML string for the mobile edit dialog.
 */
function getMobileEditContactTemplate(contact) {
  const closeBtn = `<div class="close-btn-container-mobile"><button onclick="closeAddContactDialog()" class="btn-close-white">✕</button></div>`;
  const header = `<div class="dialog-header-blue">${closeBtn}<h1 class="dialog-title-white">Edit contact</h1><div class="blue-line-horizontal"></div></div>`;
  return `<div class="edit-contact-mobile-overlay" onclick="event.stopPropagation()">${header}${getMobileEditFormHtml(contact)}</div>`;
}

/**
 * Returns the appropriate add contact dialog template based on screen width.
 * @returns {string} The HTML string for the add contact dialog.
 */
function getAddContactDialogTemplate() {
  if (window.innerWidth <= 780) {
    return getMobileAddContactTemplate();
  } else {
    return getDesktopAddContactTemplate();
  }
}

/**
 * Generates the form fields HTML for the desktop add contact dialog.
 * @returns {string} The HTML string for the add contact form.
 */
function getAddContactFormHtml() {
  const v = `checkContactFormValidity('new-contact-name', 'new-contact-email', 'new-contact-phone', 'add-contact-submit')`;
  const nameInput = `<div class="input-group"><div class="input-wrapper"><input type="text" placeholder="Name" id="new-contact-name" oninput="${v}"><img src="./assets/login-screen/person.svg" class="input-icon"></div></div>`;
  const emailInput = `<div class="input-group"><div class="input-wrapper"><input type="email" placeholder="Email" id="new-contact-email" oninput="${v}"><img src="./assets/login-screen/mail.svg" class="input-icon"></div></div>`;
  const phoneInput = `<div class="input-group"><div class="input-wrapper"><input type="tel" placeholder="Phone" id="new-contact-phone" oninput="this.value = this.value.replace(/[^0-9]/g, ''); ${v}"><img src="./assets/icons/phone.svg" class="input-icon"></div></div>`;
  const actions = `<div class="form-actions-dialog"><button type="button" class="btn-cancel" onclick="closeAddContactDialog()">Cancel <span class="cancel-x">✕</span></button><button type="submit" class="btn-create-submit btn-disabled" id="add-contact-submit" disabled>Create contact <img src="./assets/icons/check-icon.png" alt="check" class="check-icon-white"></button></div>`;
  const avatar = `<div class="contact-form-avatar-default"><img src="./assets/login-screen/person.svg" alt="Default Avatar"></div>`;
  return `<div class="edit-content-container">${avatar}<form onsubmit="createContact(event)" class="edit-form-fields" novalidate>${nameInput}${emailInput}${phoneInput}${actions}</form></div>`;
}

/**
 * Generates the desktop add contact dialog template.
 * @returns {string} The full HTML string for the desktop add contact dialog.
 */
function getDesktopAddContactTemplate() {
  const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12L18 18M18 6L12 12L18 6ZM12 12L6 18L12 12ZM12 12L6 6L12 12Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const closeBtn = `<div class="close-btn-container"><button onclick="closeAddContactDialog()" class="btn-close">${svg}</button></div>`;
  const leftPanel = `<div class="dialog-left"><img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" class="dialog-logo-small"><h1 class="dialog-title-white">Add contact</h1><p class="dialog-subtitle-white">Tasks are better with a team!</p><div class="blue-line-horizontal"></div></div>`;
  const rightPanel = `<div class="dialog-right">${closeBtn}${getAddContactFormHtml()}</div>`;
  return `<div class="slide-in-dialog active" onclick="event.stopPropagation()">${leftPanel}${rightPanel}</div>`;
}

/**
 * Generates the form fields HTML for the mobile add contact dialog.
 * @returns {string} The HTML string for the mobile add contact form.
 */
function getMobileAddFormHtml() {
  const v = `checkContactFormValidity('new-contact-name', 'new-contact-email', 'new-contact-phone', 'add-contact-submit')`;
  const nameInput = `<div class="input-group"><div class="input-wrapper"><input type="text" placeholder="Name" id="new-contact-name" oninput="${v}"><img src="./assets/login-screen/person.svg" class="input-icon"></div></div>`;
  const emailInput = `<div class="input-group"><div class="input-wrapper"><input type="email" placeholder="Email" id="new-contact-email" oninput="${v}"><img src="./assets/login-screen/mail.svg" class="input-icon"></div></div>`;
  const phoneInput = `<div class="input-group"><div class="input-wrapper"><input type="tel" placeholder="Phone" id="new-contact-phone" oninput="this.value = this.value.replace(/[^0-9]/g, ''); ${v}"><img src="./assets/icons/phone.svg" class="input-icon"></div></div>`;
  const actions = `<div class="form-actions-mobile"><button type="submit" class="btn-save-dark btn-disabled" id="add-contact-submit" style="width: 200px;" disabled>Create contact</button></div>`;
  const avatar = `<div class="contact-form-avatar-center" style="background-color: #D1D1D1;"><img src="./assets/login-screen/person.svg" alt="" style="width: 64px; height: 64px; filter: invert(1);"></div>`;
  return `<div class="dialog-content-white">${avatar}<form onsubmit="createContact(event)" class="edit-form-mobile" novalidate>${nameInput}${emailInput}${phoneInput}${actions}</form></div>`;
}

/**
 * Generates the mobile add contact dialog template.
 * @returns {string} The full HTML string for the mobile add contact dialog.
 */
function getMobileAddContactTemplate() {
  const closeBtn = `<div class="close-btn-container-mobile"><button onclick="closeAddContactDialog()" class="btn-close-white">✕</button></div>`;
  const header = `<div class="dialog-header-blue">${closeBtn}<h1 class="dialog-title-white">Add contact</h1><p style="color: white; font-size: 20px; margin-top: 8px;">Tasks are better with a team!</p><div class="blue-line-horizontal"></div></div>`;
  return `<div class="edit-contact-mobile-overlay" onclick="event.stopPropagation()">${header}${getMobileAddFormHtml()}</div>`;
}

/**
 * Generates the HTML for a contact group letter heading.
 * @param {string} letter - The group letter.
 * @returns {string} The HTML string.
 */
function getContactGroupLetterTemplate(letter) {
  return `<div class="contact-group-letter">${letter}</div>`;
}

/**
 * Generates the HTML for a horizontal separator line between contact groups.
 * @returns {string} The HTML string.
 */
function getSeparatorLineTemplate() {
  return `<div class="separator-line" style="border-bottom: 1px solid #D1D1D1; margin: 0 24px 10px 24px;"></div>`;
}
