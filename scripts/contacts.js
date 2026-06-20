/** @type {Array<Object>} In-memory list of all contacts loaded from Firestore. */
let contacts = [];

/**
 * Entry point for the contacts page.
 * Checks auth, waits for Firebase, initialises the sidebar, and loads contacts.
 */
function initContacts() {
  return (async function () {
    checkUser();
    await waitForFirebase();
    initSideMenu("contacts");
    await loadContactsFromFirestore();
    renderContactList();
  })();
}

/**
 * Fetches all contacts for the current user from Firestore.
 */
function loadContactsFromFirestore() {
  return (async function () {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    await loadContactsFromFirestoreAsync(currentUser);
  })();
}

/**
 * Populates the in-memory contacts array from a Firestore snapshot.
 * @param {import("firebase/firestore").QuerySnapshot} snapshot - Firestore query snapshot.
 */
function populateContactsFromSnapshot(snapshot) {
  contacts = [];
  snapshot.forEach(function (doc) {
    const data = doc.data();
    data.id = doc.id;
    contacts.push(data);
  });
}

/**
 * Sorts the in-memory contacts array alphabetically by name.
 */
function sortContacts() {
  contacts.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
}

/**
 * Returns initials built from the first letter of every word in the name.
 * @param {string} name - The full name.
 * @returns {string} The uppercase initials string.
 */
function getInitials(name) {
  return name
    .split(" ")
    .map(function (part) { return part[0]; })
    .join("")
    .toUpperCase();
}

/**
 * Clears the contacts list and re-renders all contacts in sorted order.
 */
function renderContactList() {
  const list = document.getElementById("contacts-list");
  if (!list) return;
  list.innerHTML = "";
  lastRenderedLetter = "";
  sortContacts();
  contacts.forEach(function (contact) {
    appendContactItemToList(list, contact);
  });
}

/**
 * Appends a letter-group heading to the list if the contact starts a new letter section.
 * @param {HTMLElement} list - The contacts list element.
 * @param {Object} contact - The contact object.
 */
function addLetterGroupIfNeeded(list, contact) {
  const first = contact.name[0].toUpperCase();
  if (first !== getLastRenderedLetter()) {
    updateLastRenderedLetter(first);
    addLetterGroupToList(list, first);
  }
}

/**
 * Appends a single contact item to the list, inserting a letter group if needed.
 * @param {HTMLElement} list - The contacts list element.
 * @param {Object} contact - The contact object.
 */
function appendContactItemToList(list, contact) {
  addLetterGroupIfNeeded(list, contact);
  list.innerHTML += getContactItemTemplate(contact);
}

/** @type {string} Tracks the last letter heading rendered in the contacts list. */
let lastRenderedLetter = "";

/**
 * Returns the last letter heading that was rendered.
 * @returns {string}
 */
function getLastRenderedLetter() {
  return lastRenderedLetter;
}

/**
 * Updates the last-rendered-letter tracker.
 * @param {string} letter - The new letter heading.
 */
function updateLastRenderedLetter(letter) {
  lastRenderedLetter = letter;
}

/**
 * Appends a letter heading and separator line to the contacts list.
 * @param {HTMLElement} list - The contacts list element.
 * @param {string} letter - The letter to render as a group heading.
 */
function addLetterGroupToList(list, letter) {
  list.innerHTML += getContactGroupLetterTemplate(letter) + getSeparatorLineTemplate();
}

/**
 * Finds a contact in the local contacts array by ID.
 * @param {string|number} id - The contact ID to search for.
 * @returns {Object|null} The matching contact, or null if not found.
 */
function findContactById(id) {
  return contacts.find(function (c) { return String(c.id) === String(id); }) || null;
}

/**
 * Displays the detail view for a contact identified by ID.
 * @param {string|number} id - The contact ID.
 */
function showContactDetails(id) {
  const contact = findContactById(id);
  if (!contact) return;
  renderContactDetailsView(contact, id);
  markActiveContact(id);
  applyContactDetailsVisibility(id);
}

/**
 * Renders the contact details template into the detail content container.
 * @param {Object} contact - The contact object.
 * @param {string|number} id - The contact ID.
 */
function renderContactDetailsView(contact, id) {
  const content = document.getElementById("contact-details-content");
  const isMobile = window.innerWidth <= 780;
  content.innerHTML = isMobile
    ? getMobileContactDetailsTemplate(contact)
    : getDesktopContactDetailsTemplate(contact);
}

/**
 * Marks the active contact item in the list and deactivates all others.
 * @param {string|number} id - The contact ID to activate.
 */
function markActiveContact(id) {
  document.querySelectorAll(".contact-item").forEach(function (item) {
    item.classList.toggle("active", item.getAttribute("data-id") === String(id));
  });
}

/**
 * Shows the contact detail panel in the appropriate mode (mobile or desktop).
 * @param {string|number} id - The contact ID (unused; present for symmetry).
 */
function applyContactDetailsVisibility(id) {
  if (window.innerWidth <= 780) {
    applyMobileContactDetailsVisibility();
  } else {
    applyDesktopContactDetailsVisibility();
  }
}

/**
 * Slides in the mobile contact details overlay.
 */
function applyMobileContactDetailsVisibility() {
  document.querySelector(".contact-details-container").classList.add("show-mobile");
}

/**
 * Makes the desktop contact details panel visible.
 */
function applyDesktopContactDetailsVisibility() {
  document.getElementById("contact-details-view").classList.add("visible");
}


/**
 * Hides both the mobile and desktop contact detail containers.
 */
function hideContactDetailsContainers() {
  const mobile = document.querySelector(".contact-details-container");
  const desktop = document.getElementById("contact-details-view");
  if (mobile) mobile.classList.remove("show-mobile");
  if (desktop) desktop.classList.remove("visible");
}

/**
 * Clears the contact detail content after the CSS transition completes.
 */
function clearContactDetailContent() {
  const content = document.getElementById("contact-details-content");
  if (content) setTimeout(function () { content.innerHTML = ""; }, 200);
}

/**
 * Removes the active highlight from all contact list items.
 */
function deactivateContactItems() {
  document.querySelectorAll(".contact-item").forEach(function (item) {
    item.classList.remove("active");
  });
}

/**
 * Closes the contact detail view and clears all active states.
 */
function closeContactDetails() {
  hideContactDetailsContainers();
  clearContactDetailContent();
  deactivateContactItems();
}

/**
 * Verifies the current user and displays their initials in the header.
 */
function checkUser() {
  if (typeof getCurrentUser !== "function") return;
  const user = getCurrentUser();
  const el = document.getElementById("user-initials");
  if (user && el) el.innerText = getInitials(user.name);
}

/**
 * Toggles the mobile floating contact action menu.
 * @param {MouseEvent} e - The click event.
 */
function toggleContactMenu(e) {
  e.stopPropagation();
  document.getElementById("contact-menu-box").classList.toggle("show");
}

document.addEventListener("click", function () {
  const menu = document.getElementById("contact-menu-box");
  if (menu) menu.classList.remove("show");
});
