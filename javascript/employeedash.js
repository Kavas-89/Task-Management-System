// filename=employee.js
// Initialize tasks and comments from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let comments = JSON.parse(localStorage.getItem('comments')) || [];

// Load tasks, comments, and set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateAssignedTaskList();
    populateTaskOptions();
    populateCommentOptions();

    // Attach event listeners
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("profileLink").addEventListener("click", showProfile);
    document.getElementById("backToDashboardBtn").addEventListener("click", backToDashboard);
    document.getElementById("viewCommentsForm").addEventListener("submit", viewComments);
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

// Show profile card when profile link is clicked
function showProfile(event) {
    event.preventDefault();
    const profileCard = document.getElementById("profileCard");
    const dashboardContent = document.getElementById("dashboardContent");

    dashboardContent.style.display = "none"; 
    profileCard.style.display = "block"; 

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        document.getElementById("userIdDisplay").textContent = loggedInUser.userId;
        document.getElementById("usernameDisplay").textContent = loggedInUser.username;
        document.getElementById("roleDisplay").textContent = "Employee"; // Replace with actual role if needed
    }
}

// Back to Dashboard button functionality
function backToDashboard() {
    const profileCard = document.getElementById("profileCard");
    const dashboardContent = document.getElementById("dashboardContent");

    profileCard.style.display = "none"; 
    dashboardContent.style.display = "block"; 
}

// Update the assigned task list
function updateAssignedTaskList() {
    const assignedTaskList = document.getElementById("assignedTaskList");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")).userId; // Get logged-in user ID

    // Filter tasks assigned to the logged-in user
    const userTasks = tasks.filter(task => task.assignedTo == loggedInUser);

    assignedTaskList.innerHTML = userTasks.map(task => `
        <li>
            ${task.title} - ${task.status} (Due: ${task.dueDate})
            <button onclick="viewComments(${task.id})">View Comments</button>
        </li>
    `).join('');
}

// Function to mark a task as completed
function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = 'Completed';
        localStorage.setItem('tasks', JSON.stringify(tasks));
        showNotification("Task marked as completed!", "success");
        updateAssignedTaskList();
    } else {
        showNotification("Task not found!", "danger");
    }
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
        assignedTo: localStorage.getItem("loggedInUser"), // Use the logged-in user ID
        status: 'Not Started',
        progress: 0,
    };

    if (!task.title || !task.description || !task.dueDate) {
        return showNotification("Please fill in all fields.", "danger");
    }

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification("Task Created Successfully!", "success");
    updateAssignedTaskList();
    clearForm("createTaskForm");
}

// Add a comment to a task
function addComment(event) {
    event.preventDefault();

    const taskId = document.getElementById("taskToComment").value;
    const commentText = document.getElementById("commentText").value.trim();

    if (!taskId || !commentText) {
        return showNotification("Please select a task and enter a comment.", "danger");
    }

    const comment = {
        id: Date.now(),
        taskId,
        text: commentText,
        userId: localStorage.getItem("loggedInUser"),
    };

    comments.push(comment);
    localStorage.setItem('comments', JSON.stringify(comments));
    showNotification("Comment added successfully!", "success");
    clearForm("addCommentForm");
}

// Populate task options for adding comments
function populateTaskOptions() {
    const taskToCommentSelect = document.getElementById("taskToComment");
    taskToCommentSelect.innerHTML = ''; // Clear existing options

    tasks.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = task.title;
        taskToCommentSelect.appendChild(option);
    });
}

// Populate comments for a task
function populateCommentOptions() {
    const taskToCommentSelect = document.getElementById("taskToComment");
    taskToCommentSelect.innerHTML = ''; // Clear existing options

    tasks.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = task.title;
        taskToCommentSelect.appendChild(option);
    });
}
// Function to view comments on a task
function viewComments(event) {
    event.preventDefault();
    const taskId = document.getElementById("taskToComment").value;

    // Check if the taskId is valid before filtering comments
    if (!taskId) {
        return showNotification("Please select a task to view comments.", "danger");
    }

    // Filter comments based on the logged-in user's tasks
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")).userId;
    const userTasks = tasks.filter(task => task.assignedTo == loggedInUser);
    const filteredComments = comments.filter(comment => userTasks.some(task => task.id == comment.taskId));

    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = filteredComments.map(comment => `
        <li>
            <strong>Task:</strong> ${tasks.find(task => task.id == comment.taskId)?.title || 'Unknown Task'}<br>
            <strong>User:</strong> ${comment.userId}<br>
            <strong>Comment:</strong> ${comment.text}
        </li>
    `).join('');

    // Show the comments section
    showSection('viewComments');
}

// Helper functions
function clearForm(formId) {
    document.getElementById(formId)?.reset();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type === "danger" ? "notification-danger" : ""}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}