/*********************************
 * LocalStorage Keys & Utilities *
 *********************************/
const LS_KEYS = {
  BOOKINGS: 'tb_bookings_v1',
  USERS: 'tb_users_v1',
  SESSION: 'tb_session_v1'
};

const $ = (sel, root = document) => root.querySelector(sel);
const uid = () => Math.random().toString(36).slice(2, 10);

const getUsers = () => JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
const saveUsers = (arr) => localStorage.setItem(LS_KEYS.USERS, JSON.stringify(arr));

const getTeachers = () => getUsers().filter(u => u.role === 'teacher');
const getStudents = () => getUsers().filter(u => u.role === 'student');
const getAdmins = () => getUsers().filter(u => u.role === 'admin');

const getBookings = () => JSON.parse(localStorage.getItem(LS_KEYS.BOOKINGS) || '[]');
const saveBookings = (arr) => localStorage.setItem(LS_KEYS.BOOKINGS, JSON.stringify(arr));

const setSession = (obj) => localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(obj));
const getSession = () => JSON.parse(localStorage.getItem(LS_KEYS.SESSION) || 'null');
const clearSession = () => localStorage.removeItem(LS_KEYS.SESSION);

function formatDate(dStr) {
  const d = new Date(dStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatTime(tStr) {
  const [h, m] = tStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/*****************
 * Seed Demo Data *
 *****************/
function seedUsers() {
  const existing = getUsers();
  if (existing.length) return;

  const users = [
    // student demo
    { id: 'stu-1', role: 'student', email: 'student@demo.com', password: '123456', name: 'Demo Student' },

    // teacher demos
    { id: 't-1', role: 'teacher', email: 'alice@school.com', password: 'teach123', name: 'Alice Johnson', subject: 'Mathematics' },
    { id: 't-2', role: 'teacher', email: 'bob@school.com', password: 'teach123', name: 'Bob Smith', subject: 'Physics' },
    { id: 't-3', role: 'teacher', email: 'carol@school.com', password: 'teach123', name: 'Carol Lee', subject: 'English' },

    // admin
    { id: 'adm-1', role: 'admin', email: 'admin@demo.com', password: 'admin123', name: 'System Admin' }
  ];

  saveUsers(users);
}

/*****************************
 * Normal Redirect Protection
 *****************************/
function requireSessionOrRedirect(expectedRoles = []) {
  const s = getSession();
  if (!s) {
    window.location.href = 'index.html';
    return null;
  }

  if (expectedRoles.length && !expectedRoles.includes(s.role)) {
    if (s.role === 'student') window.location.href = 'student.html';
    if (s.role === 'teacher') window.location.href = 'teacher.html';
    if (s.role === 'admin') window.location.href = 'admin.html';
    return null;
  }

  return s;
}

/*********************************************
 * SAFE ACCESS HELPERS (prevents null errors)
 *********************************************/
function safeSetText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
  else console.warn(`Element not found: ${selector}`);
}

function safe(selector, callback) {
  const el = document.querySelector(selector);
  if (el) callback(el);
  else console.warn(`Element not found: ${selector}`);
}

/****************
 * LOGIN PAGE   *
 ****************/
function initLoginPage() {
  seedUsers();

  const tabStudent = $('#tab-student');
  const tabTeacher = $('#tab-teacher');
  const tabAdmin = $('#tab-admin');

  const pStudent = $('#panel-student');
  const pTeacher = $('#panel-teacher');
  const pAdmin = $('#panel-admin');

  function switchTab(tab) {
    [tabStudent, tabTeacher, tabAdmin].forEach(t => t.classList.remove('active'));
    [pStudent, pTeacher, pAdmin].forEach(p => p.classList.add('hidden'));

    tab.classList.add('active');

    if (tab === tabStudent) pStudent.classList.remove('hidden');
    if (tab === tabTeacher) pTeacher.classList.remove('hidden');
    if (tab === tabAdmin) pAdmin.classList.remove('hidden');
  }

  if (tabStudent) tabStudent.addEventListener('click', () => switchTab(tabStudent));
  if (tabTeacher) tabTeacher.addEventListener('click', () => switchTab(tabTeacher));
  if (tabAdmin) tabAdmin.addEventListener('click', () => switchTab(tabAdmin));

  // STUDENT LOGIN
  const studentForm = $('#student-login-form');
  if (studentForm) {
    studentForm.addEventListener('submit', e => {
      e.preventDefault();

      const email = $('#student-email').value.toLowerCase();
      const pw = $('#student-password').value;

      const user = getStudents().find(u => u.email === email && u.password === pw);
      if (!user) return alert('Invalid student credentials');

      setSession(user);
      window.location.href = 'student.html';
    });
  }

  // TEACHER LOGIN
  const teacherForm = $('#teacher-login-form');
  if (teacherForm) {
    teacherForm.addEventListener('submit', e => {
      e.preventDefault();

      const email = $('#teacher-email').value.toLowerCase();
      const pw = $('#teacher-password').value;

      const user = getTeachers().find(u => u.email === email && u.password === pw);
      if (!user) return alert('Invalid teacher credentials');

      setSession(user);
      window.location.href = 'teacher.html';
    });
  }

  // ADMIN LOGIN
  const adminForm = $('#admin-login-form');
  if (adminForm) {
    adminForm.addEventListener('submit', e => {
      e.preventDefault();

      const email = $('#admin-email').value.toLowerCase();
      const pw = $('#admin-password').value;

      const user = getAdmins().find(u => u.email === email && u.password === pw);
      if (!user) return alert('Invalid admin credentials');

      setSession(user);
      window.location.href = 'admin.html';
    });
  }
}

/***********************
 * REGISTRATION PAGE   *
 ***********************/
function initRegisterPage() {
  seedUsers();

  safe('#register-form', form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name = $('#reg-name').value.trim();
      const email = $('#reg-email').value.trim().toLowerCase();
      const pw = $('#reg-password').value;
      const confirm = $('#reg-confirm').value;

      if (pw !== confirm) return alert('Passwords do not match');

      const users = getUsers();
      if (users.some(u => u.email === email)) return alert('Email already exists');

      users.push({
        id: 'stu-' + uid(),
        role: 'student',
        name,
        email,
        password: pw
      });

      saveUsers(users);
      alert('Account created!');

      window.location.href = 'index.html';
    });
  });
}

/*********************
 * STUDENT DASHBOARD *
 *********************/
function initStudentPage() {
  seedUsers();

  const s = requireSessionOrRedirect(['student']);
  if (!s) return;

  safeSetText('#student-welcome', `Welcome, ${s.name} (${s.email})`);

  populateTeacherSelect();
  hydrateStudentBookings();

  safe('#booking-form', form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const teacherId = $('#teacher-select').value;
      const date = $('#booking-date').value;
      const time = $('#booking-time').value;
      const notes = $('#booking-notes').value || '';

      const t = getTeachers().find(x => x.id === teacherId);
      if (!t) return alert('Invalid teacher');

      const newBk = {
        id: 'bk-' + uid(),
        teacherId,
        teacherName: t.name,
        teacherSubject: t.subject,
        studentEmail: s.email,
        studentName: s.name,
        date,
        time,
        notes,
        status: 'Booked'
      };

      const all = getBookings();
      all.push(newBk);
      saveBookings(all);

      alert('Appointment booked!');
      hydrateStudentBookings();
      hydrateTeacherBookings?.();
      hydrateAdminBookings?.();
    });
  });

  safe('#btn-refresh-student', btn => {
    btn.addEventListener('click', hydrateStudentBookings);
  });

  safe('#btn-student-logout', btn => {
    btn.addEventListener('click', () => clearSession());
  });
}

function populateTeacherSelect() {
  const sel = $('#teacher-select');
  if (!sel) return;

  sel.innerHTML = '<option value="" disabled selected>Select Teacher</option>' +
    getTeachers().map(t =>
      `<option value="${t.id}">${t.name} — ${t.subject}</option>`
    ).join('');
}

function hydrateStudentBookings() {
  const wrap = $('#student-bookings');
  const empty = $('#student-empty');
  if (!wrap || !empty) return;

  const s = getSession();
  const list = getBookings()
    .filter(b => b.studentEmail === s.email)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  wrap.innerHTML = '';
  if (!list.length) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.forEach(b => {
    const el = document.createElement('div');
    el.className = 'item';

    el.innerHTML = `
      <div class="meta">
        <div class="avatar">${b.teacherName[0]}</div>
        <div>
          <div><b>${b.teacherName}</b> • ${b.teacherSubject}</div>
          <div class="muted">${formatDate(b.date)} at ${formatTime(b.time)}</div>
        </div>
      </div>

      <div>
        <span class="pill">${b.status}</span>
        <button class="btn ghost" data-id="${b.id}">Cancel</button>
      </div>
    `;

    el.querySelector('button').addEventListener('click', () => {
      cancelBooking(b.id);
    });

    wrap.appendChild(el);
  });
}

function cancelBooking(id) {
  if (!confirm('Cancel booking?')) return;

  const arr = getBookings().filter(x => x.id !== id);
  saveBookings(arr);

  hydrateStudentBookings();
  hydrateTeacherBookings?.();
  hydrateAdminBookings?.();
}

/**********************
 * TEACHER DASHBOARD  *
 **********************/
function initTeacherPage() {
  seedUsers();

  const s = requireSessionOrRedirect(['teacher']);
  if (!s) return;

  safeSetText('#teacher-welcome', `Welcome, ${s.name} (${s.email})`);
  hydrateTeacherBookings();

  safe('#btn-refresh-teacher', btn => btn.addEventListener('click', hydrateTeacherBookings));
  safe('#btn-clear-filter', btn => {
    const f = $('#filter-date');
    if (f) f.value = '';
    hydrateTeacherBookings();
  });

  safe('#btn-teacher-logout', btn => {
    btn.addEventListener('click', () => clearSession());
  });
}

function hydrateTeacherBookings() {
  const wrap = $('#teacher-bookings');
  const empty = $('#teacher-empty');
  const s = getSession();
  if (!wrap || !empty || !s) return;

  const teacher = getTeachers().find(t => t.email === s.email);
  let list = getBookings().filter(b => b.teacherId === teacher.id);

  wrap.innerHTML = '';
  if (!list.length) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.forEach(b => {
    const el = document.createElement('div');
    el.className = 'item';

    el.innerHTML = `
      <div class="meta">
        <div class="avatar">${b.studentName[0]}</div>
        <div>
          <div><b>${b.studentName}</b> • ${b.studentEmail}</div>
          <div class="muted">${formatDate(b.date)} at ${formatTime(b.time)}</div>
        </div>
      </div>

      <div>
        <span class="pill">${b.status}</span>
        <button class="btn ghost" data-cancel="${b.id}">Cancel</button>
        <button class="btn success" data-complete="${b.id}">Done</button>
      </div>
    `;

    el.querySelector('[data-cancel]')?.addEventListener('click', () => cancelBooking(b.id));
    el.querySelector('[data-complete]')?.addEventListener('click', () => setBookingStatus(b.id, 'Completed'));

    wrap.appendChild(el);
  });
}

/*******************
 * ADMIN PANEL     *
 *******************/
function initAdminPage() {
  seedUsers();

  const s = requireSessionOrRedirect(['admin']);
  if (!s) return;

  safeSetText('#admin-welcome', `Welcome, ${s.name} (${s.email})`);

  hydrateAdminTeachers();
  hydrateAdminStudents();
  hydrateAdminBookings();

  safe('#btn-admin-logout', btn => btn.addEventListener('click', () => clearSession()));
}

/*** ADMIN — TEACHERS ***/
function hydrateAdminTeachers() {
  const wrap = $('#admin-teacher-list');
  const empty = $('#admin-teacher-empty');
  if (!wrap || !empty) return;

  let list = getTeachers();
  wrap.innerHTML = '';

  if (!list.length) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.forEach(t => {
    const el = document.createElement('div');
    el.className = 'item';

    el.innerHTML = `
      <div class="meta">
        <div class="avatar">${t.name[0]}</div>
        <div>
          <div><b>${t.name}</b> • ${t.subject}</div>
          <div class="muted">${t.email}</div>
        </div>
      </div>
    `;

    wrap.appendChild(el);
  });
}

/*** ADMIN — STUDENTS ***/
function hydrateAdminStudents() {
  const wrap = $('#admin-student-list');
  const empty = $('#admin-student-empty');
  if (!wrap || !empty) return;

  let list = getStudents();
  wrap.innerHTML = '';

  if (!list.length) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.forEach(s => {
    const el = document.createElement('div');
    el.className = 'item';

    el.innerHTML = `
      <div class="meta">
        <div class="avatar">${s.name[0]}</div>
        <div>
          <div><b>${s.name}</b></div>
          <div class="muted">${s.email}</div>
        </div>
      </div>
    `;

    wrap.appendChild(el);
  });
}

/*** ADMIN — BOOKINGS ***/
function hydrateAdminBookings() {
  const wrap = $('#admin-booking-list');
  const empty = $('#admin-booking-empty');
  if (!wrap || !empty) return;

  let list = getBookings().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  wrap.innerHTML = '';

  if (!list.length) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.forEach(b => {
    const el = document.createElement('div');
    el.className = 'item';

    el.innerHTML = `
      <div class="meta">
        <div class="avatar">${b.teacherName[0]}</div>
        <div>
          <div><b>${b.teacherName}</b> • ${b.teacherSubject}</div>
          <div class="muted">${b.studentName} • ${b.studentEmail}</div>
          <div class="muted">${formatDate(b.date)} at ${formatTime(b.time)}</div>
        </div>
      </div>

      <div>
        <span class="pill">${b.status}</span>
        <button class="btn success" data-approve="${b.id}">Approve</button>
        <button class="btn danger" data-reject="${b.id}">Reject</button>
        <button class="btn ghost" data-complete="${b.id}">Done</button>
        <button class="btn danger" data-delete="${b.id}">Delete</button>
      </div>
    `;

    el.querySelector('[data-approve]')?.addEventListener('click', () => setBookingStatus(b.id, 'Approved'));
    el.querySelector('[data-reject]')?.addEventListener('click', () => setBookingStatus(b.id, 'Rejected'));
    el.querySelector('[data-complete]')?.addEventListener('click', () => setBookingStatus(b.id, 'Completed'));
    el.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (!confirm('Delete booking?')) return;
      const arr = getBookings().filter(x => x.id !== b.id);
      saveBookings(arr);
      hydrateAdminBookings();
    });

    wrap.appendChild(el);
  });
}

function setBookingStatus(id, status) {
  const list = getBookings();
  const idx = list.findIndex(x => x.id === id);

  if (idx >= 0) {
    list[idx].status = status;
    saveBookings(list);

    hydrateAdminBookings();
    hydrateTeacherBookings?.();
    hydrateStudentBookings?.();
  }
}

/************
 * BOOTSTRAP *
 ************/
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  switch (page) {
    case 'login': return initLoginPage();
    case 'register': return initRegisterPage();
    case 'student': return initStudentPage();
    case 'teacher': return initTeacherPage();
    case 'admin': return initAdminPage();
  }
});
