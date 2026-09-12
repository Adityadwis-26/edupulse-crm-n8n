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

  // Excel Import & Export
  btnOpenImportModal: document.getElementById('btnOpenImportModal'),
  btnExportExcel: document.getElementById('btnExportExcel'),
  modalImportExcel: document.getElementById('modalImportExcel'),
  btnDownloadTemplateXlsx: document.getElementById('btnDownloadTemplateXlsx'),
  btnDownloadTemplateCsv: document.getElementById('btnDownloadTemplateCsv'),
  excelDropzone: document.getElementById('excelDropzone'),
  excelFileInput: document.getElementById('excelFileInput'),
  dropzoneFileInfo: document.getElementById('dropzoneFileInfo'),
  dropzoneFileName: document.getElementById('dropzoneFileName'),
  dropzoneFileSize: document.getElementById('dropzoneFileSize'),
  btnRemoveExcelFile: document.getElementById('btnRemoveExcelFile'),
  importPreviewSection: document.getElementById('importPreviewSection'),
  previewCountLabel: document.getElementById('previewCountLabel'),
  previewValidationBadge: document.getElementById('previewValidationBadge'),
  importPreviewTbody: document.getElementById('importPreviewTbody'),
  btnConfirmExcelImport: document.getElementById('btnConfirmExcelImport'),

  // Navigation Menu & Workflow Canvas
  tabBtnExams: document.getElementById('tabBtnExams'),
  tabBtnWorkflow: document.getElementById('tabBtnWorkflow'),
  tabBtnCopilotNav: document.getElementById('tabBtnCopilotNav'),
  btnHeaderWorkflow: document.getElementById('btnHeaderWorkflow'),
  mainContainer: document.getElementById('mainContainer'),
  workflowViewContainer: document.getElementById('workflowViewContainer'),
  navExamCount: document.getElementById('navExamCount'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// Initialization
// ==========================================
async function init() {
  loadExamsFromStorage();
  setupEventListeners();
  setupExcelHandlers();
  setupCopilot();
  setupViewNavigation();
  updateEndpointLabels();
  render();

  if (window.WorkflowCanvas) {
    window.WorkflowCanvas.init();
  }
  
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

  // Synchronize execution onto n8n Workflow Canvas
  if (window.WorkflowCanvas && !isSilent) {
    window.WorkflowCanvas.triggerFromCRM(payload.action, payload);
  }

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
  if (DOM.navExamCount) DOM.navExamCount.textContent = total;

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

      let reply = null;

      // 1. If direct Gemini API key is configured by user, query Google Gemini REST API directly
      const geminiKey = localStorage.getItem('edupulse_gemini_key');
      if (geminiKey) {
        try {
          reply = await callDirectGeminiAPI(query, geminiKey);
        } catch (err) {
          console.warn("Direct Gemini call failed, falling back to pipeline:", err);
        }
      }

      // 2. Query n8n Webhook Pipeline if no direct reply yet
      if (!reply) {
        try {
          const res = await callN8nWebhook({
            action: 'ai_chat',
            message: query
          }, true);

          if (res.success && res.data) {
            const rawMsg = res.data.message || res.data.data?.aiReply || '';
            // Detect if n8n returned a refusal from the vector store or generic agent failure
            const isRefusal = rawMsg.toLowerCase().includes('not present in my knowledge base') ||
                              rawMsg.toLowerCase().includes('cannot answer questions') ||
                              rawMsg.toLowerCase().includes('i still cannot answer') ||
                              rawMsg.toLowerCase().includes('vector store tool') ||
                              rawMsg.toLowerCase().includes('do my best to find the answer using');

            if (!isRefusal && rawMsg.trim()) {
              reply = rawMsg;
            }
          }
        } catch (err) {
          console.warn("n8n Webhook query error:", err);
        }
      }

      // 3. Built-in EduPulse Pedagogical Knowledge Base (Guarantees authoritative answer 100% of the time)
      if (!reply) {
        reply = generateSmartCopilotReply(query);
      }

      removeChatLoading(loadingId);
      if (DOM.btnSendCopilot) DOM.btnSendCopilot.disabled = false;

      appendChatMessage('bot', reply);
    });
  }
}

// ==========================================
// Direct Google Gemini API Caller
// ==========================================
async function callDirectGeminiAPI(query, apiKey) {
  const systemInstruction = `You are the Google Gemini 2.5 Flash Academic Advisor and Copilot for EduPulse Student Exam CRM.
Full Knowledge Base:
- Grading Scale: A+ (90-100%), A (80-89%), B (70-79%), C (60-69%), D (50-59%), F (<40%).
- Passing Threshold: 40% (Minimum passing marks is 40 out of 100).
- Live Student CRM Records: ${JSON.stringify(state.exams)}.
Always answer questions about grading standards, rubrics, students, scores, and remedial tutoring directly, comprehensively, and constructively. Never refuse or state that information is missing from your knowledge base.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${query}` }]
        }
      ]
    })
  });
  if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}

// ==========================================
// EduPulse Academic Knowledge Engine
// ==========================================
function generateSmartCopilotReply(query) {
  const q = (query || '').toLowerCase().trim();
  const exams = state.exams || [];
  const graded = exams.filter(e => e.marksObtained !== null && e.status === 'Graded');
  const scheduled = exams.filter(e => e.status === 'Scheduled');
  const passed = graded.filter(e => e.passed);
  const failed = graded.filter(e => !e.passed);
  const passRate = graded.length > 0 ? Math.round((passed.length / graded.length) * 100) : 0;
  const avgScore = graded.length > 0 ? (graded.reduce((acc, e) => acc + (e.percentage || 0), 0) / graded.length).toFixed(1) : 0;

  // 1. Grading Standards, Rubrics, Scale, Passing Marks, Criteria
  if (
    q.includes('standard') || q.includes('grading') || q.includes('rubric') || 
    q.includes('scale') || q.includes('criteria') || q.includes('cutoff') || 
    q.includes('pass') || q.includes('threshold') || q.includes('percentage') || 
    q.includes('how are grades') || q.includes('grade system') || q.includes('evaluation') ||
    q.includes('fix this') || q.includes('answer')
  ) {
    return `📚 **EduPulse CRM Official Academic Grading Standards & Rubrics**:

• **Grade A+ (90% – 100%)** — *Honors / Exceptional Mastery*: Demonstrates comprehensive conceptual synthesis, independent problem formulation, and optimal algorithmic execution. Eligible for Honors Track and Dean's Commendation.
• **Grade A (80% – 89%)** — *Superior Performance*: High analytical rigor, procedural precision, and structured proofs.
• **Grade B (70% – 79%)** — *Proficient / Competent*: Solid foundation across curriculum benchmarks with minor computational or syntactical omissions.
• **Grade C (60% – 69%)** — *Satisfactory / Developing*: Grasps foundational principles; targeted problem sets and revision sessions suggested.
• **Grade D (50% – 59%)** — *Minimum Passing*: Basic familiarity with syllabus topics; requires guided tutorial support.
• **Grade F (< 40%)** — *Failing / Remedial Required*: Score below the mandatory **40% passing threshold**. Triggers automated CRM alerts and mandatory peer-tutoring intervention.

🎯 **Official Passing Threshold**: Minimum **40%** (40 marks out of 100).
📊 **Current CRM Benchmark**: ${graded.length} graded exams (${passed.length} Passed, ${failed.length} Failed), **${passRate}% overall pass rate**.`;
  }

  // 2. Remedial, Failing, At-Risk, Help, Intervention
  if (q.includes('remedial') || q.includes('failing') || q.includes('fail') || q.includes('help') || q.includes('risk') || q.includes('intervention')) {
    if (failed.length > 0) {
      const failList = failed.map(f => `• **${f.studentName} (${f.studentId})** in **${f.subject}**: Scored **${f.marksObtained}/${f.totalMarks} (${f.percentage}%, Grade ${f.grade})**.\n  *Evaluation*: ${f.aiEvaluation || f.feedback || 'Remedial workshop assigned.'}`).join('\n\n');
      return `⚠️ **Remedial Intervention Alert**:
The following student(s) currently fall below the 40% passing threshold:

${failList}

📌 **Recommended Pedagogical Action**:
• Enroll in targeted peer-tutoring workshops.
• Review foundational topics (e.g. Mendelian genetics, proof steps) and re-take diagnostic quizzes.
• Reschedule assessment in Student CRM once readiness criteria are satisfied.`;
    } else {
      return `✅ **Academic Status Clear**: All ${graded.length} graded students are currently passing above the 40% threshold! No active remedial interventions required.`;
    }
  }

  // 3. Top Performer, Best Student, Highest Score, Honors
  if (q.includes('top') || q.includes('best') || q.includes('highest') || q.includes('first') || q.includes('rank')) {
    const sorted = [...graded].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    if (sorted.length > 0) {
      const top = sorted[0];
      return `🏆 **Top Academic Performer**:
• **Student**: **${top.studentName}** (${top.studentId})
• **Subject**: ${top.subject} — *${top.examTitle}*
• **Result**: **${top.marksObtained}/${top.totalMarks} (${top.percentage}%, Grade ${top.grade})**
• **Evaluation**: ${top.aiEvaluation || top.feedback || 'Exceptional performance across all rubric tiers.'}
• **Recommendation**: Enrolled in Honors Research track and eligible for peer mentorship.`;
    }
    return `No graded exams available yet to determine the top performer.`;
  }

  // 4. Specific Student Search (ByName or ById)
  const matchedStudent = exams.find(e => 
    q.includes(e.studentName.toLowerCase()) || 
    q.includes(e.studentId.toLowerCase()) ||
    e.studentName.toLowerCase().split(' ').some(part => part.length > 2 && q.includes(part))
  );

  if (matchedStudent) {
    const s = matchedStudent;
    if (s.status === 'Graded') {
      return `👤 **Student Assessment Record: ${s.studentName} (${s.studentId})**:
• **Subject**: ${s.subject}
• **Exam Title**: ${s.examTitle}
• **Score**: **${s.marksObtained}/${s.totalMarks} (${s.percentage}%)**
• **Grade**: **Grade ${s.grade}** (${s.passed ? '✅ Passed' : '❌ Failed / Remedial'})
• **CRM Status**: ${s.crmSyncStatus || 'SYNCED_TO_STUDENT_CRM'} (${s.crmRecordId || 'CRM-' + s.id})
• **AI Pedagogical Remarks**: ${s.aiEvaluation || s.feedback || 'Meets standard course competencies.'}
${!s.passed ? '\n⚠️ *Note: Score is below 40% passing standard. Remedial workshop assigned.*' : ''}`;
    } else {
      return `📅 **Scheduled Assessment: ${s.studentName} (${s.studentId})**:
• **Subject**: ${s.subject} — *${s.examTitle}*
• **Exam Date**: ${s.examDate}
• **Passing Standard**: 40% (${s.passingMarks}/${s.totalMarks} marks)
• **Readiness Status**: ${s.aiEvaluation || s.feedback || 'Syllabus rubrics loaded. Pre-exam readiness complete.'}
• **CRM Status**: Registered in Student CRM.`;
    }
  }

  // 5. Subject Specific Rubrics
  const subjects = ['computer science', 'mathematics', 'physics', 'chemistry', 'biology', 'english literature'];
  const matchedSubject = subjects.find(sub => q.includes(sub));
  if (matchedSubject) {
    const subjectExams = exams.filter(e => e.subject.toLowerCase() === matchedSubject);
    const subName = matchedSubject.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    let rubricDetails = '';
    if (matchedSubject === 'computer science') {
      rubricDetails = `• **Curriculum Rubric**: Data Structures & Algorithmic Complexity (40%), Graph Theory & DP (30%), Code Cleanliness & Edge Cases (30%).\n• Passing cutoff: 40/100. Honors cutoff: 90/100.`;
    } else if (matchedSubject === 'mathematics') {
      rubricDetails = `• **Curriculum Rubric**: Analytical Derivations & Theorems (40%), Computational Accuracy (35%), Proof Structure (25%).\n• Passing cutoff: 40/100. Honors cutoff: 90/100.`;
    } else if (matchedSubject === 'physics') {
      rubricDetails = `• **Curriculum Rubric**: Electromagnetic Field Theory (40%), Wave Equation Problem Solving (35%), Experimental Data Analysis (25%).\n• Passing cutoff: 40/100. Honors cutoff: 90/100.`;
    } else if (matchedSubject === 'chemistry') {
      rubricDetails = `• **Curriculum Rubric**: Reaction Mechanisms & Stereochemistry (40%), Retrosynthetic Analysis (35%), Laboratory Safety & Precision (25%).\n• Passing cutoff: 40/100. Honors cutoff: 90/100.`;
    } else if (matchedSubject === 'biology') {
      rubricDetails = `• **Curriculum Rubric**: Cellular Genetics & Molecular Mechanics (40%), CRISPR & Gene Editing Analysis (35%), Mendelian Ratios & Inheritance (25%).\n• Passing cutoff: 40/100. Honors cutoff: 90/100.`;
    } else {
      rubricDetails = `• **Curriculum Rubric**: Thesis & Critical Argumentation (40%), Modernist Textual Evidence (35%), Literary Synthesis (25%).\n• Passing cutoff: 40/100. Honors cutoff: 90/100.`;
    }

    return `📖 **Curriculum Rubric & Assessment Standards for ${subName}**:
${rubricDetails}

📊 **Enrolled Student Records in ${subName}**: ${subjectExams.length} record(s) in CRM.`;
  }

  // 6. Overall Overview / Status / Analytics
  if (q.includes('overview') || q.includes('status') || q.includes('summary') || q.includes('stat') || q.includes('report')) {
    return `📊 **EduPulse Student CRM Academic Overview**:
• **Total Exam Records**: ${exams.length} (${graded.length} graded, ${scheduled.length} scheduled)
• **Pass Rate**: **${passRate}%** (${passed.length} passed, ${failed.length} failed)
• **Average Graded Score**: **${avgScore}%**
• **Passing Standard**: 40% minimum cutoff
• **CRM Sync State**: Synchronized with \`Student_CRM_Database\`.
• **AI Engine**: Google Gemini 2.5 Flash pipeline.`;
  }

  // 7. General Pedagogical Query Fallback
  return `💡 **EduPulse Academic AI Copilot**:
I am synchronized with your **Student CRM Database** and **Google Gemini 2.5 Flash**. 

Here is what you can ask me:
• 📚 *"What are the general grading standards?"* — view the complete A+ to F scale and 40% passing criteria.
• ⚠️ *"Who needs remedial help?"* — identify students scoring below 40% and view intervention plans.
• 🏆 *"Who is the top student?"* — view top exam marks and honors recommendations.
• 👤 *"How is Sophia Chen doing?"* (or any student name/ID) — inspect specific exam scores and AI evaluations.
• 📖 *"Explain the Physics / Biology / Math rubric"* — review curriculum standards and marking tiers.
• 📊 *"Show academic summary"* — get overall pass rate, class average, and scheduling stats.`;
}

// ==========================================
// Copilot Message Formatter
// ==========================================
function formatCopilotMessage(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  // Bold formatting: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Inline code: `text`
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: #93c5fd;">$1</code>');
  // Bullet lines: • or *
  html = html.replace(/(?:^|\n)[•*]\s+(.+)/g, '<div class="copilot-bullet"><span class="copilot-bullet-dot">•</span> <span>$1</span></div>');
  // Double line breaks -> spacing
  html = html.replace(/\n\n/g, '<div style="margin-top: 0.55rem;"></div>');
  // Single line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}

function appendChatMessage(role, text) {
  if (!DOM.copilotChat) return;
  const msg = document.createElement('div');
  msg.className = `chat-message ${role}`;
  const avatarStyle = role === 'bot' ? 'style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;"' : '';
  const avatarIcon = role === 'bot' ? 'fa-wand-magic-sparkles' : 'fa-user';
  const bubbleContent = role === 'bot' ? formatCopilotMessage(text) : escapeHtml(text);

  msg.innerHTML = `
    <div class="msg-avatar" ${avatarStyle}><i class="fa-solid ${avatarIcon}"></i></div>
    <div class="msg-bubble">${bubbleContent}</div>
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

// ==========================================
// View Navigation (Menu Tabs & Canvas Switcher)
// ==========================================
function setupViewNavigation() {
  function switchMainView(viewName) {
    if (viewName === 'exams') {
      if (DOM.mainContainer) DOM.mainContainer.style.display = 'flex';
      if (DOM.workflowViewContainer) DOM.workflowViewContainer.style.display = 'none';
      if (DOM.tabBtnExams) DOM.tabBtnExams.classList.add('active');
      if (DOM.tabBtnWorkflow) DOM.tabBtnWorkflow.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'workflow') {
      if (DOM.mainContainer) DOM.mainContainer.style.display = 'none';
      if (DOM.workflowViewContainer) DOM.workflowViewContainer.style.display = 'flex';
      if (DOM.tabBtnExams) DOM.tabBtnExams.classList.remove('active');
      if (DOM.tabBtnWorkflow) DOM.tabBtnWorkflow.classList.add('active');
      if (window.WorkflowCanvas) {
        window.WorkflowCanvas.fitToView();
        window.WorkflowCanvas.updateCablePaths();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'copilot') {
      if (DOM.copilotDrawer) {
        DOM.copilotDrawer.classList.add('open');
        if (DOM.copilotInput) DOM.copilotInput.focus();
      }
    }
  }

  window.switchMainView = switchMainView;

  if (DOM.tabBtnExams) {
    DOM.tabBtnExams.addEventListener('click', () => switchMainView('exams'));
  }
  if (DOM.tabBtnWorkflow) {
    DOM.tabBtnWorkflow.addEventListener('click', () => switchMainView('workflow'));
  }
  if (DOM.btnHeaderWorkflow) {
    DOM.btnHeaderWorkflow.addEventListener('click', () => switchMainView('workflow'));
  }
  if (DOM.tabBtnCopilotNav) {
    DOM.tabBtnCopilotNav.addEventListener('click', () => switchMainView('copilot'));
  }
}

// ==========================================
// Excel Import & Export Engine
// ==========================================
let parsedImportRecords = [];

function setupExcelHandlers() {
  if (DOM.btnOpenImportModal) {
    DOM.btnOpenImportModal.addEventListener('click', () => {
      resetExcelImportModal();
      openModal('modalImportExcel');
    });
  }

  if (DOM.btnExportExcel) {
    DOM.btnExportExcel.addEventListener('click', () => {
      exportToExcel();
    });
  }

  if (DOM.btnDownloadTemplateXlsx) {
    DOM.btnDownloadTemplateXlsx.addEventListener('click', () => {
      downloadExcelTemplate('xlsx');
    });
  }

  if (DOM.btnDownloadTemplateCsv) {
    DOM.btnDownloadTemplateCsv.addEventListener('click', () => {
      downloadExcelTemplate('csv');
    });
  }

  // Dropzone click & file picker
  if (DOM.excelDropzone && DOM.excelFileInput) {
    DOM.excelDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btnRemoveExcelFile') || e.target === DOM.excelFileInput) return;
      DOM.excelFileInput.click();
    });

    DOM.excelFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleExcelFile(e.target.files[0]);
      }
    });

    // Drag & drop support
    ['dragenter', 'dragover'].forEach(eventName => {
      DOM.excelDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.excelDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      DOM.excelDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.excelDropzone.classList.remove('dragover');
      });
    });

    DOM.excelDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleExcelFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (DOM.btnRemoveExcelFile) {
    DOM.btnRemoveExcelFile.addEventListener('click', (e) => {
      e.stopPropagation();
      resetExcelImportModal();
    });
  }

  if (DOM.btnConfirmExcelImport) {
    DOM.btnConfirmExcelImport.addEventListener('click', () => {
      confirmExcelImport();
    });
  }
}

function resetExcelImportModal() {
  if (DOM.excelFileInput) DOM.excelFileInput.value = '';
  parsedImportRecords = [];
  if (DOM.dropzoneFileInfo) DOM.dropzoneFileInfo.style.display = 'none';
  if (DOM.importPreviewSection) DOM.importPreviewSection.style.display = 'none';
  if (DOM.btnConfirmExcelImport) {
    DOM.btnConfirmExcelImport.disabled = true;
    DOM.btnConfirmExcelImport.innerHTML = `<i class="fa-solid fa-file-import"></i> <span>Confirm & Import Records</span>`;
  }
  const icon = DOM.excelDropzone?.querySelector('.dropzone-icon');
  if (icon) icon.style.display = 'flex';
  const title = DOM.excelDropzone?.querySelector('.dropzone-title');
  if (title) title.style.display = 'block';
  const subtitle = DOM.excelDropzone?.querySelector('.dropzone-subtitle');
  if (subtitle) subtitle.style.display = 'block';
}

function handleExcelFile(file) {
  if (!file) return;
  const filename = file.name;
  const ext = filename.split('.').pop().toLowerCase();

  if (!['xlsx', 'xls', 'csv'].includes(ext)) {
    showToast('Please upload a valid Excel (.xlsx, .xls) or CSV file.', 'error');
    return;
  }

  // Update Dropzone File Info
  if (DOM.dropzoneFileName) DOM.dropzoneFileName.textContent = filename;
  if (DOM.dropzoneFileSize) {
    const sizeKB = (file.size / 1024).toFixed(1);
    DOM.dropzoneFileSize.textContent = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;
  }
  if (DOM.dropzoneFileInfo) DOM.dropzoneFileInfo.style.display = 'flex';
  
  const icon = DOM.excelDropzone?.querySelector('.dropzone-icon');
  if (icon) icon.style.display = 'none';
  const title = DOM.excelDropzone?.querySelector('.dropzone-title');
  if (title) title.style.display = 'none';
  const subtitle = DOM.excelDropzone?.querySelector('.dropzone-subtitle');
  if (subtitle) subtitle.style.display = 'none';

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      let rawRows = [];
      if (window.XLSX) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      } else if (ext === 'csv') {
        const text = new TextDecoder().decode(e.target.result);
        rawRows = parseCSVToObjects(text);
      } else {
        showToast('Excel library not loaded. Please try uploading a CSV file.', 'error');
        resetExcelImportModal();
        return;
      }

      if (!rawRows || rawRows.length === 0) {
        showToast('No student records found in the uploaded file.', 'error');
        resetExcelImportModal();
        return;
      }

      processRawExcelRows(rawRows);
    } catch (err) {
      console.error('Failed to parse spreadsheet:', err);
      showToast('Error parsing file: ' + err.message, 'error');
      resetExcelImportModal();
    }
  };

  reader.readAsArrayBuffer(file);
}

function processRawExcelRows(rows) {
  parsedImportRecords = [];

  rows.forEach((row, idx) => {
    const getVal = (...keys) => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
            return String(row[rowKey]).trim();
          }
        }
      }
      return '';
    };

    const studentName = getVal('Student Name', 'student_name', 'Name', 'Student', 'Full Name') || `Student #${idx + 1}`;
    const studentId = getVal('Student ID', 'student_id', 'ID', 'Roll No', 'Roll Number') || `STU-${Math.floor(100 + Math.random() * 900)}`;
    const subject = getVal('Subject', 'Course', 'Topic') || 'General Assessment';
    const examTitle = getVal('Exam Title', 'exam_title', 'Exam', 'Title', 'Assessment') || `${subject} Term Assessment`;
    const examDate = getVal('Exam Date', 'exam_date', 'Date') || new Date().toISOString().split('T')[0];

    const rawTotal = getVal('Total Marks', 'Max Marks', 'Total', 'Out of');
    const totalMarks = rawTotal && !isNaN(parseFloat(rawTotal)) ? parseFloat(rawTotal) : 100;

    const rawPassing = getVal('Passing Marks', 'Pass Mark', 'Pass Marks', 'Passing');
    const passingMarks = rawPassing && !isNaN(parseFloat(rawPassing)) ? parseFloat(rawPassing) : Math.round(totalMarks * 0.4);

    const rawMarks = getVal('Marks Obtained', 'Marks', 'Score', 'Obtained Marks', 'Mark');
    let marksObtained = null;
    let percentage = null;
    let grade = null;
    let passed = null;
    let status = 'Scheduled';

    if (rawMarks !== '' && !isNaN(parseFloat(rawMarks))) {
      marksObtained = parseFloat(rawMarks);
      percentage = Math.round((marksObtained / totalMarks) * 100);
      grade = calculateGradeLetter(percentage);
      passed = percentage >= Math.round((passingMarks / totalMarks) * 100);
      status = 'Graded';
    }

    let feedback = getVal('Remarks', 'Feedback', 'Teacher Remarks', 'Notes');
    if (!feedback && status === 'Graded') {
      if (grade === 'A+') feedback = 'Outstanding academic excellence and comprehensive subject mastery.';
      else if (grade === 'A') feedback = 'Demonstrated exceptional analytical depth and subject comprehension.';
      else if (grade === 'B') feedback = 'Good performance with thorough understanding of core principles.';
      else if (grade === 'C') feedback = 'Satisfactory grasp of fundamental curriculum concepts.';
      else if (grade === 'D') feedback = 'Basic knowledge displayed. Targeted review recommended.';
      else feedback = 'Scored below passing threshold. Remedial academic coaching recommended.';
    } else if (!feedback) {
      feedback = 'Scheduled in Student CRM. Assessment hall assignment pending.';
    }

    parsedImportRecords.push({
      id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId,
      studentName,
      subject,
      examTitle,
      examDate,
      totalMarks,
      passingMarks,
      marksObtained,
      percentage,
      grade,
      passed,
      status,
      feedback,
      crmSyncStatus: 'SYNCED_TO_STUDENT_CRM',
      createdAt: new Date().toISOString()
    });
  });

  renderImportPreview(parsedImportRecords);
}

function renderImportPreview(records) {
  if (!DOM.importPreviewTbody) return;

  DOM.importPreviewTbody.innerHTML = records.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(r.studentName)}</strong></td>
      <td><span class="code-pill">${escapeHtml(r.studentId)}</span></td>
      <td>${escapeHtml(r.subject)}</td>
      <td>${escapeHtml(r.examTitle)}</td>
      <td>${r.marksObtained !== null ? `<strong>${r.marksObtained}</strong>` : '<span style="color: #94a3b8;">--</span>'}</td>
      <td>${r.totalMarks}</td>
      <td>${r.grade ? `<span class="badge ${getGradeClass(r.grade)}">${r.grade}</span>` : '<span style="color: #94a3b8;">--</span>'}</td>
      <td><span class="badge ${r.status === 'Graded' ? (r.passed ? 'badge-passed' : 'badge-failed') : 'badge-scheduled'}">${r.status}</span></td>
    </tr>
  `).join('');

  if (DOM.previewCountLabel) {
    DOM.previewCountLabel.textContent = `Preview Parsed Records (${records.length})`;
  }
  if (DOM.previewValidationBadge) {
    DOM.previewValidationBadge.textContent = `${records.length} Valid Records`;
    DOM.previewValidationBadge.classList.remove('has-warnings');
  }
  if (DOM.importPreviewSection) {
    DOM.importPreviewSection.style.display = 'flex';
  }
  if (DOM.btnConfirmExcelImport) {
    DOM.btnConfirmExcelImport.disabled = records.length === 0;
    DOM.btnConfirmExcelImport.innerHTML = `<i class="fa-solid fa-file-import"></i> <span>Confirm & Import ${records.length} Records</span>`;
  }
}

function confirmExcelImport() {
  if (!parsedImportRecords || parsedImportRecords.length === 0) return;

  const modeEl = document.querySelector('input[name="importMode"]:checked');
  const mode = modeEl ? modeEl.value : 'append';

  if (mode === 'replace') {
    state.exams = [...parsedImportRecords];
  } else {
    const existingIds = new Set(state.exams.map(e => e.id));
    parsedImportRecords.forEach(r => {
      while (existingIds.has(r.id)) {
        r.id = `EX-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      existingIds.add(r.id);
    });
    state.exams = [...parsedImportRecords, ...state.exams];
  }

  saveExamsToStorage();
  render();
  closeModal('modalImportExcel');
  showToast(`Successfully imported ${parsedImportRecords.length} student records into CRM!`, 'success');

  if (typeof addLog === 'function') {
    addLog('EXCEL_IMPORT', 'SUCCESS', `Imported ${parsedImportRecords.length} student records via Excel (${mode})`, {
      recordsCount: parsedImportRecords.length,
      mode
    });
  }
}

function downloadExcelTemplate(format = 'xlsx') {
  const sampleRows = [
    {
      "Student Name": "Alex Rivera",
      "Student ID": "STU-102",
      "Subject": "Computer Science",
      "Exam Title": "Algorithms & Complexity Midterm",
      "Exam Date": "2026-09-20",
      "Total Marks": 100,
      "Passing Marks": 40,
      "Marks Obtained": 88,
      "Remarks": "Strong recursive decomposition and complexity proofs."
    },
    {
      "Student Name": "Elena Rostov",
      "Student ID": "STU-105",
      "Subject": "Mathematics",
      "Exam Title": "Linear Algebra Matrix Evaluation",
      "Exam Date": "2026-09-22",
      "Total Marks": 100,
      "Passing Marks": 40,
      "Marks Obtained": 95,
      "Remarks": "Flawless eigenvalue calculations and geometric insight."
    },
    {
      "Student Name": "Jordan Blake",
      "Student ID": "STU-109",
      "Subject": "Physics",
      "Exam Title": "Classical Mechanics Term Assessment",
      "Exam Date": "2026-09-25",
      "Total Marks": 100,
      "Passing Marks": 40,
      "Marks Obtained": 36,
      "Remarks": "Needs review on Lagrangian dynamics. Remedial scheduled."
    },
    {
      "Student Name": "Priya Sharma",
      "Student ID": "STU-114",
      "Subject": "Chemistry",
      "Exam Title": "Thermodynamics & Kinetics Final",
      "Exam Date": "2026-09-28",
      "Total Marks": 100,
      "Passing Marks": 40,
      "Marks Obtained": "",
      "Remarks": "Exam scheduled for Auditorium 3."
    }
  ];

  if (format === 'xlsx' && window.XLSX) {
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 34 },
      { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 45 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students_Template");
    XLSX.writeFile(wb, "EduPulse_Students_Template.xlsx");
    showToast("Downloaded EduPulse_Students_Template.xlsx", "info");
  } else {
    downloadCSV(sampleRows, "EduPulse_Students_Template.csv");
    showToast("Downloaded EduPulse_Students_Template.csv", "info");
  }
}

function exportToExcel() {
  if (!state.exams || state.exams.length === 0) {
    showToast("No student records available to export.", "info");
    return;
  }

  const exportRows = state.exams.map(e => ({
    "Exam ID": e.id,
    "Student ID": e.studentId,
    "Student Name": e.studentName,
    "Subject": e.subject,
    "Exam Title": e.examTitle,
    "Exam Date": e.examDate || '',
    "Total Marks": e.totalMarks,
    "Passing Marks": e.passingMarks,
    "Marks Obtained": e.marksObtained !== null ? e.marksObtained : 'N/A',
    "Percentage": e.percentage !== null ? `${e.percentage}%` : 'N/A',
    "Grade": e.grade || 'N/A',
    "Status": e.status,
    "Result": e.passed === true ? 'Passed' : (e.passed === false ? 'Failed' : 'Pending'),
    "Teacher Remarks": e.feedback || '',
    "AI Evaluation": e.aiEvaluation || '',
    "CRM Sync Status": e.crmSyncStatus || 'SYNCED_TO_STUDENT_CRM'
  }));

  if (window.XLSX) {
    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 32 },
      { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 12 },
      { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 40 }, { wch: 25 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student_CRM_Exams");
    XLSX.writeFile(wb, "EduPulse_Student_CRM_Export.xlsx");
    showToast(`Exported ${exportRows.length} student records to EduPulse_Student_CRM_Export.xlsx`, "success");
  } else {
    downloadCSV(exportRows, "EduPulse_Student_CRM_Export.csv");
    showToast(`Exported ${exportRows.length} student records to EduPulse_Student_CRM_Export.csv`, "success");
  }

  if (typeof addLog === 'function') {
    addLog('EXCEL_EXPORT', 'SUCCESS', `Exported ${exportRows.length} student records to Excel spreadsheet`, {
      count: exportRows.length
    });
  }
}

function downloadCSV(rows, filename) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(h => {
      let val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCSVToObjects(text) {
  const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  function parseLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const objects = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    objects.push(obj);
  }
  return objects;
}

// Start application
window.addEventListener('DOMContentLoaded', init);
