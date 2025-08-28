// shared.js - Shared module for all dashboards
export const DataService = {
    // User management
    getUsers: () => JSON.parse(localStorage.getItem('users')) || [],
    saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('loggedInUser')),

    // Task management
    getTasks: () => JSON.parse(localStorage.getItem('tasks')) || [],
    saveTasks: (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks)),

    // Comment management
    getComments: () => JSON.parse(localStorage.getItem('comments')) || [],
    saveComments: (comments) => localStorage.setItem('comments', JSON.stringify(comments)),

    // Helper methods
    getTaskById: (taskId) => {
        return DataService.getTasks().find(task => task.id === taskId);
    },
    getUserById: (userId) => {
        return DataService.getUsers().find(user => user.userId === userId);
    }
};

export const UIManager = {
    // Section management
    showSection: (sectionId) => {
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    },

    // Notification system
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <div class="notification-progress"></div>
        `;
        
        // Add to notification container or body
        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Form handling
    clearForm: (formId) => {
        const form = document.getElementById(formId);
        if (form) form.reset();
    },

    // Loading states
    setLoading: (element, isLoading) => {
        if (isLoading) {
            element.setAttribute('data-original-text', element.innerHTML);
            element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
            element.disabled = true;
        } else {
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.innerHTML = originalText;
                element.removeAttribute('data-original-text');
            }
            element.disabled = false;
        }
    }
};

export const Events = {
    TASK_UPDATED: 'task-updated',
    COMMENT_ADDED: 'comment-added',
    USER_UPDATED: 'user-updated',
    PROFILE_UPDATED: 'profile-updated'
};

export const NotificationManager = {
    showPermanentNotification: (message, type) => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} persistent`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-btn">&times;</button>
        `;
        
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });

        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);
    }
};