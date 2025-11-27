
// Ensure the DOM is loaded before executing
document.addEventListener("DOMContentLoaded", init);

// Initialize login logic
function init() {
    const loginForm = document.getElementById("loginForm");
    const registrationForm = document.getElementById("registrationForm");

    // Add sample users to localStorage if not already present
    if (!localStorage.getItem("users")) {
        const users = [
            { userId: 1, username: "Admin#12", password: "Admin@123", role: "admin" },
            { userId: 2, username: "Manager#12", password: "Manager@123", role: "manager" },
            { userId: 3, username: "Employee#12", password: "Employee@123", role: "employee" }
        ];
        localStorage.setItem("users", JSON.stringify(users));
        console.log("Sample users added to localStorage:", users);
    }

    if (!loginForm) {
        console.error("Login form not found.");
        return; // Exit if the form is not found
    }

    // Bind login form submission
    loginForm.addEventListener("submit", handleLogin);

    // Bind registration form submission
    if (registrationForm) {
        registrationForm.addEventListener("submit", handleRegistration);
    }

    // Bind password visibility toggle
    const togglePassword = document.getElementById("togglePassword");
    if (togglePassword) {
        togglePassword.addEventListener("click", togglePasswordVisibility);
    }

    // Add validation listeners
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    if (usernameInput) {
        usernameInput.addEventListener("input", (e) => validateInput(e.target, validateUsername));
    }
    if (passwordInput) {
        passwordInput.addEventListener("input", (e) => validateInput(e.target, validatePassword));
    }
}

// Handle login submission
function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("Attempting login with:", { username, password });

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Users in localStorage:", users);

    // Find matching user
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        console.log("User found:", user);

        // Create a loggedInUser object to keep things consistent
        const loggedInUser = {
            userId: user.userId ? user.userId.toString() : "N/A",  // fallback if userId missing
            username: user.username,
            role: user.role.toLowerCase()
        };

        // Save the logged-in user to localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

        // Redirect based on role with fixed paths
        if (loggedInUser.role === "admin") {
            console.log("Redirecting to admin dashboard...");
            window.location.href = "adminDashboard.html";
        } else if (loggedInUser.role === "manager") {
            console.log("Redirecting to manager dashboard...");
            window.location.href = "managerDashboard.html";
        } else if (loggedInUser.role === "employee") {
            console.log("Redirecting to employee dashboard...");
            window.location.href = "employeeDashboard.html"; // fixed spelling
        } else {
            alert("Invalid role. Please contact support.");
        }
    } else {
        console.log("Invalid username or password");
        alert("Invalid username or password.");
    }
}

// Handle user registration
function handleRegistration(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const role = document.getElementById("role").value.trim(); // Get user role from input

    // Validate username and password
    if (!validateUsername(username) || !validatePassword(password)) {
        return; // Exit if validation fails
    }

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the user already exists
    if (users.some(u => u.username === username)) {
        alert("Username already exists. Please choose a different one.");
        return;
    }

    // Generate a unique userId
    const newUserId = Date.now() + Math.floor(Math.random() * 1000);

    // Create new user object
    const newUser = { userId: newUserId, username, password, role };

    // Add new user to the users array
    users.push(newUser);

    // Save updated users array to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    alert("User registered successfully!");
    clearInputs();
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordField = document.getElementById("password");
    const passwordIcon = document.getElementById("togglePassword");
    if (passwordField.type === "password") {
        passwordField.type = "text";
        passwordIcon.classList.remove("bi-eye-slash");
        passwordIcon.classList.add("bi-eye");
    } else {
        passwordField.type = "password";
        passwordIcon.classList.remove("bi-eye");
        passwordIcon.classList.add("bi-eye-slash");
    }
}

// Validate input fields
function validateInput(inputElement, validationFunction) {
    const isValid = validationFunction(inputElement.value.trim());
    updateInputStyle(inputElement, isValid);
}

// Validate username format
function validateUsername(username) {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#\$&_.])[A-Za-z\d#$&_.]{8,16}$/;
    if (!username) {
        displayError("usernameError", "Username cannot be empty.");
        return false;
    } else if (!regex.test(username)) {
        displayError(
            "usernameError",
            "Username must be 8-16 characters with at least one uppercase, one lowercase, one digit, and one special character (#, $, &, _)."
        );
        return false;
    }
    displayError("usernameError", "");
    return true;
}

// Validate password format
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$&_])[A-Za-z\d@$&_]{8,16}$/;
    if (!password) {
        displayError("passwordError", "Password cannot be empty.");
        return false;
    } else if (!regex.test(password)) {
        displayError(
            "passwordError",
            "Password must be 8-16 characters with at least one uppercase, one lowercase, one digit, and one special character (@, $, &, _)."
        );
        return false;
    }
    displayError("passwordError", "");
    return true;
}

// Display error messages
function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.innerText = message;
    }
}

// Update input field styles
function updateInputStyle(inputElement, isValid) {
    const inputContainer = inputElement.closest(".mb-3");
    if (!inputContainer) return;
    const icon = inputContainer.querySelector(".bi");
    if (!icon) return;

    if (isValid) {
        inputElement.style.borderColor = "green";
        icon.classList.remove("bi-exclamation-circle");
        icon.classList.add("bi-check-circle");
        icon.style.color = "green";
    } else {
        inputElement.style.borderColor = "red";
        icon.classList.remove("bi-check-circle");
        icon.classList.add("bi-exclamation-circle");
        icon.style.color = "red";
    }
}

// Clear input fields
function clearInputs() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const regUsernameInput = document.getElementById("regUsername");
    const regPasswordInput = document.getElementById("regPassword");
    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (regUsernameInput) regUsernameInput.value = "";
    if (regPasswordInput) regPasswordInput.value = "";
}
