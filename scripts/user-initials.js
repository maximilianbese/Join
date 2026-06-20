/**
 * Generates initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The generated initials.
 */
function getInitialsFromName(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

/**
 * Updates the user initials element in the header.
 * @param {Object} user - The user object containing a name property.
 */
function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement && user) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Displays the user's initials in the header.
 * @param {string} name - The user's full name.
 */
function displayUserInitials(name) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement && name) {
    const initials = getInitialsFromName(name);
    initialsElement.textContent = initials;
  }
}
