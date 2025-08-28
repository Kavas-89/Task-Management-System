
// Function to toggle visibility of sections
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

// Validation Helper: Updates input styles and shows error messages
function updateInputStyle(inputElement, isValid) {
    if (isValid) {
        inputElement.classList.remove("is-invalid");
        inputElement.classList.add("is-valid");
    } else {
        inputElement.classList.remove("is-valid");
        inputElement.classList.add("is-invalid");
    }
}

// --- VALIDATION FUNCTIONS ---
function validateUsername() {
    const username = document.getElementById("username").value.trim();
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#\$&_.])[A-Za-z\d#$&_.]{8,16}$/;
    const usernameError = document.getElementById("usernameError");

    if (!username) {
        usernameError.innerText = "Username cannot be empty.";
        updateInputStyle(document.getElementById("username"), false);
        return false;
    } else if (!regex.test(username)) {
        usernameError.innerText = "Username must be 8-16 characters with at least one uppercase, one lowercase, one digit, and one special character (#, $, &, _).";
        updateInputStyle(document.getElementById("username"), false);
        return false;
    }
    usernameError.innerText = "";
    updateInputStyle(document.getElementById("username"), true);
    return true;
}

function validateEmail() {
    const email = document.getElementById("email").value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailError = document.getElementById("emailError");

    if (!email) {
        emailError.innerText = "Email cannot be empty.";
        updateInputStyle(document.getElementById("email"), false);
        return false;
    } else if (!regex.test(email)) {
        emailError.innerText = "Please enter a valid email address.";
        updateInputStyle(document.getElementById("email"), false);
        return false;
    }
    emailError.innerText = "";
    updateInputStyle(document.getElementById("email"), true);
    return true;
}

function validatePassword() {
    const password = document.getElementById("password").value.trim();
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$&_])[A-Za-z\d@$&_]{8,16}$/;
    const passwordError = document.getElementById("passwordError");

    if (!password) {
        passwordError.innerText = "Password cannot be empty.";
        updateInputStyle(document.getElementById("password"), false);
        return false;
    } else if (!regex.test(password)) {
        passwordError.innerText = "Password must be 8-16 characters with at least one uppercase, one lowercase, one digit, and one special character (@, $, &, _).";
        updateInputStyle(document.getElementById("password"), false);
        return false;
    }
    passwordError.innerText = "";
    updateInputStyle(document.getElementById("password"), true);
    return true;
}

function validateRole() {
    const role = document.getElementById("role").value.trim();
    const roleError = document.getElementById("roleError");

    if (!role) {
        roleError.innerText = "Role must be selected.";
        return false;
    }
    roleError.innerText = "";
    return true;
}

// Modal helper function
function showModal(message, type) {
    const modal = document.createElement("div");
    modal.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-4`;
    modal.style.zIndex = 1050;
    modal.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span>${message}</span>
            <button type="button" class="btn-close ms-3" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => modal.remove(), 3000); // Auto-remove after 3 seconds
}

// Generate unique user ID
function generateUserId() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const lastId = users.length ? Math.max(...users.map(user => user.userId)) : 0;
    return lastId + 1; // Increment the last ID by 1
}

// Reset form inputs
function resetForm() {
    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("role").value = "";
    document.querySelector("#createUser .btn").removeAttribute("data-user-id");
}

// Render user list
function renderUserList() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userListContainer = document.getElementById("userList");

    if (userListContainer) {
        userListContainer.innerHTML = users.map(user => `
            <tr>
                <td>${user.userId}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            </tr>
        `).join("");
    }
}

// --- CREATE USER ---
// Function to create a new user
function createUser(event) {
    event.preventDefault();

    if (validateUsername() && validateEmail() && validatePassword() && validateRole()) {
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const role = document.getElementById("role").value.trim();

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const userId = generateUserId(); // Generate a unique user ID

        const newUser = { userId, username, email, password, role };
        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));
        showModal("User created successfully!", "success");
        resetForm();
        renderUserList();
        showSection("viewUsers"); // Go back to the "viewUsers" section after saving
    }
}

// --- VIEW USER BY ID ---
// Function to view user details by user ID
function viewUserById() {
    const userId = document.getElementById("viewUserId").value.trim();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.userId === parseInt(userId));

    const userDetailsContainer = document.getElementById("users"); // Ensure this ID matches

    if (!userDetailsContainer) {
        console.error("User details container not found in the DOM.");
        return; // Exit if the container is not found
    }

    if (user) {
        userDetailsContainer.innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
        `;
        showSection("viewUserById");
    } else {
        showModal("User not found!", "danger");
    }
}

// --- TASK FUNCTIONALITIES ---
/// filename=admin.js
// Function to toggle visibility of sections
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

// --- TASK FUNCTIONALITIES ---
// Function to update the task list on the admin dashboard
function updateTaskTable() {
    const taskList = document.getElementById("taskList");
    const tasks = JSON.parse(localStorage.getItem("tasks")) || []; // Fetch tasks from localStorage

    // Clear the task list in case it's already populated
    taskList.innerHTML = "";

    // Loop through tasks and create a table row for each
    tasks.forEach(task => {
        const row = document.createElement("tr"); // Create a new row for each task

        // Create and append each table cell (TD) to the row
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.status}</td>
            <td>${task.assignedTo}</td>
        `;
        taskList.appendChild(row);
    });
}

// Load tasks when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    updateTaskTable(); // Ensure tasks are also updated on load
});

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = '/html/loginpage.html'; // Redirect to login page
});

// Load tasks when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    renderUserList();
    updateTaskTable(); // Ensure tasks are also updated on load
});

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));

    // Show modal when clicking the logout link
    document.querySelector('a[data-bs-toggle="modal"][data-bs-target="#logoutModal"]')?.addEventListener('click', (event) => {
        event.preventDefault();
        logoutModal.show();
    });

    // Handle the logout action
    logoutButton?.addEventListener('click', () => {
        console.log('User logged out.');
        localStorage.removeItem("loggedInUser"); // Ensure user is logged out
        window.location.href = '/html/loginpage.html'; // Redirect to login page
    });
});

// Event listener to handle form submission for creating a user
document.getElementById("createUser").addEventListener("submit", createUser);

// Event listener to handle form submission for updating a user
document.getElementById('updateUserForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updateUser(event);
});

// Function to update user details after form submission
function updateUser(event) {
    event.preventDefault();

    // Gather form data
    const userId = document.getElementById("updateUserId").value.trim();
    const username = document.getElementById("updateUsername").value.trim();
    const email = document.getElementById("updateEmail").value.trim();
    const password = document.getElementById("updatePassword").value.trim(); // Password is just shown
    const role = document.getElementById("updateRole").value.trim();

    // Validate the inputs before proceeding with the update
    if (!userId || !username || !email || !role) {
        showModal("Please fill in all fields.", "danger");
        return;
    }

    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Find the user by ID
    const userIndex = users.findIndex(user => user.userId === parseInt(userId));

    if (userIndex !== -1) {
        // If password is provided (edited previously), update it. Otherwise, retain current password
        const updatedPassword = password ? password : users[userIndex].password;

        // Update user details
        users[userIndex] = {
            userId: parseInt(userId),
            username,
            email,
            password: updatedPassword, // Update password if needed
            role
        };

        // Save updated users list back to localStorage
        localStorage.setItem("users", JSON.stringify(users));

        // Show success modal
        showModal("User updated successfully!", "success");

        // Optionally reset the form after submission
        resetForm();

        // Optionally refresh or re-render the user list (if needed)
        renderUserList();

        // Show the 'viewUsers' section after update (if applicable)
        showSection("viewUsers");
    } else {
        // If user with provided ID doesn't exist
        showModal("User not found!", "danger");
    }
}

// Function to remove user by ID
function removeUser() {
    const userId = document.getElementById("removeUserId").value.trim();

    if (!userId) {
        showModal("Please enter a User ID.", "danger");
        return;
    }

    // Fetch the current list of users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Find the index of the user to be removed
    const userIndex = users.findIndex(user => user.userId === parseInt(userId));

    if (userIndex === -1) {
        showModal("User not found!", "danger");
    } else {
        // Remove the user from the list
        users.splice(userIndex, 1);

        // Update localStorage with the new list of users
        localStorage.setItem("users", JSON.stringify(users));

        // Show a success message
        showModal("User removed successfully!", "success");

        // Optionally, clear the input field
        document.getElementById("removeUserId").value = "";
        // Optionally, re-render the user list
        renderUserList();
    }
}

// Profile display logic
// Show the profile card when the profile link is clicked
document.getElementById("profileLink").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default anchor behavior
    const profileCard = document.getElementById("profileCard");
    const dashboardContent = document.getElementById("dashboardContent");

    // Hide dashboard content and show profile card
    dashboardContent.style.display = "none"; // Hide the dashboard content
    profileCard.style.display = "block"; // Show the profile card

    // Optionally, you can populate the username and role from localStorage if needed
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        document.getElementById("usernameDisplay").textContent = loggedInUser.username;
        document.getElementById("roleDisplay").textContent = loggedInUser.role;
    }
});

// Back to Dashboard button functionality
document.getElementById("backToDashboardBtn").addEventListener("click", function () {
    const profileCard = document.getElementById("profileCard");
    const dashboardContent = document.getElementById("dashboardContent");

    // Hide profile card and show dashboard content
    profileCard.style.display = "none"; // Hide the profile card
    dashboardContent.style.display = "block"; // Show the dashboard content
});

// Function to log in a user
function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // Fetch user data from localStorage or an API
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store the user's role in localStorage or a session variable
        localStorage.setItem("loggedInUser", JSON.stringify({ role: user.role }));

        // Redirect the user to the appropriate dashboard
        if (user.role === "Admin") {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "user-dashboard.html";
        }
    } else {
        alert("Invalid credentials!");
    }
}

// Logout function
function logoutUser() {
    localStorage.removeItem("loggedInUser");
    alert("Logged out successfully!");
    window.location.href = "login.html"; 
}