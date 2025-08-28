// Ensure that the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");

    if (form) {
        form.addEventListener("submit", validateForm);
    } else {
        console.error("Registration form not found.");
    }
});

// Function to generate a unique user ID
function generateUserId() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    return users.length ? Math.max(...users.map(user => user.userId || 0)) + 1 : 1;
}

// Function to update input styles (valid/invalid)
function updateInputStyle(inputElement, isValid) {
    inputElement.style.borderColor = isValid ? "green" : "red";
}

// Function to clear previous error messages
function clearMessages() {
    document.querySelectorAll(".error-message").forEach(el => el.innerText = "");
    const validationError = document.getElementById("validationError");
    if (validationError) validationError.innerText = "";
}

// Username Validation
function validateUsername() {
    const username = document.getElementById("username").value.trim();
    const usernameError = document.getElementById("usernameError");
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#\$&_.])[A-Za-z\d#$&_.]{8,16}$/;

    if (!username) {
        usernameError.innerText = "Username cannot be empty";
        updateInputStyle(document.getElementById("username"), false);
        return false;
    } else if (!regex.test(username)) {
        usernameError.innerText = "Invalid format: 8-16 characters, 1 uppercase, 1 lowercase, 1 digit, and 1 special character.";
        updateInputStyle(document.getElementById("username"), false);
        return false;
    } else {
        usernameError.innerText = "";
        updateInputStyle(document.getElementById("username"), true);
        return true;
    }
}

// Email Validation
function validateEmail() {
    const email = document.getElementById("email").value.trim();
    const emailError = document.getElementById("emailError");
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
        emailError.innerText = "Email cannot be empty";
        updateInputStyle(document.getElementById("email"), false);
        return false;
    } else if (!regex.test(email)) {
        emailError.innerText = "Invalid email format.";
        updateInputStyle(document.getElementById("email"), false);
        return false;
    } else {
        emailError.innerText = "";
        updateInputStyle(document.getElementById("email"), true);
        return true;
    }
}

// Password Validation
function validatePassword() {
    const password = document.getElementById("password").value;
    const passwordError = document.getElementById("passwordError");
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$&_])[A-Za-z\d@$&_]{8,16}$/;

    if (!password) {
        passwordError.innerText = "Password cannot be empty";
        updateInputStyle(document.getElementById("password"), false);
        return false;
    } else if (!regex.test(password)) {
        passwordError.innerText = "Invalid format: 8-16 characters, 1 uppercase, 1 lowercase, 1 digit, and 1 special character.";
        updateInputStyle(document.getElementById("password"), false);
        return false;
    } else {
        passwordError.innerText = "";
        updateInputStyle(document.getElementById("password"), true);
        return true;
    }
}

// Confirm Password Validation
function validateConfirmPassword() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    if (!confirmPassword) {
        confirmPasswordError.innerText = "Confirm password cannot be empty";
        updateInputStyle(document.getElementById("confirm-password"), false);
        return false;
    } else if (password !== confirmPassword) {
        confirmPasswordError.innerText = "Passwords do not match";
        updateInputStyle(document.getElementById("confirm-password"), false);
        return false;
    } else {
        confirmPasswordError.innerText = "";
        updateInputStyle(document.getElementById("confirm-password"), true);
        return true;
    }
}

// Validate Form before submitting
function validateForm(event) {
    event.preventDefault(); // Prevent form submission

    clearMessages();

    if (validateUsername() && validateEmail() && validatePassword() && validateConfirmPassword()) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const newUsername = document.getElementById("username").value.trim();

        // Check if username already exists
        if (users.some(user => user.username === newUsername)) {
            document.getElementById("validationError").innerText = "Error: Username already exists.";
            return false;
        }

        // Create new user object
        const newUser = {
            userId: generateUserId(),
            username: newUsername,
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim(),
            role: "employee", // Default role
        };

        // Store user data
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // Show success message and redirect
        alert("Registration successful! Redirecting to login page...");
        window.location.href = "/html/loginpage.html";
    } else {
        document.getElementById("validationError").innerText = "Please fix errors before submitting.";
    }
}
