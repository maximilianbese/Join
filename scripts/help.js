/**
 * Initializes the help page and displays the user initials in the header.
 */
function initHelp() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    updateHeaderInitials(currentUser);
  } else {
    const initialsElement = document.getElementById("user-initials");
    if (initialsElement) initialsElement.textContent = "G";
  }
}


