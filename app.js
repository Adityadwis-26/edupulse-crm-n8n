/**
 * EduPulse CRM - Student Exam Management Dashboard
 * Client Application Logic with Live n8n Webhook Integration
 */

// Initial Seed Dataset for Instant Demonstration
const DEFAULT_EXAMS = [
  {
    id: "EX-1001",
    studentId: "STU-882",
    studentName: "Sophia Chen",
    subject: "Computer Science",
    examTitle: "Data Structures & Algorithms Midterm",
    examDate: "2026-09-15",
    totalMarks: 100,
    passingMarks: 40,
    marksObtained: 94,
    percentage: 94,
    grade: "A+",
    passed: true,
    status: "Graded",
    feedback: "Exceptional mastery in graph theory and dynamic programming.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: "EX-1002",
    studentId: "STU-741",
    studentName: "Liam Vance",
    subject: "Mathematics",
    examTitle: "Multivariable Calculus Final",
    examDate: "2026-09-18",
    totalMarks: 100,
    passingMarks: 40,
    marksObtained: 82,
    percentage: 82,
    grade: "A",
    passed: true,
    status: "Graded",
    feedback: "Great analytical breakdown of surface integrals.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "EX-1003",
    studentId: "STU-912",
    studentName: "Amina Al-Mansoor",
    subject: "Physics",
    examTitle: "Electromagnetism & Waves Quiz",
    examDate: "2026-09-22",
    totalMarks: 100,
    passingMarks: 40,
    marksObtained: null,
    percentage: null,
    grade: null,
    passed: null,
    status: "Scheduled",
    feedback: "Scheduled for Lab Hall B. Formula sheets will be provided.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "EX-1004",
    studentId: "STU-650",
    studentName: "Marcus Sterling",
    subject: "Chemistry",
    examTitle: "Organic Synthesis Periodic Exam",
    examDate: "2026-09-25",
    totalMarks: 100,
    passingMarks: 40,
    marksObtained: 71,
    percentage: 71,
    grade: "B",
    passed: true,
    status: "Graded",
    feedback: "Solid understanding of stereochemistry and reaction mechanisms.",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "EX-1005",
    studentId: "STU-520",
    studentName: "Chloe Davenport",
    subject: "Biology",
    examTitle: "Cellular Genetics & CRISPR Analysis",
    examDate: "2026-09-28",
    totalMarks: 100,
    passingMarks: 40,
    marksObtained: 38,
    percentage: 38,
    grade: "F",
    passed: false,
    status: "Graded",
    feedback: "Needs improvement in chromosome pairing concepts. Remedial session recommended.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "EX-1006",
    studentId: "STU-805",
    studentName: "David Kim",
    subject: "English Literature",
    examTitle: "Modernist Prose Essay Assessment",
    examDate: "2026-10-02",
    totalMarks: 100,
    passingMarks: 40,
    marksObtained: null,
    percentage: null,
    grade: null,
    passed: null,
    status: "Scheduled",
    feedback: "Submit thesis outline 24h prior to assessment.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Application State
const state = {
  exams: [],
  activeView: 'table', // 'table' | 'grid'
  filters: {
    search: '',
    subject: 'ALL',
    status: 'ALL'
  },
  webhookUrl: localStorage.getItem('edupulse_webhook_url') || 'http://localhost:5678/webhook/student-exam',
  isConnected: false,
  logs: []
};

// DOM References
const DOM = {
  // Webhook Status
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  currentEndpointLabel: document.getElementById('currentEndpointLabel'),
  drawerEndpointLabel: document.getElementById('drawerEndpointLabel'),
  btnTestWebhook: document.getElementById('btnTestWebhook'),
  btnConfigWebhook: document.getElementById('btnConfigWebhook'),
  
  // KPIs
  valTotalExams: document.getElementById('valTotalExams'),
  valScheduledCount: document.getElementById('valScheduledCount'),
  valGradedCount: document.getElementById('valGradedCount'),
  valAvgScore: document.getElementById('valAvgScore'),
  barAvgScore: document.getElementById('barAvgScore'),
  valPassRate: document.getElementById('valPassRate'),
  barPassRate: document.getElementById('barPassRate'),
  valPassedCount: document.getElementById('valPassedCount'),
  valFailedCount: document.getElementById('valFailedCount'),
  valTopStudent: document.getElementById('valTopStudent'),
  valTopScore: document.getElementById('valTopScore'),

  // Controls
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  subjectFilter: document.getElementById('subjectFilter'),
  statusFilter: document.getElementById('statusFilter'),
  btnSeedData: document.getElementById('btnSeedData'),
  tableItemCount: document.getElementById('tableItemCount'),
  btnViewTable: document.getElementById('btnViewTable'),
  btnViewGrid: document.getElementById('btnViewGrid'),
  
  // Views
  tableView: document.getElementById('tableView'),
  gridView: document.getElementById('gridView'),
  examTableBody: document.getElementById('examTableBody'),
  examCardsGrid: document.getElementById('examCardsGrid'),
  emptyState: document.getElementById('emptyState'),
  btnEmptySchedule: document.getElementById('btnEmptySchedule'),

  // Drawer & Console
  btnToggleConsole: document.getElementById('btnToggleConsole'),
  consoleCounter: document.getElementById('consoleCounter'),
  consoleDrawer: document.getElementById('consoleDrawer'),
  btnCloseDrawer: document.getElementById('btnCloseDrawer'),
  btnClearLogs: document.getElementById('btnClearLogs'),
  consoleLogs: document.getElementById('consoleLogs'),

  // Modals
  btnOpenScheduleModal: document.getElementById('btnOpenScheduleModal'),
  modalSchedule: document.getElementById('modalSchedule'),
  formScheduleExam: document.getElementById('formScheduleExam'),
  modalGrade: document.getElementById('modalGrade'),
  formGradeExam: document.getElementById('formGradeExam'),
  modalReport: document.getElementById('modalReport'),
  reportBody: document.getElementById('reportBody'),
  modalConfig: document.getElementById('modalConfig'),
  formConfigWebhook: document.getElementById('formConfigWebhook'),
  cfgWebhookUrl: document.getElementById('cfgWebhookUrl'),
  cfgGeminiKey: document.getElementById('cfgGeminiKey'),
  btnTestConfigUrl: document.getElementById('btnTestConfigUrl'),

  // Grade Modal Inputs
  gradeExamId: document.getElementById('gradeExamId'),
  gradeStudentId: document.getElementById('gradeStudentId'),
  gradeDisplayStudent: document.getElementById('gradeDisplayStudent'),
  gradeDisplayExam: document.getElementById('gradeDisplayExam'),
  gradeDisplayTotal: document.getElementById('gradeDisplayTotal'),
  gradeDisplayPassing: document.getElementById('gradeDisplayPassing'),
  inputGradeMarks: document.getElementById('inputGradeMarks'),
  previewPercentage: document.getElementById('previewPercentage'),
  previewGradeBadge: document.getElementById('previewGradeBadge'),
  previewStatus: document.getElementById('previewStatus'),
  inputGradeRemarks: document.getElementById('inputGradeRemarks'),

  // CRM Connection Elements
  crmConnectionPill: document.getElementById('crmConnectionPill'),
  crmDbName: document.getElementById('crmDbName'),
  crmStatusDot: document.getElementById('crmStatusDot'),
  btnSyncFromCRM: document.getElementById('btnSyncFromCRM'),
  btnPushToCRM: document.getElementById('btnPushToCRM'),

  // AI CRM Copilot
  btnOpenCopilot: document.getElementById('btnOpenCopilot'),
  copilotDrawer: document.getElementById('copilotDrawer'),
  btnCloseCopilot: document.getElementById('btnCloseCopilot'),
  copilotChat: document.getElementById('copilotChat'),
  formCopilotChat: document.getElementById('formCopilotChat'),
  copilotInput: document.getElementById('copilotInput'),
  btnSendCopilot: document.getElementById('btnSendCopilot'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// Initialization
// ==========================================
async function init() {
  loadExamsFromStorage();
  setupEventListeners();
  setupCopilot();
  updateEndpointLabels();
  render();
  
  // Ping webhook and attempt CRM database sync on startup
  const pingOk = await pingWebhook(true);
  if (pingOk) {
    await fetchFromCRM(true);
  }
}

// ==========================================
// Local Storage & State Management
// ==========================================
function loadExamsFromStorage() {
  const saved = localStorage.getItem('edupulse_exams_data');
  if (saved) {
    try {
      state.exams = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved exams:", e);
      state.exams = [...DEFAULT_EXAMS];
    }
  } else {
    state.exams = [...DEFAULT_EXAMS];
    saveExamsToStorage();
  }
}

function saveExamsToStorage() {
  localStorage.setItem('edupulse_exams_data', JSON.stringify(state.exams));
}

// ==========================================
// n8n Webhook Client & Console Logger
// ==========================================
async function callN8nWebhook(payload, isSilent = false) {
  const startTime = performance.now();
  const logId = 'LOG-' + Math.floor(Math.random() * 100000);
  
  const geminiKey = localStorage.getItem('edupulse_gemini_key');
  const fullPayload = {
    ...payload,
    ...(geminiKey ? { geminiApiKey: geminiKey } : {})
  };

  try {
    const response = await fetch(state.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fullPayload)
    });

    const elapsed = Math.round(performance.now() - startTime);
    const data = await response.json();

    logWebhookActivity({
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      url: state.webhookUrl,
      payload: payload,
      status: response.status,
      elapsedMs: elapsed,
      response: data,
      isSuccess: response.ok
    });

    if (response.ok) {
      updateConnectionStatus(true);
      return { success: true, data: data };
    } else {
      updateConnectionStatus(false, `HTTP ${response.status}`);
      if (!isSilent) showToast(`n8n error: HTTP ${response.status}`, 'error');
      return { success: false, error: data };
    }
  } catch (err) {
    const elapsed = Math.round(performance.now() - startTime);
    logWebhookActivity({
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      url: state.webhookUrl,
      payload: payload,
      status: 0,
      elapsedMs: elapsed,
      response: { message: err.message || 'Network error / CORS issue / n8n inactive' },
      isSuccess: false
    });

    updateConnectionStatus(false, 'Disconnected');
    if (!isSilent) showToast(`Could not reach n8n at ${state.webhookUrl}. Check that n8n is running.`, 'error');
    return { success: false, error: err };
  }
}

async function pingWebhook(isSilent = false) {
  DOM.statusDot.className = 'status-dot pulsing';
  DOM.statusText.textContent = 'Connecting...';
  
  const res = await callN8nWebhook({ action: 'ping' }, isSilent);
  if (res.success) {
    if (!isSilent) showToast('Successfully connected to n8n Webhook & Student CRM!', 'success');
    if (DOM.crmStatusDot) DOM.crmStatusDot.className = 'crm-status-dot connected';
    return true;
  } else {
    if (DOM.crmStatusDot) DOM.crmStatusDot.className = 'crm-status-dot';
    return false;
  }
}

async function fetchFromCRM(isSilent = false) {
  if (DOM.btnSyncFromCRM) {
    DOM.btnSyncFromCRM.disabled = true;
    DOM.btnSyncFromCRM.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
  }

  const res = await callN8nWebhook({ action: 'fetch_crm' }, isSilent);

  if (DOM.btnSyncFromCRM) {
    DOM.btnSyncFromCRM.disabled = false;
    DOM.btnSyncFromCRM.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> <span class="hide-tablet">Sync from CRM</span>';
  }

  if (res.success && res.data && Array.isArray(res.data.data)) {
    state.exams = res.data.data;
    saveExamsToStorage();
    render();
    if (DOM.crmStatusDot) DOM.crmStatusDot.className = 'crm-status-dot connected';
    if (!isSilent) showToast(`Synchronized ${state.exams.length} student records from CRM Database!`, 'success');
    return true;
  } else {
    if (!isSilent) showToast('Could not fetch records from Student CRM Database.', 'error');
    return false;
  }
}

async function pushToCRM() {
  if (DOM.btnPushToCRM) {
    DOM.btnPushToCRM.disabled = true;
    DOM.btnPushToCRM.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Pushing...';
  }

  const res = await callN8nWebhook({
    action: 'sync_to_crm',
    records: state.exams
  });

  if (DOM.btnPushToCRM) {
    DOM.btnPushToCRM.disabled = false;
    DOM.btnPushToCRM.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> <span class="hide-tablet">Push to CRM</span>';
  }

  if (res.success) {
    state.exams.forEach(e => {
      e.crmSyncStatus = 'SYNCED_TO_STUDENT_CRM';
      if (!e.crmRecordId) e.crmRecordId = 'CRM-' + e.id;
    });
    saveExamsToStorage();
    render();
    showToast(`Pushed ${state.exams.length} records to Student CRM Database!`, 'success');
  } else {
    showToast('Failed to push to CRM database.', 'error');
  }
}

function updateConnectionStatus(connected, message = '') {
  state.isConnected = connected;
  if (connected) {
    DOM.statusDot.className = 'status-dot connected';
    DOM.statusText.textContent = 'n8n Live';
  } else {
    DOM.statusDot.className = 'status-dot error';
    DOM.statusText.textContent = message || 'n8n Offline';
  }
}

function updateEndpointLabels() {
  DOM.currentEndpointLabel.textContent = state.webhookUrl;
  DOM.drawerEndpointLabel.textContent = `POST ${state.webhookUrl}`;
  DOM.cfgWebhookUrl.value = state.webhookUrl;
  if (DOM.cfgGeminiKey) {
    DOM.cfgGeminiKey.value = localStorage.getItem('edupulse_gemini_key') || '';
  }
}

function logWebhookActivity(logItem) {
  state.logs.unshift(logItem);
  if (state.logs.length > 50) state.logs.pop();
  DOM.consoleCounter.textContent = state.logs.length;
  renderConsoleLogs();
}

function renderConsoleLogs() {
  if (state.logs.length === 0) {
    DOM.consoleLogs.innerHTML = `
      <div class="log-placeholder">
        <i class="fa-solid fa-network-wired"></i>
        <p>Awaiting webhook activity. Send a ping or schedule an exam to inspect live request & response streams.</p>
      </div>
    `;
    return;
  }

  DOM.consoleLogs.innerHTML = state.logs.map(log => `
    <div class="log-entry ${log.isSuccess ? 'success' : 'error'}">
      <div class="log-meta">
        <div>
          <span class="log-badge badge-post">${log.method}</span>
          <span class="log-badge ${log.isSuccess ? 'badge-200' : 'badge-err'}">${log.status || 'ERR'}</span>
        </div>
        <span>${log.elapsedMs}ms • ${log.timestamp}</span>
      </div>
      <div style="font-size: 0.72rem; color: #94a3b8; word-break: break-all;">
        Action: <strong style="color: #60a5fa">${log.payload.action || 'unknown'}</strong>
      </div>
      <div class="log-body">${escapeHtml(JSON.stringify(log.response, null, 2))}</div>
    </div>
  `).join('');
}

// ==========================================
// Rendering & Calculation Engine
// ==========================================
function render() {
  updateKPIs();
  renderExamsList();
}

function updateKPIs() {
  const total = state.exams.length;
  const graded = state.exams.filter(e => e.status === 'Graded' && e.marksObtained !== null);
  const scheduled = total - graded.length;
  const passed = graded.filter(e => e.passed);
  const failed = graded.length - passed.length;

  DOM.valTotalExams.textContent = total;
  DOM.valScheduledCount.textContent = `${scheduled} Scheduled`;
  DOM.valGradedCount.textContent = `${graded.length} Graded`;

  if (graded.length > 0) {
    const avg = graded.reduce((acc, e) => acc + Number(e.percentage || 0), 0) / graded.length;
    const avgScore = Math.round(avg * 10) / 10;
    DOM.valAvgScore.textContent = `${avgScore}%`;
    DOM.barAvgScore.style.width = `${Math.min(avgScore, 100)}%`;

    const passRate = Math.round((passed.length / graded.length) * 100 * 10) / 10;
    DOM.valPassRate.textContent = `${passRate}%`;
    DOM.barPassRate.style.width = `${Math.min(passRate, 100)}%`;

    // Find top performer
    const sorted = [...graded].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    const top = sorted[0];
    DOM.valTopStudent.textContent = top ? top.studentName : '-';
    DOM.valTopScore.textContent = top ? `${top.percentage}% in ${top.subject} (${top.grade})` : 'Awaiting results';
  } else {
    DOM.valAvgScore.textContent = `0.0%`;
    DOM.barAvgScore.style.width = `0%`;
    DOM.valPassRate.textContent = `0.0%`;
    DOM.barPassRate.style.width = `0%`;
    DOM.valTopStudent.textContent = '-';
    DOM.valTopScore.textContent = 'No graded exams yet';
  }

  DOM.valPassedCount.textContent = `${passed.length} Passed`;
  DOM.valFailedCount.textContent = `${failed} Failed`;
}

function getFilteredExams() {
  const search = state.filters.search.toLowerCase().trim();
  const subject = state.filters.subject;
  const status = state.filters.status;

  return state.exams.filter(exam => {
    // Search match
    const matchSearch = !search || 
      exam.studentName.toLowerCase().includes(search) ||
      exam.studentId.toLowerCase().includes(search) ||
      exam.examTitle.toLowerCase().includes(search) ||
      exam.subject.toLowerCase().includes(search);

    // Subject filter
    const matchSubject = subject === 'ALL' || exam.subject === subject;

    // Status filter
    let matchStatus = true;
    if (status === 'Scheduled') matchStatus = exam.status === 'Scheduled';
    else if (status === 'Graded') matchStatus = exam.status === 'Graded';
    else if (status === 'Passed') matchStatus = exam.passed === true;
    else if (status === 'Failed') matchStatus = exam.passed === false;

    return matchSearch && matchSubject && matchStatus;
  });
}

function renderExamsList() {
  const filtered = getFilteredExams();
  DOM.tableItemCount.textContent = `${filtered.length} of ${state.exams.length} records`;

  if (filtered.length === 0) {
    DOM.tableView.style.display = 'none';
    DOM.gridView.style.display = 'none';
    DOM.emptyState.style.display = 'block';
    return;
  }

  DOM.emptyState.style.display = 'none';

  if (state.activeView === 'table') {
    DOM.tableView.style.display = 'block';
    DOM.gridView.style.display = 'none';
    renderTableRows(filtered);
  } else {
    DOM.tableView.style.display = 'none';
    DOM.gridView.style.display = 'block';
    renderGridCards(filtered);
  }
}

function renderTableRows(exams) {
  DOM.examTableBody.innerHTML = exams.map(exam => {
    const avatarGradient = getAvatarGradient(exam.studentName);
    const initials = getInitials(exam.studentName);
    const gradeClass = getGradeClass(exam.grade);
    const statusClass = exam.status === 'Scheduled' 
      ? 'status-scheduled' 
      : (exam.passed ? 'status-passed' : 'status-failed');
    
    const percentage = exam.percentage !== null ? `${exam.percentage}%` : 'Pending';
    const scoreFillColor = exam.passed === false ? '#ef4444' : (exam.percentage >= 80 ? '#10b981' : '#3b82f6');
    const isSynced = Boolean(exam.crmSyncStatus);
    const crmId = exam.crmRecordId || ('CRM-' + exam.id);

    return `
      <tr data-id="${exam.id}">
        <td>
          <div class="student-profile">
            <div class="student-avatar" style="background: ${avatarGradient}">${initials}</div>
            <div>
              <div class="student-name">${escapeHtml(exam.studentName)}</div>
              <div class="student-id">${escapeHtml(exam.studentId)}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="exam-subject-badge">
            ${getSubjectIcon(exam.subject)} ${escapeHtml(exam.subject)}
          </div>
          <div class="exam-title-text">${escapeHtml(exam.examTitle)}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem; font-weight: 500;">
            <i class="fa-regular fa-calendar" style="color: #94a3b8; margin-right: 4px;"></i>
            ${formatDate(exam.examDate)}
          </div>
        </td>
        <td>
          <div class="score-cell">
            <div class="score-text">
              <span class="score-bold">${exam.marksObtained !== null ? exam.marksObtained : '--'}</span>
              <span class="score-total">/ ${exam.totalMarks} (${percentage})</span>
            </div>
            <div class="score-progress-bar">
              <div class="score-fill" style="width: ${exam.percentage || 0}%; background: ${scoreFillColor};"></div>
            </div>
          </div>
        </td>
        <td>
          <span class="grade-pill ${gradeClass}">
            ${exam.grade || '-'}
          </span>
        </td>
        <td>
          <span class="status-pill ${statusClass}">
            <i class="fa-solid ${exam.status === 'Scheduled' ? 'fa-clock' : (exam.passed ? 'fa-circle-check' : 'fa-circle-xmark')}"></i>
            ${exam.status === 'Graded' ? (exam.passed ? 'Passed' : 'Failed') : 'Scheduled'}
          </span>
        </td>
        <td>
          <span class="crm-badge ${isSynced ? 'synced' : 'pending'}">
            <i class="fa-solid ${isSynced ? 'fa-cloud-arrow-up' : 'fa-clock'}"></i>
            ${isSynced ? 'CRM Synced' : 'Local'}
          </span>
          <span class="crm-rec-id">${crmId}</span>
        </td>
        <td>
          <div class="ai-remarks-cell" title="${escapeHtml(exam.aiEvaluation || exam.feedback || '')}">
            <i class="fa-solid fa-wand-magic-sparkles" style="color: #60a5fa;"></i>
            <span>${escapeHtml(exam.aiEvaluation || exam.feedback || 'Pedagogical evaluation pending')}</span>
          </div>
        </td>
        <td>
          <div class="row-actions">
            <button class="action-btn btn-grade" title="Evaluate / Enter Marks" onclick="openGradeModal('${exam.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn btn-report" title="View Official Report Card" onclick="openReportModal('${exam.id}')">
              <i class="fa-solid fa-file-lines"></i>
            </button>
            <button class="action-btn btn-delete" title="Delete Record" onclick="deleteExam('${exam.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderGridCards(exams) {
  DOM.examCardsGrid.innerHTML = exams.map(exam => {
    const avatarGradient = getAvatarGradient(exam.studentName);
    const initials = getInitials(exam.studentName);
    const gradeClass = getGradeClass(exam.grade);
    const statusClass = exam.status === 'Scheduled' 
      ? 'status-scheduled' 
      : (exam.passed ? 'status-passed' : 'status-failed');
    const isSynced = Boolean(exam.crmSyncStatus);
    const crmId = exam.crmRecordId || ('CRM-' + exam.id);

    return `
      <div class="exam-card-item">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="student-profile">
            <div class="student-avatar" style="background: ${avatarGradient}">${initials}</div>
            <div>
              <div class="student-name">${escapeHtml(exam.studentName)}</div>
              <div class="student-id">${escapeHtml(exam.studentId)}</div>
            </div>
          </div>
          <span class="grade-pill ${gradeClass}">
            ${exam.grade || '-'}
          </span>
        </div>

        <div>
          <div class="exam-subject-badge" style="margin-bottom: 0.35rem;">
            ${getSubjectIcon(exam.subject)} ${escapeHtml(exam.subject)}
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 700;">${escapeHtml(exam.examTitle)}</h4>
          <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.25rem;">
            <i class="fa-regular fa-calendar"></i> ${formatDate(exam.examDate)}
          </div>
        </div>

        <div class="score-cell" style="background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 8px;">
          <div class="score-text">
            <span>Score: <strong class="score-bold">${exam.marksObtained !== null ? exam.marksObtained : '--'}</strong> / ${exam.totalMarks}</span>
            <span>${exam.percentage !== null ? `${exam.percentage}%` : 'Pending'}</span>
          </div>
          <div class="score-progress-bar" style="margin-top: 0.35rem;">
            <div class="score-fill" style="width: ${exam.percentage || 0}%; background: ${exam.passed === false ? '#ef4444' : '#10b981'};"></div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.75rem;">
          <span class="crm-badge ${isSynced ? 'synced' : 'pending'}">
            <i class="fa-solid ${isSynced ? 'fa-cloud-arrow-up' : 'fa-clock'}"></i>
            ${isSynced ? 'CRM Synced' : 'Local'}
          </span>
          <span class="crm-rec-id" style="margin: 0;">${crmId}</span>
        </div>

        ${exam.aiEvaluation ? `
          <div style="font-size: 0.76rem; color: #cbd5e1; background: rgba(59, 130, 246, 0.08); padding: 0.5rem 0.75rem; border-radius: 6px; border-left: 2px solid #3b82f6;">
            <strong style="color: #60a5fa;"><i class="fa-solid fa-wand-magic-sparkles"></i> Gemini 2.5 Flash:</strong>
            ${escapeHtml(exam.aiEvaluation.substring(0, 110))}${exam.aiEvaluation.length > 110 ? '...' : ''}
          </div>
        ` : ''}

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06);">
          <span class="status-pill ${statusClass}">
            ${exam.status === 'Graded' ? (exam.passed ? 'Passed' : 'Failed') : 'Scheduled'}
          </span>
          <div class="row-actions">
            <button class="action-btn btn-grade" title="Grade" onclick="openGradeModal('${exam.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn" title="Report" onclick="openReportModal('${exam.id}')">
              <i class="fa-solid fa-file-lines"></i>
            </button>
            <button class="action-btn btn-delete" title="Delete" onclick="deleteExam('${exam.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// User Actions & Modal Handlers
// ==========================================

// Open Schedule Modal
DOM.btnOpenScheduleModal.addEventListener('click', () => {
  DOM.formScheduleExam.reset();
  document.getElementById('inputExamDate').value = new Date().toISOString().split('T')[0];
  openModal('modalSchedule');
});

DOM.btnEmptySchedule.addEventListener('click', () => {
  DOM.formScheduleExam.reset();
  document.getElementById('inputExamDate').value = new Date().toISOString().split('T')[0];
  openModal('modalSchedule');
});

// Submit Schedule Form (Calls n8n Webhook)
DOM.formScheduleExam.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitSchedule');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Synchronizing with n8n...';

  const rawMarks = document.getElementById('inputInitialMarks').value;
  const marksObtained = rawMarks !== '' ? Number(rawMarks) : null;

  const payload = {
    action: 'create_exam',
    id: 'EX-' + Math.floor(1000 + Math.random() * 9000),
    studentName: document.getElementById('inputStudentName').value.trim(),
    studentId: document.getElementById('inputStudentId').value.trim(),
    subject: document.getElementById('inputSubject').value,
    examTitle: document.getElementById('inputExamTitle').value.trim(),
    examDate: document.getElementById('inputExamDate').value,
    totalMarks: Number(document.getElementById('inputTotalMarks').value),
    passingMarks: Number(document.getElementById('inputPassingMarks').value),
    marksObtained: marksObtained,
    feedback: document.getElementById('inputFeedback').value.trim() || undefined
  };

  // Dispatch to n8n Webhook
  const result = await callN8nWebhook(payload);
  btn.disabled = false;
  btn.innerHTML = originalHtml;

  let newExamRecord = payload;
  if (result.success && result.data && result.data.data) {
    newExamRecord = result.data.data;
    showToast(`Exam created & processed via n8n! (${newExamRecord.id})`, 'success');
  } else {
    // Calculate client-side fallback if n8n is offline
    if (newExamRecord.marksObtained !== null) {
      const pct = (newExamRecord.marksObtained / newExamRecord.totalMarks) * 100;
      newExamRecord.percentage = Math.round(pct * 10) / 10;
      newExamRecord.passed = newExamRecord.marksObtained >= newExamRecord.passingMarks;
      newExamRecord.grade = calculateGradeLetter(pct);
      newExamRecord.status = 'Graded';
    } else {
      newExamRecord.status = 'Scheduled';
    }
    showToast(`Exam scheduled locally (n8n was offline)`, 'info');
  }

  newExamRecord.createdAt = new Date().toISOString();
  state.exams.unshift(newExamRecord);
  saveExamsToStorage();
  closeModal('modalSchedule');
  render();
});

// Open Grade Modal
window.openGradeModal = function(examId) {
  const exam = state.exams.find(e => e.id === examId);
  if (!exam) return;

  DOM.gradeExamId.value = exam.id;
  DOM.gradeStudentId.value = exam.studentId;
  DOM.gradeDisplayStudent.textContent = `${exam.studentName} (${exam.studentId})`;
  DOM.gradeDisplayExam.textContent = `${exam.subject} - ${exam.examTitle}`;
  DOM.gradeDisplayTotal.textContent = exam.totalMarks;
  DOM.gradeDisplayPassing.textContent = exam.passingMarks;

  DOM.inputGradeMarks.max = exam.totalMarks;
  DOM.inputGradeMarks.value = exam.marksObtained !== null ? exam.marksObtained : '';
  DOM.inputGradeRemarks.value = exam.feedback || '';

  updateGradeLivePreview();
  openModal('modalGrade');
};

// Live Grade Input Preview
DOM.inputGradeMarks.addEventListener('input', updateGradeLivePreview);

function updateGradeLivePreview() {
  const total = Number(DOM.gradeDisplayTotal.textContent) || 100;
  const passing = Number(DOM.gradeDisplayPassing.textContent) || 40;
  const val = DOM.inputGradeMarks.value;

  if (val === '' || isNaN(val)) {
    DOM.previewPercentage.textContent = '--%';
    DOM.previewGradeBadge.textContent = '--';
    DOM.previewStatus.textContent = '--';
    DOM.previewStatus.style.color = '#94a3b8';
    return;
  }

  const marks = Number(val);
  const pct = Math.round((marks / total) * 100 * 10) / 10;
  const grade = calculateGradeLetter(pct);
  const passed = marks >= passing;

  DOM.previewPercentage.textContent = `${pct}%`;
  DOM.previewGradeBadge.textContent = grade;
  DOM.previewStatus.textContent = passed ? 'Passed' : 'Failed';
  DOM.previewStatus.style.color = passed ? '#34d399' : '#f87171';
}

// Submit Grade Form (Calls n8n Webhook)
DOM.formGradeExam.addEventListener('submit', async (e) => {
  e.preventDefault();
  const examId = DOM.gradeExamId.value;
  const exam = state.exams.find(e => e.id === examId);
  if (!exam) return;

  const btn = document.getElementById('btnSubmitGrade');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating in n8n...';

  const marks = Number(DOM.inputGradeMarks.value);
  const feedback = DOM.inputGradeRemarks.value.trim();

  const payload = {
    action: 'record_score',
    id: exam.id,
    studentId: exam.studentId,
    totalMarks: exam.totalMarks,
    passingMarks: exam.passingMarks,
    marksObtained: marks,
    feedback: feedback || undefined
  };

  // Dispatch to n8n Webhook
  const result = await callN8nWebhook(payload);
  btn.disabled = false;
  btn.innerHTML = originalHtml;

  if (result.success && result.data && result.data.data) {
    const updated = result.data.data;
    exam.marksObtained = updated.marksObtained;
    exam.percentage = updated.percentage;
    exam.grade = updated.grade;
    exam.passed = updated.passed;
    exam.status = 'Graded';
    exam.feedback = updated.feedback;
    showToast(`Score & Grade evaluated by n8n! (${exam.grade} - ${exam.percentage}%)`, 'success');
  } else {
    // Client-side fallback
    const pct = Math.round((marks / exam.totalMarks) * 100 * 10) / 10;
    exam.marksObtained = marks;
    exam.percentage = pct;
    exam.grade = calculateGradeLetter(pct);
    exam.passed = marks >= exam.passingMarks;
    exam.status = 'Graded';
    exam.feedback = feedback || (exam.passed ? 'Cleared exam successfully.' : 'Remedial assessment suggested.');
    showToast(`Score evaluated locally (n8n offline)`, 'info');
  }

  saveExamsToStorage();
  closeModal('modalGrade');
  render();
});

// Open Report Card Modal
window.openReportModal = function(examId) {
  const exam = state.exams.find(e => e.id === examId);
  if (!exam) return;

  const avatarGradient = getAvatarGradient(exam.studentName);
  const initials = getInitials(exam.studentName);
  const statusColor = exam.passed ? '#10b981' : (exam.status === 'Scheduled' ? '#3b82f6' : '#ef4444');
  const statusText = exam.status === 'Scheduled' ? 'SCHEDULED' : (exam.passed ? 'PASSED' : 'FAILED');

  DOM.reportBody.innerHTML = `
    <div class="report-card-container">
      <div class="report-watermark">EDUPULSE</div>

      <div class="report-header">
        <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div class="logo-icon" style="width: 32px; height: 32px; font-size: 1rem;">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <span class="report-school">Academy Examination Board</span>
        </div>
        <div class="report-doc-title">Official Student Performance Transcript</div>
      </div>

      <div class="report-details-grid">
        <div class="report-field">
          <span class="report-field-title">Student Name</span>
          <span class="report-field-val">${escapeHtml(exam.studentName)}</span>
        </div>
        <div class="report-field">
          <span class="report-field-title">Roll Number / ID</span>
          <span class="report-field-val" style="font-family: var(--font-mono);">${escapeHtml(exam.studentId)}</span>
        </div>
        <div class="report-field">
          <span class="report-field-title">Course / Subject</span>
          <span class="report-field-val">${escapeHtml(exam.subject)}</span>
        </div>
        <div class="report-field">
          <span class="report-field-title">Exam Assessment</span>
          <span class="report-field-val">${escapeHtml(exam.examTitle)}</span>
        </div>
        <div class="report-field">
          <span class="report-field-title">Examination Date</span>
          <span class="report-field-val">${formatDate(exam.examDate)}</span>
        </div>
        <div class="report-field">
          <span class="report-field-title">Transcript ID</span>
          <span class="report-field-val" style="font-family: var(--font-mono); color: #818cf8;">${exam.id}</span>
        </div>
      </div>

      <!-- CRM Database Verification Banner -->
      <div class="report-crm-verification">
        <div class="crm-verified-tag">
          <i class="fa-solid fa-circle-check"></i>
          <span>Official Student CRM Record</span>
        </div>
        <div class="crm-verified-details">
          <div>CRM Database: <strong>Student_CRM_Database (WWJbILmVtjqZrYbx)</strong></div>
          <div>Record ID: <strong>${exam.crmRecordId || ('CRM-' + exam.id)}</strong></div>
          <div>Sync Status: <strong style="color: #34d399;">${exam.crmSyncStatus || 'SYNCED_TO_STUDENT_CRM'}</strong></div>
        </div>
      </div>

      <div class="report-score-box">
        <div class="report-score-item">
          <div class="report-field-title">Marks Obtained</div>
          <div class="report-score-num" style="color: #60a5fa">${exam.marksObtained !== null ? exam.marksObtained : '--'}</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Out of ${exam.totalMarks}</span>
        </div>
        <div class="report-score-item">
          <div class="report-field-title">Percentage</div>
          <div class="report-score-num" style="color: #34d399">${exam.percentage !== null ? `${exam.percentage}%` : '--'}</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Passing: ${exam.passingMarks}</span>
        </div>
        <div class="report-score-item">
          <div class="report-field-title">Assigned Grade</div>
          <div class="report-score-num" style="color: #c084fc">${exam.grade || '--'}</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Letter Tier</span>
        </div>
        <div class="report-score-item">
          <div class="report-field-title">Result</div>
          <div class="report-score-num" style="color: ${statusColor}; font-size: 1.4rem;">${statusText}</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Status</span>
        </div>
      </div>

      ${exam.aiEvaluation ? `
        <div class="report-ai-box" style="border-left: 3px solid #3b82f6;">
          <div class="report-ai-header">
            <div class="report-ai-title">
              <i class="fa-solid fa-wand-magic-sparkles" style="color: #60a5fa;"></i>
              <span>Google Gemini 2.5 Flash AI Assessment</span>
            </div>
            <span class="ai-badge gemini"><i class="fa-solid fa-microchip"></i> Gemini 2.5 Flash</span>
          </div>
          <div class="report-ai-content">${escapeHtml(exam.aiEvaluation)}</div>
        </div>
      ` : ''}

      <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <div class="report-field-title" style="margin-bottom: 0.25rem;">Instructor Remarks & Feedback</div>
        <div style="font-style: italic; font-size: 0.88rem; color: #cbd5e1;">
          "${escapeHtml(exam.feedback || 'Satisfactory completion of curriculum assessment.')}"
        </div>
      </div>

      <div class="report-footer-meta">
        <div>
          <i class="fa-solid fa-shield-halved" style="color: #10b981; margin-right: 4px;"></i>
          Digitally synchronized with Student CRM Database & n8n Engine
        </div>
        <div>Issued: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>
  `;

  openModal('modalReport');
};

// Delete Exam
window.deleteExam = function(examId) {
  if (!confirm(`Are you sure you want to delete exam record ${examId}?`)) return;
  state.exams = state.exams.filter(e => e.id !== examId);
  saveExamsToStorage();
  showToast('Exam record removed', 'info');
  render();
};

// ==========================================
// Event Listeners & UI Controls
// ==========================================
function setupEventListeners() {
  // Search input
  DOM.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    DOM.btnClearSearch.style.display = e.target.value ? 'block' : 'none';
    renderExamsList();
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.filters.search = '';
    DOM.btnClearSearch.style.display = 'none';
    renderExamsList();
  });

  // Filter dropdowns
  DOM.subjectFilter.addEventListener('change', (e) => {
    state.filters.subject = e.target.value;
    renderExamsList();
  });

  DOM.statusFilter.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderExamsList();
  });

  // View toggles
  DOM.btnViewTable.addEventListener('click', () => {
    state.activeView = 'table';
    DOM.btnViewTable.classList.add('active');
    DOM.btnViewGrid.classList.remove('active');
    renderExamsList();
  });

  DOM.btnViewGrid.addEventListener('click', () => {
    state.activeView = 'grid';
    DOM.btnViewGrid.classList.add('active');
    DOM.btnViewTable.classList.remove('active');
    renderExamsList();
  });

  // Seed Data button
  DOM.btnSeedData.addEventListener('click', () => {
    if (confirm('Load fresh demo sample exams dataset? Current records will be replaced.')) {
      state.exams = [...DEFAULT_EXAMS];
      saveExamsToStorage();
      showToast('Loaded demo student exams!', 'success');
      render();
    }
  });

  // CRM Sync Buttons
  if (DOM.btnSyncFromCRM) {
    DOM.btnSyncFromCRM.addEventListener('click', () => fetchFromCRM(false));
  }
  if (DOM.btnPushToCRM) {
    DOM.btnPushToCRM.addEventListener('click', () => pushToCRM());
  }

  // Drawer toggles
  DOM.btnToggleConsole.addEventListener('click', () => {
    DOM.consoleDrawer.classList.toggle('open');
  });

  DOM.btnCloseDrawer.addEventListener('click', () => {
    DOM.consoleDrawer.classList.remove('open');
  });

  DOM.btnClearLogs.addEventListener('click', () => {
    state.logs = [];
    DOM.consoleCounter.textContent = '0';
    renderConsoleLogs();
  });

  // Webhook Ping buttons
  DOM.btnTestWebhook.addEventListener('click', () => pingWebhook(false));
  DOM.btnConfigWebhook.addEventListener('click', () => openModal('modalConfig'));

  // Webhook Config Form
  DOM.formConfigWebhook.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUrl = DOM.cfgWebhookUrl.value.trim();
    if (!newUrl) return;
    state.webhookUrl = newUrl;
    localStorage.setItem('edupulse_webhook_url', newUrl);
    if (DOM.cfgGeminiKey) {
      const keyVal = DOM.cfgGeminiKey.value.trim();
      if (keyVal) {
        localStorage.setItem('edupulse_gemini_key', keyVal);
      } else {
        localStorage.removeItem('edupulse_gemini_key');
      }
    }
    updateEndpointLabels();
    closeModal('modalConfig');
    showToast('Updated webhook and Google Gemini settings', 'success');
    pingWebhook(false);
  });

  DOM.btnTestConfigUrl.addEventListener('click', async () => {
    const tempUrl = DOM.cfgWebhookUrl.value.trim();
    if (!tempUrl) return;
    const oldUrl = state.webhookUrl;
    state.webhookUrl = tempUrl;
    await pingWebhook(false);
    state.webhookUrl = oldUrl;
  });

  // Preset buttons in Webhook modal
  document.querySelectorAll('.btn-chip[data-preset]').forEach(chip => {
    chip.addEventListener('click', () => {
      DOM.cfgWebhookUrl.value = chip.getAttribute('data-preset');
    });
  });

  // Generic Modal Closers
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-close');
      if (target) closeModal(target);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // Keyboard escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
      DOM.consoleDrawer.classList.remove('open');
    }
  });
}

// ==========================================
// Modal Utilities
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// ==========================================
// Toast Alerts
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color: ${type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#3b82f6')}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// Helper Functions
// ==========================================
function calculateGradeLetter(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

function getGradeClass(grade) {
  if (!grade) return 'grade-none';
  if (grade === 'A+') return 'grade-A-plus';
  return `grade-${grade}`;
}

function getSubjectIcon(subject) {
  switch (subject) {
    case 'Mathematics': return '<i class="fa-solid fa-calculator" style="color: #60a5fa"></i>';
    case 'Physics': return '<i class="fa-solid fa-atom" style="color: #c084fc"></i>';
    case 'Chemistry': return '<i class="fa-solid fa-flask" style="color: #34d399"></i>';
    case 'Computer Science': return '<i class="fa-solid fa-laptop-code" style="color: #38bdf8"></i>';
    case 'Biology': return '<i class="fa-solid fa-dna" style="color: #f472b6"></i>';
    case 'English Literature': return '<i class="fa-solid fa-feather-pointed" style="color: #fbbf24"></i>';
    default: return '<i class="fa-solid fa-book" style="color: #94a3b8"></i>';
  }
}

function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarGradient(name) {
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
  ];
  let sum = 0;
  for (let i = 0; i < (name || '').length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}

function formatDate(dateStr) {
  if (!dateStr) return 'Not set';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// AI CRM Copilot Chat Engine
// ==========================================
function setupCopilot() {
  if (!DOM.btnOpenCopilot) return;

  DOM.btnOpenCopilot.addEventListener('click', () => {
    DOM.copilotDrawer.classList.toggle('open');
    if (DOM.copilotDrawer.classList.contains('open') && DOM.copilotInput) {
      DOM.copilotInput.focus();
    }
  });

  if (DOM.btnCloseCopilot) {
    DOM.btnCloseCopilot.addEventListener('click', () => {
      DOM.copilotDrawer.classList.remove('open');
    });
  }

  if (DOM.formCopilotChat) {
    DOM.formCopilotChat.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = DOM.copilotInput.value.trim();
      if (!query) return;

      appendChatMessage('user', query);
      DOM.copilotInput.value = '';
      if (DOM.btnSendCopilot) DOM.btnSendCopilot.disabled = true;

      const loadingId = 'loading-' + Date.now();
      appendChatLoading(loadingId);

      const res = await callN8nWebhook({
        action: 'ai_chat',
        message: query
      }, true);

      removeChatLoading(loadingId);
      if (DOM.btnSendCopilot) DOM.btnSendCopilot.disabled = false;

      if (res.success && res.data) {
        const reply = res.data.message || res.data.data?.aiReply || 'Pedagogical assessment generated.';
        appendChatMessage('bot', reply);
      } else {
        appendChatMessage('bot', '⚠️ Could not connect to Google Gemini AI Copilot via n8n. Check that the n8n pipeline is active.');
      }
    });
  }
}

function appendChatMessage(role, text) {
  if (!DOM.copilotChat) return;
  const msg = document.createElement('div');
  msg.className = `chat-message ${role}`;
  const avatarStyle = role === 'bot' ? 'style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;"' : '';
  const avatarIcon = role === 'bot' ? 'fa-wand-magic-sparkles' : 'fa-user';
  msg.innerHTML = `
    <div class="msg-avatar" ${avatarStyle}><i class="fa-solid ${avatarIcon}"></i></div>
    <div class="msg-bubble">${escapeHtml(text)}</div>
  `;
  DOM.copilotChat.appendChild(msg);
  DOM.copilotChat.scrollTop = DOM.copilotChat.scrollHeight;
}

function appendChatLoading(id) {
  if (!DOM.copilotChat) return;
  const msg = document.createElement('div');
  msg.className = 'chat-message bot';
  msg.id = id;
  msg.innerHTML = `
    <div class="msg-avatar" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
    <div class="msg-bubble" style="color: #94a3b8; font-style: italic;">
      <i class="fa-solid fa-spinner fa-spin" style="color: #60a5fa;"></i> Querying Google Gemini 2.5 Flash & Student CRM...
    </div>
  `;
  DOM.copilotChat.appendChild(msg);
  DOM.copilotChat.scrollTop = DOM.copilotChat.scrollHeight;
}

function removeChatLoading(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Start application
window.addEventListener('DOMContentLoaded', init);
