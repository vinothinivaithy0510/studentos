/**
 * StudentOS - Your college life, organized.
 * 100% Frontend Static Application
 * Features: LocalStorage persistence, Dark mode, Task Manager, Assignment Tracker,
 * Exam Countdown, Study Planner, CGPA Calculator, Pomodoro, Notes, Resources.
 */

// ==========================================================================
// 1. DATA STORE & LOCAL STORAGE HELPERS
// ==========================================================================
const DB_KEYS = {
  TASKS: 'studentos_tasks',
  ASSIGNMENTS: 'studentos_assignments',
  EXAMS: 'studentos_exams',
  PLANNER: 'studentos_planner',
  CGPA: 'studentos_cgpa',
  NOTES: 'studentos_notes',
  RESOURCES: 'studentos_resources',
  THEME: 'studentos_theme',
  POMO_SESSIONS: 'studentos_pomo_sessions'
};

// Generic LocalStorage Loader
function getStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Error reading LocalStorage key:', key, e);
    return defaultValue;
  }
}

// Generic LocalStorage Saver
function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving LocalStorage key:', key, e);
  }
}

// Initial Data Structures
let tasks = getStorage(DB_KEYS.TASKS);
let assignments = getStorage(DB_KEYS.ASSIGNMENTS);
let exams = getStorage(DB_KEYS.EXAMS);
let plannerSessions = getStorage(DB_KEYS.PLANNER);
let cgpaCourses = getStorage(DB_KEYS.CGPA);
let quickNotes = getStorage(DB_KEYS.NOTES);
let resources = getStorage(DB_KEYS.RESOURCES);
let pomoSessionsCount = getStorage(DB_KEYS.POMO_SESSIONS, 0);

// ==========================================================================
// 2. APP INITIALIZATION & NAVIGATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDateDisplay();
  initQuotes();
  initNavigation();
  initModals();
  initPomodoro();
  initWordCounter();
  initPercentageCalc();
  initQuickNotes();
  initCgpaCalculator();
  
  // Initial renders
  renderAllViews();
  startGlobalTimers();

  // Load Sample Data event
  document.getElementById('loadDemoBtn').addEventListener('click', loadSampleData);
});

// Toast notification display helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

// Format date nicely
function initDateDisplay() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options);
  document.getElementById('todayDateDisplay').innerText = dateStr;

  // Set default date input values
  const isoDate = now.toISOString().split('T')[0];
  document.getElementById('plannerDateFilter').value = isoDate;
  document.getElementById('taskDueDate').value = isoDate;
  document.getElementById('examDate').value = isoDate;

  // Set greeting
  const hrs = now.getHours();
  let greeting = 'Good evening';
  if (hrs < 12) greeting = 'Good morning';
  else if (hrs < 17) greeting = 'Good afternoon';
  document.getElementById('greetingMessage').innerText = `${greeting}, Student! 👋`;
}

// Theme handling
function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem(DB_KEYS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(DB_KEYS.THEME, newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
  });
}

// Navigation & View switching
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  const sidebar = document.getElementById('sidebar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewTarget = btn.getAttribute('data-view');
      switchView(viewTarget);
      
      // Close mobile drawer if open
      sidebar.classList.remove('mobile-open');
    });
  });

  // Mobile menu triggers
  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
  });

  sidebarCloseBtn.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
  });
}

function switchView(viewName) {
  // Update sidebar buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update view sections
  document.querySelectorAll('.view-section').forEach(sec => {
    if (sec.id === `view-${viewName}`) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  // Update topbar title
  const titleMap = {
    dashboard: 'Dashboard',
    tasks: 'Task Manager',
    assignments: 'Assignment Tracker',
    exams: 'Exam Countdown',
    planner: 'Daily Study Planner',
    cgpa: 'CGPA & GPA Calculator',
    tools: 'Useful Student Tools',
    resources: 'Study Resources'
  };
  document.getElementById('pageTitle').innerText = titleMap[viewName] || 'StudentOS';

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-render target view to ensure fresh state
  renderAllViews();
}

// Motivational Quotes engine
const MOTIVATIONAL_QUOTES = [
  "Education is the most powerful weapon which you can use to change the world.",
  "The secret of getting ahead is getting started.",
  "Don't limit your challenges. Challenge your limits.",
  "Small daily improvements over time lead to stunning results.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your future is created by what you do today, not tomorrow.",
  "Believe you can and you're halfway there."
];

function initQuotes() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const nextQuoteBtn = document.getElementById('nextQuoteBtn');

  function randomQuote() {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    quoteDisplay.innerText = `"${MOTIVATIONAL_QUOTES[idx]}"`;
  }

  nextQuoteBtn.addEventListener('click', randomQuote);
  randomQuote();
}

// Modal handling
function initModals() {
  // Form Submit Listeners
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  document.getElementById('assignmentForm').addEventListener('submit', handleAssignmentSubmit);
  document.getElementById('examForm').addEventListener('submit', handleExamSubmit);
  document.getElementById('plannerForm').addEventListener('submit', handlePlannerSubmit);
  document.getElementById('resourceForm').addEventListener('submit', handleResourceSubmit);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Close modal on clicking backdrop
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});


// ==========================================================================
// 3. MASTER RENDER CONTROLLER
// ==========================================================================
function renderAllViews() {
  renderNavBadges();
  renderDashboard();
  renderTasks();
  renderAssignments();
  renderExams();
  renderPlanner();
  renderCgpa();
  renderResources();
}

function renderNavBadges() {
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const pendingAssign = assignments.filter(a => a.status !== 'Submitted').length;
  const upcomingExams = exams.length;

  document.getElementById('navTaskBadge').innerText = pendingTasks;
  document.getElementById('navAssignmentBadge').innerText = pendingAssign;
  document.getElementById('navExamBadge').innerText = upcomingExams;
}


// ==========================================================================
// 4. SECTION 1: DASHBOARD
// ==========================================================================
function renderDashboard() {
  // 1. Calculate Stats
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingAssign = assignments.filter(a => a.status !== 'Submitted').length;
  
  // Calculate Due Soon Assignments (deadline within next 48 hours)
  const now = new Date().getTime();
  const dueSoonAssign = assignments.filter(a => {
    if (a.status === 'Submitted') return false;
    const dueTime = new Date(a.deadline).getTime();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 48;
  }).length;

  // Upcoming Exams count & nearest preview
  const sortedExams = [...exams].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
  const futureExams = sortedExams.filter(e => new Date(`${e.date}T${e.time || '00:00'}`).getTime() > now);

  // Today's Study Hours calculation
  const todayIso = new Date().toISOString().split('T')[0];
  const todaySessions = plannerSessions.filter(s => s.date === todayIso);
  let totalStudyMinutes = 0;
  todaySessions.forEach(s => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    if (endMins > startMins) totalStudyMinutes += (endMins - startMins);
  });
  const studyHoursDecimal = (totalStudyMinutes / 60).toFixed(1);

  // Update Stat Elements
  document.getElementById('statPendingTasks').innerText = pendingTasks;
  document.getElementById('statCompletedTasks').innerText = `${completedTasks} completed`;
  document.getElementById('statUpcomingAssignments').innerText = pendingAssign;
  document.getElementById('statDueSoonAssignments').innerText = `${dueSoonAssign} due soon`;
  document.getElementById('statUpcomingExams').innerText = futureExams.length;
  
  if (futureExams.length > 0) {
    const nextExam = futureExams[0];
    document.getElementById('statNextExamTime').innerText = `Next: ${nextExam.subject}`;
  } else {
    document.getElementById('statNextExamTime').innerText = 'Next exam: None';
  }

  document.getElementById('statTodayStudyHours').innerText = `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`;
  document.getElementById('statSessionCount').innerText = `${todaySessions.length} sessions planned`;
  document.getElementById('heroStudyHours').innerText = `${studyHoursDecimal} hrs`;

  // 2. Render Today's Tasks Snippet in Dashboard
  const dashTaskList = document.getElementById('dashTaskList');
  if (tasks.length === 0) {
    dashTaskList.innerHTML = `<div class="empty-state" style="padding:1.5rem;"><p>No tasks yet. Add your first task!</p></div>`;
  } else {
    const topTasks = tasks.slice(0, 4);
    dashTaskList.innerHTML = topTasks.map(t => `
      <div class="dash-item">
        <div class="dash-item-left">
          <input type="checkbox" class="custom-checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTaskStatus('${t.id}')">
          <div>
            <div class="dash-item-title ${t.completed ? 'completed' : ''}">${t.title}</div>
            <div class="dash-item-sub">${t.subject} • Due: ${t.dueDate}</div>
          </div>
        </div>
        <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
      </div>
    `).join('');
  }

  // 3. Render Urgent Assignments Snippet
  const dashAssignmentList = document.getElementById('dashAssignmentList');
  if (assignments.length === 0) {
    dashAssignmentList.innerHTML = `<div class="empty-state" style="padding:1.5rem;"><p>No assignments tracked.</p></div>`;
  } else {
    const topAssign = assignments.slice(0, 3);
    dashAssignmentList.innerHTML = topAssign.map(a => {
      const isSubmitted = a.status === 'Submitted';
      return `
        <div class="dash-item">
          <div>
            <div class="dash-item-title">${a.title}</div>
            <div class="dash-item-sub">${a.subject} • ${new Date(a.deadline).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
          </div>
          <span class="badge ${isSubmitted ? 'badge-success' : 'badge-pending'}">${a.status}</span>
        </div>
      `;
    }).join('');
  }

  // 4. Render Next Exam Countdown Snippet
  const dashCountdownBox = document.getElementById('dashExamCountdownBox');
  if (futureExams.length === 0) {
    dashCountdownBox.innerHTML = `<h4>No upcoming exams.</h4><p class="text-muted">Relax or prepare ahead!</p>`;
  } else {
    const nextExam = futureExams[0];
    const examTimeStr = new Date(`${nextExam.date}T${nextExam.time || '00:00'}`).toLocaleString([], {weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
    dashCountdownBox.innerHTML = `
      <span class="badge badge-high">${nextExam.subject}</span>
      <h4 style="margin-top:0.4rem;">${nextExam.title || 'Upcoming Exam'}</h4>
      <div class="countdown-timer-large" id="dashCountdownDigits">--:--:--</div>
      <p class="dash-item-sub">${examTimeStr}</p>
    `;
  }

  // 5. Render Today's Planner Snippet
  const dashPlannerList = document.getElementById('dashPlannerList');
  if (todaySessions.length === 0) {
    dashPlannerList.innerHTML = `<div class="empty-state" style="padding:1.5rem;"><p>No study sessions scheduled for today.</p></div>`;
  } else {
    dashPlannerList.innerHTML = todaySessions.map(s => `
      <div class="dash-item">
        <div>
          <div class="dash-item-title">${s.subject}</div>
          <div class="dash-item-sub">${s.topic}</div>
        </div>
        <span class="badge badge-low">${s.startTime} - ${s.endTime}</span>
      </div>
    `).join('');
  }
}


// ==========================================================================
// 5. SECTION 2: TASK MANAGER
// ==========================================================================
let taskFilter = 'all';

function renderTasks() {
  const container = document.getElementById('tasksList');
  const searchVal = document.getElementById('taskSearchInput')?.value.toLowerCase() || '';

  // Setup filter buttons
  document.querySelectorAll('#taskStatusFilters .filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#taskStatusFilters .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      taskFilter = btn.getAttribute('data-filter');
      renderTasks();
    };
  });

  // Search input event
  const searchInput = document.getElementById('taskSearchInput');
  if (searchInput && !searchInput.dataset.listening) {
    searchInput.dataset.listening = 'true';
    searchInput.addEventListener('input', renderTasks);
  }

  let filtered = tasks.filter(t => {
    if (taskFilter === 'pending' && t.completed) return false;
    if (taskFilter === 'completed' && !t.completed) return false;
    if (searchVal && !t.title.toLowerCase().includes(searchVal) && !t.subject.toLowerCase().includes(searchVal)) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h4>No tasks found</h4>
        <p>No tasks match your current filter. Add a new task to stay organized!</p>
        <button class="btn btn-sm btn-primary" onclick="openModal('taskModal')">+ Add Task</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => `
    <div class="task-item-card ${t.completed ? 'completed' : ''}">
      <div class="task-left">
        <div class="custom-checkbox" onclick="toggleTaskStatus('${t.id}')">
          ${t.completed ? '✓' : ''}
        </div>
        <div class="task-details">
          <span class="task-title">${t.title}</span>
          <div class="task-meta">
            <span>📚 ${t.subject}</span>
            <span>📅 Due: ${t.dueDate}</span>
          </div>
        </div>
      </div>
      <div class="task-right">
        <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
        <button class="btn btn-xs btn-danger" onclick="deleteTask('${t.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function handleTaskSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const subject = document.getElementById('taskSubject').value.trim();
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDueDate').value;

  if (!title || !subject || !dueDate) return;

  const newTask = {
    id: Date.now().toString(),
    title,
    subject,
    priority,
    dueDate,
    completed: false
  };

  tasks.unshift(newTask);
  saveStorage(DB_KEYS.TASKS, tasks);
  closeModal('taskModal');
  document.getElementById('taskForm').reset();
  renderAllViews();
  showToast('Task added successfully! 🎉', 'success');
}

function toggleTaskStatus(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveStorage(DB_KEYS.TASKS, tasks);
  renderAllViews();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveStorage(DB_KEYS.TASKS, tasks);
  renderAllViews();
  showToast('Task deleted', 'info');
}


// ==========================================================================
// 6. SECTION 3: ASSIGNMENT TRACKER
// ==========================================================================
let assignmentFilter = 'all';

function renderAssignments() {
  const container = document.getElementById('assignmentsList');

  document.querySelectorAll('#assignmentFilters .filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#assignmentFilters .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      assignmentFilter = btn.getAttribute('data-filter');
      renderAssignments();
    };
  });

  const now = new Date().getTime();

  let filtered = assignments.filter(a => {
    if (assignmentFilter === 'pending' && a.status === 'Submitted') return false;
    if (assignmentFilter === 'submitted' && a.status !== 'Submitted') return false;
    if (assignmentFilter === 'duesoon') {
      if (a.status === 'Submitted') return false;
      const dueTime = new Date(a.deadline).getTime();
      const diffHours = (dueTime - now) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 48;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">📚</div>
        <h4>No assignments yet</h4>
        <p>Keep track of homework and lab reports here!</p>
        <button class="btn btn-sm btn-primary" onclick="openModal('assignmentModal')">+ Add Assignment</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(a => {
    const isSubmitted = a.status === 'Submitted';
    const dueTime = new Date(a.deadline).getTime();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);
    const isDueSoon = !isSubmitted && diffHours >= 0 && diffHours <= 48;

    const formattedDeadline = new Date(a.deadline).toLocaleString([], {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <div class="card assignment-card ${isSubmitted ? 'submitted' : ''} ${isDueSoon ? 'due-soon' : ''}">
        <div class="assignment-header">
          <div>
            <span class="assignment-subject">${a.subject}</span>
            <h3 class="assignment-title">${a.title}</h3>
          </div>
          ${isDueSoon ? `<span class="badge badge-alert">⚡ Due Soon</span>` : ''}
        </div>
        <div class="assignment-meta">
          <span class="text-muted">Deadline:</span> <strong>${formattedDeadline}</strong>
        </div>
        <div class="assignment-footer">
          <label class="due-indicator">
            <input type="checkbox" ${isSubmitted ? 'checked' : ''} onchange="toggleAssignmentStatus('${a.id}')">
            <span>${isSubmitted ? 'Submitted' : 'Mark as Submitted'}</span>
          </label>
          <button class="btn btn-xs btn-danger" onclick="deleteAssignment('${a.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function handleAssignmentSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('assignTitle').value.trim();
  const subject = document.getElementById('assignSubject').value.trim();
  const deadline = document.getElementById('assignDeadline').value;
  const status = document.getElementById('assignStatus').value;

  if (!title || !subject || !deadline) return;

  const newAssignment = {
    id: Date.now().toString(),
    title,
    subject,
    deadline,
    status
  };

  assignments.unshift(newAssignment);
  saveStorage(DB_KEYS.ASSIGNMENTS, assignments);
  closeModal('assignmentModal');
  document.getElementById('assignmentForm').reset();
  renderAllViews();
  showToast('Assignment added!', 'success');
}

function toggleAssignmentStatus(id) {
  assignments = assignments.map(a => a.id === id ? {
    ...a,
    status: a.status === 'Submitted' ? 'Pending' : 'Submitted'
  } : a);
  saveStorage(DB_KEYS.ASSIGNMENTS, assignments);
  renderAllViews();
}

function deleteAssignment(id) {
  assignments = assignments.filter(a => a.id !== id);
  saveStorage(DB_KEYS.ASSIGNMENTS, assignments);
  renderAllViews();
  showToast('Assignment removed', 'info');
}


// ==========================================================================
// 7. SECTION 4: EXAM COUNTDOWN
// ==========================================================================
function renderExams() {
  const container = document.getElementById('examsList');

  if (exams.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">⏱️</div>
        <h4>No upcoming exams</h4>
        <p>Add your midterms or finals to see live countdown timers!</p>
        <button class="btn btn-sm btn-primary" onclick="openModal('examModal')">+ Add Exam</button>
      </div>
    `;
    return;
  }

  // Sort exams chronologically
  const sorted = [...exams].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

  container.innerHTML = sorted.map(ex => {
    const examDateTimeStr = new Date(`${ex.date}T${ex.time || '00:00'}`).toLocaleString([], {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <div class="exam-card" id="exam-card-${ex.id}">
        <div>
          <span class="exam-subject-badge">${ex.subject}</span>
          <h3 class="exam-card-title">${ex.title || 'Exam'}</h3>
          <span class="exam-datetime">📅 ${examDateTimeStr}</span>
        </div>
        <div class="exam-countdown-box">
          <div class="countdown-digits" id="countdown-timer-${ex.id}">Calculating...</div>
        </div>
        <div>
          <button class="btn btn-xs btn-danger" onclick="deleteExam('${ex.id}')">Delete Exam</button>
        </div>
      </div>
    `;
  }).join('');

  updateExamCountdowns();
}

function updateExamCountdowns() {
  const now = new Date().getTime();

  // Update Exam page cards
  exams.forEach(ex => {
    const timerElem = document.getElementById(`countdown-timer-${ex.id}`);
    if (!timerElem) return;

    const examTime = new Date(`${ex.date}T${ex.time || '00:00'}`).getTime();
    const distance = examTime - now;

    if (distance < 0) {
      timerElem.innerText = 'PASSED / COMPLETED';
      timerElem.style.fontSize = '1rem';
      timerElem.style.color = 'var(--text-muted)';
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timerElem.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  });

  // Update Dashboard Next Exam Countdown Digits
  const dashTimerElem = document.getElementById('dashCountdownDigits');
  if (dashTimerElem && exams.length > 0) {
    const sorted = [...exams].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    const futureExams = sorted.filter(e => new Date(`${e.date}T${e.time || '00:00'}`).getTime() > now);

    if (futureExams.length > 0) {
      const nextExam = futureExams[0];
      const examTime = new Date(`${nextExam.date}T${nextExam.time || '00:00'}`).getTime();
      const distance = examTime - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      dashTimerElem.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }
}

function handleExamSubmit(e) {
  e.preventDefault();
  const subject = document.getElementById('examSubject').value.trim();
  const title = document.getElementById('examTitle').value.trim();
  const date = document.getElementById('examDate').value;
  const time = document.getElementById('examTime').value;

  if (!subject || !date || !time) return;

  const newExam = {
    id: Date.now().toString(),
    subject,
    title: title || 'Final Assessment',
    date,
    time
  };

  exams.push(newExam);
  saveStorage(DB_KEYS.EXAMS, exams);
  closeModal('examModal');
  document.getElementById('examForm').reset();
  renderAllViews();
  showToast('Exam added to countdown!', 'success');
}

function deleteExam(id) {
  exams = exams.filter(e => e.id !== id);
  saveStorage(DB_KEYS.EXAMS, exams);
  renderAllViews();
  showToast('Exam deleted', 'info');
}


// ==========================================================================
// 8. SECTION 5: STUDY PLANNER
// ==========================================================================
function renderPlanner() {
  const container = document.getElementById('plannerTimeline');
  const dateFilterInput = document.getElementById('plannerDateFilter');
  const targetDate = dateFilterInput ? dateFilterInput.value : new Date().toISOString().split('T')[0];

  // Set event listener once
  if (dateFilterInput && !dateFilterInput.dataset.listening) {
    dateFilterInput.dataset.listening = 'true';
    dateFilterInput.addEventListener('change', renderPlanner);
  }

  const dateSessions = plannerSessions.filter(s => s.date === targetDate);

  // Calculate planned hours for target date
  let totalMins = 0;
  dateSessions.forEach(s => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff > 0) totalMins += diff;
  });

  const hoursDecimal = (totalMins / 60).toFixed(1);
  document.getElementById('plannedHoursDisplay').innerText = `${hoursDecimal} Hours (${Math.floor(totalMins/60)}h ${totalMins%60}m)`;

  if (dateSessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="border:none;">
        <div class="empty-state-icon">📅</div>
        <h4>No study plan for this date</h4>
        <p>Plan out your revision slots to optimize your daily focus!</p>
        <button class="btn btn-sm btn-primary" onclick="openModal('plannerModal')">+ Add Study Session</button>
      </div>
    `;
    return;
  }

  // Sort sessions chronologically by start time
  const sorted = [...dateSessions].sort((a, b) => a.startTime.localeCompare(b.startTime));

  container.innerHTML = sorted.map(s => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div>
          <span class="timeline-time">⏰ ${s.startTime} - ${s.endTime}</span>
          <h4 class="timeline-subject">${s.subject}</h4>
          <span class="timeline-topic">${s.topic}</span>
        </div>
        <button class="btn btn-xs btn-danger" onclick="deletePlannerSession('${s.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

function handlePlannerSubmit(e) {
  e.preventDefault();
  const subject = document.getElementById('planSubject').value.trim();
  const topic = document.getElementById('planTopic').value.trim();
  const startTime = document.getElementById('planStartTime').value;
  const endTime = document.getElementById('planEndTime').value;
  const targetDate = document.getElementById('plannerDateFilter').value || new Date().toISOString().split('T')[0];

  if (!subject || !topic || !startTime || !endTime) return;

  const newSession = {
    id: Date.now().toString(),
    subject,
    topic,
    startTime,
    endTime,
    date: targetDate
  };

  plannerSessions.push(newSession);
  saveStorage(DB_KEYS.PLANNER, plannerSessions);
  closeModal('plannerModal');
  document.getElementById('plannerForm').reset();
  renderAllViews();
  showToast('Study session planned!', 'success');
}

function deletePlannerSession(id) {
  plannerSessions = plannerSessions.filter(s => s.id !== id);
  saveStorage(DB_KEYS.PLANNER, plannerSessions);
  renderAllViews();
  showToast('Session removed', 'info');
}


// ==========================================================================
// 9. SECTION 6: CGPA CALCULATOR
// ==========================================================================
function initCgpaCalculator() {
  document.getElementById('addCourseBtn').addEventListener('click', addCgpaRow);
  document.getElementById('resetCgpaBtn').addEventListener('click', resetCgpa);
  document.getElementById('gradeScaleSelect').addEventListener('change', renderCgpa);
}

function renderCgpa() {
  const tbody = document.getElementById('cgpaTableBody');
  const scale = document.getElementById('gradeScaleSelect').value;

  // Grade point mapping tables
  const scale10Points = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };
  const scale4Points = { 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0 };

  const gradeMap = scale === '10' ? scale10Points : scale4Points;

  // Render Grade Legend text
  const legendText = scale === '10' 
    ? 'O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5, P: 4, F: 0'
    : 'A: 4.0, A-: 3.7, B+: 3.3, B: 3.0, B-: 2.7, C+: 2.3, C: 2.0, D: 1.0, F: 0';
  document.getElementById('gradeLegendText').innerText = legendText;
  document.getElementById('cgpaScaleText').innerText = `out of ${scale === '10' ? '10.0' : '4.0'}`;

  if (cgpaCourses.length === 0) {
    // Add default row if empty
    cgpaCourses = [
      { id: '1', subject: 'Data Structures', credits: 4, grade: scale === '10' ? 'O' : 'A' },
      { id: '2', subject: 'Mathematics III', credits: 3, grade: scale === '10' ? 'A+' : 'B+' }
    ];
    saveStorage(DB_KEYS.CGPA, cgpaCourses);
  }

  tbody.innerHTML = cgpaCourses.map(c => {
    const gradeOptions = Object.keys(gradeMap).map(g => `
      <option value="${g}" ${c.grade === g ? 'selected' : ''}>${g} (${gradeMap[g]})</option>
    `).join('');

    const pt = gradeMap[c.grade] !== undefined ? (c.credits * gradeMap[c.grade]).toFixed(1) : '0.0';

    return `
      <tr>
        <td>
          <input type="text" class="form-control form-control-sm" value="${c.subject}" onchange="updateCgpaCourse('${c.id}', 'subject', this.value)">
        </td>
        <td>
          <input type="number" min="1" max="10" class="form-control form-control-sm" value="${c.credits}" onchange="updateCgpaCourse('${c.id}', 'credits', parseFloat(this.value)||0)">
        </td>
        <td>
          <select class="form-control form-control-sm" onchange="updateCgpaCourse('${c.id}', 'grade', this.value)">
            ${gradeOptions}
          </select>
        </td>
        <td><strong>${pt}</strong></td>
        <td>
          <button class="btn btn-xs btn-danger" onclick="deleteCgpaCourse('${c.id}')">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  // Compute CGPA Metrics
  let totalCredits = 0;
  let totalPoints = 0;

  cgpaCourses.forEach(c => {
    const pts = gradeMap[c.grade] !== undefined ? gradeMap[c.grade] : 0;
    const cred = Number(c.credits) || 0;
    totalCredits += cred;
    totalPoints += (pts * cred);
  });

  const cgpaResult = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  document.getElementById('cgpaTotalCredits').innerText = totalCredits;
  document.getElementById('cgpaTotalPoints').innerText = totalPoints.toFixed(1);
  document.getElementById('cgpaResultValue').innerText = cgpaResult;

  // Academic Standing calculation
  const val = parseFloat(cgpaResult);
  let honors = 'Academic Status: Good Standing';
  if (scale === '10') {
    if (val >= 9.0) honors = '🌟 First Class with Distinction';
    else if (val >= 7.5) honors = '✨ First Class';
    else if (val >= 6.0) honors = '👍 Second Class';
  } else {
    if (val >= 3.8) honors = '🌟 Summa Cum Laude / High Distinction';
    else if (val >= 3.5) honors = '✨ Magna Cum Laude / Distinction';
    else if (val >= 3.0) honors = '👍 Good Standing';
  }
  document.getElementById('cgpaHonorsBadge').innerText = honors;
}

function updateCgpaCourse(id, field, value) {
  cgpaCourses = cgpaCourses.map(c => c.id === id ? { ...c, [field]: value } : c);
  saveStorage(DB_KEYS.CGPA, cgpaCourses);
  renderCgpa();
}

function addCgpaRow() {
  const scale = document.getElementById('gradeScaleSelect').value;
  const newRow = {
    id: Date.now().toString(),
    subject: `New Subject ${cgpaCourses.length + 1}`,
    credits: 3,
    grade: scale === '10' ? 'A' : 'B'
  };
  cgpaCourses.push(newRow);
  saveStorage(DB_KEYS.CGPA, cgpaCourses);
  renderCgpa();
}

function deleteCgpaCourse(id) {
  cgpaCourses = cgpaCourses.filter(c => c.id !== id);
  saveStorage(DB_KEYS.CGPA, cgpaCourses);
  renderCgpa();
}

function resetCgpa() {
  if (confirm('Reset all CGPA course entries?')) {
    cgpaCourses = [];
    saveStorage(DB_KEYS.CGPA, cgpaCourses);
    renderCgpa();
    showToast('CGPA calculator reset', 'info');
  }
}


// ==========================================================================
// 10. SECTION 7: USEFUL STUDENT TOOLS
// ==========================================================================
// Tab switching inside Tools section
document.querySelectorAll('.tool-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const targetTool = btn.getAttribute('data-tool');
    document.getElementById(`tool-${targetTool}`).classList.add('active');
  });
});

// A) POMODORO TIMER
let pomoTimerInt = null;
let pomoMode = 'work'; // 'work' | 'shortBreak' | 'longBreak'
let pomoSecondsLeft = 25 * 60;
let pomoTotalDuration = 25 * 60;
let isPomoRunning = false;

function initPomodoro() {
  const startBtn = document.getElementById('pomoStartBtn');
  const pauseBtn = document.getElementById('pomoPauseBtn');
  const resetBtn = document.getElementById('pomoResetBtn');

  document.getElementById('pomoSessionsCount').innerText = pomoSessionsCount;

  // Mode Buttons
  document.querySelectorAll('.pomo-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      pomoMode = btn.getAttribute('data-mode');
      resetPomodoro();
    });
  });

  startBtn.addEventListener('click', startPomodoro);
  pauseBtn.addEventListener('click', pausePomodoro);
  resetBtn.addEventListener('click', resetPomodoro);

  updatePomoDisplay();
}

function startPomodoro() {
  if (isPomoRunning) return;
  isPomoRunning = true;
  document.getElementById('pomoStartBtn').disabled = true;
  document.getElementById('pomoPauseBtn').disabled = false;

  pomoTimerInt = setInterval(() => {
    pomoSecondsLeft--;
    updatePomoDisplay();

    if (pomoSecondsLeft <= 0) {
      clearInterval(pomoTimerInt);
      isPomoRunning = false;
      playBeepSound();

      if (pomoMode === 'work') {
        pomoSessionsCount++;
        saveStorage(DB_KEYS.POMO_SESSIONS, pomoSessionsCount);
        document.getElementById('pomoSessionsCount').innerText = pomoSessionsCount;
        showToast('Great job! 25 min focus complete. Take a break! ☕', 'success');
      } else {
        showToast('Break finished! Ready to focus again?', 'info');
      }

      resetPomodoro();
    }
  }, 1000);
}

function pausePomodoro() {
  clearInterval(pomoTimerInt);
  isPomoRunning = false;
  document.getElementById('pomoStartBtn').disabled = false;
  document.getElementById('pomoPauseBtn').disabled = true;
}

function resetPomodoro() {
  pausePomodoro();
  if (pomoMode === 'work') pomoTotalDuration = 25 * 60;
  else if (pomoMode === 'shortBreak') pomoTotalDuration = 5 * 60;
  else if (pomoMode === 'longBreak') pomoTotalDuration = 15 * 60;

  pomoSecondsLeft = pomoTotalDuration;
  updatePomoDisplay();
}

function updatePomoDisplay() {
  const mins = Math.floor(pomoSecondsLeft / 60);
  const secs = pomoSecondsLeft % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  document.getElementById('pomoTimeDisplay').innerText = formatted;

  // Ring Progress calculation (stroke-dashoffset)
  const ringFill = document.getElementById('pomoRingFill');
  if (ringFill) {
    const circumference = 2 * Math.PI * 100; // r=100 -> ~628
    const fraction = pomoSecondsLeft / pomoTotalDuration;
    const offset = circumference - (fraction * circumference);
    ringFill.style.strokeDashoffset = offset;
  }
}

// Synthesize pleasant chime using Web Audio API
function playBeepSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.log('Audio Context error', e);
  }
}

// B) WORD COUNTER
function initWordCounter() {
  const input = document.getElementById('wordCounterInput');
  const clearBtn = document.getElementById('clearTextBtn');

  input.addEventListener('input', () => {
    const text = input.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const readingTime = Math.ceil(words / 200);

    document.getElementById('wcWords').innerText = words;
    document.getElementById('wcChars').innerText = chars;
    document.getElementById('wcCharsNoSpace').innerText = charsNoSpace;
    document.getElementById('wcSentences').innerText = sentences;
    document.getElementById('wcReadingTime').innerText = `${readingTime} min`;
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
  });
}

// C) PERCENTAGE CALCULATOR
function initPercentageCalc() {
  const obtained = document.getElementById('calcMarksObtained');
  const max = document.getElementById('calcMarksMax');
  const simplePct = document.getElementById('calcSimplePct');
  const simpleTotal = document.getElementById('calcSimpleTotal');

  function updateMarksCalc() {
    const o = parseFloat(obtained.value) || 0;
    const m = parseFloat(max.value) || 0;
    const pct = m > 0 ? ((o / m) * 100).toFixed(2) : '0.00';
    document.getElementById('calcMarksResult').innerHTML = `Percentage: <strong>${pct}%</strong>`;
  }

  function updateSimpleCalc() {
    const p = parseFloat(simplePct.value) || 0;
    const t = parseFloat(simpleTotal.value) || 0;
    const res = ((p / 100) * t).toFixed(2);
    document.getElementById('calcSimpleResult').innerHTML = `Result: <strong>${res}</strong>`;
  }

  obtained.addEventListener('input', updateMarksCalc);
  max.addEventListener('input', updateMarksCalc);
  simplePct.addEventListener('input', updateSimpleCalc);
  simpleTotal.addEventListener('input', updateSimpleCalc);
}

// D) QUICK NOTES
const NOTE_COLORS = ['yellow', 'blue', 'purple', 'green', 'pink'];

function initQuickNotes() {
  document.getElementById('addNoteBtn').addEventListener('click', addNote);
  renderQuickNotes();
}

function renderQuickNotes() {
  const container = document.getElementById('notesContainer');

  if (quickNotes.length === 0) {
    quickNotes = [
      { id: '1', text: '💡 Study Group Meeting at 4:00 PM tomorrow in Library Lab 2', color: 'yellow', date: 'Oct 7' }
    ];
    saveStorage(DB_KEYS.NOTES, quickNotes);
  }

  container.innerHTML = quickNotes.map(n => `
    <div class="note-card color-${n.color}">
      <textarea class="note-textarea" placeholder="Type quick note..." oninput="updateNoteText('${n.id}', this.value)">${n.text}</textarea>
      <div class="note-footer">
        <span>${n.date}</span>
        <button class="note-delete-btn" onclick="deleteNote('${n.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function addNote() {
  const randomColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  const newNote = {
    id: Date.now().toString(),
    text: '',
    color: randomColor,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
  quickNotes.unshift(newNote);
  saveStorage(DB_KEYS.NOTES, quickNotes);
  renderQuickNotes();
}

function updateNoteText(id, text) {
  quickNotes = quickNotes.map(n => n.id === id ? { ...n, text } : n);
  saveStorage(DB_KEYS.NOTES, quickNotes);
}

function deleteNote(id) {
  quickNotes = quickNotes.filter(n => n.id !== id);
  saveStorage(DB_KEYS.NOTES, quickNotes);
  renderQuickNotes();
}


// ==========================================================================
// 11. SECTION 8: RESOURCES
// ==========================================================================
function renderResources() {
  const container = document.getElementById('resourcesList');

  if (resources.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🔗</div>
        <h4>No resources saved yet</h4>
        <p>Save important textbook links, lecture drives, and reference websites!</p>
        <button class="btn btn-sm btn-primary" onclick="openModal('resourceModal')">+ Save Resource</button>
      </div>
    `;
    return;
  }

  container.innerHTML = resources.map(r => `
    <div class="card resource-card">
      <div>
        <span class="badge badge-low">${r.subject}</span>
        <h3 style="margin-top:0.5rem; font-size:1.1rem;">${r.name}</h3>
        <p class="res-url">${r.url}</p>
      </div>
      <div class="flex-between" style="margin-top:1rem; border-top:1px solid var(--border-light); padding-top:0.75rem;">
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-primary">Open Link ↗️</a>
        <button class="btn btn-xs btn-danger" onclick="deleteResource('${r.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function handleResourceSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('resName').value.trim();
  const subject = document.getElementById('resSubject').value.trim();
  let url = document.getElementById('resUrl').value.trim();

  if (!name || !subject || !url) return;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const newResource = {
    id: Date.now().toString(),
    name,
    subject,
    url
  };

  resources.unshift(newResource);
  saveStorage(DB_KEYS.RESOURCES, resources);
  closeModal('resourceModal');
  document.getElementById('resourceForm').reset();
  renderAllViews();
  showToast('Resource link saved!', 'success');
}

function deleteResource(id) {
  resources = resources.filter(r => r.id !== id);
  saveStorage(DB_KEYS.RESOURCES, resources);
  renderAllViews();
  showToast('Resource deleted', 'info');
}


// ==========================================================================
// 12. GLOBAL TIMERS & SAMPLE DATA GENERATOR
// ==========================================================================
function startGlobalTimers() {
  // Update countdown timers every 1 second
  setInterval(updateExamCountdowns, 1000);
}

function loadSampleData() {
  if (confirm('Load sample student data into LocalStorage? This will populate tasks, assignments, exams, and study plans.')) {
    const todayIso = new Date().toISOString().split('T')[0];

    tasks = [
      { id: 't1', title: 'Complete Physics Lab Sheet 4', subject: 'Physics 101', priority: 'High', dueDate: todayIso, completed: false },
      { id: 't2', title: 'Read Chapter 3 on Binary Trees', subject: 'Data Structures', priority: 'Medium', dueDate: todayIso, completed: true },
      { id: 't3', title: 'Prepare presentation slides for Seminar', subject: 'Technical Writing', priority: 'Low', dueDate: todayIso, completed: false }
    ];

    assignments = [
      { id: 'a1', title: 'Algorithm Analysis Paper', subject: 'Computer Science', deadline: `${todayIso}T23:59`, status: 'Pending' },
      { id: 'a2', title: 'Database Normalization Homework', subject: 'DBMS', deadline: `${todayIso}T18:00`, status: 'Submitted' }
    ];

    // Set exam date 5 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureDateIso = futureDate.toISOString().split('T')[0];

    exams = [
      { id: 'e1', subject: 'Data Structures', title: 'Midterm Examination', date: futureDateIso, time: '10:00' },
      { id: 'e2', subject: 'Mathematics III', title: 'Quiz 2', date: futureDateIso, time: '14:30' }
    ];

    plannerSessions = [
      { id: 'p1', subject: 'Data Structures', topic: 'Practice Graph Traversal (DFS/BFS)', startTime: '09:00', endTime: '11:00', date: todayIso },
      { id: 'p2', subject: 'Physics 101', topic: 'Electromagnetism Problem Set', startTime: '14:00', endTime: '16:00', date: todayIso }
    ];

    cgpaCourses = [
      { id: 'c1', subject: 'Data Structures & Algorithms', credits: 4, grade: 'O' },
      { id: 'c2', subject: 'Database Management Systems', credits: 4, grade: 'A+' },
      { id: 'c3', subject: 'Discrete Mathematics', credits: 3, grade: 'A' },
      { id: 'c4', subject: 'Computer Networks', credits: 3, grade: 'B+' }
    ];

    resources = [
      { id: 'r1', name: 'MIT OpenCourseware - Algorithms', subject: 'CS', url: 'https://ocw.mit.edu' },
      { id: 'r2', name: 'Khan Academy Linear Algebra', subject: 'Math', url: 'https://www.khanacademy.org' }
    ];

    saveStorage(DB_KEYS.TASKS, tasks);
    saveStorage(DB_KEYS.ASSIGNMENTS, assignments);
    saveStorage(DB_KEYS.EXAMS, exams);
    saveStorage(DB_KEYS.PLANNER, plannerSessions);
    saveStorage(DB_KEYS.CGPA, cgpaCourses);
    saveStorage(DB_KEYS.RESOURCES, resources);

    renderAllViews();
    showToast('Sample student data loaded successfully! ⚡', 'success');
  }
}
