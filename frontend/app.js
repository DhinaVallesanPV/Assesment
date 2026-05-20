/**
 * TaskFlow Frontend Client
 * Premium Single Page Application Engine
 */

// API Base URL Detection
// Falls back to localhost:8000 if hosted separately
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? (window.location.port === '8000' ? window.location.origin : 'http://localhost:8000')
    : window.location.origin;

// State Management
let state = {
    token: localStorage.getItem('taskflow_token') || '',
    userEmail: localStorage.getItem('taskflow_email') || '',
    tasks: [],
    currentPage: 1,
    limit: 5, // Small page limit to easily show off pagination
    currentFilter: 'all' // 'all', 'completed', 'pending'
};

// DOM Cache
const DOM = {
    toastContainer: document.getElementById('toast-container'),
    authSection: document.getElementById('auth-section'),
    dashboardSection: document.getElementById('dashboard-section'),
    userProfile: document.getElementById('user-profile'),
    displayEmail: document.getElementById('display-email'),
    btnLogout: document.getElementById('btn-logout'),
    
    // Auth Forms & Tabs
    tabLogin: document.getElementById('tab-login'),
    tabRegister: document.getElementById('tab-register'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    loginEmail: document.getElementById('login-email'),
    loginPass: document.getElementById('login-password'),
    registerEmail: document.getElementById('register-email'),
    registerPass: document.getElementById('register-password'),
    
    // Dashboard Forms
    createTaskForm: document.getElementById('create-task-form'),
    taskTitle: document.getElementById('task-title'),
    taskDesc: document.getElementById('task-desc'),
    taskCompleted: document.getElementById('task-completed'),
    
    // Stats
    statTotal: document.getElementById('stat-total'),
    statCompleted: document.getElementById('stat-completed'),
    statPending: document.getElementById('stat-pending'),
    
    // Tasks list & pagination
    tasksList: document.getElementById('tasks-list'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    paginationInfo: document.getElementById('pagination-info')
};

// 1. Toast Notification Generator
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    // Auto remove after 3.5s
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 2. Authentication UI Transitions
function updateAuthUI() {
    if (state.token) {
        // Authenticated State
        DOM.authSection.classList.add('hidden');
        DOM.dashboardSection.classList.remove('hidden');
        DOM.userProfile.classList.remove('hidden');
        DOM.displayEmail.textContent = state.userEmail;
        
        // Load Fresh Dashboard
        state.currentPage = 1;
        fetchTasks();
    } else {
        // Non-Authenticated State
        DOM.authSection.classList.remove('hidden');
        DOM.dashboardSection.classList.add('hidden');
        DOM.userProfile.classList.add('hidden');
        
        // Reset state
        state.tasks = [];
        state.userEmail = '';
        state.currentPage = 1;
    }
}

// Tab Switching
DOM.tabLogin.addEventListener('click', () => {
    DOM.tabLogin.classList.add('active');
    DOM.tabRegister.classList.remove('active');
    DOM.loginForm.classList.remove('hidden');
    DOM.registerForm.classList.add('hidden');
});

DOM.tabRegister.addEventListener('click', () => {
    DOM.tabRegister.classList.add('active');
    DOM.tabLogin.classList.remove('active');
    DOM.registerForm.classList.remove('hidden');
    DOM.loginForm.classList.add('hidden');
});

// Logout
DOM.btnLogout.addEventListener('click', () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_email');
    state.token = '';
    state.userEmail = '';
    updateAuthUI();
    showToast('Signed out successfully. Come back soon!', 'success');
});

// 3. Register & Login Actions
DOM.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = DOM.registerEmail.value.trim();
    const password = DOM.registerPass.value;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }
        
        showToast('Registration successful! Please Sign In.', 'success');
        // Clear and switch to Login
        DOM.registerForm.reset();
        DOM.tabLogin.click();
        DOM.loginEmail.value = email;
    } catch (err) {
        showToast(err.message, 'error');
    }
});

DOM.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPass.value;
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Login failed. Check your credentials.');
        }
        
        // Save auth data
        localStorage.setItem('taskflow_token', data.access_token);
        localStorage.setItem('taskflow_email', email);
        state.token = data.access_token;
        state.userEmail = email;
        
        DOM.loginForm.reset();
        showToast(`Welcome back, ${email}!`, 'success');
        updateAuthUI();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// 4. Fetch Tasks & Render Dashboard
async function fetchTasks() {
    if (!state.token) return;
    
    // Calculate skip (offset)
    const skip = (state.currentPage - 1) * state.limit;
    
    // Construct Query String
    let queryParams = `?skip=${skip}&limit=${state.limit}`;
    if (state.currentFilter === 'completed') queryParams += `&completed=true`;
    if (state.currentFilter === 'pending') queryParams += `&completed=false`;
    
    try {
        const response = await fetch(`${API_BASE}/tasks${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            DOM.btnLogout.click();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to retrieve tasks');
        }
        
        const tasks = await response.json();
        state.tasks = tasks;
        
        // Load stats separately (we can fetch all active tasks in one go or calculate from metadata)
        // To accurately calculate stats, let's fetch all tasks (un-paginated) once or do a swift background fetch
        fetchStats();
        renderTasksList();
        updatePaginationControls();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Background fetch to ensure stats are calculated globally, not just on current page
async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE}/tasks?limit=1000`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (response.ok) {
            const allTasks = await response.json();
            const total = allTasks.length;
            const completed = allTasks.filter(t => t.completed).length;
            const pending = total - completed;
            
            DOM.statTotal.textContent = total;
            DOM.statCompleted.textContent = completed;
            DOM.statPending.textContent = pending;
        }
    } catch (err) {
        console.error("Stats fetching failed", err);
    }
}

function renderTasksList() {
    DOM.tasksList.innerHTML = '';
    
    if (state.tasks.length === 0) {
        DOM.tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-clipboard"></i>
                <p>No tasks found in this section.</p>
                <span style="font-size: 0.8rem; color: var(--text-dimmed);">Tasks you add will appear here</span>
            </div>
        `;
        return;
    }
    
    state.tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskCard.id = `task-${task.id}`;
        
        // Formatted timestamp
        const dateObj = new Date(task.created_at);
        const formattedDate = dateObj.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        taskCard.innerHTML = `
            <div class="task-left">
                <div class="task-checkbox-container">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskCompletion(${task.id}, ${task.completed})">
                        <i class="fa-solid fa-check"></i>
                    </div>
                </div>
                <div class="task-details">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                    ${task.description ? `<span class="task-description">${escapeHTML(task.description)}</span>` : ''}
                    <div class="task-meta">
                        <i class="fa-regular fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                </div>
            </div>
            <div class="task-right">
                <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete Task">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;
        DOM.tasksList.appendChild(taskCard);
    });
}

// 5. Create Task Action
DOM.createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = DOM.taskTitle.value.trim();
    const description = DOM.taskDesc.value.trim();
    const completed = DOM.taskCompleted.checked;
    
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ title, description, completed })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to create task');
        }
        
        showToast('Task created successfully!', 'success');
        DOM.createTaskForm.reset();
        fetchTasks();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// 6. Toggle Task Completion
window.toggleTaskCompletion = async function(id, currentStatus) {
    const taskCard = document.getElementById(`task-${id}`);
    const checkbox = taskCard.querySelector('.task-checkbox');
    
    // Optimistic UI update
    const nextStatus = !currentStatus;
    if (nextStatus) {
        taskCard.classList.add('completed');
        checkbox.classList.add('checked');
    } else {
        taskCard.classList.remove('completed');
        checkbox.classList.remove('checked');
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ completed: nextStatus })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update status on server');
        }
        
        showToast(nextStatus ? 'Task completed!' : 'Task active again', 'success');
        fetchTasks(); // Refresh to ensure backend ordering/sync
    } catch (err) {
        // Rollback on error
        if (currentStatus) {
            taskCard.classList.add('completed');
            checkbox.classList.add('checked');
        } else {
            taskCard.classList.remove('completed');
            checkbox.classList.remove('checked');
        }
        showToast(err.message, 'error');
    }
};

// 7. Delete Task
window.deleteTask = async function(id) {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        showToast('Task removed from workspace', 'success');
        
        // If we delete the last item on the page, move back a page
        if (state.tasks.length === 1 && state.currentPage > 1) {
            state.currentPage--;
        }
        
        fetchTasks();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

// 8. Pagination & Filtering Handlers
function updatePaginationControls() {
    DOM.paginationInfo.textContent = `Page ${state.currentPage}`;
    
    // Disable prev button if on page 1
    DOM.btnPrev.disabled = state.currentPage === 1;
    
    // If the returned tasks count matches the limit, there is highly likely a next page.
    // If it's less than the limit, we know for sure there is no next page.
    DOM.btnNext.disabled = state.tasks.length < state.limit;
}

DOM.btnPrev.addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        fetchTasks();
    }
});

DOM.btnNext.addEventListener('click', () => {
    if (state.tasks.length === state.limit) {
        state.currentPage++;
        fetchTasks();
    }
});

// Filtering tabs click handler
DOM.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        DOM.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        state.currentFilter = tab.getAttribute('data-filter');
        state.currentPage = 1; // Reset to page 1 on filter change
        fetchTasks();
    });
});

// Utility: Prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// 9. Initial Load Setup
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});
