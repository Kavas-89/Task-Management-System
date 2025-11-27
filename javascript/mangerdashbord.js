// filename=managerdashboard.js
// Initialize tasks and comments from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let comments = JSON.parse(localStorage.getItem('comments')) || [];

// Load tasks and set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("Manager Dashboard Loading...");
    
    // Initialize data
    initializeManagerDashboard();
    
    // Hide all sections by default and show the dashboard on page load
    document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
    showSection('dashboard');

    // Attach event listeners safely
    attachEventListeners();
    
    // Initial data population
    updateAssignedTaskList();
    populateTaskOptions();
    populateTaskOptionsForComments();
    updateEmployeeTaskStatuses(); // NEW: Track employee updates
});

// ENHANCED: Initialize manager dashboard with validation
function initializeManagerDashboard() {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (!userData || !userData.userId) {
        console.error("No logged in user found, redirecting to login...");
        window.location.href = '/html/loginpage.html';
        return;
    }
    
    // Verify manager role
    if (userData.role && userData.role.toLowerCase() !== 'manager') {
        console.warn("Non-manager user accessing manager dashboard");
        showNotification("Access denied: Manager privileges required", "danger");
        setTimeout(() => {
            window.location.href = '/html/loginpage.html';
        }, 2000);
        return;
    }
    
    console.log("Manager dashboard initialized for:", userData.username);
}

// ENHANCED: Safely attach all event listeners
function attachEventListeners() {
    // Core navigation listeners
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
    
    const profileLink = document.getElementById("profileLink");
    if (profileLink) {
        profileLink.addEventListener("click", showProfile);
    }
    
    const backToDashboardBtn = document.getElementById("backToDashboardBtn");
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener("click", backToDashboard);
    }
    
    // Form listeners
    const viewCommentsForm = document.getElementById("viewCommentsForm");
    if (viewCommentsForm) {
        viewCommentsForm.addEventListener("submit", viewComments);
    }
    
    const createTaskForm = document.getElementById("createTaskForm");
    if (createTaskForm) {
        createTaskForm.addEventListener("submit", createTask);
    }
    
    // NEW: Task management listeners
    const updateTaskForm = document.getElementById("updateTaskForm");
    if (updateTaskForm) {
        updateTaskForm.addEventListener("submit", updateTaskStatus);
    }
    
    const deleteTaskForm = document.getElementById("deleteTaskForm");
    if (deleteTaskForm) {
        deleteTaskForm.addEventListener("submit", deleteTask);
    }
    
    console.log("Event listeners attached successfully");
}

// Function to show a specific section
function showSection(sectionId) {
    console.log("Showing section:", sectionId);
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        selectedSection.classList.add('active');
        
        // Refresh data when switching sections
        if (sectionId === 'dashboard') {
            updateAssignedTaskList();
            updateEmployeeTaskStatuses();
        } else if (sectionId === 'viewComments') {
            populateTaskOptionsForComments();
        }
    }
}

// Logout functionality
function logout() {
    try {
        localStorage.removeItem("loggedInUser");
        showNotification("Logged out successfully!", "success");
        
        setTimeout(() => {
            window.location.href = '/html/loginpage.html';
        }, 1000);
    } catch (error) {
        console.error("Error during logout:", error);
        window.location.href = '/html/loginpage.html';
    }
}

// ENHANCED: Function to create a new task with validation
function createTask(event) {
    event.preventDefault();
    console.log("Creating new task...");
    
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!userData || !userData.userId) {
        return showNotification("Manager not logged in!", "danger");
    }
    
    const task = {
        id: Date.now(),
        title: document.getElementById("taskTitle").value.trim(),
        description: document.getElementById("taskDescription").value.trim(),
        priority: document.getElementById("taskPriority").value,
        dueDate: document.getElementById("dueDate").value,
        assignedTo: document.getElementById("assignedUserId").value.trim(),
        status: 'Not Started',
        progress: 0,
        createdBy: userData.userId,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    // Enhanced validation
    if (!task.title || !task.description || !task.dueDate || !task.assignedTo) {
        return showNotification("Please fill in all required fields.", "danger");
    }
    
    // Validate due date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    
    if (dueDate < today) {
        return showNotification("Due date cannot be in the past.", "danger");
    }
    
    // Validate employee ID format (basic check)
    if (isNaN(task.assignedTo)) {
        return showNotification("Please enter a valid employee ID (number).", "danger");
    }
    
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification("✅ Task created and assigned successfully!", "success");
    
    updateAssignedTaskList();
    populateTaskOptions();
    populateTaskOptionsForComments();
    clearForm("createTaskForm");
}

// NEW: Function to update task status
function updateTaskStatus(event) {
    event.preventDefault();
    console.log("Updating task status...");
    
    const taskId = document.getElementById("taskToUpdateStatus").value;
    const newStatus = document.getElementById("newTaskStatus").value;
    
    if (!taskId || !newStatus) {
        return showNotification("Please select a task and new status.", "danger");
    }
    
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    if (taskIndex === -1) {
        return showNotification("Task not found!", "danger");
    }
    
    const oldStatus = tasks[taskIndex].status;
    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].lastUpdated = new Date().toISOString();
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification(`Task status updated from "${oldStatus}" to "${newStatus}"`, "success");
    
    updateAssignedTaskList();
    clearForm("updateTaskForm");
}

// NEW: Function to delete task
function deleteTask(event) {
    event.preventDefault();
    console.log("Deleting task...");
    
    const taskId = document.getElementById("taskDelete").value;
    
    if (!taskId) {
        return showNotification("Please select a task to delete.", "danger");
    }
    
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    if (taskIndex === -1) {
        return showNotification("Task not found!", "danger");
    }
    
    const taskTitle = tasks[taskIndex].title;
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete task: "${taskTitle}"?`)) {
        tasks.splice(taskIndex, 1);
        
        // Also remove associated comments
        const remainingComments = comments.filter(comment => comment.taskId != taskId);
        comments = remainingComments;
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('comments', JSON.stringify(comments));
        
        showNotification(`Task "${taskTitle}" deleted successfully!`, "success");
        
        updateAssignedTaskList();
        populateTaskOptions();
        populateTaskOptionsForComments();
        clearForm("deleteTaskForm");
    }
}

// ENHANCED: Update the assigned task list with better styling
function updateAssignedTaskList() {
    const assignedTaskList = document.getElementById("assignedTaskList");
    if (!assignedTaskList) return;
    
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!userData || !userData.userId) {
        console.error("No logged in user found, redirecting to login...");
        window.location.href = "/html/loginpage.html";
        return;
    }
    
    // For managers, show all tasks or tasks created by them
    const managerTasks = userData.role === 'manager' ? 
        tasks : // Show all tasks for managers
        tasks.filter(task => task.createdBy == userData.userId); // Show only created tasks
    
    if (managerTasks.length > 0) {
        assignedTaskList.innerHTML = managerTasks.map(task => {
            const statusColor = getStatusColor(task.status);
            const priorityColor = getPriorityColor(task.priority);
            
            return `
                <li class="task-item" style="border-left: 4px solid ${priorityColor}; margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <div class="task-header">
                        <strong style="color: #333;">${task.title}</strong>
                        <span class="badge" style="background: ${priorityColor}; color: white; margin-left: 10px;">${task.priority}</span>
                    </div>
                    <div class="task-details" style="margin-top: 8px;">
                        <small><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${task.status}</span></small><br>
                        <small><strong>Assigned to:</strong> Employee ID ${task.assignedTo}</small><br>
                        <small><strong>Due:</strong> ${formatDate(task.dueDate)}</small><br>
                        <small><strong>Created:</strong> ${formatDate(task.createdAt)}</small>
                    </div>
                    <div class="task-actions" style="margin-top: 10px;">
                        <button onclick="viewTaskComments(${task.id})" class="btn btn-sm btn-info">View Comments</button>
                        <button onclick="editTask(${task.id})" class="btn btn-sm btn-warning">Edit</button>
                    </div>
                </li>
            `;
        }).join('');
    } else {
        assignedTaskList.innerHTML = `
            <li class="no-tasks" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-tasks" style="font-size: 3rem; margin-bottom: 15px; color: #ddd;"></i>
                <p>No tasks created yet.</p>
                <small>Create your first task using the form above.</small>
            </li>
        `;
    }
}

// NEW: Track employee task status updates
function updateEmployeeTaskStatuses() {
    const performanceData = JSON.parse(localStorage.getItem('taskPerformance')) || [];
    
    performanceData.forEach(performance => {
        // Find matching task and update its status
        const taskIndex = tasks.findIndex(task => 
            task.title.toLowerCase() === performance.title.toLowerCase() ||
            task.id === performance.taskId
        );
        
        if (taskIndex !== -1) {
            tasks[taskIndex].status = performance.status;
            tasks[taskIndex].progress = performance.progress || 0;
            tasks[taskIndex].lastUpdated = performance.updatedAt;
            tasks[taskIndex].employeeNotes = performance.updates;
        }
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Helper function to get status color
function getStatusColor(status) {
    switch(status?.toLowerCase()) {
        case 'completed': return '#28a745';
        case 'in progress': return '#007bff';
        case 'pending': return '#ffc107';
        case 'not started': return '#6c757d';
        case 'blocked': return '#dc3545';
        default: return '#6c757d';
    }
}

// Helper function to get priority color
function getPriorityColor(priority) {
    switch(priority?.toLowerCase()) {
        case 'high': return '#dc3545';
        case 'medium': return '#ffc107';
        case 'low': return '#28a745';
        default: return '#6c757d';
    }
}

// ENHANCED: Format date with better display
function formatDate(dateString) {
    if (!dateString) return 'No date';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

// ENHANCED: Populate task options with better error handling
function populateTaskOptions() {
    const selectors = ["taskToUpdate", "taskToUpdateStatus", "taskDelete"];
    
    selectors.forEach(selectorId => {
        const element = document.getElementById(selectorId);
        if (element) {
            element.innerHTML = '<option value="">Select a task...</option>';
            
            tasks.forEach(task => {
                const option = document.createElement("option");
                option.value = task.id;
                option.textContent = `${task.title} (${task.status})`;
                element.appendChild(option);
            });
        }
    });
}

// ENHANCED: Populate task options for comments with filtering
function populateTaskOptionsForComments() {
    const taskToCommentSelect = document.getElementById("taskToComment");
    if (!taskToCommentSelect) return;
    
    taskToCommentSelect.innerHTML = '<option value="">Select a task...</option>';
    
    tasks.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = `${task.title} (Employee: ${task.assignedTo})`;
        taskToCommentSelect.appendChild(option);
    });
}

// ENHANCED: View comments with better display
function viewComments(event) {
    event.preventDefault();
    console.log("Viewing comments...");
    
    const taskId = document.getElementById("taskToComment").value;
    
    if (!taskId) {
        return showNotification("Please select a task to view comments.", "warning");
    }
    
    const task = tasks.find(t => t.id == taskId);
    const filteredComments = comments.filter(comment => comment.taskId == taskId);
    const commentsList = document.getElementById("commentsList");
    
    if (!commentsList) return;
    
    if (filteredComments.length > 0) {
        commentsList.innerHTML = `
            <div class="task-info" style="background: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h6>Comments for: "${task?.title || 'Unknown Task'}"</h6>
                <small>Assigned to: Employee ID ${task?.assignedTo}</small>
            </div>
            ${filteredComments.map(comment => `
                <li class="comment-item" style="background: #f8f9fa; margin-bottom: 15px; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                    <div class="comment-header" style="margin-bottom: 8px;">
                        <strong>👤 ${comment.username || comment.userId}</strong>
                        <small style="float: right; color: #666;">${formatDate(comment.timestamp)}</small>
                    </div>
                    <div class="comment-text" style="background: white; padding: 10px; border-radius: 5px;">
                        "${comment.text}"
                    </div>
                </li>
            `).join('')}
        `;
    } else {
        commentsList.innerHTML = `
            <div class="task-info" style="background: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h6>Comments for: "${task?.title || 'Unknown Task'}"</h6>
                <small>Assigned to: Employee ID ${task?.assignedTo}</small>
            </div>
            <li class="no-comments" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>No comments yet for this task.</p>
            </li>
        `;
    }
    
    showSection('viewComments');
}

// NEW: View comments for specific task (called from task list)
function viewTaskComments(taskId) {
    const taskSelect = document.getElementById("taskToComment");
    if (taskSelect) {
        taskSelect.value = taskId;
        
        // Trigger the view comments function
        const event = new Event('submit');
        document.getElementById("viewCommentsForm").dispatchEvent(event);
    }
}

// NEW: Edit task function (placeholder for future implementation)
function editTask(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (task) {
        showNotification(`Edit functionality for "${task.title}" - Coming soon!`, "info");
        // TODO: Implement edit modal or redirect to edit form
    }
}

// Helper functions
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        console.log(`Form ${formId} cleared`);
    }
}

// ENHANCED: Notification system with better styling
function showNotification(message, type = 'success') {
    console.log("Notification:", message, type);
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notificationElement = document.createElement("div");
    notificationElement.classList.add("notification", `notification-${type}`);
    
    // Enhanced styling
    notificationElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 
                    type === 'danger' ? 'linear-gradient(135deg, #dc3545, #e74c3c)' :
                    type === 'warning' ? 'linear-gradient(135deg, #ffc107, #e0a800)' :
                    'linear-gradient(135deg, #17a2b8, #138496)'};
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        min-width: 300px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    notificationElement.textContent = message;
    document.body.appendChild(notificationElement);

    // Auto-clear after 4 seconds
    setTimeout(() => {
        notificationElement.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.remove();
            }
        }, 300);
    }, 4000);
}

// Show profile card when profile link is clicked
function showProfile(event) {
    event.preventDefault();
    const profileCard = document.getElementById("profileCard");
    const dashboardContent = document.getElementById("dashboardContent");
    
    if (profileCard && dashboardContent) {
        dashboardContent.style.display = "none";
        profileCard.style.display = "block";
        updateProfileInfo();
    }
}

// ENHANCED: Update profile information with role verification
function updateProfileInfo() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;
    
    const userIdDisplay = document.getElementById("userIdDisplay");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const roleDisplay = document.getElementById("roleDisplay");
    
    if (userIdDisplay) userIdDisplay.textContent = loggedInUser.userId || "N/A";
    if (usernameDisplay) usernameDisplay.textContent = loggedInUser.username || "N/A";
    if (roleDisplay) roleDisplay.textContent = loggedInUser.role || "Manager";
}

// Back to Dashboard button functionality
function backToDashboard() {
    const profileCard = document.getElementById("profileCard");
    const dashboardContent = document.getElementById("dashboardContent");
    
    if (profileCard && dashboardContent) {
        profileCard.style.display = "none";
        dashboardContent.style.display = "block";
        showSection('dashboard');
    }
}

// ADD CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
