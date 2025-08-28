// Initialize tasks and comments from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let comments = JSON.parse(localStorage.getItem('comments')) || [];

// Load tasks and set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedTasks = localStorage.getItem('tasks');
    const savedComments = localStorage.getItem('comments');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    if (savedComments) {
        comments = JSON.parse(savedComments);
    }

    // Hide all sections by default and show the dashboard on page load
    document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
    showSection('dashboard');

    // Attach event listeners
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("profileLink").addEventListener("click", showProfile);
    document.getElementById("backToDashboardBtn").addEventListener("click", backToDashboard);
    document.getElementById("viewCommentsForm").addEventListener("submit", viewComments);

    updateAssignedTaskList();
    populateTaskOptions();
    populateTaskOptionsForComments(); // Populate task dropdown for comments
});

// Function to show a specific section
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
    
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = '/html/loginpage.html'; 
}

// Function to create a new task
function createTask(event) {
    event.preventDefault();

    const task = {
        id: Date.now(),
        title: document.getElementById("taskTitle").value.trim(),
        description: document.getElementById("taskDescription").value.trim(),
        priority: document.getElementById("taskPriority").value,
        dueDate: document.getElementById("dueDate").value,
        assignedTo: document.getElementById("assignedUserId").value.trim(), // Ensure this is the correct user ID
        status: 'Not Started',
        progress: 0,
    };

    if (!task.title || !task.description || !task.dueDate || !task.assignedTo) {
        return showNotification("Please fill in all fields.", "danger");
    }

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification("Task Created Successfully!", "success");
    updateAssignedTaskList();
    clearForm("createTaskForm");
}

// Update the assigned task list
function updateAssignedTaskList() {
    const assignedTaskList = document.getElementById("assignedTaskList");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")).userId; // Get logged-in user ID

    // Filter tasks assigned to the logged-in user
    const userTasks = tasks.filter(task => task.assignedTo == loggedInUser);

    assignedTaskList.innerHTML = userTasks.map(task => `
        <li>${task.title} - ${task.status} (Due: ${task.dueDate})</li>
    `).join('');
}

// Populate task options for update and delete
function populateTaskOptions() {
    const taskToUpdateSelect = document.getElementById("taskToUpdate");
    const taskToUpdateStatusSelect = document.getElementById("taskToUpdateStatus");
    const taskDeleteSelect = document.getElementById("taskDelete");

    // Clear existing options
    taskToUpdateSelect.innerHTML = '';
    taskToUpdateStatusSelect.innerHTML = '';
    taskDeleteSelect.innerHTML = '';

    tasks.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = task.title;
        taskToUpdateSelect.appendChild(option);
        taskToUpdateStatusSelect.appendChild(option.cloneNode(true));
        taskDeleteSelect.appendChild(option.cloneNode(true));
    });
}

// Populate task options for the "View Comments" dropdown
function populateTaskOptionsForComments() {
    const taskToCommentSelect = document.getElementById("taskToComment");
    taskToCommentSelect.innerHTML = ''; // Clear existing options

    tasks.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = task.title;
        taskToCommentSelect.appendChild(option);
    });
}

// Function to view comments for a specific task
function viewComments(event) {
    event.preventDefault();

    const taskId = document.getElementById("taskToComment").value;
    const filteredComments = comments.filter(comment => comment.taskId == taskId);

    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = filteredComments.map(comment => {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        return `
            <li>
                <strong>User ID:</strong> ${loggedInUser.userId}<br>
                <strong>Username:</strong> ${loggedInUser.username}<br>
                <strong>Comment:</strong> ${comment.text}
            </li>
        `;
    }).join('');

    // Show the comments section
    showSection('viewComments');
}

// Helper functions
function clearForm(formId) {
    document.getElementById(formId)?.reset();
}

function showNotification(message, type) {
    const notificationElement = document.createElement("div");
    notificationElement.classList.add("notification", `notification-${type}`);
    notificationElement.textContent = message;

    // Center the notification
    notificationElement.style.position = 'fixed';
    notificationElement.style.top = '50%';
    notificationElement.style.left = '50%';
    notificationElement.style.transform = 'translate(-50%, -50%)';
    notificationElement.style.zIndex = '1050';

    document.body.appendChild(notificationElement);

    // Auto-clear after 3 seconds
    setTimeout(() => {
        notificationElement.remove();
    }, 3000);
}

// Show profile card when profile link is clicked
function showProfile(event) {
    event.preventDefault();
    document.getElementById("profileCard").style.display = "block";
    updateProfileInfo();
}

// Update user's profile information
function updateProfileInfo() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    document.getElementById("userIdDisplay").textContent = loggedInUser.userId;
    document.getElementById("usernameDisplay").textContent = loggedInUser.username;
    document.getElementById("roleDisplay").textContent = loggedInUser.role;
}

// Back to Dashboard button functionality
function backToDashboard() {
    document.getElementById("profileCard").style.display = "none";
    showSection('dashboard');
}