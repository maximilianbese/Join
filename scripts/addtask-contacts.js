/**
 * Loads contacts from Firestore and populates the assigned-to dropdown.
 */
async function loadContacts() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const snapshot = await fetchContactsSnapshot(currentUser.id);
    processContactsSnapshot(snapshot, currentUser);
    sortContactsByName();
    renderAssignedToOptions();
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/**
 * Returns a Firestore getDocs promise for the user's contacts collection.
 * @param {string} userId - The user ID.
 * @returns {Promise<QuerySnapshot>} The Firestore query snapshot promise.
 */
function fetchContactsSnapshot(userId) {
  const contactsRef = window.fbCollection(
    window.firebaseDb,
    "users",
    userId,
    "contacts",
  );
  return window.fbGetDocs(contactsRef);
}

/**
 * Processes the Firestore contacts snapshot and populates the allContacts array.
 * @param {QuerySnapshot} snapshot - The Firestore snapshot.
 * @param {Object} currentUser - The currently logged-in user.
 */
function processContactsSnapshot(snapshot, currentUser) {
  allContacts = [];
  snapshot.forEach(function (doc) {
    const contact = doc.data();
    contact.id = doc.id;
    contact.isYou = contact.email === currentUser.email;
    allContacts.push(contact);
  });
}

/**
 * Sorts the allContacts array alphabetically by name.
 */
function sortContactsByName() {
  allContacts.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
}

/**
 * Renders the contact options in the assigned-to dropdown.
 */
function renderAssignedToOptions() {
  const optionsContainer = document.getElementById("assigned-to-options");
  if (!optionsContainer) return;
  optionsContainer.innerHTML = "";
  allContacts.forEach(function (contact) {
    const isSelected = selectedContacts.some(function (c) {
      return c.id === contact.id;
    });
    optionsContainer.innerHTML += getContactOptionTemplate(contact, isSelected);
  });
}

/**
 * Toggles the assigned-to dropdown open/closed.
 */
function toggleAssignedToDropdown() {
  const wrapper = document.getElementById("assigned-to-wrapper");
  const options = document.getElementById("assigned-to-options");
  wrapper.classList.toggle("open");
  options.classList.toggle("d-none");
}

/**
 * Toggles the selection state of a contact in the assigned-to list.
 * @param {string} contactId - The contact ID to toggle.
 * @param {Event} event - The click event.
 */
function toggleContactSelection(contactId, event) {
  event.stopPropagation();
  const contact = allContacts.find(function (c) {
    return c.id === contactId;
  });
  if (!contact) return;
  updateSelectedContacts(contact, contactId);
  renderAssignedToOptions();
  renderSelectedInitials();
}

/**
 * Adds or removes a contact from the selectedContacts array.
 * @param {Object} contact - The contact object.
 * @param {string} contactId - The contact ID.
 */
function updateSelectedContacts(contact, contactId) {
  const index = selectedContacts.findIndex(function (c) {
    return c.id === contactId;
  });
  if (index > -1) {
    selectedContacts.splice(index, 1);
  } else {
    selectedContacts.push(contact);
  }
}

/**
 * Renders the initials avatars for all currently selected contacts.
 */
function renderSelectedInitials() {
  const container = document.getElementById("selected-contacts-initials");
  if (!container) return;
  container.innerHTML = "";
  selectedContacts.forEach(function (contact) {
    container.innerHTML += getSelectedContactInitialsTemplate(contact);
  });
}

// Closes the assigned-to dropdown when clicking outside of it.
document.addEventListener(
  "click",
  function (event) {
    const wrapper = document.getElementById("assigned-to-wrapper");
    if (wrapper && !wrapper.contains(event.target)) {
      wrapper.classList.remove("open");
      const options = document.getElementById("assigned-to-options");
      if (options) options.classList.add("d-none");
    }
  },
  true,
);

/**
 * Loads the assigned contacts for a task into the form selection state.
 * @param {Object} task - The task object containing an assignedTo array.
 */
function loadAssigneesForEdit(task) {
  selectedContacts = [];
  if (Array.isArray(task.assignedTo)) {
    processEditAssignees(task.assignedTo);
  }
  renderAssignedToOptions();
  renderSelectedInitials();
}

/**
 * Resolves each assignee ID to a contact object and adds it to selectedContacts.
 * @param {Array} assignedToList - Array of contact IDs.
 */
function processEditAssignees(assignedToList) {
  for (let i = 0; i < assignedToList.length; i++) {
    const contact = findContactById(assignedToList[i]);
    if (contact) {
      selectedContacts.push(contact);
    }
  }
}

/**
 * Finds a contact in allContacts by ID.
 * @param {string|number} id - The contact ID to look up.
 * @returns {Object|undefined} The matching contact or undefined.
 */
function findContactById(id) {
  return allContacts.find(function (c) {
    return String(c.id) === String(id);
  });
}
