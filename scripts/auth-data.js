/**
 * Initializes a new user's Firestore data in a single batch:
 * profile document, default contacts, and default tasks.
 * @param {string} uid - The Firebase user ID.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 */
async function initializeUserData(uid, name, email) {
  const batch = window.fbWriteBatch(window.firebaseDb);
  await Promise.all([
    saveUserProfile(uid, name, email, batch),
    initDefaultContacts(uid, batch),
    initDefaultTasks(uid, batch),
  ]);
  await batch.commit();
}

/**
 * Saves a user profile document to Firestore, either within a batch or standalone.
 * @param {string} uid - The Firebase user ID.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @param {Object|null} batch - Firestore WriteBatch, or null for a direct write.
 * @returns {Promise<void>}
 */
async function saveUserProfile(uid, name, email, batch) {
  const userRef = window.fbDoc(window.firebaseDb, "users", uid);
  const data = { name: name, email: email, isGuest: false, createdAt: new Date().toISOString() };
  if (batch) { batch.set(userRef, data); } else { await window.fbSetDoc(userRef, data); }
}

/**
 * Extracts the storable fields from a contact object.
 * @param {Object} contact - The contact object to extract data from.
 * @returns {Object} Plain data object with name, email, phone, color, and initials.
 */
function getContactData(contact) {
  return { name: contact.name, email: contact.email, phone: contact.phone, color: contact.color, initials: contact.initials };
}

/**
 * Writes a single contact document to Firestore, either in a batch or standalone.
 * @param {string} uid - The Firebase user ID.
 * @param {Object} contact - The contact object (must have an id property).
 * @param {Object|null} batch - Firestore WriteBatch, or null for a direct write.
 * @returns {Promise<void>}
 */
async function writeContact(uid, contact, batch) {
  const contactRef = window.fbDoc(window.firebaseDb, "users", uid, "contacts", String(contact.id));
  const data = getContactData(contact);
  if (batch) { batch.set(contactRef, data); } else { await window.fbSetDoc(contactRef, data); }
}

/**
 * Writes all default contacts for a new user to Firestore.
 * @param {string} uid - The Firebase user ID.
 * @param {Object|null} batch - Firestore WriteBatch, or null for direct writes.
 * @returns {Promise<void>}
 */
async function initDefaultContacts(uid, batch) {
  for (let i = 0; i < DEFAULT_CONTACTS.length; i++) {
    await writeContact(uid, DEFAULT_CONTACTS[i], batch);
  }
}

/**
 * Writes a single task document to Firestore, either in a batch or standalone.
 * @param {string} uid - The Firebase user ID.
 * @param {Object} task - The task object (must have an id property).
 * @param {Object|null} batch - Firestore WriteBatch, or null for a direct write.
 * @returns {Promise<void>}
 */
async function writeTask(uid, task, batch) {
  const taskRef = window.fbDoc(window.firebaseDb, "users", uid, "tasks", String(task.id));
  if (batch) { batch.set(taskRef, task); } else { await window.fbSetDoc(taskRef, task); }
}

/**
 * Writes all default tasks for a new user to Firestore.
 * @param {string} uid - The Firebase user ID.
 * @param {Object|null} batch - Firestore WriteBatch, or null for direct writes.
 * @returns {Promise<void>}
 */
async function initDefaultTasks(uid, batch) {
  for (let i = 0; i < DEFAULT_TASKS.length; i++) {
    await writeTask(uid, DEFAULT_TASKS[i], batch);
  }
}

/**
 * Loads a user's profile document from Firestore.
 * Returns a default profile object if no document exists.
 * @param {string} uid - The Firebase user ID.
 * @returns {Promise<Object>} The user profile data.
 */
async function loadUserProfile(uid) {
  const userRef = window.fbDoc(window.firebaseDb, "users", uid);
  const docSnap = await window.fbGetDoc(userRef);
  if (docSnap.exists()) return docSnap.data();
  return { name: "User", email: "" };
}

/**
 * Ensures a guest profile exists in Firestore, creating one if it does not.
 * @param {string} uid - The Firebase anonymous user ID.
 * @returns {Promise<void>}
 */
async function ensureGuestProfile(uid) {
  const userRef = window.fbDoc(window.firebaseDb, "users", uid);
  const docSnap = await window.fbGetDoc(userRef);
  if (!docSnap.exists()) await createGuestProfile(uid);
}

/**
 * Creates a guest user profile in Firestore along with default contacts and tasks.
 * @param {string} uid - The Firebase anonymous user ID.
 * @returns {Promise<void>}
 */
async function createGuestProfile(uid) {
  const userRef = window.fbDoc(window.firebaseDb, "users", uid);
  const batch = window.fbWriteBatch(window.firebaseDb);
  batch.set(userRef, { name: "Guest", email: "guest@join.com", isGuest: true, createdAt: new Date().toISOString() });
  await Promise.all([initDefaultContacts(uid, batch), initDefaultTasks(uid, batch)]);
  await batch.commit();
}

/**
 * Deletes a guest user's Firestore data and removes their anonymous Auth account.
 * @param {Object} currentUser - The session user object (must have an id field).
 * @param {Object} firebaseUser - The Firebase Auth user object.
 * @returns {Promise<void>}
 */
async function deleteGuestAccount(currentUser, firebaseUser) {
  await deleteUserData(currentUser.id);
  try {
    await firebaseUser.delete();
  } catch (e) {
    console.warn("Could not delete anonymous auth user:", e);
  }
}

/**
 * Deletes all Firestore data for a user (tasks, contacts, and the user document).
 * @param {string} uid - The Firebase user ID.
 * @returns {Promise<void>}
 */
async function deleteUserData(uid) {
  try {
    const batch = window.fbWriteBatch(window.firebaseDb);
    await batchDeleteUserCollections(batch, uid);
    await batch.commit();
  } catch (error) {
    console.error("Error deleting guest data:", error);
  }
}

/**
 * Adds batch delete operations for all subcollections and the user document.
 * @param {Object} batch - Firestore WriteBatch to add delete operations to.
 * @param {string} uid - The Firebase user ID.
 * @returns {Promise<void>}
 */
async function batchDeleteUserCollections(batch, uid) {
  await addCollectionDeletesToBatch(batch, uid, "tasks");
  await addCollectionDeletesToBatch(batch, uid, "contacts");
  batch.delete(window.fbDoc(window.firebaseDb, "users", uid));
}

/**
 * Queries a Firestore subcollection and adds a delete operation for each document to the batch.
 * @param {Object} batch - Firestore WriteBatch to add delete operations to.
 * @param {string} uid - The Firebase user ID.
 * @param {string} collectionName - The name of the subcollection to delete from.
 * @returns {Promise<void>}
 */
async function addCollectionDeletesToBatch(batch, uid, collectionName) {
  const ref = window.fbCollection(window.firebaseDb, "users", uid, collectionName);
  const snap = await window.fbGetDocs(ref);
  snap.forEach((doc) => batch.delete(doc.ref));
}
