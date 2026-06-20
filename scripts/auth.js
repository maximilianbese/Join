/**
 * Waits for Firebase to finish initializing before proceeding.
 * @returns {Promise<void>} Resolves when Firebase is ready.
 */
function waitForFirebase() {
  return new Promise(function (resolve) {
    if (window.firebaseReady) { resolve(); return; }
    window.addEventListener("firebaseReady", function () { resolve(); });
  });
}

/**
 * Creates a new Firebase Auth user and sets their display name.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The Firebase user object.
 */
async function createFirebaseUser(name, email, password) {
  const userCredential = await window.fbCreateUser(window.firebaseAuth, email, password);
  const user = userCredential.user;
  await window.fbUpdateProfile(user, { displayName: name });
  return user;
}

/**
 * Registers a new user via Firebase Authentication and initializes their data.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} Result object with success and message fields.
 */
async function signUpUser(name, email, password) {
  try {
    const user = await createFirebaseUser(name, email, password);
    await initializeUserData(user.uid, name, email);
    return { success: true, message: "Registration successful" };
  } catch (error) {
    console.error("Signup error:", error);
    return handleFirebaseError(error);
  }
}

/**
 * Processes a logged-in Firebase user: loads profile, resolves display values,
 * re-initializes data if incomplete, and returns a session user object.
 * @param {Object} user - Firebase Auth user object.
 * @returns {Promise<Object>} Session user object with id, name, email, and isGuest.
 */
async function processLoginUser(user) {
  const profile = await loadUserProfile(user.uid);
  const userName = resolveUserName(profile, user);
  const userEmail = resolveUserEmail(profile, user);
  if (profile.name === "User" || !profile.email) {
    await initializeUserData(user.uid, userName, userEmail);
  }
  return buildSessionUser(user.uid, userName, userEmail);
}

/**
 * Signs in a user with email and password and stores the session.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} Result object with success and user fields.
 */
async function loginUser(email, password) {
  try {
    const userCredential = await window.fbSignIn(window.firebaseAuth, email, password);
    const sessionUser = await processLoginUser(userCredential.user);
    storeUserSession(sessionUser);
    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Login error:", error);
    return handleFirebaseError(error);
  }
}

/**
 * Resolves the display name from the Firestore profile or Firebase Auth object.
 * @param {Object} profile - Firestore user profile document data.
 * @param {Object} authUser - Firebase Auth user object.
 * @returns {string} The resolved display name.
 */
function resolveUserName(profile, authUser) {
  return profile.name !== "User" ? profile.name : authUser.displayName || profile.name;
}

/**
 * Resolves the email from the Firestore profile or Firebase Auth object.
 * @param {Object} profile - Firestore user profile document data.
 * @param {Object} authUser - Firebase Auth user object.
 * @returns {string} The resolved email address.
 */
function resolveUserEmail(profile, authUser) {
  return profile.email || authUser.email;
}

/**
 * Builds a session user object for a regular (non-guest) user.
 * @param {string} uid - The Firebase user ID.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @returns {Object} Session user object.
 */
function buildSessionUser(uid, name, email) {
  return { id: uid, name: name, email: email, isGuest: false };
}

/**
 * Persists the session user to sessionStorage and sets the greeting flag.
 * @param {Object} sessionUser - The session user object to store.
 */
function storeUserSession(sessionUser) {
  sessionStorage.setItem("join_current_user", JSON.stringify(sessionUser));
  sessionStorage.setItem("showJoinGreeting", "true");
}

/**
 * Signs in anonymously via Firebase and sets up a guest session.
 * @returns {Promise<Object>} Result object with success and user fields.
 */
async function guestLoginUser() {
  try {
    const userCredential = await window.fbSignInAnon(window.firebaseAuth);
    const user = userCredential.user;
    const guestSession = buildGuestSession(user.uid);
    await ensureGuestProfile(user.uid);
    storeUserSession(guestSession);
    return { success: true, user: guestSession };
  } catch (error) {
    console.error("Guest login error:", error);
    return handleFirebaseError(error);
  }
}

/**
 * Builds a session object for a guest user.
 * @param {string} uid - The Firebase anonymous user ID.
 * @returns {Object} Guest session user object.
 */
function buildGuestSession(uid) {
  return { id: uid, name: "Guest", email: "guest@join.com", isGuest: true };
}

/**
 * Retrieves the currently stored session user from sessionStorage.
 * @returns {Object|null} The session user object, or null if not logged in.
 */
function getCurrentUser() {
  const userJson = sessionStorage.getItem("join_current_user");
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Checks whether the current session belongs to an anonymous guest user.
 * @param {Object} currentUser - The session user object.
 * @param {Object} firebaseUser - The Firebase Auth current user.
 * @returns {boolean} True if the user is a guest.
 */
function isGuestUser(currentUser, firebaseUser) {
  return currentUser && currentUser.isGuest && firebaseUser && firebaseUser.isAnonymous;
}

/**
 * Logs out the current user, deleting guest data first if applicable,
 * then signs out of Firebase and clears the session.
 * @returns {Promise<void>}
 */
async function logoutUser() {
  const currentUser = getCurrentUser();
  const firebaseUser = window.firebaseAuth.currentUser;
  if (isGuestUser(currentUser, firebaseUser)) {
    await deleteGuestAccount(currentUser, firebaseUser);
  }
  try {
    await window.fbSignOut(window.firebaseAuth);
  } catch (error) {
    console.error("Logout error:", error);
  }
  clearUserSession();
}

/**
 * Removes the current user from sessionStorage.
 */
function clearUserSession() {
  sessionStorage.removeItem("join_current_user");
}

/**
 * Checks whether any user is currently logged in.
 * @returns {boolean} True if a session user exists.
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Returns the human-readable message and error key for a given Firebase error code.
 * @param {string} code - The Firebase error code (e.g. "auth/invalid-email").
 * @returns {Array|null} Tuple of [message, errorKey], or null if unrecognized.
 */
function getFirebaseErrorDetails(code) {
  const errors = {
    "auth/email-already-in-use": ["This email address is already registered", "duplicate-email"],
    "auth/invalid-email": ["Invalid email address", "invalid-email"],
    "auth/weak-password": ["The password is too weak (at least 6 characters)", "weak-password"],
    "auth/user-not-found": ["User not found", "user-not-found"],
    "auth/wrong-password": ["Wrong password", "wrong-password"],
    "auth/invalid-credential": ["Email or password is incorrect", "invalid-credential"],
  };
  return errors[code] || null;
}

/**
 * Converts a Firebase error into a standardized result object.
 * @param {Object} error - The Firebase error object.
 * @returns {Object} Result object with success: false, error key, and message.
 */
function handleFirebaseError(error) {
  const details = getFirebaseErrorDetails(error.code);
  if (details) return { success: false, error: details[1], message: details[0] };
  return { success: false, error: error.code || "unknown", message: "An error occurred: " + error.message };
}

/**
 * Creates a generic error result object.
 * @param {string} error - The error key or code.
 * @param {string} message - A human-readable error message.
 * @returns {Object} Result object with success: false, error, and message.
 */
function createErrorResult(error, message) {
  return { success: false, error: error, message: message };
}
