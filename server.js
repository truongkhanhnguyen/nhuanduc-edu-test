// ==========================================
// PRODUCTION NODE.JS HTTP & API SERVER
// Trường THCS Nhuận Đức • GV: Mai Trần Diễm Phúc
// Deployment Target: Railway / Docker / Cloud
// ==========================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.csv': 'text/csv; charset=utf-8'
};

// Database helper functions
function normalizeSubmission(sub) {
  if (sub && sub.correctCount !== undefined && sub.totalQuestions) {
    const raw = (sub.correctCount / sub.totalQuestions) * 10;
    const exact = Math.round(raw * 100) / 100;
    if (typeof sub.score === 'number' && Math.abs(sub.score - exact) < 0.06) {
      sub.score = exact;
    }
  }
  return sub;
}

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    for (const key in data) {
      if (data[key]) {
        data[key] = normalizeSubmission(data[key]);
      }
    }
    return data;
  } catch (err) {
    console.error('[DB Error] Failed to read database:', err);
    return {};
  }
}

function writeDb(data) {
  try {
    for (const key in data) {
      if (data[key]) {
        data[key] = normalizeSubmission(data[key]);
      }
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[DB Error] Failed to write database:', err);
    return false;
  }
}

// Helper to parse JSON request body
function parseRequestBody(req, maxBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload Too Large'));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
        resolve(json);
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}

// Request Handler
const server = http.createServer(async (req, res) => {
  // CORS Headers for API & web
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // 1. Healthcheck Endpoint (for Railway deployment verification)
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      version: '1.1.0-mobile-pro',
      school: 'THCS Nhuan Duc',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 2. API: POST /api/teacher/auth (Secure Server-Side Password Verification)
  if (req.method === 'POST' && pathname === '/api/teacher/auth') {
    try {
      const body = await parseRequestBody(req);
      const expectedPassword = process.env.TEACHER_PASSWORD || 'phuc2026';

      if (body && body.password && body.password.trim() === expectedPassword) {
        const token = 'phuc_' + Buffer.from(`${Date.now()}_${Math.random()}`).toString('base64');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, token: token }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Mật khẩu giáo viên không chính xác!' }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Lỗi xác thực máy chủ' }));
    }
    return;
  }

  // 3. API: GET /api/submissions (Retrieve all submissions)
  if (req.method === 'GET' && pathname === '/api/submissions') {
    const submissions = readDb();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify({ success: true, data: submissions }));
    return;
  }

  // 4. API: POST /api/submissions (Save a student test submission)
  if (req.method === 'POST' && pathname === '/api/submissions') {
    try {
      const submission = await parseRequestBody(req);
      if (!submission.classId || !submission.studentCode) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Thiếu classId hoặc studentCode' }));
        return;
      }

      const all = readDb();
      const key = `${submission.classId}_${submission.studentCode}`;
      all[key] = submission;
      writeDb(all);

      console.log(`[Submission] Saved: ${submission.studentName} (${submission.classId}) - Điểm: ${submission.score}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, key: key }));
    } catch (err) {
      console.error('[API Error] POST /api/submissions failed:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 5. API: POST /api/submissions/reset-all (Reset all submissions clean)
  if (req.method === 'POST' && pathname === '/api/submissions/reset-all') {
    writeDb({});
    console.log('[Reset All] Cleared all submissions in database.');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Đã xóa trắng toàn bộ dữ liệu bảng điểm.' }));
    return;
  }

  // 6. API: DELETE /api/submissions/:key (Reset single attempt for a student)
  if (req.method === 'DELETE' && pathname.startsWith('/api/submissions/')) {
    const key = pathname.replace('/api/submissions/', '').trim();
    if (!key) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Thiếu key học sinh' }));
      return;
    }

    const all = readDb();
    delete all[key];
    writeDb(all);

    console.log(`[Reset] Deleted submission key: ${key}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `Đã reset bài thi: ${key}` }));
    return;
  }

  // 5. Static Files Serving
  if (req.method === 'GET') {
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    // Security: Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html for Single Page Application navigation
        filePath = path.join(__dirname, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const isHtml = ext === '.html';

      // Headers: do not cache HTML, cache static assets
      const headers = {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff'
      };

      if (isHtml || ext === '.css' || ext === '.js') {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      } else {
        headers['Cache-Control'] = 'public, max-age=3600';
      }

      // Check gzip support
      const acceptEncoding = req.headers['accept-encoding'] || '';
      const rawStream = fs.createReadStream(filePath);

      if (acceptEncoding.includes('gzip') && (contentType.startsWith('text/') || contentType.startsWith('application/'))) {
        headers['Content-Encoding'] = 'gzip';
        res.writeHead(200, headers);
        rawStream.pipe(zlib.createGzip()).pipe(res);
      } else {
        res.writeHead(200, headers);
        rawStream.pipe(res);
      }
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

// Start Server
server.listen(PORT, HOST, () => {
  console.log('========================================================');
  console.log(`🚀 NHUẬN ĐỨC EDU TEST SERVER IS RUNNING!`);
  console.log(`📍 Host: ${HOST}:${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('========================================================');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed cleanly.');
    process.exit(0);
  });
});
