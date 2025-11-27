// employeedash.js

// Load data from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let comments = JSON.parse(localStorage.getItem("comments")) || [];
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

// Redirect if not logged in
if (!loggedInUser) {
  window.location.href = "/html/loginpage.html";
}

// ------------------ NAVIGATION ------------------
function showSection(sectionId) {
  document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");
  document.getElementById(sectionId).style.display = "block";

  if (sectionId === "viewTasks") updateAssignedTaskList();
  if (sectionId === "addComment") populateTaskOptions("taskToCommentAdd");
  if (sectionId === "viewComments") populateTaskOptions("taskToCommentView");
  if (sectionId === "performTask") populateTaskOptions("performTaskSelect");
}

// ------------------ PROFILE CARD ------------------
document.getElementById("profileLink").addEventListener("click", () => {
  document.querySelector(".content-section.active")?.classList.remove("active");
  document.getElementById("profileCard").style.display = "block";

  document.getElementById("userIdDisplay").textContent = loggedInUser.userId;
  document.getElementById("usernameDisplay").textContent = loggedInUser.username;
  document.getElementById("roleDisplay").textContent = loggedInUser.role;
});

document.getElementById("backToDashboardBtn").addEventListener("click", () => {
  document.getElementById("profileCard").style.display = "none";
  showSection("dashboard");
});

// ------------------ TASKS ------------------
function updateAssignedTaskList() {
  const assignedTaskList = document.getElementById("assignedTaskList");
  const userTasks = tasks.filter(task => task.assignedTo == loggedInUser.userId);

  assignedTaskList.innerHTML = userTasks.length > 0
    ? userTasks.map(task => `<li>${task.title} - ${task.status} (Due: ${task.dueDate})</li>`).join("")
    : "<li>No tasks assigned.</li>";
}

function createTask(event) {
  event.preventDefault();
  const task = {
    id: Date.now(),
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDescription").value,
    priority: document.getElementById("taskPriority").value,
    dueDate: document.getElementById("dueDate").value,
    assignedTo: loggedInUser.userId,
    status: "Pending",
    notes: ""
  };
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  event.target.reset();
  alert("Task created successfully!");
}

// ------------------ COMMENTS ------------------
function addComment(event) {
  event.preventDefault();
  const comment = {
    id: Date.now(),
    taskId: document.getElementById("taskToCommentAdd").value,
    userId: loggedInUser.userId,
    text: document.getElementById("commentText").value
  };
  comments.push(comment);
  localStorage.setItem("comments", JSON.stringify(comments));
  event.target.reset();
  alert("Comment added!");
}

function viewComments(event) {
  event.preventDefault();
  const taskId = document.getElementById("taskToCommentView").value;
  const filteredComments = comments.filter(c => c.taskId == taskId);

  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = filteredComments.length > 0
    ? filteredComments.map(c => `
        <li>
          <strong>User:</strong> ${c.userId} <br>
          <strong>Comment:</strong> ${c.text}
        </li>
      `).join("")
    : "<li>No comments for this task.</li>";
}

// ------------------ PERFORM TASK ------------------
function populateTaskOptions(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const userTasks = tasks.filter(task => task.assignedTo == loggedInUser.userId);
  select.innerHTML = userTasks.length > 0
    ? userTasks.map(t => `<option value="${t.id}">${t.title}</option>`).join("")
    : "<option disabled>No tasks available</option>";

  if (selectId === "performTaskSelect" && userTasks.length > 0) {
    loadTaskDetails(userTasks[0].id);
  }
}

function loadTaskDetails(taskId) {
  const task = tasks.find(t => t.id == taskId);
  if (!task) return;

  document.getElementById("performTaskTitle").value = task.title;
  document.getElementById("performTaskDescription").value = task.description;
  document.getElementById("performTaskPriority").value = task.priority;
  document.getElementById("performDueDate").value = task.dueDate;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskUpdates").value = task.notes || "";
}

function performTask(event) {
  event.preventDefault();
  const taskId = document.getElementById("performTaskSelect").value;
  const task = tasks.find(t => t.id == taskId);
  if (!task) return;

  task.status = document.getElementById("taskStatus").value;
  task.notes = document.getElementById("taskUpdates").value;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  alert("Task updated successfully!");
  updateAssignedTaskList();
  populateTaskOptions("performTaskSelect");
}

// ------------------ LOGOUT ------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "/html/loginpage.html";
});
