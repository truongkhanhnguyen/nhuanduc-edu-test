// ==========================================
// NHUẬN ĐỨC ENGLISH ASSESSMENT APPLICATION
// Trường THCS Nhuận Đức • GV: Mai Trần Diễm Phúc
// Môn: Ngoại ngữ 1 (Tiếng Anh 9 - Global Success)
// ==========================================

const STORAGE_KEY = 'nhuanduc_exam_submissions_prod';
// Secure Teacher Auth: Authentication handled by POST /api/teacher/auth with SHA-256 fallback
const TEACHER_AUTH_HASH = '7f3602e8116679e53cde5183349f8a567000e12e31228aef961026e506280c73';

// App State
const state = {
  currentView: 'student-select', // 'student-select' | 'exam' | 'result' | 'teacher' | 'vocab'
  selectedClass: '9.2C',
  selectedStudent: null,
  testMode: 'full', // 'full' (40q) | 'set1' (20q) | 'set2' (20q)
  
  // Shuffling & Display Customization
  shuffleQuestions: true,
  shuffleOptions: true,
  liveFillPreview: true,
  examCode: '901',
  examFontScale: 1.0,

  // Test Session
  activeQuestions: [],
  currentIndex: 0,
  answers: {}, // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  flagged: new Set(),
  timeRemaining: 45 * 60,
  timerInterval: null,
  isSubmitted: false,
  lastResult: null,

  // Anti-Cheat (Azota Style & Multi-Platform Tab/App Switching)
  cheatCount: 0,
  cheatLogs: [],
  lastBlurTime: 0,
  maxAllowedViolations: 3,

  // Teacher Authentication & Gatekeeper
  isTeacherAuthenticated: false,
  teacherClassFilter: 'all',
  teacherSearch: '',
  teacherStatusFilter: 'all',

  // Webcam Proctoring & Face Verification (Pop-up snapshots only, no continuous streaming)
  webcamStream: null,
  initialFacePhoto: null, // base64 JPEG
  faceAuditSnapshots: [], // Array<{ time: string, photo: string, reason: string }>
  scheduledFaceAudits: [], // Array<number> (elapsed seconds checkpoints)
  totalScheduledAudits: 0,
  currentAuditNum: 0,
  modalAuditMode: 'initial', // 'initial' | 'random'

  // History & Navigation
  historyInitialized: false
};

// ==========================================
// SHUFFLE & HELPER UTILITIES
// ==========================================

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateExamCode() {
  const codes = ['901', '902', '903', '904', '905', '906', '907', '908', '909', '910', '912', '915', '918', '920', '925', '928'];
  return codes[Math.floor(Math.random() * codes.length)];
}

function getSpeakerInfo(speakerName, index) {
  const s = speakerName.trim();
  if (s.startsWith('Dr.') || s.toLowerCase().includes('doctor')) {
    return { icon: '👨‍⚕️', styleClass: 'speaker-doc' };
  }
  if (s.startsWith('Mr.') || s.startsWith('Ms.') || s.toLowerCase().includes('teacher')) {
    return { icon: '👩‍🏫', styleClass: 'speaker-doc' };
  }
  return {
    icon: index === 0 ? '👦' : '👧',
    styleClass: index === 0 ? 'speaker-1' : 'speaker-2'
  };
}

function adjustExamFontSize(delta) {
  state.examFontScale = Math.min(1.3, Math.max(0.85, Number((state.examFontScale + delta * 0.1).toFixed(2))));
  const card = document.getElementById('questionCardBody');
  if (card) {
    card.style.fontSize = `${state.examFontScale}rem`;
  }
  showToast(`Cỡ chữ đề thi: ${Math.round(state.examFontScale * 100)}%`, 'info');
}

// ==========================================
// LOCAL STORAGE & SERVER SYNC MANAGEMENT
// ==========================================

function normalizeSubmissionScore(sub) {
  if (!sub) return sub;
  const total = sub.totalQuestions || (sub.mode === 'set1' || sub.mode === 'set2' ? 20 : 40);
  sub.totalQuestions = total;

  if (sub.answersDetail && Array.isArray(sub.answersDetail) && sub.answersDetail.length > 0) {
    const trueCorrect = sub.answersDetail.filter(d => Boolean(d.isCorrect)).length;
    sub.correctCount = trueCorrect;
    sub.score = Math.round(((trueCorrect / total) * 10) * 100) / 100;
  } else if (sub.correctCount !== undefined && sub.correctCount !== null) {
    sub.correctCount = Math.max(0, Math.min(total, Math.round(Number(sub.correctCount))));
    sub.score = Math.round(((sub.correctCount / total) * 10) * 100) / 100;
  } else if (typeof sub.score === 'number') {
    sub.correctCount = Math.max(0, Math.min(total, Math.round((sub.score / 10) * total)));
    sub.score = Math.round(((sub.correctCount / total) * 10) * 100) / 100;
  }
  return sub;
}

function getSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const data = JSON.parse(raw);
    for (const key in data) {
      if (data[key]) {
        data[key] = normalizeSubmissionScore(data[key]);
      }
    }
    return data;
  } catch (e) {
    console.error('Failed to read storage', e);
    return {};
  }
}

async function syncSubmissionsFromServer() {
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        for (const key in json.data) {
          if (json.data[key]) {
            json.data[key] = normalizeSubmissionScore(json.data[key]);
          }
        }
        // Synchronize server database state to client
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        if (state.currentView === 'teacher') {
          renderTeacherDashboard(false); // avoid loop
        }
        updateStudentList();
      }
    }
  } catch (e) {
    // Offline or pure local static file mode, fallback cleanly to localStorage
  }
}

async function saveSubmission(submission) {
  // 1. Save to local storage immediately
  const all = getSubmissions();
  const key = `${submission.classId}_${submission.studentCode}`;
  all[key] = submission;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  // 2. Synchronize to central server so Teacher can view across all devices
  try {
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
  } catch (e) {
    console.warn('Could not sync submission to central server (offline mode):', e);
  }
}

async function deleteSubmission(classId, studentCode) {
  const key = `${classId}_${studentCode}`;
  const all = getSubmissions();
  delete all[key];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  try {
    await fetch(`/api/submissions/${key}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Could not sync deletion to server:', e);
  }
}

// Clean production mode: all 72 students start fresh (0 completed)
function generateSampleSubmissions() {
  return {};
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Purge old test submissions cache if present
  try { localStorage.removeItem('nhuanduc_test_submissions_v1'); } catch (e) {}

  // Restore teacher session if authenticated in this browser session
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nhuanduc_teacher_token')) {
    state.isTeacherAuthenticated = true;
  }

  initTheme();
  bindNavigation();
  initStudentSelect();
  renderVocabList();
  initAntiCheatMonitoring();
  initHistoryNavigation();
  syncSubmissionsFromServer();

  // Keyboard shortcut for quick answers (A, B, C, D or 1, 2, 3, 4) & shortcut protection
  document.addEventListener('keydown', handleGlobalKeydown);

  // Auto-focus login code input for swift entry
  setTimeout(() => {
    const codeInp = document.getElementById('loginCodeInput');
    if (codeInp) codeInp.focus();
  }, 400);
});

function initTheme() {
  const saved = localStorage.getItem('nhuanduc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('nhuanduc_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// ==========================================
// NAVIGATION & HISTORY API (UI & BROWSER BACK)
// ==========================================

function initHistoryNavigation() {
  if (window.history && window.history.pushState) {
    window.history.replaceState({ view: 'student-select' }, '', '#student-select');

    window.addEventListener('popstate', (e) => {
      const targetView = (e.state && e.state.view) ? e.state.view : 'student-select';

      // If user is inside an ongoing exam session and hits browser Back or mobile swipe back:
      if (state.currentView === 'exam' && !state.isSubmitted) {
        window.history.pushState({ view: 'exam' }, '', '#exam');
        promptExitExam();
        return;
      }

      // If heading to teacher view without credentials
      if (targetView === 'teacher' && !state.isTeacherAuthenticated) {
        switchView('student-select', false);
        promptTeacherAccess();
        return;
      }

      switchView(targetView, false);
    });
  }
}

function bindNavigation() {
  document.querySelectorAll('[data-view-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-view-target');
      switchView(target, true);
    });
  });
}

function switchView(viewName, updateHistory = true) {
  // Guard teacher dashboard behind authentication
  if (viewName === 'teacher' && !state.isTeacherAuthenticated) {
    promptTeacherAccess();
    return;
  }

  // Guard active exam session
  if (state.currentView === 'exam' && viewName !== 'exam' && !state.isSubmitted) {
    promptExitExam();
    return;
  }

  state.currentView = viewName;

  if (document.body && document.body.classList) {
    document.body.classList.toggle('in-exam-mode', viewName === 'exam');
  }

  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.tab-btn:not(.teacher-gate-btn)').forEach(btn => btn.classList.remove('active'));

  const activeSec = document.getElementById(`view-${viewName}`);
  if (activeSec) activeSec.classList.add('active');

  const activeTab = document.querySelector(`[data-view-target="${viewName}"]`);
  if (activeTab) activeTab.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update browser history
  if (updateHistory && window.history && window.history.pushState) {
    window.history.pushState({ view: viewName }, '', `#${viewName}`);
  }

  if (viewName === 'teacher') {
    renderTeacherDashboard();
  }
}

// Exit Exam Confirmation Modal Handlers
function promptExitExam() {
  const modal = document.getElementById('exitExamModal');
  if (modal) modal.classList.add('active');
}

function closeExitExamModal() {
  const modal = document.getElementById('exitExamModal');
  if (modal) modal.classList.remove('active');
}

function confirmExitExam() {
  closeExitExamModal();
  clearInterval(state.timerInterval);
  stopWebcamStream();
  state.isSubmitted = true;
  handleExamBlur('Thí sinh chủ động thoát bài thi giữa giờ');
  switchView('student-select', true);
  showToast('Đã dừng bài kiểm tra.', 'info');
}

// ==========================================
// TEACHER AUTHENTICATION & ACCESS GATE
// ==========================================

function promptTeacherAccess() {
  if (state.isTeacherAuthenticated) {
    switchView('teacher', true);
    return;
  }
  const modal = document.getElementById('teacherAuthModal');
  const input = document.getElementById('teacherPasswordInput');
  if (modal) {
    modal.classList.add('active');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 300);
    }
  }
}

function closeTeacherAuthModal() {
  const modal = document.getElementById('teacherAuthModal');
  if (modal) modal.classList.remove('active');
}

async function submitTeacherAuth() {
  const input = document.getElementById('teacherPasswordInput');
  if (!input) return;

  const val = input.value.trim();
  if (!val) {
    showToast('Vui lòng nhập mật khẩu giáo viên!', 'warning');
    input.focus();
    return;
  }

  // 1. Authenticate via secure backend endpoint
  try {
    const res = await fetch('/api/teacher/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: val })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      state.isTeacherAuthenticated = true;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('nhuanduc_teacher_token', data.token || 'granted');
      }
      closeTeacherAuthModal();
      switchView('teacher', true);
      showToast('Chào mừng Giáo viên Mai Trần Diễm Phúc! Quyền giáo viên đã được kích hoạt.', 'success');
      return;
    } else {
      showToast(data.error || 'Mật khẩu giáo viên không chính xác!', 'danger');
      input.focus();
      input.select();
      return;
    }
  } catch (err) {
    // 2. Offline / local static file mode: verify with SHA-256 hash without exposing plaintext
    try {
      const encoder = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(val));
      const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (hashHex === TEACHER_AUTH_HASH) {
        state.isTeacherAuthenticated = true;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('nhuanduc_teacher_token', 'local_granted');
        }
        closeTeacherAuthModal();
        switchView('teacher', true);
        showToast('Chào mừng Giáo viên Mai Trần Diễm Phúc! (Chế độ cục bộ)', 'success');
        return;
      }
    } catch (e) {
      console.error(e);
    }
    showToast('Mật khẩu giáo viên không chính xác! Vui lòng thử lại.', 'danger');
    input.focus();
    input.select();
  }
}

function logoutTeacher() {
  state.isTeacherAuthenticated = false;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('nhuanduc_teacher_token');
  }
  switchView('student-select', true);
  showToast('Đã khóa và đăng xuất khỏi khu vực giáo viên.', 'info');
}

// Reset all submissions (Teacher only action)
async function resetAllSubmissionsPrompt() {
  const confirmed = confirm('⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA TRẮNG TOÀN BỘ BẢNG ĐIỂM?\n\n- Tất cả bài nộp, điểm số và ảnh giám sát sẽ bị xóa hoàn toàn.\n- Toàn bộ 72 học sinh (9.2C & 9.5C) sẽ chuyển về trạng thái "Chưa làm bài".\n- Thao tác này để chuẩn bị bắt đầu đợt thi thật.');
  if (!confirmed) return;

  try {
    await fetch('/api/submissions/reset-all', { method: 'POST' });
  } catch (e) {
    console.warn('Could not call server reset endpoint:', e);
  }

  // Clear client storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  try { localStorage.removeItem('nhuanduc_test_submissions_v1'); } catch (e) {}

  // Update UI immediately
  renderTeacherDashboard(false);
  updateStudentList();
  showToast('✅ Đã xóa trắng toàn bộ dữ liệu bảng điểm! Hệ thống sẵn sàng cho đợt thi thật.', 'success');
}

// ==========================================
// STUDENT LOGIN CODE VERIFICATION
// ==========================================

function verifyStudentLoginCode() {
  const input = document.getElementById('loginCodeInput');
  if (!input) return;

  const raw = input.value.trim();
  if (!raw) {
    showToast('⚠️ Vui lòng nhập mã dự thi 4 chữ số (Ví dụ: 9201, 9512...)', 'warning');
    input.focus();
    return;
  }

  // Look for student matching loginCode (e.g. '9201') or ministry code (e.g. '079208007626')
  let foundStudent = null;
  let foundClass = null;

  for (const [classId, classInfo] of Object.entries(APP_DATA.classes)) {
    const match = classInfo.students.find(s => {
      const codeMatches = s.loginCode && s.loginCode.toLowerCase() === raw.toLowerCase();
      const ministryMatches = s.code && (s.code === raw || s.code.endsWith(raw));
      return codeMatches || ministryMatches;
    });

    if (match) {
      foundStudent = match;
      foundClass = classId;
      break;
    }
  }

  if (foundStudent) {
    state.selectedClass = foundClass;
    state.selectedStudent = foundStudent;

    const classSelect = document.getElementById('classSelect');
    if (classSelect) classSelect.value = foundClass;
    updateStudentList(true);

    const studentSelect = document.getElementById('studentSelect');
    if (studentSelect) studentSelect.value = foundStudent.code;
    updateStudentPreview();

    showToast(`✅ Đã tìm thấy: ${foundStudent.name} (Lớp ${foundClass} • STT ${foundStudent.stt})`, 'success');

    // Focus start exam button
    const startBtn = document.getElementById('startExamBtn');
    if (startBtn) {
      startBtn.focus();
    }
  } else {
    showToast(`❌ Không tìm thấy thí sinh với mã "${raw}". Vui lòng kiểm tra lại mã cô Mai Trần Diễm Phúc cấp!`, 'danger');
    input.focus();
    input.select();
  }
}

// ==========================================
// WEBCAM POP-UP PROCTORING (ON-DEMAND ONLY, NO CONTINUOUS STREAM)
// ==========================================

async function startModalWebcam() {
  stopWebcamStream(); // Ensure any existing stream is cleanly closed first

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Trình duyệt chưa hỗ trợ MediaDevices.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user'
    },
    audio: false
  });

  state.webcamStream = stream;
  const video = document.getElementById('modalWebcamVideo');
  if (video) {
    video.srcObject = stream;
    await video.play().catch(e => console.warn('Video play error:', e));
  }
}

function stopWebcamStream() {
  if (state.webcamStream) {
    try {
      state.webcamStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.warn('Error stopping webcam track:', e);
    }
    state.webcamStream = null;
  }
  const video = document.getElementById('modalWebcamVideo');
  if (video) {
    video.srcObject = null;
  }
}

async function openFaceCaptureModal(mode = 'initial', auditIndex = 1, auditTotal = 1) {
  state.modalAuditMode = mode;
  const modal = document.getElementById('faceCaptureModal');
  const title = document.getElementById('faceCaptureTitle');
  const desc = document.getElementById('faceCaptureDesc');
  const preview = document.getElementById('modalCapturedPreview');
  const previewImg = document.getElementById('modalCapturedImg');
  const status = document.getElementById('modalCaptureStatus');
  const btnCapture = document.getElementById('btnModalCapture');
  const btnRetake = document.getElementById('btnModalRetake');
  const btnContinue = document.getElementById('btnModalContinue');
  const fallback = document.getElementById('modalNoCameraFallback');

  if (!modal) return;

  // Reset modal elements
  if (preview) preview.style.display = 'none';
  if (previewImg) previewImg.src = '';
  if (btnCapture) {
    btnCapture.style.display = 'inline-flex';
    btnCapture.disabled = false;
  }
  if (btnRetake) btnRetake.style.display = 'none';
  if (btnContinue) btnContinue.style.display = 'none';
  if (fallback) fallback.style.display = 'none';

  if (mode === 'initial') {
    if (title) title.textContent = '📸 XÁC THỰC KHUÔN MẶT ĐẦU GIỜ THI';
    if (desc) desc.innerHTML = 'Vui lòng nhìn thẳng vào camera và nhấn nút <strong>"Chụp ảnh khuôn mặt"</strong> bên dưới để bắt đầu bài thi. Camera sẽ tự động tắt ngay sau khi chụp.';
    if (status) {
      status.textContent = 'Đang khởi động camera...';
      status.style.color = 'var(--text-muted)';
    }
  } else {
    if (title) title.textContent = `📸 YÊU CẦU QUÉT MẶT NGẪU NHIÊN (${auditIndex}/${auditTotal})`;
    if (desc) desc.innerHTML = 'Hệ thống kiểm tra đột xuất đối chiếu thí sinh. Vui lòng nhìn thẳng vào camera và bấm <strong>"Chụp ảnh khuôn mặt"</strong> để tiếp tục làm bài. Camera sẽ tắt ngay sau khi chụp.';
    if (status) {
      status.textContent = 'Đang bật camera đối chiếu ngẫu nhiên...';
      status.style.color = 'var(--text-muted)';
    }
  }

  modal.classList.add('active');

  // Activate camera stream strictly for this modal
  try {
    await startModalWebcam();
    if (status) {
      status.textContent = '🟢 Camera đã bật. Căn chỉnh khuôn mặt vào khung và bấm chụp ảnh.';
      status.style.color = 'var(--success)';
    }
  } catch (err) {
    console.warn('Camera error:', err);
    if (status) {
      status.textContent = '⚠️ Không thể mở Camera hoặc bạn chưa cấp quyền.';
      status.style.color = 'var(--warning)';
    }
    if (fallback) fallback.style.display = 'block';
  }
}

function handleModalCapturePhoto() {
  const video = document.getElementById('modalWebcamVideo');
  const canvas = document.getElementById('modalWebcamCanvas');
  const preview = document.getElementById('modalCapturedPreview');
  const previewImg = document.getElementById('modalCapturedImg');
  const status = document.getElementById('modalCaptureStatus');
  const btnCapture = document.getElementById('btnModalCapture');
  const btnRetake = document.getElementById('btnModalRetake');
  const btnContinue = document.getElementById('btnModalContinue');

  if (!video || !canvas) return;

  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // Mirror perspective
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.65);

  // Turn off camera stream immediately! (Không quay liên tục)
  stopWebcamStream();

  if (previewImg) previewImg.src = dataUrl;
  if (preview) preview.style.display = 'block';

  if (btnCapture) btnCapture.style.display = 'none';
  if (btnRetake) btnRetake.style.display = 'inline-flex';
  if (btnContinue) btnContinue.style.display = 'inline-flex';

  const nowStr = new Date().toLocaleTimeString('vi-VN');

  if (state.modalAuditMode === 'initial') {
    state.initialFacePhoto = dataUrl;
    if (status) {
      status.innerHTML = '✅ <strong style="color:var(--success);">Đã chụp thành công!</strong> Đang chuẩn bị vào bài thi...';
      status.style.color = 'var(--success)';
    }
    showToast('Đã xác thực khuôn mặt thí sinh thành công!', 'success');

    // Auto-proceed after 900ms
    setTimeout(() => {
      handleModalConfirmAndContinue();
    }, 900);
  } else {
    state.faceAuditSnapshots.push({
      time: nowStr,
      photo: dataUrl,
      reason: `Quét ngẫu nhiên lần ${state.currentAuditNum}`
    });
    if (status) {
      status.innerHTML = '✅ <strong style="color:var(--success);">Đã đối chiếu thành công!</strong> Đang quay lại làm bài...';
      status.style.color = 'var(--success)';
    }
    showToast(`Đã hoàn thành quét mặt ngẫu nhiên lần ${state.currentAuditNum}!`, 'success');

    // Auto-proceed after 900ms
    setTimeout(() => {
      handleModalConfirmAndContinue();
    }, 900);
  }
}

async function handleModalRetakePhoto() {
  const preview = document.getElementById('modalCapturedPreview');
  const btnCapture = document.getElementById('btnModalCapture');
  const btnRetake = document.getElementById('btnModalRetake');
  const btnContinue = document.getElementById('btnModalContinue');
  const status = document.getElementById('modalCaptureStatus');

  if (preview) preview.style.display = 'none';
  if (btnCapture) {
    btnCapture.style.display = 'inline-flex';
    btnCapture.disabled = false;
  }
  if (btnRetake) btnRetake.style.display = 'none';
  if (btnContinue) btnContinue.style.display = 'none';

  if (status) {
    status.textContent = 'Đang mở lại camera...';
    status.style.color = 'var(--text-muted)';
  }

  try {
    await startModalWebcam();
    if (status) {
      status.textContent = '🟢 Camera đã bật. Bấm nút chụp ảnh khi sẵn sàng.';
      status.style.color = 'var(--success)';
    }
  } catch (err) {
    if (status) {
      status.textContent = '⚠️ Không thể khởi động lại camera.';
      status.style.color = 'var(--warning)';
    }
  }
}

function handleModalConfirmAndContinue() {
  stopWebcamStream();
  const modal = document.getElementById('faceCaptureModal');
  if (modal) modal.classList.remove('active');

  if (state.modalAuditMode === 'initial') {
    startExamSession();
  } else {
    // Resume exam timer for student
    startTimer();
  }
}

function bypassCameraVerification() {
  stopWebcamStream();
  const modal = document.getElementById('faceCaptureModal');
  if (modal) modal.classList.remove('active');

  if (state.modalAuditMode === 'initial') {
    state.initialFacePhoto = null;
    showToast('Đã bỏ qua quét mặt (Thiết bị không có Camera)', 'info');
    startExamSession();
  } else {
    state.faceAuditSnapshots.push({
      time: new Date().toLocaleTimeString('vi-VN'),
      photo: '',
      reason: 'Thiết bị không có camera (Bỏ qua)'
    });
    startTimer();
  }
}

// ==========================================
// STUDENT SELECTION & SETUP
// ==========================================

function initStudentSelect() {
  const classSelect = document.getElementById('classSelect');
  const studentSelect = document.getElementById('studentSelect');
  const startBtn = document.getElementById('startExamBtn');

  // Populate Classes
  if (classSelect) {
    classSelect.innerHTML = Object.keys(APP_DATA.classes).map(cId => {
      const c = APP_DATA.classes[cId];
      return `<option value="${cId}">${c.name} (${c.total_students} học sinh)</option>`;
    }).join('');

    classSelect.addEventListener('change', () => {
      state.selectedClass = classSelect.value;
      updateStudentList();
    });
  }

  if (studentSelect) {
    studentSelect.addEventListener('change', () => {
      const code = studentSelect.value;
      const students = APP_DATA.classes[state.selectedClass].students;
      state.selectedStudent = students.find(s => s.code === code) || null;
      updateStudentPreview();
      
      // If student has a login code, populate it into the input
      if (state.selectedStudent && state.selectedStudent.loginCode) {
        const inp = document.getElementById('loginCodeInput');
        if (inp) inp.value = state.selectedStudent.loginCode;
      }
    });
  }

  // Mode Selection
  document.querySelectorAll('.mode-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.testMode = opt.getAttribute('data-mode');
    });
  });

  if (startBtn) {
    startBtn.addEventListener('click', startExam);
  }

  // Initial load
  updateStudentList();
}

function updateStudentList(preserveSelected = false) {
  const studentSelect = document.getElementById('studentSelect');
  if (!studentSelect) return;

  const students = APP_DATA.classes[state.selectedClass].students;
  const submissions = getSubmissions();

  studentSelect.innerHTML = '<option value="">-- Chọn họ và tên học sinh --</option>' +
    students.map(s => {
      const isDone = Boolean(submissions[`${state.selectedClass}_${s.code}`]);
      const tag = isDone ? ' (Đã làm)' : '';
      const loginTag = s.loginCode ? ` [Mã: ${s.loginCode}]` : '';
      return `<option value="${s.code}">STT ${s.stt}: ${s.name}${loginTag} - NS: ${s.dob}${tag}</option>`;
    }).join('');

  if (!preserveSelected) {
    state.selectedStudent = null;
    updateStudentPreview();
  } else if (state.selectedStudent) {
    studentSelect.value = state.selectedStudent.code;
    updateStudentPreview();
  }
}

function updateStudentPreview() {
  const preview = document.getElementById('studentPreview');
  const startBtn = document.getElementById('startExamBtn');
  if (!preview) return;

  if (!state.selectedStudent) {
    preview.innerHTML = `
      <div class="student-avatar" style="background: rgba(255,255,255,0.08); color: var(--text-dim);">?</div>
      <div class="student-details">
        <h4 style="color: var(--text-muted);">Chưa xác thực thí sinh</h4>
        <p>Vui lòng nhập Mã dự thi (4 số) ở ô trên hoặc chọn tên trong danh sách để chuẩn bị làm bài.</p>
      </div>
    `;
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.style.opacity = '0.85';
      startBtn.style.cursor = 'pointer';
    }
    return;
  }

  const s = state.selectedStudent;
  const submissions = getSubmissions();
  const pastRecord = submissions[`${state.selectedClass}_${s.code}`];

  preview.innerHTML = `
    <div class="student-avatar">${s.name.split(' ').slice(-1)[0][0]}</div>
    <div class="student-details">
      <h4>${s.name} <span class="badge ${s.gender === 'Nam' ? 'badge-primary' : 'badge-secondary'}">${s.gender}</span></h4>
      <p>
        Mã dự thi: <strong style="color:var(--primary); font-size:1.05rem;">${s.loginCode || s.code.slice(-4)}</strong> |
        Lớp: <strong>${state.selectedClass}</strong> | STT: <strong>${s.stt}</strong> | Ngày sinh: <strong>${s.dob}</strong>
      </p>
      <p style="font-size:0.8rem; color:var(--text-dim); margin-top:2px;">Mã ĐD Bộ GD&ĐT: <code>${s.code}</code></p>
      ${pastRecord ? `
        <div style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-sm); padding:0.65rem 0.85rem; margin-top:0.6rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <p style="color: var(--success); font-weight:700; margin:0; font-size:0.95rem;">
                ✓ Đã hoàn thành lần thi trước: <span style="font-size:1.15rem; color:var(--success);">${pastRecord.score}/10 điểm</span> (${pastRecord.correctCount !== undefined ? pastRecord.correctCount : Math.round((pastRecord.score / 10) * (pastRecord.totalQuestions || 40))}/${pastRecord.totalQuestions || 40} câu đúng)
              </p>
              <p style="color: var(--text-muted); font-size:0.8rem; margin:3px 0 0 0;">
                Mã đề: <strong>${pastRecord.examCode || '901'}</strong> • Thời điểm: ${pastRecord.submittedAt}
              </p>
            </div>
            <button type="button" class="btn btn-secondary" style="font-size:0.85rem; padding:0.4rem 0.85rem; border-color:var(--success); color:var(--success); display:inline-flex; align-items:center; gap:0.35rem;" onclick="reviewPastSubmission('${state.selectedClass}', '${s.code}')">
              👁️ Xem lại chi tiết bài làm & Lời giải
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  if (startBtn) {
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';
  }
}

function reviewPastSubmission(classId, studentCode) {
  const submissions = getSubmissions();
  const pastRecord = submissions[`${classId}_${studentCode}`];
  if (!pastRecord) {
    showToast('Không tìm thấy dữ liệu bài làm trước đó!', 'warning');
    return;
  }

  // Populate activeQuestions if answersDetail exists so review screen can render fully
  if (pastRecord.answersDetail && pastRecord.answersDetail.length > 0) {
    state.activeQuestions = pastRecord.answersDetail.map(d => ({
      id: d.questionId,
      vocab: d.vocab,
      dialogue: d.dialogue,
      options: d.options,
      correct: d.correctKey,
      explanation: d.explanation
    }));
  } else {
    state.activeQuestions = [...APP_DATA.questions];
  }

  state.lastResult = pastRecord;
  renderResultScreen(pastRecord);
  switchView('result', true);
  showToast(`Đang hiển thị lại bài thi của ${pastRecord.studentName} (${pastRecord.score}/10 điểm)`, 'info');
}

// ==========================================
// EXAM SESSION & LOGIC
// ==========================================

function startExam() {
  if (!state.selectedStudent) {
    showToast('⚠️ Bạn chưa xác thực học sinh! Vui lòng nhập Mã dự thi ở ô trên.', 'warning');
    const codeInp = document.getElementById('loginCodeInput');
    if (codeInp) {
      codeInp.focus();
      codeInp.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.6)';
      setTimeout(() => { codeInp.style.boxShadow = ''; }, 2500);
    }
    return;
  }

  // Open pop-up face capture modal before starting exam session
  openFaceCaptureModal('initial');
}

function startExamSession() {
  // Read Shuffling & Display Customization options
  const shuffleQ = document.getElementById('shuffleQuestionsToggle');
  const shuffleOpt = document.getElementById('shuffleOptionsToggle');
  const liveFill = document.getElementById('liveFillPreviewToggle');

  state.shuffleQuestions = shuffleQ ? shuffleQ.checked : true;
  state.shuffleOptions = shuffleOpt ? shuffleOpt.checked : true;
  state.liveFillPreview = liveFill ? liveFill.checked : true;

  // 1. Select Base Questions
  let baseQuestions = [];
  if (state.testMode === 'set1') {
    baseQuestions = APP_DATA.questions.slice(0, 20);
    state.timeRemaining = 20 * 60;
  } else if (state.testMode === 'set2') {
    baseQuestions = APP_DATA.questions.slice(20, 40);
    state.timeRemaining = 20 * 60;
  } else {
    baseQuestions = [...APP_DATA.questions];
    state.timeRemaining = 45 * 60;
  }

  // 2. Shuffle Questions (Mỗi học sinh có thứ tự câu riêng)
  if (state.shuffleQuestions) {
    baseQuestions = shuffleArray(baseQuestions);
  }

  // 3. Shuffle Options within each question (Đảo phương án A, B, C, D)
  if (state.shuffleOptions) {
    baseQuestions = baseQuestions.map(q => {
      const originalCorrectText = q.options[q.correct];
      const optionKeys = ['A', 'B', 'C', 'D'];
      const shuffledTexts = shuffleArray(Object.values(q.options));
      const newOptions = {};
      let newCorrectKey = 'A';

      optionKeys.forEach((key, idx) => {
        newOptions[key] = shuffledTexts[idx];
        if (shuffledTexts[idx] === originalCorrectText) {
          newCorrectKey = key;
        }
      });

      return {
        ...q,
        options: newOptions,
        correct: newCorrectKey,
        originalCorrect: q.correct
      };
    });
  }

  state.activeQuestions = baseQuestions;
  state.currentIndex = 0;
  state.answers = {};
  state.flagged.clear();
  state.isSubmitted = false;
  state.faceAuditSnapshots = [];

  // Generate unique Exam Code
  state.examCode = generateExamCode();
  const examCodeDisplay = document.getElementById('examCodeDisplay');
  if (examCodeDisplay) examCodeDisplay.textContent = state.examCode;

  // Schedule 1 to 3 random face audits during the exam
  const totalSec = state.testMode === 'full' ? 45 * 60 : 20 * 60;
  const auditCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 times
  state.totalScheduledAudits = auditCount;
  state.currentAuditNum = 0;
  state.scheduledFaceAudits = [];

  const step = Math.floor(totalSec / (auditCount + 1));
  for (let i = 1; i <= auditCount; i++) {
    const jitter = Math.floor((Math.random() - 0.5) * (step * 0.35));
    const target = Math.max(75, Math.min(totalSec - 75, i * step + jitter));
    state.scheduledFaceAudits.push(target);
  }
  state.scheduledFaceAudits.sort((a, b) => a - b);

  // Reset Anti-Cheat tracking
  state.cheatCount = 0;
  state.cheatLogs = [];
  state.lastBlurTime = 0;
  const antiCheatBadge = document.getElementById('antiCheatBadge');
  if (antiCheatBadge) {
    antiCheatBadge.textContent = '🛡️ Giám sát: 0 vi phạm';
    antiCheatBadge.classList.remove('warning');
  }

  // Update Exam Header UI
  const examStudentName = document.getElementById('examStudentName');
  if (examStudentName) examStudentName.textContent = state.selectedStudent.name;

  const examClassName = document.getElementById('examClassName');
  if (examClassName) examClassName.textContent = state.selectedClass;

  const examTotalQ = document.getElementById('examTotalQ');
  if (examTotalQ) examTotalQ.textContent = state.activeQuestions.length;

  const totalQNum = document.getElementById('totalQNum');
  if (totalQNum) totalQNum.textContent = state.activeQuestions.length;

  renderPalette();
  renderCurrentQuestion();
  startTimer();

  switchView('exam', true);
  showToast(`Bắt đầu làm bài: ${state.selectedStudent.name} (Mã đề: ${state.examCode})`, 'success');
}

function startTimer() {
  clearInterval(state.timerInterval);
  updateTimerUI();

  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerUI();

    // Check for random face audit checkpoints
    const totalDuration = state.testMode === 'full' ? 45 * 60 : 20 * 60;
    const elapsed = totalDuration - state.timeRemaining;

    if (state.scheduledFaceAudits && state.scheduledFaceAudits.length > 0) {
      if (elapsed >= state.scheduledFaceAudits[0]) {
        state.scheduledFaceAudits.shift();
        state.currentAuditNum++;

        // Pause timer while modal is open so student doesn't lose test time
        clearInterval(state.timerInterval);
        openFaceCaptureModal('random', state.currentAuditNum, state.totalScheduledAudits);
      }
    }

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      showToast('Hết thời gian làm bài! Hệ thống tự động thu bài và chấm điểm.', 'danger');
      submitExam(true);
    }
  }, 1000);
}

function updateTimerUI() {
  const m = Math.floor(state.timeRemaining / 60);
  const s = state.timeRemaining % 60;
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  
  const timerBox = document.getElementById('examTimer');
  if (timerBox) {
    timerBox.innerHTML = `⏱️ ${timeStr}`;
    if (state.timeRemaining <= 300) {
      timerBox.classList.add('urgent');
    } else {
      timerBox.classList.remove('urgent');
    }
  }
}

function renderCurrentQuestion() {
  const q = state.activeQuestions[state.currentIndex];
  if (!q) return;

  const curQ = document.getElementById('currentQNum');
  const totQ = document.getElementById('totalQNum');
  if (curQ) curQ.textContent = state.currentIndex + 1;
  if (totQ) totQ.textContent = state.activeQuestions.length;

  // Topic & Shuffling Indicator update
  const topicBadge = document.getElementById('questionTopicBadge');
  if (topicBadge) {
    topicBadge.textContent = 'Unit 3: ' + (q.vocab ? q.vocab.toUpperCase() : 'HEALTHY LIVING');
  }

  const shuffleBadge = document.getElementById('shuffleBadge');
  if (shuffleBadge) {
    shuffleBadge.innerHTML = state.shuffleQuestions 
      ? `🔀 Đề xáo trộn câu (Mã đề: <strong>${state.examCode}</strong>)` 
      : '📋 Đề theo thứ tự gốc';
  }

  // Flag status
  const flagBtn = document.getElementById('flagBtn');
  if (flagBtn) {
    if (state.flagged.has(q.id)) {
      flagBtn.classList.add('flagged');
      flagBtn.innerHTML = '🚩 Đã đặt cờ';
    } else {
      flagBtn.classList.remove('flagged');
      flagBtn.innerHTML = '🏳️ Đặt cờ xem lại';
    }
  }

  // Dialogue rendering with interactive blank fill-in
  const dialogueContainer = document.getElementById('dialogueContainer');
  const selectedAns = state.answers[q.id];
  const selectedWordText = selectedAns ? q.options[selectedAns] : null;

  if (dialogueContainer) {
    dialogueContainer.innerHTML = q.dialogue.map((d, dIdx) => {
      const spk = getSpeakerInfo(d.speaker, dIdx);
      let lineText = d.text;

      if (lineText.includes('_____')) {
        if (state.liveFillPreview && selectedWordText) {
          lineText = lineText.replace('_____', `<span class="filled-blank">✍️ ${selectedWordText}</span>`);
        } else {
          lineText = lineText.replace('_____', `<span class="blank-placeholder">_____</span>`);
        }
      }

      return `
        <div class="dialogue-bubble">
          <span class="speaker-pill ${spk.styleClass}">
            <span>${spk.icon}</span> <span>${d.speaker}</span>
          </span>
          <span class="speaker-text">"${lineText}"</span>
        </div>
      `;
    }).join('');
  }

  // Options rendering
  const optionsContainer = document.getElementById('optionsContainer');
  if (optionsContainer) {
    optionsContainer.innerHTML = Object.entries(q.options).map(([key, text]) => `
      <div class="option-item ${selectedAns === key ? 'selected' : ''}" onclick="selectAnswer(${q.id}, '${key}')">
        <div class="option-left">
          <div class="option-key">${key}</div>
          <div class="option-text">${text}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="option-check-icon">✓ Đã chọn</span>
          <span class="option-shortcut-hint">[Phím ${key}]</span>
        </div>
      </div>
    `).join('');
  }

  // Nav buttons
  const prevBtn = document.getElementById('prevQBtn');
  const nextBtn = document.getElementById('nextQBtn');
  if (prevBtn) prevBtn.disabled = state.currentIndex === 0;
  if (nextBtn) {
    if (state.currentIndex === state.activeQuestions.length - 1) {
      nextBtn.textContent = 'Hoàn thành ➔';
    } else {
      nextBtn.textContent = 'Câu sau ➔';
    }
  }

  updatePaletteHighlight();
}

function selectAnswer(questionId, optionKey) {
  state.answers[questionId] = optionKey;
  if (navigator.vibrate) {
    try { navigator.vibrate(15); } catch (e) {}
  }
  renderCurrentQuestion();
  renderPalette();
}

function toggleFlag() {
  const q = state.activeQuestions[state.currentIndex];
  if (!q) return;

  if (state.flagged.has(q.id)) {
    state.flagged.delete(q.id);
  } else {
    state.flagged.add(q.id);
  }
  renderCurrentQuestion();
  renderPalette();
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderCurrentQuestion();
    renderPalette();
  }
}

function nextQuestion() {
  if (state.currentIndex < state.activeQuestions.length - 1) {
    state.currentIndex++;
    renderCurrentQuestion();
    renderPalette();
  } else {
    promptSubmit();
  }
}

function jumpToQuestion(index) {
  state.currentIndex = index;
  renderCurrentQuestion();
  renderPalette();
}

// Question Palette (Desktop & Mobile)
function renderPalette() {
  const grid = document.getElementById('paletteGrid');
  const mobileGrid = document.getElementById('mobilePaletteGrid');
  const answeredCountEl = document.getElementById('answeredCount');
  
  const answeredCount = Object.keys(state.answers).length;
  const totalCount = state.activeQuestions.length;

  if (answeredCountEl) {
    answeredCountEl.textContent = `${answeredCount}/${totalCount}`;
  }

  // Update progress bar
  const pBar = document.getElementById('examProgressBar');
  if (pBar) {
    const percent = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
    pBar.style.width = `${percent}%`;
  }

  // Update mobile indicators
  const mobileQCurrent = document.getElementById('mobileQCurrent');
  const mobileQTotal = document.getElementById('mobileQTotal');
  const mobileDrawerAnswered = document.getElementById('mobileDrawerAnswered');
  const mobileDrawerTotal = document.getElementById('mobileDrawerTotal');

  if (mobileQCurrent) mobileQCurrent.textContent = state.currentIndex + 1;
  if (mobileQTotal) mobileQTotal.textContent = totalCount;
  if (mobileDrawerAnswered) mobileDrawerAnswered.textContent = answeredCount;
  if (mobileDrawerTotal) mobileDrawerTotal.textContent = totalCount;

  // Nav buttons state on mobile bar
  const mobilePrevBtn = document.getElementById('mobilePrevBtn');
  const mobileNextBtn = document.getElementById('mobileNextBtn');
  if (mobilePrevBtn) mobilePrevBtn.disabled = state.currentIndex === 0;
  if (mobileNextBtn) {
    mobileNextBtn.textContent = state.currentIndex === totalCount - 1 ? 'Nộp ➔' : 'Sau ➔';
  }

  const cellsHtml = state.activeQuestions.map((q, idx) => {
    const isAnswered = Boolean(state.answers[q.id]);
    const isCurrent = idx === state.currentIndex;
    const isFlagged = state.flagged.has(q.id);

    let classes = ['palette-cell'];
    if (isAnswered) classes.push('answered');
    if (isCurrent) classes.push('current');
    if (isFlagged) classes.push('flagged');

    return `<div class="${classes.join(' ')}" onclick="jumpToQuestion(${idx}); closeMobilePalette();">${idx + 1}</div>`;
  }).join('');

  if (grid) grid.innerHTML = cellsHtml;
  if (mobileGrid) mobileGrid.innerHTML = cellsHtml;
}

function updatePaletteHighlight() {
  document.querySelectorAll('.palette-cell').forEach((cell, idx) => {
    if (idx === state.currentIndex) {
      cell.classList.add('current');
    } else {
      cell.classList.remove('current');
    }
  });
}

// Mobile Palette Drawer Controls
function openMobilePalette() {
  const drawer = document.getElementById('mobilePaletteDrawer');
  if (drawer) {
    drawer.classList.add('active');
    renderPalette();
  }
}

function closeMobilePalette() {
  const drawer = document.getElementById('mobilePaletteDrawer');
  if (drawer) drawer.classList.remove('active');
}

function handleDrawerBackdropClick(e) {
  if (e.target && e.target.id === 'mobilePaletteDrawer') {
    closeMobilePalette();
  }
}

// ==========================================
// DEEP ANTI-CHEAT (DESKTOP & MOBILE TAB/APP SWITCH DETECTION)
// ==========================================

function initAntiCheatMonitoring() {
  // 1. Tab & App Switching Detection (Mobile & Desktop)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      handleExamBlur('Chuyển tab hoặc ẩn trình duyệt');
    }
  });

  window.addEventListener('blur', () => {
    handleExamBlur('Rời khỏi cửa sổ bài thi');
  });

  window.addEventListener('pagehide', () => {
    handleExamBlur('Rời trang kiểm tra');
  });

  // 2. Prevent Copy, Cut, Paste
  document.addEventListener('copy', (e) => {
    if (state.currentView === 'exam') {
      e.preventDefault();
      showToast('⚠️ Tính năng sao chép (Copy) bị vô hiệu hóa trong bài thi!', 'warning');
    }
  });

  document.addEventListener('cut', (e) => {
    if (state.currentView === 'exam') {
      e.preventDefault();
      showToast('⚠️ Không thể cắt nội dung trong bài thi!', 'warning');
    }
  });

  document.addEventListener('paste', (e) => {
    if (state.currentView === 'exam') {
      e.preventDefault();
      showToast('⚠️ Không thể dán (Paste) nội dung ngoài vào bài thi!', 'warning');
    }
  });

  // 3. Prevent Context Menu (Right Click)
  document.addEventListener('contextmenu', (e) => {
    if (state.currentView === 'exam') {
      e.preventDefault();
      showToast('⚠️ Chuột phải đã bị khóa để đảm bảo tính nghiêm túc!', 'warning');
    }
  });
}

function handleExamBlur(reason = 'Rời màn hình') {
  if (state.currentView !== 'exam' || state.isSubmitted) return;

  const now = Date.now();
  if (now - state.lastBlurTime < 2500) return; // avoid duplicate bounce events
  state.lastBlurTime = now;

  state.cheatCount++;
  const timeStr = new Date().toLocaleTimeString('vi-VN');
  state.cheatLogs.push({ time: timeStr, reason: reason });

  // Update UI badge
  const badge = document.getElementById('antiCheatBadge');
  if (badge) {
    badge.textContent = `⚠️ ${state.cheatCount} vi phạm`;
    badge.classList.add('warning');
  }

  // Haptic alert on phone
  if (navigator.vibrate) {
    try { navigator.vibrate([200, 100, 200, 100, 300]); } catch (e) {}
  }

  // Automatic submission if exceeded maximum allowed strikes
  if (state.cheatCount >= state.maxAllowedViolations) {
    showToast(`🚨 BẠN ĐÃ VI PHẠM QUÁ ${state.maxAllowedViolations} LẦN! Hệ thống tự động thu bài và chấm điểm ngay.`, 'danger');
    const modal = document.getElementById('antiCheatModal');
    if (modal) modal.classList.remove('active');
    submitExam(true);
    return;
  }

  // Open Anti-Cheat Warning Modal
  const countEl = document.getElementById('antiCheatModalCount');
  if (countEl) countEl.textContent = state.cheatCount;

  const modal = document.getElementById('antiCheatModal');
  if (modal) modal.classList.add('active');

  showToast(`Cảnh báo: Bạn vừa rời màn hình thi lần thứ ${state.cheatCount}/${state.maxAllowedViolations} (${reason})!`, 'danger');
}

function acknowledgeAntiCheatWarning() {
  const modal = document.getElementById('antiCheatModal');
  if (modal) modal.classList.remove('active');
  showToast('Đã quay lại bài thi. Vui lòng tập trung làm bài nghiêm túc!', 'info');
}

function handleGlobalKeydown(e) {
  if (state.currentView !== 'exam' || state.isSubmitted) return;

  const isCtrl = e.ctrlKey || e.metaKey;
  const key = e.key.toUpperCase();

  // Block Developer Tools & Inspection shortcuts
  if (
    e.key === 'F12' ||
    (isCtrl && ['U', 'C', 'V', 'P', 'S'].includes(key)) ||
    (isCtrl && e.shiftKey && ['I', 'J', 'C'].includes(key))
  ) {
    e.preventDefault();
    showToast('⚠️ Phím tắt này bị vô hiệu hóa trong phòng thi trực tuyến!', 'warning');
    return;
  }

  // Quick answering shortcuts
  if (['A', 'B', 'C', 'D'].includes(key)) {
    const q = state.activeQuestions[state.currentIndex];
    if (q) selectAnswer(q.id, key);
  } else if (['1', '2', '3', '4'].includes(key)) {
    const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
    const q = state.activeQuestions[state.currentIndex];
    if (q) selectAnswer(q.id, keyMap[key]);
  } else if (e.key === 'ArrowRight') {
    nextQuestion();
  } else if (e.key === 'ArrowLeft') {
    prevQuestion();
  }
}

// ==========================================
// SUBMIT & GRADING
// ==========================================

function promptSubmit() {
  const answeredCount = Object.keys(state.answers).length;
  const total = state.activeQuestions.length;
  const unanswered = total - answeredCount;

  const modal = document.getElementById('confirmSubmitModal');
  const textEl = document.getElementById('confirmSubmitText');

  if (unanswered > 0) {
    textEl.innerHTML = `
      <p style="font-size:1.05rem; margin-bottom: 0.5rem;">Bạn đã làm <strong>${answeredCount}</strong> / <strong>${total}</strong> câu hỏi.</p>
      <p style="color: var(--warning); font-weight:600;">⚠️ Lưu ý: Bạn còn <strong>${unanswered} câu chưa trả lời</strong>!</p>
      <p style="color: var(--text-muted); font-size:0.9rem; margin-top: 0.5rem;">Bạn có chắc chắn muốn nộp bài ngay bây giờ?</p>
    `;
  } else {
    textEl.innerHTML = `
      <p style="font-size:1.05rem; color:var(--success); font-weight:600; margin-bottom: 0.5rem;">🎉 Chúc mừng! Bạn đã hoàn thành toàn bộ ${total}/${total} câu hỏi.</p>
      <p style="color: var(--text-muted); font-size:0.9rem;">Bạn có muốn kết thúc bài thi và xem kết quả chấm điểm ngay?</p>
    `;
  }

  modal.classList.add('active');
}

function closeSubmitModal() {
  const modal = document.getElementById('confirmSubmitModal');
  if (modal) modal.classList.remove('active');
}

function submitExam(isAuto = false) {
  closeSubmitModal();
  clearInterval(state.timerInterval);
  stopWebcamStream();
  state.isSubmitted = true;

  // Grade calculation & Build answersDetail preserving exact options and selections
  let correctCount = 0;
  const answersDetail = state.activeQuestions.map((q, idx) => {
    const userKey = state.answers[q.id] || null;
    const isCorrect = Boolean(userKey && userKey === q.correct);
    if (isCorrect) {
      correctCount++;
    }
    const userText = userKey && q.options && q.options[userKey] ? q.options[userKey] : '';
    const correctText = q.options && q.options[q.correct] ? q.options[q.correct] : '';

    return {
      index: idx + 1,
      questionId: q.id,
      vocab: q.vocab,
      dialogue: q.dialogue,
      options: { ...q.options },
      userKey: userKey,
      userText: userText,
      correctKey: q.correct,
      correctText: correctText,
      isCorrect: isCorrect,
      explanation: q.explanation
    };
  });

  const total = state.activeQuestions.length;
  // Exact 2-decimal scale for 0.25 pt increments (e.g. 35/40 = 8.75, 37/40 = 9.25, 39/40 = 9.75)
  const rawScore = (correctCount / total) * 10;
  const score = Math.round(rawScore * 100) / 100;
  const timeUsedMinutes = Math.ceil(((state.testMode === 'full' ? 45 * 60 : 20 * 60) - state.timeRemaining) / 60);

  const result = {
    classId: state.selectedClass,
    studentCode: state.selectedStudent.code,
    studentName: state.selectedStudent.name,
    dob: state.selectedStudent.dob,
    gender: state.selectedStudent.gender,
    score: score,
    correctCount: correctCount,
    totalQuestions: total,
    mode: state.testMode,
    timeSpent: `${timeUsedMinutes} phút`,
    submittedAt: new Date().toLocaleString('vi-VN'),
    answers: state.answers,
    answersDetail: answersDetail,
    cheatCount: state.cheatCount,
    cheatLogs: state.cheatLogs,
    examCode: state.examCode,
    isShuffled: state.shuffleQuestions,
    faceAudit: {
      initialPhoto: state.initialFacePhoto || null,
      snapshots: state.faceAuditSnapshots || []
    }
  };

  state.lastResult = result;
  saveSubmission(result);

  renderResultScreen(result);
  switchView('result', true);
  showToast(`Đã nộp bài thành công! Điểm của bạn: ${score}/10 (${correctCount}/${total} câu đúng - Mã đề: ${state.examCode})`, 'success');
}

function renderResultScreen(result) {
  // Guarantee strict mathematical harmony between answersDetail and top summary cards
  if (result.answersDetail && Array.isArray(result.answersDetail) && result.answersDetail.length > 0) {
    const detailCorrect = result.answersDetail.filter(d => Boolean(d.isCorrect)).length;
    result.correctCount = detailCorrect;
    result.totalQuestions = result.answersDetail.length;
    result.score = Math.round(((detailCorrect / result.totalQuestions) * 10) * 100) / 100;
  } else if (result.correctCount !== undefined && result.totalQuestions) {
    result.correctCount = Math.max(0, Math.min(result.totalQuestions, Math.round(Number(result.correctCount))));
    result.score = Math.round(((result.correctCount / result.totalQuestions) * 10) * 100) / 100;
  }

  document.getElementById('resStudentName').textContent = result.studentName;
  document.getElementById('resClassName').textContent = result.classId;
  document.getElementById('resScore').textContent = result.score;
  document.getElementById('resCorrect').textContent = `${result.correctCount}/${result.totalQuestions}`;
  document.getElementById('resAccuracy').textContent = `${Math.round((result.correctCount / result.totalQuestions) * 100)}%`;
  document.getElementById('resTime').textContent = result.timeSpent;

  // Exam code display
  const resExamCode = document.getElementById('resExamCode');
  if (resExamCode) resExamCode.textContent = result.examCode || state.examCode || '901';

  // Anti-cheat summary on result card
  const resAntiCheat = document.getElementById('resAntiCheatSummary');
  if (resAntiCheat) {
    if (result.cheatCount > 0) {
      resAntiCheat.innerHTML = `<span class="badge badge-danger">⚠️ Phát hiện ${result.cheatCount} lần rời tab</span>`;
    } else {
      resAntiCheat.innerHTML = `<span class="badge badge-success">🛡️ Thi trung thực (0 vi phạm)</span>`;
    }
  }

  // Evaluation badge
  const evalEl = document.getElementById('resEvaluation');
  if (evalEl) {
    if (result.score >= 9.0) {
      evalEl.innerHTML = '<span class="badge badge-success">🏆 Xuất sắc</span>';
    } else if (result.score >= 8.0) {
      evalEl.innerHTML = '<span class="badge badge-primary">⭐ Giỏi</span>';
    } else if (result.score >= 6.5) {
      evalEl.innerHTML = '<span class="badge badge-secondary">👍 Khá</span>';
    } else if (result.score >= 5.0) {
      evalEl.innerHTML = '<span class="badge badge-warning">👌 Đạt yêu cầu</span>';
    } else {
      evalEl.innerHTML = '<span class="badge badge-danger">⚠️ Cần cố gắng ôn luyện thêm</span>';
    }
  }

  // Render question by question review
  const reviewContainer = document.getElementById('resultReviewList');
  if (!reviewContainer) return;

  const hasDetail = result.answersDetail && Array.isArray(result.answersDetail) && result.answersDetail.length > 0;

  if (hasDetail) {
    reviewContainer.innerHTML = result.answersDetail.map((item, idx) => {
      const isCorrect = item.isCorrect;
      const qNum = item.index || (idx + 1);

      return `
        <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem; flex-wrap:wrap; gap:0.5rem;">
            <h4 style="font-size:1rem; font-family:var(--font-heading);">
              Câu ${qNum}: ${isCorrect ? '✅ Đúng (+0.25đ)' : '❌ Sai (0đ)'} 
              <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}" style="margin-left:0.5rem;">Từ vựng: ${item.vocab}</span>
            </h4>
            <span style="font-size:0.85rem; color:var(--text-muted);">
              Lựa chọn của bạn: <strong style="color:${isCorrect ? 'var(--success)' : 'var(--danger)'};">${item.userKey ? `${item.userKey}. ${item.userText}` : '(Chưa chọn)'}</strong> 
              ${!isCorrect ? `| Đáp án đúng: <strong style="color:var(--success);">${item.correctKey}. ${item.correctText}</strong>` : ''}
            </span>
          </div>

          <div style="background:var(--bg-primary); padding:0.75rem 1rem; border-radius:var(--radius-sm); margin-bottom:0.75rem;">
            ${item.dialogue ? item.dialogue.map(d => `<div style="font-size:0.95rem;"><strong>${d.speaker}:</strong> "${d.text}"</div>`).join('') : ''}
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.5rem; font-size:0.9rem;">
            ${item.options ? Object.entries(item.options).map(([k, val]) => {
              const isOptCorrect = k === item.correctKey;
              const isOptSelected = k === item.userKey;
              let badgeText = '';
              let bg = 'transparent';
              let border = 'var(--border-color)';

              if (isOptCorrect && isOptSelected) {
                badgeText = '✓ (Bạn chọn đúng)';
                bg = 'rgba(16,185,129,0.18)';
                border = 'var(--success)';
              } else if (isOptCorrect) {
                badgeText = '✓ (Đáp án chuẩn)';
                bg = 'rgba(16,185,129,0.18)';
                border = 'var(--success)';
              } else if (isOptSelected) {
                badgeText = '✗ (Bạn đã chọn)';
                bg = 'rgba(244,63,94,0.18)';
                border = 'var(--danger)';
              }

              return `
                <div style="padding:0.45rem 0.65rem; border-radius:var(--radius-sm); background:${bg}; border:1px solid ${border}; line-height:1.4;">
                  <strong>${k}.</strong> ${val} ${badgeText ? `<span style="font-size:0.8rem; font-weight:700; margin-left:4px;">${badgeText}</span>` : ''}
                </div>
              `;
            }).join('') : ''}
          </div>

          <div class="explanation-box" style="margin-top:0.75rem;">
            💡 <strong>Giải thích & Dịch nghĩa:</strong> ${item.explanation}
          </div>
        </div>
      `;
    }).join('');
  } else {
    // Clean educational review for legacy submissions (avoids false-mismatch red tags)
    reviewContainer.innerHTML = `
      <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:1rem 1.25rem; margin-bottom:1.5rem;">
        <div style="display:flex; align-items:center; gap:0.5rem; color:var(--warning); font-weight:700; margin-bottom:0.35rem;">
          <span>📌</span> <span>Thông tin kết quả bài thi:</span>
        </div>
        <p style="margin:0; font-size:0.92rem; color:var(--text-main); line-height:1.55;">
          Kết quả thi của em: <strong>${result.score}/10 điểm (${result.correctCount}/${result.totalQuestions} câu đúng)</strong>.<br>
          <span style="font-size:0.85rem; color:var(--text-muted);">
            <em>(Bài làm này được nộp ở phiên bản trước khi hệ thống lưu vết chi tiết từng phương án đảo đề. Dưới đây là ngân hàng 40 câu hỏi chuẩn Unit 3 kèm đáp án và giải thích để em ôn tập lại kiến thức):</em>
          </span>
        </p>
      </div>
      ${APP_DATA.questions.map((q, idx) => `
        <div class="review-item" style="border-left:4px solid var(--primary);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem; flex-wrap:wrap; gap:0.5rem;">
            <h4 style="font-size:1rem; font-family:var(--font-heading);">
              Câu ${idx + 1}: <span class="badge badge-primary">Từ vựng: ${q.vocab}</span>
            </h4>
            <span style="font-size:0.85rem; color:var(--success); font-weight:700;">
              Đáp án chuẩn: ${q.correct}. ${q.options[q.correct]}
            </span>
          </div>

          <div style="background:var(--bg-primary); padding:0.75rem 1rem; border-radius:var(--radius-sm); margin-bottom:0.75rem;">
            ${q.dialogue ? q.dialogue.map(d => `<div style="font-size:0.95rem;"><strong>${d.speaker}:</strong> "${d.text}"</div>`).join('') : ''}
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.5rem; font-size:0.9rem;">
            ${Object.entries(q.options).map(([k, val]) => `
              <div style="padding:0.45rem 0.65rem; border-radius:var(--radius-sm); background:${k === q.correct ? 'rgba(16,185,129,0.18)' : 'transparent'}; border:1px solid ${k === q.correct ? 'var(--success)' : 'var(--border-color)'}; line-height:1.4;">
                <strong>${k}.</strong> ${val} ${k === q.correct ? '<span style="font-size:0.8rem; font-weight:700; margin-left:4px; color:var(--success);">✓ (Đáp án chuẩn)</span>' : ''}
              </div>
            `).join('')}
          </div>

          <div class="explanation-box" style="margin-top:0.75rem;">
            💡 <strong>Giải thích & Dịch nghĩa:</strong> ${q.explanation}
          </div>
        </div>
      `).join('')}
    `;
  }
}

// ==========================================
// VOCABULARY STUDY / FLASHCARDS
// ==========================================

function renderVocabList() {
  const container = document.getElementById('vocabGrid');
  if (!container) return;

  container.innerHTML = APP_DATA.vocabulary.map(v => `
    <div class="vocab-card">
      <div>
        <div class="vocab-word">
          <span>${v.word} <small style="font-size:0.75rem; color:var(--text-dim); font-weight:500;">(${v.pos})</small></span>
          <button class="vocab-audio-btn" title="Phát âm từ vựng" onclick="speakWord('${v.word.replace(/'/g, "\\'")}')">🔊</button>
        </div>
        <div class="vocab-ipa">${v.ipa}</div>
        <div class="vocab-meaning">👉 ${v.meaning}</div>
      </div>
      <div class="vocab-example">
        "${v.example}"
      </div>
    </div>
  `).join('');
}

function speakWord(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
    showToast(`Đang phát âm: "${text}"`, 'info');
  } else {
    showToast('Trình duyệt của bạn không hỗ trợ phát âm âm thanh.', 'warning');
  }
}

// ==========================================
// TEACHER DASHBOARD
// ==========================================

function renderTeacherDashboard(triggerSync = true) {
  if (triggerSync) {
    syncSubmissionsFromServer();
  }
  const submissions = getSubmissions();
  const c92 = APP_DATA.classes['9.2C'].students;
  const c95 = APP_DATA.classes['9.5C'].students;
  const allStudents = [
    ...c92.map(s => ({ ...s, classId: '9.2C' })),
    ...c95.map(s => ({ ...s, classId: '9.5C' }))
  ];

  const totalRegistered = allStudents.length; // 72
  const completedSubmissions = Object.values(submissions);
  const totalCompleted = completedSubmissions.length;
  
  // Calculate average score
  let avgScore = 0;
  let passCount = 0;
  if (totalCompleted > 0) {
    const sum = completedSubmissions.reduce((acc, cur) => acc + cur.score, 0);
    avgScore = (sum / totalCompleted).toFixed(1);
    passCount = completedSubmissions.filter(s => s.score >= 5.0).length;
  }
  const passRate = totalCompleted > 0 ? Math.round((passCount / totalCompleted) * 100) : 0;

  // KPI UI
  const kpiTot = document.getElementById('kpiTotalStudents');
  const kpiComp = document.getElementById('kpiCompleted');
  const kpiAvg = document.getElementById('kpiAverageScore');
  const kpiPass = document.getElementById('kpiPassRate');

  if (kpiTot) kpiTot.textContent = totalRegistered;
  if (kpiComp) kpiComp.textContent = totalCompleted;
  if (kpiAvg) kpiAvg.textContent = avgScore;
  if (kpiPass) kpiPass.textContent = `${passRate}%`;

  // Render Table
  renderTeacherTable(allStudents, submissions);

  // Render Item Analysis (Top mistake questions)
  renderItemAnalysis(completedSubmissions);
}

function renderTeacherTable(allStudents, submissions) {
  const tbody = document.getElementById('teacherTableBody');
  if (!tbody) return;

  const classFilter = state.teacherClassFilter;
  const statusFilter = state.teacherStatusFilter;
  const search = state.teacherSearch.toLowerCase().trim();

  const filtered = allStudents.filter(s => {
    // Class filter
    if (classFilter !== 'all' && s.classId !== classFilter) return false;

    const sub = submissions[`${s.classId}_${s.code}`];
    // Status filter
    if (statusFilter === 'done' && !sub) return false;
    if (statusFilter === 'pending' && sub) return false;

    // Search filter
    if (search) {
      const matchName = s.name.toLowerCase().includes(search);
      const matchCode = s.code.includes(search);
      const matchLogin = s.loginCode && s.loginCode.includes(search);
      if (!matchName && !matchCode && !matchLogin) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding: 2.5rem; color:var(--text-muted);">
          Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const sub = submissions[`${s.classId}_${s.code}`];
    const isDone = Boolean(sub);

    return `
      <tr>
        <td><strong>${s.stt}</strong></td>
        <td>
          <code>${s.code}</code>
          <div style="margin-top:2px;">
            <span class="login-code-pill" style="font-size:0.75rem;">Mã: ${s.loginCode || s.code.slice(-4)}</span>
          </div>
        </td>
        <td><strong>${s.name}</strong></td>
        <td><span class="badge ${s.classId === '9.2C' ? 'badge-primary' : 'badge-secondary'}">${s.classId}</span></td>
        <td>${s.dob}</td>
        <td>${s.gender}</td>
        <td>
          <span class="status-badge ${isDone ? 'done' : 'pending'}">
            ${isDone ? '● Đã nộp bài' : '○ Chưa làm'}
          </span>
          ${isDone && sub.cheatCount > 0 ? `<div style="margin-top:4px;"><span class="badge badge-danger" style="font-size:0.72rem; padding:0.15rem 0.5rem;" title="Học sinh đã chuyển tab/thoát ứng dụng ${sub.cheatCount} lần">⚠️ Rời tab: ${sub.cheatCount} lần</span></div>` : ''}
          ${isDone && sub.faceAudit && (sub.faceAudit.initialPhoto || (sub.faceAudit.snapshots && sub.faceAudit.snapshots.length > 0)) ? `<div style="margin-top:2px;"><span class="badge badge-success" style="font-size:0.7rem; padding:0.1rem 0.4rem;">📸 Có ảnh quét mặt</span></div>` : ''}
        </td>
        <td>
          ${isDone ? `<span class="exam-code-badge" style="font-size:0.8rem;">${sub.examCode || '901'}</span>` : '<span style="color:var(--text-dim);">-</span>'}
        </td>
        <td>
          ${isDone ? `<strong style="font-size:1.15rem; color:${sub.score >= 8 ? 'var(--success)' : (sub.score >= 5 ? 'var(--primary)' : 'var(--danger)')};">${sub.score}</strong> <small style="color:var(--text-dim);">(${sub.correctCount}/${sub.totalQuestions})</small>` : '<span style="color:var(--text-dim);">-</span>'}
        </td>
        <td>
          ${isDone ? `
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <button class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.8rem;" onclick="viewStudentDetail('${s.classId}', '${s.code}')">👁️ Xem bài</button>
              <button class="btn btn-danger" style="padding:0.35rem 0.65rem; font-size:0.8rem;" title="Xóa kết quả để học sinh thi lại" onclick="resetStudentAttempt('${s.classId}', '${s.code}', '${s.name.replace(/'/g, "\\'")}')">🔄 Reset</button>
            </div>
          ` : `
            <button class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.8rem; opacity:0.75;" onclick="loginAsStudent('${s.classId}', '${s.code}')">✍️ Vào thi</button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function setTeacherClassFilter(cId) {
  state.teacherClassFilter = cId;
  document.querySelectorAll('[data-teacher-class]').forEach(btn => {
    if (btn.getAttribute('data-teacher-class') === cId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderTeacherDashboard();
}

function handleTeacherSearch(e) {
  state.teacherSearch = e.target.value;
  renderTeacherDashboard();
}

function handleTeacherStatusFilter(e) {
  state.teacherStatusFilter = e.target.value;
  renderTeacherDashboard();
}

function resetStudentAttempt(classId, studentCode, studentName) {
  if (confirm(`Bạn có chắc chắn muốn xóa bài làm của học sinh "${studentName}" (Lớp ${classId}) để em làm lại bài từ đầu không?`)) {
    deleteSubmission(classId, studentCode);
    renderTeacherDashboard();
    showToast(`Đã reset kết quả của học sinh ${studentName}`, 'info');
  }
}

function loginAsStudent(classId, studentCode) {
  state.selectedClass = classId;
  const students = APP_DATA.classes[classId].students;
  state.selectedStudent = students.find(s => s.code === studentCode) || null;

  const classSelect = document.getElementById('classSelect');
  if (classSelect) classSelect.value = classId;
  updateStudentList(true);

  const studentSelect = document.getElementById('studentSelect');
  if (studentSelect) studentSelect.value = studentCode;

  const loginInput = document.getElementById('loginCodeInput');
  if (loginInput && state.selectedStudent && state.selectedStudent.loginCode) {
    loginInput.value = state.selectedStudent.loginCode;
  }

  updateStudentPreview();
  switchView('student-select', true);
  showToast(`Đã chuẩn bị làm bài cho: ${state.selectedStudent.name}`, 'info');
}

function viewStudentDetail(classId, studentCode) {
  const submissions = getSubmissions();
  const sub = submissions[`${classId}_${studentCode}`];
  if (!sub) return;

  // Guarantee strict mathematical harmony between answersDetail and summary counters
  if (sub.answersDetail && Array.isArray(sub.answersDetail) && sub.answersDetail.length > 0) {
    const detailCorrect = sub.answersDetail.filter(d => Boolean(d.isCorrect)).length;
    sub.correctCount = detailCorrect;
    sub.totalQuestions = sub.answersDetail.length;
    sub.score = Math.round(((detailCorrect / sub.totalQuestions) * 10) * 100) / 100;
  } else if (sub.correctCount !== undefined && sub.totalQuestions) {
    sub.correctCount = Math.max(0, Math.min(sub.totalQuestions, Math.round(Number(sub.correctCount))));
    sub.score = Math.round(((sub.correctCount / sub.totalQuestions) * 10) * 100) / 100;
  }

  const modal = document.getElementById('studentDetailModal');
  const title = document.getElementById('modalStudentTitle');
  if (title) {
    title.textContent = `Chi tiết bài làm: ${sub.studentName} - Lớp ${sub.classId}`;
  }
  
  const content = document.getElementById('modalStudentContent');
  if (!content) return;

  // Face Audit Evidence HTML
  const hasFaceAudit = sub.faceAudit && (sub.faceAudit.initialPhoto || (sub.faceAudit.snapshots && sub.faceAudit.snapshots.length > 0));
  let faceAuditHtml = '';

  if (hasFaceAudit) {
    faceAuditHtml = `
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <strong style="color:var(--text-main); font-size:0.95rem;">📸 Hồ sơ đối chiếu khuôn mặt thí sinh (Webcam Audit):</strong>
          <span class="badge badge-success">Đã lưu ảnh đối chiếu</span>
        </div>
        <div class="face-audit-gallery">
          ${sub.faceAudit.initialPhoto ? `
            <div class="face-audit-item">
              <img src="${sub.faceAudit.initialPhoto}" alt="Ảnh chân dung trước giờ thi" />
              <div class="face-audit-tag">Ảnh xác thực đầu giờ thi</div>
            </div>
          ` : ''}
          ${sub.faceAudit.snapshots && sub.faceAudit.snapshots.length > 0 ? sub.faceAudit.snapshots.map((snap, sIdx) => `
            <div class="face-audit-item">
              ${snap.photo ? `<img src="${snap.photo}" alt="Quét ngẫu nhiên lúc ${snap.time}" />` : '<div style="padding:1rem; color:var(--text-dim); font-size:0.8rem;">Không có camera</div>'}
              <div class="face-audit-tag">${snap.reason || 'Quét ngẫu nhiên'}: <strong>${snap.time}</strong></div>
            </div>
          `).join('') : ''}
        </div>
      </div>
    `;
  } else {
    faceAuditHtml = `
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:0.75rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; font-size:0.85rem; color:var(--text-muted);">
        📸 <em>Thí sinh làm bài trên thiết bị chưa kích hoạt camera hoặc là bản ghi dữ liệu mẫu.</em>
      </div>
    `;
  }

  content.innerHTML = `
    <div style="background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem;">
      <div><small style="color:var(--text-muted);">Điểm số:</small><div style="font-size:1.5rem; font-weight:700; color:var(--primary);">${sub.score}/10</div></div>
      <div><small style="color:var(--text-muted);">Số câu đúng:</small><div style="font-size:1.2rem; font-weight:700;">${sub.correctCount}/${sub.totalQuestions}</div></div>
      <div><small style="color:var(--text-muted);">Mã đề thi:</small><div style="font-size:1.15rem; font-weight:700; color:#fbbf24;">${sub.examCode || '901'}</div></div>
      <div><small style="color:var(--text-muted);">Thời gian nộp:</small><div style="font-size:0.9rem; font-weight:600;">${sub.submittedAt}</div></div>
      <div><small style="color:var(--text-muted);">Mã định danh:</small><div style="font-size:0.9rem; font-family:monospace;">${sub.studentCode}</div></div>
    </div>

    <!-- Anti-Cheat Audit Summary -->
    <div style="background:${sub.cheatCount > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)'}; border:1px solid ${sub.cheatCount > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}; padding:0.85rem 1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
      <div style="font-weight:700; color:${sub.cheatCount > 0 ? 'var(--danger)' : 'var(--success)'}; display:flex; align-items:center; gap:0.4rem; font-size:0.92rem;">
        🛡️ Giám sát thi cử (Anti-Cheat): ${sub.cheatCount > 0 ? `Cảnh báo ${sub.cheatCount} lần rời màn hình thi` : 'Không có vi phạm rời tab (Thi trung thực)'}
      </div>
      ${sub.cheatLogs && sub.cheatLogs.length > 0 ? `
        <ul style="font-size:0.82rem; color:var(--text-muted); margin-top:0.4rem; padding-left:1.2rem; line-height:1.5;">
          ${sub.cheatLogs.map(l => `<li>Thời điểm: <strong>${l.time}</strong> - Hành vi: ${l.reason}</li>`).join('')}
        </ul>
      ` : ''}
    </div>

    <!-- Webcam Face Audit Evidence -->
    ${faceAuditHtml}

    <div style="max-height:480px; overflow-y:auto; padding-right:6px;">
      ${(sub.answersDetail && Array.isArray(sub.answersDetail) && sub.answersDetail.length > 0)
        ? sub.answersDetail.map((d, idx) => {
            const isCorrect = d.isCorrect;
            return `
              <div style="padding:0.85rem; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; flex-wrap:wrap; background:${isCorrect ? 'transparent' : 'rgba(244,63,94,0.04)'};">
                <div style="flex:1; min-width:240px;">
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                    <strong>Câu ${d.index || (idx + 1)}</strong>
                    <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}">Từ vựng: ${d.vocab}</span>
                    <span style="color:${isCorrect ? 'var(--success)' : 'var(--danger)'}; font-weight:700;">
                      ${isCorrect ? '✓ Đúng' : '✗ Sai'}
                    </span>
                  </div>
                  <div style="font-size:0.88rem; color:var(--text-main); margin-top:0.2rem;">
                    Học sinh chọn: <strong style="color:${isCorrect ? 'var(--success)' : 'var(--danger)'};">${d.userKey ? `${d.userKey}. ${d.userText}` : '(Chưa chọn)'}</strong>
                  </div>
                  ${!isCorrect ? `
                    <div style="font-size:0.85rem; color:var(--success); margin-top:3px;">
                      Đáp án chuẩn: <strong>${d.correctKey}. ${d.correctText}</strong>
                    </div>
                  ` : ''}
                </div>
                <div style="text-align:right;">
                  <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}" style="font-size:0.8rem;">${isCorrect ? '+0.25đ' : '0đ'}</span>
                </div>
              </div>
            `;
          }).join('')
        : `
          <div style="padding:0.75rem 1rem; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.88rem; color:var(--text-main); line-height:1.5;">
            📌 <strong>Kết quả bài thi đã ghi nhận chính xác:</strong> Thí sinh đạt <strong>${sub.correctCount}/${sub.totalQuestions} câu đúng (${sub.score}/10 điểm)</strong>.<br>
            <span style="color:var(--text-muted); font-size:0.82rem;"><em>(Lưu ý: Bài làm này được nộp ở phiên bản trước khi hệ thống lưu vết chi tiết từng phương án đảo đề. Thống kê điểm số và số câu đúng được bảo toàn chính xác. Dưới đây là danh sách ngân hàng câu hỏi tham chiếu kèm đáp án chuẩn Unit 3):</em></span>
          </div>
          ${APP_DATA.questions.map((q, idx) => `
            <div style="padding:0.85rem; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; flex-wrap:wrap;">
              <div style="flex:1; min-width:240px;">
                <div>
                  <strong>Câu ${idx + 1}</strong> <span class="badge badge-primary" style="margin-left:0.35rem;">Từ vựng: ${q.vocab}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
                  ${q.dialogue ? q.dialogue.map(d => `<div><strong>${d.speaker}:</strong> "${d.text}"</div>`).join('') : ''}
                </div>
              </div>
              <div style="text-align:right;">
                <span class="badge badge-success" style="font-size:0.82rem;">Đáp án chuẩn: ${q.correct}. ${q.options[q.correct]}</span>
              </div>
            </div>
          `).join('')}
        `
      }
    </div>
  `;

  if (modal) modal.classList.add('active');
}

function closeStudentDetailModal() {
  const modal = document.getElementById('studentDetailModal');
  if (modal) modal.classList.remove('active');
}

// Item Analysis: Find questions where students fail the most
function renderItemAnalysis(completedSubmissions) {
  const container = document.getElementById('itemAnalysisList');
  if (!container) return;

  if (completedSubmissions.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">Chưa có dữ liệu bài nộp để phân tích câu hỏi.</p>';
    return;
  }

  const stats = APP_DATA.questions.map(q => {
    let wrongCount = 0;
    let answeredCount = 0;

    completedSubmissions.forEach(sub => {
      if (sub.answersDetail && Array.isArray(sub.answersDetail)) {
        const item = sub.answersDetail.find(d => d.questionId === q.id);
        if (item) {
          answeredCount++;
          if (!item.isCorrect) {
            wrongCount++;
          }
        }
      } else if (sub.answers && sub.answers[q.id] && sub.isShuffled === false) {
        answeredCount++;
        if (sub.answers[q.id] !== q.correct) {
          wrongCount++;
        }
      }
    });

    const errorRate = answeredCount > 0 ? Math.round((wrongCount / answeredCount) * 100) : 0;
    return { q, wrongCount, answeredCount, errorRate };
  });

  stats.sort((a, b) => b.errorRate - a.errorRate);
  const topWrong = stats.slice(0, 5);

  container.innerHTML = topWrong.map(item => `
    <div style="background:var(--bg-secondary); padding:0.85rem 1rem; border-radius:var(--radius-md); margin-bottom:0.75rem; border-left:4px solid ${item.errorRate > 40 ? 'var(--danger)' : 'var(--warning)'};">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
        <strong>Câu ${item.q.id}: Từ vựng "${item.q.vocab}"</strong>
        <span class="badge ${item.errorRate > 40 ? 'badge-danger' : 'badge-warning'}">Tỷ lệ sai: ${item.errorRate}%</span>
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted);">${item.q.dialogue[0].text}</div>
      <div style="font-size:0.82rem; color:var(--secondary); margin-top:0.25rem;">Đáp án đúng: <strong>${item.q.correct}. ${item.q.options[item.q.correct]}</strong></div>
    </div>
  `).join('');
}

// ==========================================
// TEACHER LOGIN CODES DIRECTORY MODAL
// ==========================================

function openLoginCodesModal() {
  const modal = document.getElementById('loginCodesModal');
  const tbody = document.getElementById('loginCodesTableBody');
  if (!modal || !tbody) return;

  const c92 = APP_DATA.classes['9.2C'].students;
  const c95 = APP_DATA.classes['9.5C'].students;
  const allStudents = [
    ...c92.map(s => ({ ...s, classId: '9.2C' })),
    ...c95.map(s => ({ ...s, classId: '9.5C' }))
  ];

  tbody.innerHTML = allStudents.map(s => `
    <tr>
      <td><strong>${s.stt}</strong></td>
      <td><span class="login-code-pill">${s.loginCode || s.code.slice(-4)}</span></td>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge ${s.classId === '9.2C' ? 'badge-primary' : 'badge-secondary'}">${s.classId}</span></td>
      <td>${s.dob}</td>
      <td>${s.gender}</td>
      <td><code>${s.code}</code></td>
    </tr>
  `).join('');

  modal.classList.add('active');
}

function closeLoginCodesModal() {
  const modal = document.getElementById('loginCodesModal');
  if (modal) modal.classList.remove('active');
}

function copyLoginCodesToClipboard() {
  const c92 = APP_DATA.classes['9.2C'].students;
  const c95 = APP_DATA.classes['9.5C'].students;

  let text = `DANH SÁCH MÃ DỰ THI TIẾNG ANH 9 - THCS NHUẬN ĐỨC\n`;
  text += `Giáo viên: Mai Trần Diễm Phúc\n`;
  text += `Hướng dẫn: Học sinh truy cập vào trang kiểm tra và nhập đúng Mã dự thi 4 chữ số.\n\n`;

  text += `══════ LỚP 9.2C (${c92.length} HỌC SINH) ══════\n`;
  c92.forEach(s => {
    text += `${s.stt}. Mã: ${s.loginCode} | ${s.name} | NS: ${s.dob}\n`;
  });

  text += `\n══════ LỚP 9.5C (${c95.length} HỌC SINH) ══════\n`;
  c95.forEach(s => {
    text += `${s.stt}. Mã: ${s.loginCode} | ${s.name} | NS: ${s.dob}\n`;
  });

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Đã sao chép danh sách mã dự thi! Cô có thể dán ngay vào Zalo/nhóm lớp.', 'success');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('Đã sao chép danh sách mã dự thi vào Clipboard.', 'success');
}

function exportLoginCodesCSV() {
  const c92 = APP_DATA.classes['9.2C'].students;
  const c95 = APP_DATA.classes['9.5C'].students;
  const allStudents = [
    ...c92.map(s => ({ ...s, classId: '9.2C' })),
    ...c95.map(s => ({ ...s, classId: '9.5C' }))
  ];

  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += `UBND XÃ NHUẬN ĐỨC - THCS NHUẬN ĐỨC\n`;
  csvContent += `DANH SÁCH MÃ DỰ THI TIẾNG ANH 9 - NĂM HỌC 2026-2027\n`;
  csvContent += `Giáo viên phụ trách: Mai Trần Diễm Phúc\n\n`;
  csvContent += `"STT","Mã dự thi (Đăng nhập)","Họ và tên","Lớp","Ngày sinh","Giới tính","Mã định danh Bộ GD&ĐT"\n`;

  allStudents.forEach(s => {
    csvContent += `"${s.stt}","${s.loginCode || s.code.slice(-4)}","${s.name}","${s.classId}","${s.dob}","${s.gender}","${s.code}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Danh_Sach_Ma_Du_Thi_Tieng_Anh_9_THCS_Nhuan_Duc.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Đã xuất file Excel danh sách mã dự thi thành công!', 'success');
}

function printLoginCodes() {
  const c92 = APP_DATA.classes['9.2C'].students;
  const c95 = APP_DATA.classes['9.5C'].students;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Vui lòng cho phép popup để in danh sách.', 'warning');
    return;
  }

  const printContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Danh Sách Mã Dự Thi Tiếng Anh 9 - THCS Nhuận Đức</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 25px; color: #111; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 20px; }
        h2 { margin: 0 0 5px; font-size: 18px; text-transform: uppercase; }
        p { margin: 3px 0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
        th { background: #eee; font-weight: bold; }
        .code-col { font-weight: bold; font-family: monospace; font-size: 14px; text-align: center; }
        .section-title { font-size: 15px; font-weight: bold; margin-top: 25px; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 3px; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <p><strong>UBND HUYỆN CỦ CHI • TRƯỜNG THCS NHUẬN ĐỨC</strong></p>
        <h2>DANH SÁCH MÃ DỰ THI ĐÁNH GIÁ NGOẠI NGỮ 1 (TIẾNG ANH 9)</h2>
        <p>Giáo viên bộ môn: <strong>Mai Trần Diễm Phúc</strong> • Năm học: 2026-2027</p>
      </div>

      <div class="section-title">LỚP 9.2C (${c92.length} HỌC SINH)</div>
      <table>
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">STT</th>
            <th style="width:100px; text-align:center;">MÃ DỰ THI</th>
            <th>HỌ VÀ TÊN</th>
            <th style="width:90px;">NGÀY SINH</th>
            <th style="width:65px;">GIỚI TÍNH</th>
            <th style="width:110px;">MÃ ĐỊNH DANH</th>
          </tr>
        </thead>
        <tbody>
          ${c92.map(s => `
            <tr>
              <td style="text-align:center;">${s.stt}</td>
              <td class="code-col">${s.loginCode}</td>
              <td><strong>${s.name}</strong></td>
              <td>${s.dob}</td>
              <td>${s.gender}</td>
              <td>${s.code}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title" style="page-break-before: always;">LỚP 9.5C (${c95.length} HỌC SINH)</div>
      <table>
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">STT</th>
            <th style="width:100px; text-align:center;">MÃ DỰ THI</th>
            <th>HỌ VÀ TÊN</th>
            <th style="width:90px;">NGÀY SINH</th>
            <th style="width:65px;">GIỚI TÍNH</th>
            <th style="width:110px;">MÃ ĐỊNH DANH</th>
          </tr>
        </thead>
        <tbody>
          ${c95.map(s => `
            <tr>
              <td style="text-align:center;">${s.stt}</td>
              <td class="code-col">${s.loginCode}</td>
              <td><strong>${s.name}</strong></td>
              <td>${s.dob}</td>
              <td>${s.gender}</td>
              <td>${s.code}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}

// ==========================================
// EXPORT EXCEL GRADEBOOK
// ==========================================

function exportExcelGradebook() {
  const submissions = getSubmissions();
  const targetClass = state.teacherClassFilter === 'all' ? '9.2C' : state.teacherClassFilter;
  const students = APP_DATA.classes[targetClass].students;

  // Build CSV format compatible with Excel
  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += `UBND XÃ NHUẬN ĐỨC - THCS NHUẬN ĐỨC\n`;
  csvContent += `BẢNG ĐIỂM ĐÁNH GIÁ THƯỜNG XUYÊN (ĐĐGtx) - MÔN: NGOẠI NGỮ 1\n`;
  csvContent += `Lớp: ${targetClass} - Năm học: 2026-2027 - Giáo viên: Mai Trần Diễm Phúc\n\n`;
  csvContent += `"STT","Mã định danh Bộ GD&ĐT","Mã dự thi","Họ và tên","Lớp","Ngày sinh","Giới tính","Mã đề","ĐĐGtx","Số câu đúng","Thời gian nộp","Xếp loại","Giám sát rời tab","Ảnh quét mặt"\n`;

  students.forEach(s => {
    const sub = submissions[`${targetClass}_${s.code}`];
    const score = sub ? sub.score : "";
    const correct = sub ? `${sub.correctCount}/${sub.totalQuestions}` : "";
    const time = sub ? sub.submittedAt : "Chưa làm bài";
    const examCode = sub ? (sub.examCode || "901") : "-";
    const cheat = sub ? (sub.cheatCount > 0 ? `Cảnh báo (${sub.cheatCount} lần)` : "Trung thực") : "-";
    const faceStatus = sub && sub.faceAudit && (sub.faceAudit.initialPhoto || (sub.faceAudit.snapshots && sub.faceAudit.snapshots.length > 0)) ? "Có ảnh" : "Không có";
    let rank = "";
    if (sub) {
      if (sub.score >= 9.0) rank = "Xuất sắc";
      else if (sub.score >= 8.0) rank = "Giỏi";
      else if (sub.score >= 6.5) rank = "Khá";
      else if (sub.score >= 5.0) rank = "Đạt";
      else rank = "Chưa đạt";
    }

    csvContent += `"${s.stt}","${s.code}","${s.loginCode || s.code.slice(-4)}","${s.name}","${targetClass}","${s.dob}","${s.gender}","${examCode}","${score}","${correct}","${time}","${rank}","${cheat}","${faceStatus}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Bang_Diem_Ngoai_Ngu_1_${targetClass}_THCS_Nhuan_Duc.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Đã xuất bảng điểm lớp ${targetClass} thành công!`, 'success');
}

// ==========================================
// TOAST NOTIFICATION UTILITY
// ==========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'ℹ️';
  let color = 'var(--primary)';
  if (type === 'success') { icon = '✅'; color = 'var(--success)'; }
  if (type === 'warning') { icon = '⚠️'; color = 'var(--warning)'; }
  if (type === 'danger') { icon = '❌'; color = 'var(--danger)'; }

  toast.style.borderLeftColor = color;
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
