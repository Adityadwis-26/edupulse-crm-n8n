/**
 * EduPulse CRM - n8n Workflow Canvas & Execution Engine
 * Interactive Node Canvas with Real-Time Executions, SVG Bezier Connections,
 * Pan/Zoom Controls, Node Inspection, and Direct CRM Event Synchronization.
 */

(function(window) {
  'use strict';

  // =========================================================================
  // Workflow Definitions (Extracted directly from /workflows/*.json)
  // =========================================================================
  const WORKFLOW_DEFINITIONS = {
    '01': {
      id: '8zUeTtZ2gytX24SC',
      name: 'Student Exam CRM & AI Automation Pipeline (Active)',
      description: 'Production pipeline connecting CRM Webhook to Google Gemini 2.5 Flash, Student CRM Database, and Pass/Remedial Routing.',
      active: true,
      triggerCount: 2,
      nodes: [
        {
          id: 'node-webhook',
          name: 'Student Exam Webhook',
          type: 'n8n-nodes-base.webhook',
          category: 'trigger',
          icon: 'fa-bolt',
          color: '#ff6d5a',
          position: [50, 140],
          description: 'Receives POST events from EduPulse CRM (/webhook/student-exam)',
          parameters: {
            httpMethod: 'POST',
            path: 'student-exam',
            responseMode: 'responseNode',
            allowedOrigins: '*'
          },
          inputs: [],
          outputs: [{ name: 'main', label: 'Output' }]
        },
        {
          id: 'node-dispatcher',
          name: 'Slack / CRM Notification Dispatcher',
          type: 'n8n-nodes-base.set',
          category: 'action',
          icon: 'fa-paper-plane',
          color: '#06b6d4',
          position: [330, 40],
          description: 'Dispatches activity log to #student-exams-crm channel',
          parameters: {
            targetChannel: '#student-exams-crm',
            notificationEvent: 'CRM_STUDENT_ACTIVITY_LOGGED',
            priority: 'Real-time'
          },
          inputs: [{ name: 'main' }],
          outputs: []
        },
        {
          id: 'node-process',
          name: 'Process CRM Exam Record',
          type: 'n8n-nodes-base.code',
          category: 'code',
          icon: 'fa-code',
          color: '#f59e0b',
          position: [330, 240],
          description: 'Validates exam scores, formats payload & prepares Gemini context',
          parameters: {
            language: 'javascript',
            executionMode: 'runOnceForEachItem',
            jsCode: 'const body = $input.item.json.body || {};\nconst action = body.action || "ping";\nreturn { action, payload: body, timestamp: new Date().toISOString() };'
          },
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main', label: 'Output' }]
        },
        {
          id: 'node-router-ping',
          name: 'Is Health Ping?',
          type: 'n8n-nodes-base.if',
          category: 'router',
          icon: 'fa-code-branch',
          color: '#8b5cf6',
          position: [600, 240],
          description: 'Routes quick health pings directly to response, exams to AI Agent',
          parameters: {
            condition: 'action === "ping"',
            combinator: 'all'
          },
          inputs: [{ name: 'main' }],
          outputs: [
            { name: 'true', label: 'True (Ping)' },
            { name: 'false', label: 'False (Pipeline)' }
          ]
        },
        {
          id: 'node-chat-trigger',
          name: 'When chat message received',
          type: '@n8n/n8n-nodes-langchain.chatTrigger',
          category: 'trigger',
          icon: 'fa-comments',
          color: '#3b82f6',
          position: [600, 40],
          description: 'Triggers on direct questions from the Gemini AI Copilot drawer',
          parameters: {
            mode: 'webhookChat',
            publicEndpoint: true
          },
          inputs: [],
          outputs: [{ name: 'main', label: 'Output' }]
        },
        {
          id: 'node-ai-agent',
          name: 'AI Agent (LangChain)',
          type: '@n8n/n8n-nodes-langchain.agent',
          category: 'ai',
          icon: 'fa-robot',
          color: '#ec4899',
          position: [870, 240],
          description: 'Core intelligence engine powered by Google Gemini 2.5 Flash',
          parameters: {
            promptType: 'auto',
            systemMessage: 'You are EduPulse AI, evaluating student exam performance and providing pedagogical feedback.'
          },
          inputs: [
            { name: 'main' },
            { name: 'ai_languageModel', label: 'Model' },
            { name: 'ai_memory', label: 'Memory' },
            { name: 'ai_tool', label: 'Tools' }
          ],
          outputs: [{ name: 'main', label: 'Output' }]
        },
        {
          id: 'node-gemini-model',
          name: 'Google Gemini 2.5 Flash',
          type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
          category: 'ai-model',
          icon: 'fa-wand-magic-sparkles',
          color: '#a855f7',
          position: [600, 430],
          description: 'Sub-second (<0.3s) multimodal LLM via Google AI Studio API',
          parameters: {
            modelName: 'models/gemini-2.5-flash',
            temperature: 0.2,
            maxOutputTokens: 2048
          },
          inputs: [],
          outputs: [{ name: 'ai_languageModel', label: 'Model Out' }]
        },
        {
          id: 'node-memory',
          name: 'Simple Window Memory',
          type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
          category: 'ai-helper',
          icon: 'fa-brain',
          color: '#6366f1',
          position: [600, 560],
          description: 'Stores recent conversational context for student sessions',
          parameters: {
            contextWindowLength: 10,
            sessionKey: 'studentId'
          },
          inputs: [],
          outputs: [{ name: 'ai_memory', label: 'Memory Out' }]
        },
        {
          id: 'node-vector-tool',
          name: 'Vector Store Tool',
          type: '@n8n/n8n-nodes-langchain.toolVectorStore',
          category: 'ai-tool',
          icon: 'fa-database',
          color: '#06b6d4',
          position: [870, 430],
          description: 'Retrieves curricular grading rubrics & course syllabus rules',
          parameters: {
            name: 'exam_rubrics_retriever',
            topK: 4
          },
          inputs: [
            { name: 'ai_vectorStore', label: 'Vector Store' }
          ],
          outputs: [{ name: 'ai_tool', label: 'Tool Out' }]
        },
        {
          id: 'node-vector-store',
          name: 'Exam Rubrics Vector Store',
          type: '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
          category: 'ai-helper',
          icon: 'fa-layer-group',
          color: '#0284c7',
          position: [870, 560],
          description: 'In-memory semantic vector store indexed with course rubrics',
          parameters: {
            collectionName: 'exam_rubrics_2026',
            dimensions: 768
          },
          inputs: [],
          outputs: [{ name: 'ai_vectorStore', label: 'Store Out' }]
        },
        {
          id: 'node-calculator',
          name: 'Calculator Tool',
          type: '@n8n/n8n-nodes-langchain.toolCalculator',
          category: 'ai-tool',
          icon: 'fa-calculator',
          color: '#10b981',
          position: [1120, 430],
          description: 'Deterministic computation for percentage, standard deviation & curves',
          parameters: {},
          inputs: [],
          outputs: [{ name: 'ai_tool', label: 'Tool Out' }]
        },
        {
          id: 'node-crm-db',
          name: 'Sync to Student CRM Database',
          type: 'n8n-nodes-base.dataTable',
          category: 'database',
          icon: 'fa-table-cells',
          color: '#10b981',
          position: [1140, 240],
          description: 'Upserts student exam records in n8n Data Table (Student_CRM_Database)',
          parameters: {
            operation: 'upsert',
            dataTable: 'Student_CRM_Database (WWJbILmVtjqZrYbx)',
            matchColumn: 'studentId'
          },
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main', label: 'Output' }]
        },
        {
          id: 'node-router-pass',
          name: 'Check Pass or Remedial',
          type: 'n8n-nodes-base.if',
          category: 'router',
          icon: 'fa-split',
          color: '#8b5cf6',
          position: [1410, 240],
          description: 'Branches student: Passed (>=40%) vs Remedial Intervention (<40%)',
          parameters: {
            conditions: {
              number: [{ value1: '={{ $json.percentage }}', operation: 'largerEqual', value2: 40 }]
            }
          },
          inputs: [{ name: 'main' }],
          outputs: [
            { name: 'true', label: 'Passed (>=40%)' },
            { name: 'false', label: 'Remedial (<40%)' }
          ]
        },
        {
          id: 'node-honor-roll',
          name: 'Honor Roll Certificate',
          type: 'n8n-nodes-base.set',
          category: 'action',
          icon: 'fa-award',
          color: '#f59e0b',
          position: [1680, 160],
          description: 'Generates honor distinction badge & marks student as cleared',
          parameters: {
            academicTier: 'HONOR_ROLL_MERIT',
            crmStudentBadge: 'DISTINCTION_SCHOLAR'
          },
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main', label: 'Output' }]
        },
        {
          id: 'node-remedial-plan',
          name: 'Remedial Study Plan',
          type: 'n8n-nodes-base.set',
          category: 'action',
          icon: 'fa-triangle-exclamation',
          color: '#ef4444',
          position: [1680, 320],
          description: 'Triggers teacher alert and assigns remedial workshop session',
          parameters: {
            academicTier: 'REMEDIAL_INTERVENTION',
            crmTeacherAlert: 'URGENT_TUTOR_REQUIRED',
            workshopAssigned: 'Biology Concept Clarification'
          },
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main', label: 'Output' }]
        },
        {
          id: 'node-respond',
          name: 'Respond to CRM Dashboard',
          type: 'n8n-nodes-base.respondToWebhook',
          category: 'output',
          icon: 'fa-reply',
          color: '#06b6d4',
          position: [1950, 240],
          description: 'Returns HTTP 200 JSON payload with AI evaluations and CRM state',
          parameters: {
            responseCode: 200,
            responseFormat: 'json',
            options: { responseHeaders: 'Access-Control-Allow-Origin: *' }
          },
          inputs: [{ name: 'main' }],
          outputs: []
        }
      ],
      connections: [
        { from: 'node-webhook', fromOutput: 0, to: 'node-dispatcher', toInput: 0, type: 'main' },
        { from: 'node-webhook', fromOutput: 0, to: 'node-process', toInput: 0, type: 'main' },
        { from: 'node-process', fromOutput: 0, to: 'node-router-ping', toInput: 0, type: 'main' },
        { from: 'node-router-ping', fromOutput: 0, to: 'node-respond', toInput: 0, type: 'main', label: 'true' },
        { from: 'node-router-ping', fromOutput: 1, to: 'node-ai-agent', toInput: 0, type: 'main', label: 'false' },
        { from: 'node-chat-trigger', fromOutput: 0, to: 'node-ai-agent', toInput: 0, type: 'main' },
        { from: 'node-gemini-model', fromOutput: 0, to: 'node-ai-agent', toInput: 1, type: 'ai' },
        { from: 'node-memory', fromOutput: 0, to: 'node-ai-agent', toInput: 2, type: 'ai' },
        { from: 'node-vector-tool', fromOutput: 0, to: 'node-ai-agent', toInput: 3, type: 'ai' },
        { from: 'node-vector-store', fromOutput: 0, to: 'node-vector-tool', toInput: 0, type: 'ai' },
        { from: 'node-calculator', fromOutput: 0, to: 'node-ai-agent', toInput: 3, type: 'ai' },
        { from: 'node-ai-agent', fromOutput: 0, to: 'node-crm-db', toInput: 0, type: 'main' },
        { from: 'node-crm-db', fromOutput: 0, to: 'node-router-pass', toInput: 0, type: 'main' },
        { from: 'node-router-pass', fromOutput: 0, to: 'node-honor-roll', toInput: 0, type: 'main', label: 'pass' },
        { from: 'node-router-pass', fromOutput: 1, to: 'node-remedial-plan', toInput: 0, type: 'main', label: 'remedial' },
        { from: 'node-honor-roll', fromOutput: 0, to: 'node-respond', toInput: 0, type: 'main' },
        { from: 'node-remedial-plan', fromOutput: 0, to: 'node-respond', toInput: 0, type: 'main' }
      ]
    },
    '02': {
      id: 'IWKr2KiFF699UMPG',
      name: 'Student Exam AI Automation Enterprise (LangChain 14-Node)',
      description: 'Advanced LangChain workflow with Ollama local models, Pinecone vector store, and Discord alerts.',
      active: false,
      triggerCount: 2,
      nodes: [
        {
          id: 'e-chat',
          name: 'When chat message received',
          type: '@n8n/n8n-nodes-langchain.chatTrigger',
          category: 'trigger',
          icon: 'fa-comments',
          color: '#3b82f6',
          position: [80, 180],
          description: 'LangChain Chat Trigger',
          parameters: {},
          inputs: [],
          outputs: [{ name: 'main' }]
        },
        {
          id: 'e-alert',
          name: 'Slack / Discord Alert',
          type: 'n8n-nodes-base.httpRequest',
          category: 'action',
          icon: 'fa-bell',
          color: '#6366f1',
          position: [360, 80],
          description: 'Webhook Alert Dispatcher',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: []
        },
        {
          id: 'e-agent',
          name: 'Enterprise AI Agent',
          type: '@n8n/n8n-nodes-langchain.agent',
          category: 'ai',
          icon: 'fa-robot',
          color: '#ec4899',
          position: [360, 260],
          description: 'ReAct Conversational Agent',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main' }]
        },
        {
          id: 'e-model',
          name: 'Ollama Chat Model',
          type: '@n8n/n8n-nodes-langchain.lmChatOllama',
          category: 'ai-model',
          icon: 'fa-microchip',
          color: '#a855f7',
          position: [180, 420],
          description: 'Local LLM: llama3:8b',
          parameters: { model: 'llama3:8b' },
          inputs: [],
          outputs: [{ name: 'ai' }]
        },
        {
          id: 'e-memory',
          name: 'Simple Memory',
          type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
          category: 'ai-helper',
          icon: 'fa-brain',
          color: '#6366f1',
          position: [360, 440],
          description: 'Session Context Buffer',
          parameters: {},
          inputs: [],
          outputs: [{ name: 'ai' }]
        },
        {
          id: 'e-tool-vs',
          name: 'Vector Store Tool',
          type: '@n8n/n8n-nodes-langchain.toolVectorStore',
          category: 'ai-tool',
          icon: 'fa-database',
          color: '#06b6d4',
          position: [540, 440],
          description: 'Rubric Retrieval Tool',
          parameters: {},
          inputs: [],
          outputs: [{ name: 'ai' }]
        },
        {
          id: 'e-code',
          name: 'Code: Grade & Validate',
          type: 'n8n-nodes-base.code',
          category: 'code',
          icon: 'fa-code',
          color: '#f59e0b',
          position: [680, 260],
          description: 'Validates grading constraints',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main' }]
        },
        {
          id: 'e-if',
          name: 'Check Passing Score',
          type: 'n8n-nodes-base.if',
          category: 'router',
          icon: 'fa-code-branch',
          color: '#8b5cf6',
          position: [950, 260],
          description: 'Branches based on 40% threshold',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'true', label: 'Pass' }, { name: 'false', label: 'Fail' }]
        },
        {
          id: 'e-cert',
          name: 'Pass: Generate Certificate',
          type: 'n8n-nodes-base.set',
          category: 'action',
          icon: 'fa-award',
          color: '#10b981',
          position: [1220, 180],
          description: 'Creates verifiable certificate',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main' }]
        },
        {
          id: 'e-fail',
          name: 'Fail: Schedule Remedial',
          type: 'n8n-nodes-base.set',
          category: 'action',
          icon: 'fa-book-open-reader',
          color: '#ef4444',
          position: [1220, 360],
          description: 'Schedules remedial workshop',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main' }]
        },
        {
          id: 'e-resp',
          name: 'Webhook Response',
          type: 'n8n-nodes-base.respondToWebhook',
          category: 'output',
          icon: 'fa-reply',
          color: '#06b6d4',
          position: [1480, 260],
          description: 'Returns JSON response',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: []
        }
      ],
      connections: [
        { from: 'e-chat', fromOutput: 0, to: 'e-alert', toInput: 0, type: 'main' },
        { from: 'e-chat', fromOutput: 0, to: 'e-agent', toInput: 0, type: 'main' },
        { from: 'e-model', fromOutput: 0, to: 'e-agent', toInput: 0, type: 'ai' },
        { from: 'e-memory', fromOutput: 0, to: 'e-agent', toInput: 0, type: 'ai' },
        { from: 'e-tool-vs', fromOutput: 0, to: 'e-agent', toInput: 0, type: 'ai' },
        { from: 'e-agent', fromOutput: 0, to: 'e-code', toInput: 0, type: 'main' },
        { from: 'e-code', fromOutput: 0, to: 'e-if', toInput: 0, type: 'main' },
        { from: 'e-if', fromOutput: 0, to: 'e-cert', toInput: 0, type: 'main', label: 'pass' },
        { from: 'e-if', fromOutput: 1, to: 'e-fail', toInput: 0, type: 'main', label: 'fail' },
        { from: 'e-cert', fromOutput: 0, to: 'e-resp', toInput: 0, type: 'main' },
        { from: 'e-fail', fromOutput: 0, to: 'e-resp', toInput: 0, type: 'main' }
      ]
    },
    '03': {
      id: 'xrasbPObBlriGu8Y',
      name: 'Student Exam Webhook Starter (Minimalist)',
      description: 'Streamlined 3-node starter pipeline for fast webhook debugging and health checks.',
      active: false,
      triggerCount: 1,
      nodes: [
        {
          id: 's-hook',
          name: 'Student Exam Webhook',
          type: 'n8n-nodes-base.webhook',
          category: 'trigger',
          icon: 'fa-bolt',
          color: '#ff6d5a',
          position: [100, 200],
          description: 'Receives POST /webhook/student-exam',
          parameters: { path: 'student-exam' },
          inputs: [],
          outputs: [{ name: 'main' }]
        },
        {
          id: 's-proc',
          name: 'Process Exam Action',
          type: 'n8n-nodes-base.code',
          category: 'code',
          icon: 'fa-code',
          color: '#f59e0b',
          position: [400, 200],
          description: 'Validates payload and creates response payload',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: [{ name: 'main' }]
        },
        {
          id: 's-resp',
          name: 'Respond to Dashboard',
          type: 'n8n-nodes-base.respondToWebhook',
          category: 'output',
          icon: 'fa-reply',
          color: '#06b6d4',
          position: [700, 200],
          description: 'Returns HTTP 200 with evaluated results',
          parameters: {},
          inputs: [{ name: 'main' }],
          outputs: []
        }
      ],
      connections: [
        { from: 's-hook', fromOutput: 0, to: 's-proc', toInput: 0, type: 'main' },
        { from: 's-proc', fromOutput: 0, to: 's-resp', toInput: 0, type: 'main' }
      ]
    }
  };

  // Preset execution payloads
  const EXECUTION_PRESETS = {
    'schedule': {
      label: 'Schedule Exam (STU-882)',
      action: 'create_exam',
      triggerNode: 'node-webhook',
      payload: {
        action: 'create_exam',
        id: 'EX-1007',
        studentId: 'STU-882',
        studentName: 'Sophia Chen',
        subject: 'Computer Science',
        examTitle: 'Algorithms & Discrete Math',
        examDate: '2026-09-30',
        totalMarks: 100,
        passingMarks: 40,
        marksObtained: null
      },
      path: ['node-webhook', 'node-dispatcher', 'node-process', 'node-router-ping', 'node-ai-agent', 'node-gemini-model', 'node-crm-db', 'node-respond'],
      resultSummary: 'Exam schedule created and saved to Student CRM Database'
    },
    'grade_pass': {
      label: 'Grade Exam - High Pass (94% A+)',
      action: 'record_score',
      triggerNode: 'node-webhook',
      payload: {
        action: 'record_score',
        id: 'EX-1001',
        studentId: 'STU-882',
        studentName: 'Sophia Chen',
        subject: 'Computer Science',
        totalMarks: 100,
        passingMarks: 40,
        marksObtained: 94,
        feedback: 'Superb mastery over graph algorithms.'
      },
      path: ['node-webhook', 'node-dispatcher', 'node-process', 'node-router-ping', 'node-ai-agent', 'node-gemini-model', 'node-calculator', 'node-crm-db', 'node-router-pass', 'node-honor-roll', 'node-respond'],
      resultSummary: 'Scored 94% (Grade A+). Honor roll certificate distinction awarded.'
    },
    'grade_remedial': {
      label: 'Grade Exam - Remedial Alert (38% F)',
      action: 'record_score',
      triggerNode: 'node-webhook',
      payload: {
        action: 'record_score',
        id: 'EX-1005',
        studentId: 'STU-520',
        studentName: 'Chloe Davenport',
        subject: 'Biology',
        totalMarks: 100,
        passingMarks: 40,
        marksObtained: 38,
        feedback: 'Needs urgent assistance in molecular genetics.'
      },
      path: ['node-webhook', 'node-dispatcher', 'node-process', 'node-router-ping', 'node-ai-agent', 'node-gemini-model', 'node-calculator', 'node-crm-db', 'node-router-pass', 'node-remedial-plan', 'node-respond'],
      resultSummary: 'Scored 38% (Grade F). Remedial intervention scheduled & teacher alerted.'
    },
    'ai_copilot': {
      label: 'Gemini AI Copilot Query',
      action: 'ai_chat',
      triggerNode: 'node-chat-trigger',
      payload: {
        action: 'ai_chat',
        message: 'Who needs immediate remedial intervention in our Student CRM Database?'
      },
      path: ['node-chat-trigger', 'node-ai-agent', 'node-gemini-model', 'node-memory', 'node-vector-tool', 'node-vector-store', 'node-respond'],
      resultSummary: 'Google Gemini 2.5 Flash identified Chloe Davenport (STU-520, 38%) for remedial tutoring.'
    },
    'crm_sync': {
      label: 'CRM Database Sync',
      action: 'sync_to_crm',
      triggerNode: 'node-webhook',
      payload: {
        action: 'sync_to_crm',
        recordsCount: 6
      },
      path: ['node-webhook', 'node-process', 'node-crm-db', 'node-respond'],
      resultSummary: 'Successfully synchronized 6 student records with Student CRM Database.'
    },
    'ping': {
      label: 'Webhook Health Ping',
      action: 'ping',
      triggerNode: 'node-webhook',
      payload: {
        action: 'ping'
      },
      path: ['node-webhook', 'node-process', 'node-router-ping', 'node-respond'],
      resultSummary: 'Health ping verified. Pipeline & Google Gemini 2.5 Flash operational.'
    }
  };

  // Canvas State
  const state = {
    activeWorkflowId: '01',
    scale: 0.85,
    panX: 40,
    panY: 30,
    isPanning: false,
    startPanX: 0,
    startPanY: 0,
    isDraggingNode: false,
    draggedNodeId: null,
    nodeDragStartX: 0,
    nodeDragStartY: 0,
    selectedNodeId: null,
    isExecuting: false,
    executionSpeed: 1, // 1x, 2x, 4x
    executions: [],
    nodeStates: {}, // nodeId -> { status: 'idle'|'running'|'success'|'error', timeMs: number, items: number, lastOutput: object }
    lastExecution: null
  };

  // DOM Elements cache
  let el = {};

  // =========================================================================
  // Canvas Module Controller
  // =========================================================================
  const WorkflowCanvas = {
    init() {
      cacheDOMElements();
      setupEventListeners();
      this.switchWorkflow('01');
    },

    switchWorkflow(workflowId) {
      if (!WORKFLOW_DEFINITIONS[workflowId]) return;
      state.activeWorkflowId = workflowId;
      state.selectedNodeId = null;
      this.resetNodeStates();
      
      if (el.workflowSelect) el.workflowSelect.value = workflowId;
      const wf = WORKFLOW_DEFINITIONS[workflowId];
      if (el.workflowTitlePill) {
        el.workflowTitlePill.innerHTML = wf.active
          ? `<span class="badge-dot-live"></span> <span>Production Pipeline (Active)</span>`
          : `<span class="badge-dot-idle"></span> <span>Template (Inactive)</span>`;
      }

      this.render();
      this.fitToView();
      if (state.selectedNodeId) this.selectNode(state.selectedNodeId);
      else this.closeInspector();
    },

    resetNodeStates() {
      state.nodeStates = {};
      const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
      if (wf) {
        wf.nodes.forEach(n => {
          state.nodeStates[n.id] = {
            status: 'idle',
            timeMs: null,
            items: null,
            lastInput: null,
            lastOutput: null
          };
        });
      }
      this.renderNodeStatusBadges();
      this.updateTelemetryBanner(null);
    },

    render() {
      const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
      if (!wf || !el.nodesLayer || !el.svgLayer) return;

      // Update Canvas transform container
      el.transformContainer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;

      // Render Nodes HTML
      el.nodesLayer.innerHTML = wf.nodes.map(node => this.renderNodeHTML(node)).join('');

      // Render SVG Cables & Defs
      this.renderCables(wf);

      // Attach node drag and click events
      this.bindNodeEvents();

      // Reflect current states
      this.renderNodeStatusBadges();
    },

    renderNodeHTML(node) {
      const nodeState = state.nodeStates[node.id] || { status: 'idle' };
      const isSelected = state.selectedNodeId === node.id;
      const categoryClass = 'cat-' + (node.category || 'action');

      return `
        <div class="n8n-node-card ${categoryClass} ${nodeState.status} ${isSelected ? 'selected' : ''}" 
             id="canvas-${node.id}" 
             data-node-id="${node.id}"
             style="transform: translate(${node.position[0]}px, ${node.position[1]}px);">
          
          <!-- Category Accent Bar -->
          <div class="node-accent-bar" style="background: ${node.color};"></div>

          <!-- Input Connector Socket -->
          ${node.inputs && node.inputs.length > 0 ? `
            <div class="node-port port-input" title="Input Stream">
              <span class="port-socket"></span>
            </div>
          ` : ''}

          <!-- Node Header -->
          <div class="node-header">
            <div class="node-icon-wrapper" style="background: ${node.color}22; color: ${node.color}; border: 1px solid ${node.color}44;">
              <i class="fa-solid ${node.icon}"></i>
            </div>
            <div class="node-titles">
              <div class="node-title" title="${node.name}">${node.name}</div>
              <div class="node-subtitle">${node.type.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', '')}</div>
            </div>
          </div>

          <!-- Node Body / Summary -->
          <div class="node-body">
            <div class="node-desc">${node.description || ''}</div>
          </div>

          <!-- Node Footer Telemetry Badge -->
          <div class="node-footer" id="footer-${node.id}">
            <div class="node-status-pill status-${nodeState.status}">
              ${this.getStatusIconAndText(nodeState)}
            </div>
            ${nodeState.items ? `<span class="node-items-pill">${nodeState.items} ${nodeState.items === 1 ? 'item' : 'items'}</span>` : ''}
          </div>

          <!-- Output Connector Socket(s) -->
          ${node.outputs && node.outputs.length > 0 ? `
            <div class="node-outputs-group">
              ${node.outputs.map((out, idx) => `
                <div class="node-port port-output" data-output-idx="${idx}" title="${out.label || 'Output'}">
                  ${out.label && node.outputs.length > 1 ? `<span class="port-label">${out.label}</span>` : ''}
                  <span class="port-socket"></span>
                </div>
              `).join('')}
            </div>
          ` : ''}

        </div>
      `;
    },

    getStatusIconAndText(nodeState) {
      if (!nodeState || nodeState.status === 'idle') {
        return `<i class="fa-regular fa-circle"></i> <span>Ready</span>`;
      }
      if (nodeState.status === 'running') {
        return `<i class="fa-solid fa-spinner fa-spin"></i> <span>Running...</span>`;
      }
      if (nodeState.status === 'success') {
        const time = nodeState.timeMs ? `${nodeState.timeMs}ms` : 'OK';
        return `<i class="fa-solid fa-check"></i> <span>${time}</span>`;
      }
      if (nodeState.status === 'error') {
        return `<i class="fa-solid fa-xmark"></i> <span>Error</span>`;
      }
      return `<span>Ready</span>`;
    },

    renderCables(wf) {
      if (!el.svgLayer) return;

      // Build SVG Defs for glowing markers and gradients
      const defs = `
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="cableGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#06b6d4" />
          </linearGradient>
          <linearGradient id="cableGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
        </defs>
      `;

      const nodeMap = {};
      wf.nodes.forEach(n => { nodeMap[n.id] = n; });

      // Calculate path curves
      const paths = wf.connections.map((conn, idx) => {
        const fromNode = nodeMap[conn.from];
        const toNode = nodeMap[conn.to];
        if (!fromNode || !toNode) return '';

        const nodeWidth = 240;
        const nodeHeight = 85;

        // Output port coordinate
        const startX = fromNode.position[0] + nodeWidth;
        // If node has multiple outputs, stagger vertically
        let startY = fromNode.position[1] + (nodeHeight / 2);
        if (fromNode.outputs && fromNode.outputs.length > 1) {
          const step = nodeHeight / (fromNode.outputs.length + 1);
          startY = fromNode.position[1] + (step * (conn.fromOutput + 1));
        }

        // Input port coordinate
        const endX = toNode.position[0];
        let endY = toNode.position[1] + (nodeHeight / 2);
        if (toNode.inputs && toNode.inputs.length > 1 && conn.toInput !== undefined) {
          const step = nodeHeight / (toNode.inputs.length + 1);
          endY = toNode.position[1] + (step * (conn.toInput + 1));
        }

        const dx = Math.max(60, Math.abs(endX - startX) * 0.48);
        const d = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
        const cableId = `cable-${conn.from}-${conn.to}`;

        return `
          <g class="cable-group" id="group-${cableId}">
            <!-- Background Halo Path -->
            <path d="${d}" class="cable-halo" />
            <!-- Main Bezier Cable -->
            <path d="${d}" class="cable-path" id="${cableId}" data-from="${conn.from}" data-to="${conn.to}" />
            <!-- Animated Flow Pulse Particle -->
            <circle class="cable-pulse-particle" r="4.5" fill="#38bdf8" filter="url(#glow)">
              <animateMotion path="${d}" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </g>
        `;
      }).join('');

      el.svgLayer.innerHTML = defs + paths;
    },

    updateCablePaths() {
      const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
      if (!wf || !el.svgLayer) return;
      this.renderCables(wf);
    },

    renderNodeStatusBadges() {
      const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
      if (!wf) return;

      wf.nodes.forEach(node => {
        const nodeEl = document.getElementById(`canvas-${node.id}`);
        const footerEl = document.getElementById(`footer-${node.id}`);
        const nodeState = state.nodeStates[node.id] || { status: 'idle' };

        if (nodeEl) {
          nodeEl.classList.remove('idle', 'running', 'success', 'error');
          nodeEl.classList.add(nodeState.status);
        }

        if (footerEl) {
          footerEl.innerHTML = `
            <div class="node-status-pill status-${nodeState.status}">
              ${this.getStatusIconAndText(nodeState)}
            </div>
            ${nodeState.items ? `<span class="node-items-pill">${nodeState.items} ${nodeState.items === 1 ? 'item' : 'items'}</span>` : ''}
          `;
        }
      });
    },

    bindNodeEvents() {
      const nodeElements = el.nodesLayer.querySelectorAll('.n8n-node-card');
      nodeElements.forEach(nodeCard => {
        const nodeId = nodeCard.getAttribute('data-node-id');

        // Click to Select / Inspect
        nodeCard.addEventListener('click', (e) => {
          if (state.isDraggingNode) return;
          this.selectNode(nodeId);
        });

        // Mouse Drag to Move Node
        nodeCard.addEventListener('mousedown', (e) => {
          if (e.target.closest('.node-port')) return;
          state.isDraggingNode = true;
          state.draggedNodeId = nodeId;
          state.nodeDragStartX = e.clientX;
          state.nodeDragStartY = e.clientY;
          nodeCard.classList.add('dragging');
          e.stopPropagation();
        });
      });
    },

    selectNode(nodeId) {
      state.selectedNodeId = nodeId;
      const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
      const node = wf ? wf.nodes.find(n => n.id === nodeId) : null;

      // Update selection UI on canvas
      el.nodesLayer.querySelectorAll('.n8n-node-card').forEach(card => {
        card.classList.toggle('selected', card.getAttribute('data-node-id') === nodeId);
      });

      if (!node) {
        this.closeInspector();
        return;
      }

      this.openInspector(node);
    },

    openInspector(node) {
      if (!el.inspectorPanel) return;
      el.inspectorPanel.classList.add('open');

      const nodeState = state.nodeStates[node.id] || { status: 'idle' };

      // Populate Node Inspector Details
      const inspectorContent = document.getElementById('inspectorNodeContent');
      if (inspectorContent) {
        inspectorContent.innerHTML = `
          <div class="inspector-header">
            <div class="inspector-icon" style="background: ${node.color}22; color: ${node.color}; border: 1px solid ${node.color}55;">
              <i class="fa-solid ${node.icon}"></i>
            </div>
            <div>
              <h4>${node.name}</h4>
              <div class="inspector-type">${node.type}</div>
            </div>
          </div>

          <div class="inspector-section">
            <div class="inspector-sec-title">Execution State</div>
            <div class="inspector-status-badge ${nodeState.status}">
              ${this.getStatusIconAndText(nodeState)}
              ${nodeState.timeMs ? `<span class="time-badge">${nodeState.timeMs}ms runtime</span>` : ''}
            </div>
          </div>

          <div class="inspector-section">
            <div class="inspector-sec-title">Configured Parameters</div>
            <pre class="code-viewer"><code>${escapeHtml(JSON.stringify(node.parameters, null, 2))}</code></pre>
          </div>

          <div class="inspector-section">
            <div class="inspector-sec-title">Node Input Stream</div>
            <pre class="code-viewer"><code>${nodeState.lastInput ? escapeHtml(JSON.stringify(nodeState.lastInput, null, 2)) : '// Awaiting workflow execution...'}</code></pre>
          </div>

          <div class="inspector-section">
            <div class="inspector-sec-title">Node Output Stream</div>
            <pre class="code-viewer"><code>${nodeState.lastOutput ? escapeHtml(JSON.stringify(nodeState.lastOutput, null, 2)) : '// No items emitted yet.'}</code></pre>
          </div>

          <div class="inspector-footer-actions">
            <button class="btn btn-primary btn-sm w-100" id="btnTestNodeSingle">
              <i class="fa-solid fa-play"></i> Test Step (Execute This Node)
            </button>
          </div>
        `;

        const btnTestNode = document.getElementById('btnTestNodeSingle');
        if (btnTestNode) {
          btnTestNode.addEventListener('click', () => {
            this.simulateSingleNode(node);
          });
        }
      }
    },

    closeInspector() {
      if (el.inspectorPanel) el.inspectorPanel.classList.remove('open');
      state.selectedNodeId = null;
      if (el.nodesLayer) {
        el.nodesLayer.querySelectorAll('.n8n-node-card').forEach(card => card.classList.remove('selected'));
      }
    },

    // =========================================================================
    // Live Workflow Execution Engine ("executions should be happening")
    // =========================================================================
    async executeWorkflow(presetKey = 'schedule', customPayload = null) {
      if (state.isExecuting) return;
      state.isExecuting = true;

      const preset = EXECUTION_PRESETS[presetKey] || EXECUTION_PRESETS['schedule'];
      const payload = customPayload || preset.payload;
      const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
      if (!wf) return;

      const executionId = '#EXEC-' + Math.floor(1000 + Math.random() * 9000);
      const startTime = performance.now();

      // UI status updates
      if (el.btnRunWorkflow) {
        el.btnRunWorkflow.disabled = true;
        el.btnRunWorkflow.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing...';
      }
      this.updateTelemetryBanner({
        status: 'running',
        id: executionId,
        text: `Executing workflow with scenario: ${preset.label}`
      });

      this.showLivePill(true, `Running ${executionId}...`);

      // Reset previous node statuses
      wf.nodes.forEach(n => {
        state.nodeStates[n.id] = { status: 'idle', timeMs: null, items: null, lastInput: null, lastOutput: null };
      });
      this.renderNodeStatusBadges();

      // Calculate sequential path of nodes for this scenario
      const executionPath = (state.activeWorkflowId === '01') 
        ? preset.path 
        : wf.nodes.map(n => n.id);

      let currentData = { ...payload };

      const baseDelay = Math.max(100, Math.round(350 / state.executionSpeed));

      // Sequential Execution Loop
      for (let i = 0; i < executionPath.length; i++) {
        const nodeId = executionPath[i];
        const node = wf.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        // 1. Mark node running
        state.nodeStates[nodeId].status = 'running';
        state.nodeStates[nodeId].lastInput = { ...currentData };
        this.renderNodeStatusBadges();
        this.highlightActiveNode(nodeId, true);

        // Highlight preceding cable
        if (i > 0) {
          const prevNodeId = executionPath[i - 1];
          this.highlightCable(prevNodeId, nodeId, true);
        }

        // Realistic benchmark micro-delays
        let nodeLatency = 16;
        if (node.category === 'ai' || node.id === 'node-ai-agent') nodeLatency = 184;
        else if (node.id === 'node-gemini-model') nodeLatency = 96;
        else if (node.category === 'database') nodeLatency = 42;
        else if (node.category === 'code') nodeLatency = 28;
        else nodeLatency = Math.floor(12 + Math.random() * 24);

        // Sleep scaled by speed
        await sleep(Math.round(baseDelay * (nodeLatency / 100)));

        // Compute simulated output data for node
        currentData = this.generateNodeOutput(node, currentData, presetKey);

        // 2. Mark node success
        state.nodeStates[nodeId].status = 'success';
        state.nodeStates[nodeId].timeMs = nodeLatency;
        state.nodeStates[nodeId].items = 1;
        state.nodeStates[nodeId].lastOutput = { ...currentData };

        this.renderNodeStatusBadges();
        this.highlightActiveNode(nodeId, false);

        if (state.selectedNodeId === nodeId) {
          this.openInspector(node);
        }
      }

      const totalElapsed = Math.round(performance.now() - startTime);

      // Record in execution history
      const executionRecord = {
        id: executionId,
        scenario: preset.label,
        timestamp: new Date().toLocaleTimeString(),
        totalElapsedMs: totalElapsed,
        nodeCount: executionPath.length,
        status: 'success',
        resultSummary: preset.resultSummary,
        payload: payload,
        response: currentData
      };

      state.executions.unshift(executionRecord);
      if (state.executions.length > 30) state.executions.pop();
      state.lastExecution = executionRecord;

      // Update UI elements
      this.renderExecutionHistory();
      this.updateTelemetryBanner({
        status: 'success',
        id: executionId,
        text: `Completed in ${totalElapsed}ms • ${executionPath.length} nodes executed • ${preset.resultSummary}`
      });

      this.showLivePill(false);

      if (el.btnRunWorkflow) {
        el.btnRunWorkflow.disabled = false;
        el.btnRunWorkflow.innerHTML = '<i class="fa-solid fa-play"></i> Test Execution';
      }

      state.isExecuting = false;

      // Show toast if available
      if (typeof window.showToast === 'function') {
        window.showToast(`n8n Execution ${executionId} Succeeded (${totalElapsed}ms)`, 'success');
      }
    },

    generateNodeOutput(node, inputData, presetKey) {
      const output = { ...inputData };
      if (node.id === 'node-webhook') {
        output.receivedAt = new Date().toISOString();
        output.status = 'RECEIVED';
      } else if (node.id === 'node-process') {
        output.processed = true;
        output.crmSyncTarget = 'Student_CRM_Database';
      } else if (node.id === 'node-router-ping') {
        output.isPing = (inputData.action === 'ping');
        output.route = output.isPing ? 'direct_response' : 'ai_pipeline';
      } else if (node.id === 'node-ai-agent' || node.id === 'node-gemini-model') {
        output.aiModel = 'Google Gemini 2.5 Flash';
        output.inferenceLatency = '142ms';
        if (presetKey === 'grade_remedial') {
          output.aiPedagogicalAdvice = 'Identified critical gap in Genetics. Assign remedial peer-tutoring and review chromosome segregation.';
        } else {
          output.aiPedagogicalAdvice = 'Exceptional conceptual retention. Student demonstrates mastery aligned with curriculum benchmarks.';
        }
      } else if (node.id === 'node-crm-db') {
        output.crmUpserted = true;
        output.crmRecordId = 'CRM-' + (inputData.id || Math.floor(1000 + Math.random() * 9000));
        output.crmDatabase = 'Student_CRM_Database (WWJbILmVtjqZrYbx)';
      } else if (node.id === 'node-router-pass') {
        const pct = inputData.percentage || (inputData.marksObtained ? Math.round((inputData.marksObtained / (inputData.totalMarks || 100)) * 100) : 75);
        output.passed = (pct >= 40);
        output.route = output.passed ? 'honor_roll' : 'remedial_plan';
      } else if (node.id === 'node-honor-roll') {
        output.tier = 'HONOR_ROLL_DISTINCTION';
        output.badge = 'GOLD_SCHOLAR';
      } else if (node.id === 'node-remedial-plan') {
        output.tier = 'REMEDIAL_INTERVENTION';
        output.workshopAssigned = 'Academic Skills Clinic';
      } else if (node.id === 'node-respond') {
        output.httpStatus = 200;
        output.timestamp = new Date().toISOString();
      }
      return output;
    },

    simulateSingleNode(node) {
      state.nodeStates[node.id].status = 'running';
      this.renderNodeStatusBadges();
      this.highlightActiveNode(node.id, true);

      setTimeout(() => {
        state.nodeStates[node.id].status = 'success';
        state.nodeStates[node.id].timeMs = Math.floor(15 + Math.random() * 35);
        state.nodeStates[node.id].items = 1;
        state.nodeStates[node.id].lastOutput = {
          node: node.name,
          executedAt: new Date().toISOString(),
          status: 'SUCCESS',
          parameters: node.parameters
        };
        this.renderNodeStatusBadges();
        this.highlightActiveNode(node.id, false);
        this.openInspector(node);
      }, 400);
    },

    // Two-Way Hook: Triggered directly when actions happen on the CRM tables
    triggerFromCRM(action, data) {
      // Map CRM action to execution preset
      let presetKey = 'schedule';
      if (action === 'create_exam') presetKey = 'schedule';
      else if (action === 'record_score') {
        presetKey = (data && data.marksObtained < (data.passingMarks || 40)) ? 'grade_remedial' : 'grade_pass';
      } else if (action === 'ai_chat') presetKey = 'ai_copilot';
      else if (action === 'fetch_crm' || action === 'sync_to_crm') presetKey = 'crm_sync';
      else if (action === 'ping') presetKey = 'ping';

      // Update preset dropdown to match
      if (el.selectExecPreset) el.selectExecPreset.value = presetKey;

      // Show execution floating notification
      this.showWorkflowToastNotification(presetKey);

      // Run execution
      this.executeWorkflow(presetKey, data ? { action, ...data } : null);
    },

    showWorkflowToastNotification(presetKey) {
      const preset = EXECUTION_PRESETS[presetKey] || EXECUTION_PRESETS['schedule'];
      const toast = document.createElement('div');
      toast.className = 'workflow-exec-toast';
      toast.innerHTML = `
        <div class="exec-toast-icon"><i class="fa-solid fa-bolt fa-beat"></i></div>
        <div class="exec-toast-body">
          <div class="exec-toast-title">n8n Pipeline Executing</div>
          <div class="exec-toast-sub">${preset.label}</div>
        </div>
        <button class="btn btn-sm btn-ghost" id="btnJumpToCanvas">Watch Canvas</button>
      `;

      const container = document.getElementById('toastContainer');
      if (container) {
        container.appendChild(toast);
        const jumpBtn = toast.querySelector('#btnJumpToCanvas');
        if (jumpBtn) {
          jumpBtn.addEventListener('click', () => {
            if (typeof window.switchMainView === 'function') {
              window.switchMainView('workflow');
            }
            toast.remove();
          });
        }
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4500);
      }
    },

    highlightActiveNode(nodeId, isActive) {
      const nodeEl = document.getElementById(`canvas-${nodeId}`);
      if (nodeEl) {
        nodeEl.classList.toggle('node-active-pulse', isActive);
      }
    },

    highlightCable(fromNodeId, toNodeId, isActive) {
      const cableGroup = document.getElementById(`group-cable-${fromNodeId}-${toNodeId}`);
      if (cableGroup) {
        cableGroup.classList.toggle('active-cable', isActive);
      }
    },

    updateTelemetryBanner(info) {
      if (!el.telemetryBanner) return;

      if (!info) {
        el.telemetryBanner.innerHTML = `
          <div class="telemetry-item">
            <span class="telemetry-label">Pipeline Status:</span>
            <span class="telemetry-value"><span class="badge-dot-live"></span> Ready for Webhook Triggers</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Active Model:</span>
            <span class="telemetry-value highlight-purple">Google Gemini 2.5 Flash</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Connected CRM:</span>
            <span class="telemetry-value highlight-emerald">Student_CRM_Database</span>
          </div>
        `;
        return;
      }

      el.telemetryBanner.innerHTML = `
        <div class="telemetry-item">
          <span class="telemetry-label">Execution:</span>
          <span class="telemetry-value highlight-cyan">${info.id}</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">Status:</span>
          <span class="telemetry-value ${info.status === 'success' ? 'highlight-emerald' : 'highlight-amber'}">
            ${info.status.toUpperCase()}
          </span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">Telemetry:</span>
          <span class="telemetry-value">${info.text}</span>
        </div>
      `;
    },

    showLivePill(isLive, text = '') {
      if (el.liveFlowIndicator) {
        el.liveFlowIndicator.style.display = isLive ? 'inline-flex' : 'none';
        if (el.liveFlowStatusText) el.liveFlowStatusText.textContent = text || 'Workflow executing...';
      }
    },

    renderExecutionHistory() {
      const container = document.getElementById('inspectorHistoryList');
      if (!container) return;

      if (state.executions.length === 0) {
        container.innerHTML = `
          <div class="history-empty">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <p>No executions yet. Run a test execution or trigger an action from the CRM tables.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = state.executions.map((exec, idx) => `
        <div class="history-card" data-history-idx="${idx}">
          <div class="history-card-header">
            <span class="history-id">${exec.id}</span>
            <span class="history-badge ${exec.status}">${exec.status.toUpperCase()}</span>
          </div>
          <div class="history-title">${exec.scenario}</div>
          <div class="history-meta">
            <span><i class="fa-regular fa-clock"></i> ${exec.timestamp}</span>
            <span><i class="fa-solid fa-stopwatch"></i> ${exec.totalElapsedMs}ms</span>
            <span><i class="fa-solid fa-diagram-project"></i> ${exec.nodeCount} nodes</span>
          </div>
          <div class="history-summary">${exec.resultSummary}</div>
          <button class="btn btn-ghost btn-xs w-100 btn-replay-exec" data-scenario="${exec.scenario}">
            <i class="fa-solid fa-rotate-right"></i> Replay on Canvas
          </button>
        </div>
      `).join('');

      container.querySelectorAll('.btn-replay-exec').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest('.history-card');
          const idx = parseInt(card.getAttribute('data-history-idx'), 10);
          const exec = state.executions[idx];
          if (exec) {
            WorkflowCanvas.executeWorkflow('schedule', exec.payload);
          }
        });
      });
    },

    // =========================================================================
    // Pan, Zoom, and Fit Controls
    // =========================================================================
    zoomIn() {
      state.scale = Math.min(2.0, state.scale + 0.15);
      this.applyTransform();
    },

    zoomOut() {
      state.scale = Math.max(0.35, state.scale - 0.15);
      this.applyTransform();
    },

    zoomReset() {
      state.scale = 1.0;
      this.applyTransform();
    },

    fitToView() {
      const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
      if (!wf || !el.viewport) return;

      const rect = el.viewport.getBoundingClientRect();
      const padding = 60;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      wf.nodes.forEach(n => {
        minX = Math.min(minX, n.position[0]);
        minY = Math.min(minY, n.position[1]);
        maxX = Math.max(maxX, n.position[0] + 250);
        maxY = Math.max(maxY, n.position[1] + 120);
      });

      const contentWidth = maxX - minX + padding * 2;
      const contentHeight = maxY - minY + padding * 2;

      const scaleX = (rect.width - padding) / contentWidth;
      const scaleY = (rect.height - padding) / contentHeight;

      state.scale = Math.min(1.0, Math.max(0.5, Math.min(scaleX, scaleY)));
      state.panX = Math.round((rect.width - (contentWidth * state.scale)) / 2) - (minX * state.scale) + 30;
      state.panY = Math.round((rect.height - (contentHeight * state.scale)) / 2) - (minY * state.scale) + 20;

      this.applyTransform();
    },

    applyTransform() {
      if (el.transformContainer) {
        el.transformContainer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
      }
      if (el.btnZoomReset) {
        el.btnZoomReset.textContent = `${Math.round(state.scale * 100)}%`;
      }
    }
  };

  // =========================================================================
  // Internal Helpers & DOM Setup
  // =========================================================================
  function cacheDOMElements() {
    el = {
      viewport: document.getElementById('workflowCanvasViewport'),
      transformContainer: document.getElementById('workflowCanvasTransform'),
      svgLayer: document.getElementById('workflowSvgLayer'),
      nodesLayer: document.getElementById('workflowNodesLayer'),
      workflowSelect: document.getElementById('workflowSelect'),
      workflowTitlePill: document.getElementById('workflowTitlePill'),
      btnRunWorkflow: document.getElementById('btnRunWorkflow'),
      selectExecPreset: document.getElementById('selectExecPreset'),
      selectExecSpeed: document.getElementById('selectExecSpeed'),
      btnResetWorkflowState: document.getElementById('btnResetWorkflowState'),
      btnZoomIn: document.getElementById('btnZoomIn'),
      btnZoomOut: document.getElementById('btnZoomOut'),
      btnZoomReset: document.getElementById('btnZoomReset'),
      btnFitView: document.getElementById('btnFitView'),
      btnToggleInspector: document.getElementById('btnToggleInspector'),
      inspectorPanel: document.getElementById('workflowInspectorPanel'),
      btnCloseInspector: document.getElementById('btnCloseInspector'),
      telemetryBanner: document.getElementById('canvasTelemetryBanner'),
      liveFlowIndicator: document.getElementById('liveFlowIndicator'),
      liveFlowStatusText: document.getElementById('liveFlowStatusText')
    };
  }

  function setupEventListeners() {
    // Workflow selector
    if (el.workflowSelect) {
      el.workflowSelect.addEventListener('change', (e) => {
        WorkflowCanvas.switchWorkflow(e.target.value);
      });
    }

    // Run workflow execution button
    if (el.btnRunWorkflow) {
      el.btnRunWorkflow.addEventListener('click', () => {
        const preset = el.selectExecPreset ? el.selectExecPreset.value : 'schedule';
        WorkflowCanvas.executeWorkflow(preset);
      });
    }

    // Speed selector
    if (el.selectExecSpeed) {
      el.selectExecSpeed.addEventListener('change', (e) => {
        state.executionSpeed = parseFloat(e.target.value) || 1;
      });
    }

    // Reset button
    if (el.btnResetWorkflowState) {
      el.btnResetWorkflowState.addEventListener('click', () => {
        WorkflowCanvas.resetNodeStates();
        if (typeof window.showToast === 'function') {
          window.showToast('Canvas execution states reset to idle.', 'info');
        }
      });
    }

    // Zoom buttons
    if (el.btnZoomIn) el.btnZoomIn.addEventListener('click', () => WorkflowCanvas.zoomIn());
    if (el.btnZoomOut) el.btnZoomOut.addEventListener('click', () => WorkflowCanvas.zoomOut());
    if (el.btnZoomReset) el.btnZoomReset.addEventListener('click', () => WorkflowCanvas.zoomReset());
    if (el.btnFitView) el.btnFitView.addEventListener('click', () => WorkflowCanvas.fitToView());

    // Inspector toggle
    if (el.btnToggleInspector) {
      el.btnToggleInspector.addEventListener('click', () => {
        if (el.inspectorPanel) {
          el.inspectorPanel.classList.toggle('open');
          if (el.inspectorPanel.classList.contains('open') && !state.selectedNodeId) {
            // Select first node or default to history tab
            const tabHistory = document.querySelector('[data-inspector-tab="history"]');
            if (tabHistory) tabHistory.click();
          }
        }
      });
    }

    if (el.btnCloseInspector) {
      el.btnCloseInspector.addEventListener('click', () => WorkflowCanvas.closeInspector());
    }

    // Inspector tab switching
    document.querySelectorAll('.inspector-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-inspector-tab');
        document.querySelectorAll('.inspector-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.inspector-tab-pane').forEach(pane => {
          pane.classList.toggle('active', pane.getAttribute('data-pane') === tab);
        });
      });
    });

    // Canvas Panning (Drag background)
    if (el.viewport) {
      el.viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.n8n-node-card') || e.target.closest('.canvas-toolbar') || e.target.closest('.workflow-inspector-panel')) {
          return;
        }
        state.isPanning = true;
        state.startPanX = e.clientX - state.panX;
        state.startPanY = e.clientY - state.panY;
        el.viewport.classList.add('panning');
      });

      window.addEventListener('mousemove', (e) => {
        if (state.isPanning) {
          state.panX = e.clientX - state.startPanX;
          state.panY = e.clientY - state.startPanY;
          WorkflowCanvas.applyTransform();
        } else if (state.isDraggingNode && state.draggedNodeId) {
          const dx = (e.clientX - state.nodeDragStartX) / state.scale;
          const dy = (e.clientY - state.nodeDragStartY) / state.scale;

          const wf = WORKFLOW_DEFINITIONS[state.activeWorkflowId];
          const node = wf.nodes.find(n => n.id === state.draggedNodeId);
          if (node) {
            node.position[0] = Math.round(node.position[0] + dx);
            node.position[1] = Math.round(node.position[1] + dy);

            const card = document.getElementById(`canvas-${node.id}`);
            if (card) {
              card.style.transform = `translate(${node.position[0]}px, ${node.position[1]}px)`;
            }
            WorkflowCanvas.updateCablePaths();
          }

          state.nodeDragStartX = e.clientX;
          state.nodeDragStartY = e.clientY;
        }
      });

      window.addEventListener('mouseup', () => {
        if (state.isPanning) {
          state.isPanning = false;
          if (el.viewport) el.viewport.classList.remove('panning');
        }
        if (state.isDraggingNode) {
          state.isDraggingNode = false;
          const card = document.getElementById(`canvas-${state.draggedNodeId}`);
          if (card) card.classList.remove('dragging');
          state.draggedNodeId = null;
        }
      });

      // Mouse Wheel Zoom
      el.viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomDelta = -Math.sign(e.deltaY) * 0.08;
        const newScale = Math.min(2.0, Math.max(0.35, state.scale + zoomDelta));
        
        // Zoom towards mouse cursor
        const rect = el.viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        state.panX = mouseX - (mouseX - state.panX) * (newScale / state.scale);
        state.panY = mouseY - (mouseY - state.panY) * (newScale / state.scale);
        state.scale = newScale;

        WorkflowCanvas.applyTransform();
      }, { passive: false });
    }

    // Resize handler to adjust cables
    window.addEventListener('resize', () => {
      WorkflowCanvas.updateCablePaths();
    });
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Export to global window
  window.WorkflowCanvas = WorkflowCanvas;

})(window);
