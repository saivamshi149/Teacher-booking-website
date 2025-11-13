/*********************************
 * LocalStorage Keys & Utilities *
 *********************************/
const LS_KEYS = {
    BOOKINGS: 'tb_bookings_v1',
    USERS: 'tb_users_v1',
    SESSION: 'tb_session_v1'
  };
  
  const $ = (sel, root=document) => root.querySelector(sel);
  const uid = () => Math.random().toString(36).slice(2, 10);
  
  const getUsers = () => JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
  const saveUsers = (arr) => localStorage.setItem(LS_KEYS.USERS, JSON.stringify(arr));
  const getTeachers = () => getUsers().filter(u => u.role === 'teacher');
  const getStudents = () => getUsers().filter(u => u.role === 'student');
  const getAdmins   = () => getUsers().filter(u => u.role === 'admin');
  
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
    const d = new Date(); d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  
  /*****************
   * Seed Demo Data *
   *****************/
  function seedUsers() {
    const existing = getUsers();
    if (existing.length) return;
    const users = [
      // Student demo
      { id: 'stu-1', role: 'student', email: 'student@demo.com', password: '123456', name: 'Demo Student' },
      // Teachers demo
      { id: 't-1', role: 'teacher', email: 'alice@school.com', password: 'teach123', name: 'Alice Johnson', subject: 'Mathematics' },
      { id: 't-2', role: 'teacher', email: 'bob@school.com', password: 'teach123', name: 'Bob Smith', subject: 'Physics' },
      { id: 't-3', role: 'teacher', email: 'carol@school.com', password: 'teach123', name: 'Carol Lee', subject: 'English' },
      // Admin demo
      { id: 'adm-1', role: 'admin', email: 'admin@demo.com', password: 'admin123', name: 'System Admin' }
    ];
    saveUsers(users);
  }
  
  /*****************************
   * Redirect Protection (Normal)
   *****************************/
  function requireSessionOrRedirect(expectedRoleList = []) {
    const s = getSession();
    if (!s) {
      window.location.href = 'index.html';
      return null;
    }
    if (expectedRoleList.length && !expectedRoleList.includes(s.role)) {
      if (s.role === 'student') window.location.href = 'student.html';
      if (s.role === 'teacher') window.location.href = 'teacher.html';
      if (s.role === 'admin')   window.location.href = 'admin.html';
      return null;
    }
    return s;
  }
  
  /****************
   * LOGIN PAGE   *
   ****************/
  function initLoginPage() {
    seedUsers();
  
    // Tabs
    const tabStudent = $('#tab-student');
    const tabTeacher = $('#tab-teacher');
    const tabAdmin   = $('#tab-admin');
    const panelStudent = $('#panel-student');
    const panelTeacher = $('#panel-teacher');
    const panelAdmin   = $('#panel-admin');
  
    function activate(tab) {
      [tabStudent, tabTeacher, tabAdmin].forEach(t => t?.classList.remove('active'));
      [panelStudent, panelTeacher, panelAdmin].forEach(p => p?.classList.add('hidden'));
      tab.classList.add('active');
      if (tab === tabStudent) panelStudent.classList.remove('hidden');
      if (tab === tabTeacher) panelTeacher.classList.remove('hidden');
      if (tab === tabAdmin)   panelAdmin.classList.remove('hidden');
    }
    tabStudent?.addEventListener('click', () => activate(tabStudent));
    tabTeacher?.addEventListener('click', () => activate(tabTeacher));
    tabAdmin?.addEventListener('click',   () => activate(tabAdmin));
  
    // Student login
    $('#student-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#student-email').value.trim().toLowerCase();
      const pw = $('#student-password').value;
      const user = getStudents().find(u => u.email.toLowerCase() === email && u.password === pw);
      if (!user) return alert('Invalid student credentials');
      setSession({ id: user.id, role: 'student', email: user.email, name: user.name });
      window.location.href = 'student.html';
    });
  
    // Teacher login
    $('#teacher-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#teacher-email').value.trim().toLowerCase();
      const pw = $('#teacher-password').value;
      const user = getTeachers().find(u => u.email.toLowerCase() === email && u.password === pw);
      if (!user) return alert('Invalid teacher credentials');
      setSession({ id: user.id, role: 'teacher', email: user.email, name: user.name });
      window.location.href = 'teacher.html';
    });
  
    // Admin login
    $('#admin-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#admin-email').value.trim().toLowerCase();
      const pw = $('#admin-password').value;
      const user = getAdmins().find(u => u.email.toLowerCase() === email && u.password === pw);
      if (!user) return alert('Invalid admin credentials');
      setSession({ id: user.id, role: 'admin', email: user.email, name: user.name });
      window.location.href = 'admin.html';
    });
  }
  
  /***********************
   * REGISTRATION PAGE   *
   ***********************/
  function initRegisterPage() {
    seedUsers();
    $('#register-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#reg-name').value.trim();
      const email = $('#reg-email').value.trim().toLowerCase();
      const pw = $('#reg-password').value;
      const confirm = $('#reg-confirm').value;
  
      if (pw !== confirm) return alert('Passwords do not match.');
      if (pw.length < 6) return alert('Password must be at least 6 characters.');
      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) return alert('Email already registered.');
  
      const newUser = { id: 'stu-' + uid(), role: 'student', email, password: pw, name };
      users.push(newUser);
      saveUsers(users);
      alert('Registration successful! You can now log in.');
      window.location.href = 'index.html';
    });
  }
  
  /*********************
   * STUDENT DASHBOARD *
   *********************/
  function validateBooking(teacherId, dateStr, timeStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Please choose a valid date.';
    const [h, m] = timeStr.split(':').map(Number);
    if (Number.isNaN(h)) return 'Please choose a valid time.';
    if (h < 9 || h > 17 || (h === 17 && m > 0)) return 'Bookings allowed between 09:00 and 17:00.';
    const now = new Date();
    const candidate = new Date(dateStr + 'T' + timeStr + ':00');
    if (candidate < new Date(now.getTime() - 60 * 1000)) return 'Cannot book in the past.';
    const clash = getBookings().some(b => b.teacherId === teacherId && b.date === dateStr && b.time === timeStr);
    if (clash) return 'This slot is already booked for the selected teacher.';
    return null;
  }
  
  function populateTeacherSelect() {
    const sel = $('#teacher-select');
    if (!sel) return;
    sel.innerHTML = '<option value="" disabled selected>Select a teacher</option>' +
      getTeachers().map(t => `<option value="${t.id}">${t.name} — ${t.subject}</option>`).join('');
  }
  
  function hydrateStudentBookings() {
    const wrap = $('#student-bookings');
    const empty = $('#student-empty');
    if (!wrap || !empty) return;
    const s = getSession();
    const data = getBookings()
      .filter(b => b.studentEmail === s.email)
      .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    wrap.innerHTML = '';
    if (!data.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
  
    data.forEach(b => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div class="meta">
          <div class="avatar">${b.teacherName.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight:600;">${b.teacherName} <span class="muted" style="font-weight:500;">• ${b.teacherSubject}</span></div>
            <div class="muted" style="font-size:14px;">${formatDate(b.date)} at ${formatTime(b.time)}</div>
            ${b.notes ? `<div style="font-size:14px; margin-top:6px;">📝 ${b.notes}</div>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="pill">${b.status}</span>
          <button class="btn ghost" data-action="cancel" data-id="${b.id}">Cancel</button>
        </div>
      `;
      el.querySelector('[data-action="cancel"]').addEventListener('click', () => cancelBooking(b.id));
      wrap.appendChild(el);
    });
  }
  
  function cancelBooking(id) {
    if (!confirm('Cancel this booking?')) return;
    const arr = getBookings();
    const idx = arr.findIndex(b => b.id === id);
    if (idx >= 0) {
      arr.splice(idx, 1);
      saveBookings(arr);
      hydrateStudentBookings();
      hydrateTeacherBookings();
      hydrateAdminBookings();
    }
  }
  
  function initStudentPage() {
    seedUsers();
    const s = requireSessionOrRedirect(['student']);
    if (!s) return;
  
    $('#student-welcome').textContent = `Welcome, ${s.name} (${s.email})`;
    populateTeacherSelect();
    hydrateStudentBookings();
  
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const min = `${yyyy}-${mm}-${dd}`;
    document.querySelectorAll('input[type="date"]').forEach(inp => inp.min = min);
  
    $('#booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const teacherId = $('#teacher-select').value;
      const date = $('#booking-date').value;
      const time = $('#booking-time').value;
      const notes = $('#booking-notes').value.trim();
      if (!teacherId || !date || !time) return alert('Please fill all required fields.');
  
      const err = validateBooking(teacherId, date, time);
      if (err) return alert(err);
  
      const t = getTeachers().find(x => x.id === teacherId);
      const newBooking = {
        id: 'bk-' + uid(),
        teacherId,
        teacherName: t.name,
        teacherSubject: t.subject,
        studentEmail: s.email,
        studentName: s.name,
        date,
        time,
        notes,
        status: 'Booked',
        createdAt: new Date().toISOString()
      };
      const all = getBookings();
      all.push(newBooking);
      saveBookings(all);
      e.target.reset();
      alert('Appointment booked successfully!');
      hydrateStudentBookings();
      hydrateTeacherBookings();
      hydrateAdminBookings();
    });
  
    $('#btn-refresh-student')?.addEventListener('click', hydrateStudentBookings);
    $('#btn-student-logout')?.addEventListener('click', () => { clearSession(); });
  }
  
  /*********************
   * TEACHER DASHBOARD *
   *********************/
  function hydrateTeacherBookings() {
    const wrap = $('#teacher-bookings');
    const empty = $('#teacher-empty');
    if (!wrap || !empty) return;
  
    const s = getSession();
    if (!s) return;
    const teacher = getTeachers().find(t => t.email === s.email);
    const filterDate = $('#filter-date')?.value || null;
  
    let data = getBookings().filter(b => b.teacherId === teacher.id);
    if (filterDate) data = data.filter(b => b.date === filterDate);
    data.sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
  
    wrap.innerHTML = '';
    if (!data.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
  
    data.forEach(b => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div class="meta">
          <div class="avatar">${b.studentName.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight:600;">${b.studentName} <span class="muted" style="font-weight:500;">• ${b.studentEmail}</span></div>
            <div class="muted" style="font-size:14px;">${formatDate(b.date)} at ${formatTime(b.time)}</div>
            ${b.notes ? `<div style="font-size:14px; margin-top:6px;">📝 ${b.notes}</div>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="pill">${b.status}</span>
          <button class="btn ghost" data-action="cancel" data-id="${b.id}">Cancel</button>
          <button class="btn success" data-action="complete" data-id="${b.id}">Mark Done</button>
        </div>
      `;
      el.querySelector('[data-action="cancel"]').addEventListener('click', () => cancelBooking(b.id));
      el.querySelector('[data-action="complete"]').addEventListener('click', () => completeBooking(b.id));
      wrap.appendChild(el);
    });
  }
  
  function completeBooking(id) {
    const arr = getBookings();
    const idx = arr.findIndex(b => b.id === id);
    if (idx >= 0) {
      arr[idx].status = 'Completed';
      saveBookings(arr);
      hydrateTeacherBookings();
      hydrateStudentBookings();
      hydrateAdminBookings();
    }
  }
  
  function initTeacherPage() {
    seedUsers();
    const s = requireSessionOrRedirect(['teacher']);
    if (!s) return;
  
    const teacher = getTeachers().find(t => t.email === s.email);
    $('#teacher-welcome').textContent = `Welcome, ${teacher.name} (${teacher.email})`;
    $('#teacher-name').textContent = teacher.name;
    $('#teacher-email-display').textContent = teacher.email;
    $('#teacher-subject-pill').textContent = teacher.subject;
    $('#teacher-avatar').textContent = teacher.name.split(' ').map(x=>x[0]).join('').slice(0,2);
  
    hydrateTeacherBookings();
  
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const min = `${yyyy}-${mm}-${dd}`;
    $('#filter-date')?.setAttribute('min', min);
  
    $('#btn-refresh-teacher')?.addEventListener('click', hydrateTeacherBookings);
    $('#btn-clear-filter')?.addEventListener('click', () => { $('#filter-date').value = ''; hydrateTeacherBookings(); });
    $('#btn-teacher-logout')?.addEventListener('click', () => { clearSession(); });
    $('#btn-copy-teacher-email')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(teacher.email); alert('Email copied!'); } catch { alert('Could not copy'); }
    });
  }
  
  /****************
   * ADMIN PANEL  *
   ****************/
  function initAdminPage() {
    seedUsers();
    const s = requireSessionOrRedirect(['admin']);
    if (!s) return;
  
    $('#admin-welcome').textContent = `Welcome, ${s.name} (${s.email})`;
  
    // TEACHER form actions
    $('#btn-teacher-resetform')?.addEventListener('click', () => resetTeacherForm());
    $('#teacher-form')?.addEventListener('submit', onSaveTeacher);
    $('#btn-delete-teacher')?.addEventListener('click', onDeleteTeacher);
    $('#teacher-search')?.addEventListener('input', hydrateAdminTeachers);
  
    // STUDENTS
    $('#student-search')?.addEventListener('input', hydrateAdminStudents);
  
    // BOOKINGS
    $('#btn-booking-refresh')?.addEventListener('click', hydrateAdminBookings);
    $('#btn-booking-clear')?.addEventListener('click', () => {
      $('#booking-date-filter').value = '';
      $('#booking-status-filter').value = '';
      hydrateAdminBookings();
    });
    $('#booking-date-filter')?.addEventListener('change', hydrateAdminBookings);
    $('#booking-status-filter')?.addEventListener('change', hydrateAdminBookings);
  
    // Initial renders
    hydrateAdminTeachers();
    hydrateAdminStudents();
    hydrateAdminBookings();
  
    $('#btn-admin-logout')?.addEventListener('click', () => { clearSession(); });
  }
  
  /*** Teachers ***/
  function resetTeacherForm() {
    $('#teacher-id').value = '';
    $('#teacher-name').value = '';
    $('#teacher-email-new').value = '';
    $('#teacher-subject').value = '';
    $('#teacher-password').value = '';
    $('#btn-delete-teacher').disabled = true;
  }
  
  function onSaveTeacher(e) {
    e.preventDefault();
    const id = $('#teacher-id').value;
    const name = $('#teacher-name').value.trim();
    const email = $('#teacher-email-new').value.trim().toLowerCase();
    const subject = $('#teacher-subject').value.trim();
    const password = $('#teacher-password').value;
  
    if (!name || !email || !subject || !password) return alert('All fields are required.');
  
    const users = getUsers();
    const duplicate = users.some(u => u.email.toLowerCase() === email && u.id !== id);
    if (duplicate) return alert('Email already in use.');
  
    if (id) {
      // update
      const idx = users.findIndex(u => u.id === id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], name, email, subject, password, role: 'teacher' };
      }
    } else {
      // create
      users.push({ id: 't-' + uid(), role: 'teacher', name, email, subject, password });
    }
    saveUsers(users);
    alert('Teacher saved.');
    resetTeacherForm();
    hydrateAdminTeachers();
  }
  
  function onDeleteTeacher() {
    const id = $('#teacher-id').value;
    if (!id) return;
    if (!confirm('Delete this teacher? This will not remove existing bookings.')) return;
    const users = getUsers().filter(u => u.id !== id);
    saveUsers(users);
    resetTeacherForm();
    hydrateAdminTeachers();
    hydrateAdminBookings();
  }
  
  function hydrateAdminTeachers() {
    const search = ($('#teacher-search')?.value || '').toLowerCase();
    const list = $('#admin-teacher-list');
    const empty = $('#admin-teacher-empty');
    if (!list || !empty) return;
  
    let data = getTeachers();
    if (search) data = data.filter(t => (t.name + ' ' + t.email).toLowerCase().includes(search));
    data.sort((a,b) => a.name.localeCompare(b.name));
  
    list.innerHTML = '';
    if (!data.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
  
    data.forEach(t => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div class="meta">
          <div class="avatar">${t.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight:600;">${t.name} <span class="muted">• ${t.subject}</span></div>
            <div class="muted" style="font-size:14px;">${t.email}</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn ghost" data-action="edit" data-id="${t.id}">Edit</button>
        </div>
      `;
      el.querySelector('[data-action="edit"]').addEventListener('click', () => {
        $('#teacher-id').value = t.id;
        $('#teacher-name').value = t.name;
        $('#teacher-email-new').value = t.email;
        $('#teacher-subject').value = t.subject || '';
        $('#teacher-password').value = t.password || '';
        $('#btn-delete-teacher').disabled = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      list.appendChild(el);
    });
  }
  
  /*** Students ***/
  function hydrateAdminStudents() {
    const search = ($('#student-search')?.value || '').toLowerCase();
    const list = $('#admin-student-list');
    const empty = $('#admin-student-empty');
    if (!list || !empty) return;
  
    let data = getStudents();
    if (search) data = data.filter(s => (s.name + ' ' + s.email).toLowerCase().includes(search));
    data.sort((a,b) => a.name.localeCompare(b.name));
  
    list.innerHTML = '';
    if (!data.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
  
    data.forEach(s => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div class="meta">
          <div class="avatar">${s.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight:600;">${s.name}</div>
            <div class="muted" style="font-size:14px;">${s.email}</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn ghost" data-action="reset" data-id="${s.id}">Reset PW</button>
          <button class="btn danger" data-action="remove" data-id="${s.id}">Remove</button>
        </div>
      `;
      el.querySelector('[data-action="reset"]').addEventListener('click', () => {
        if (!confirm('Reset this student password to "123456"?')) return;
        const users = getUsers();
        const idx = users.findIndex(u => u.id === s.id);
        if (idx >= 0) {
          users[idx].password = '123456';
          saveUsers(users);
          alert('Password reset to 123456');
        }
      });
      el.querySelector('[data-action="remove"]').addEventListener('click', () => {
        if (!confirm('Remove this student? Bookings remain in the system.')) return;
        const users = getUsers().filter(u => u.id !== s.id);
        saveUsers(users);
        hydrateAdminStudents();
        hydrateAdminBookings();
      });
      list.appendChild(el);
    });
  }
  
  /*** Bookings ***/
  function hydrateAdminBookings() {
    const list = $('#admin-booking-list');
    const empty = $('#admin-booking-empty');
    if (!list || !empty) return;
  
    const df = $('#booking-date-filter')?.value || '';
    const sf = $('#booking-status-filter')?.value || '';
  
    let data = getBookings();
    if (df) data = data.filter(b => b.date === df);
    if (sf) data = data.filter(b => (b.status || '') === sf);
    data.sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  
    list.innerHTML = '';
    if (!data.length) { empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
  
    data.forEach(b => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div class="meta">
          <div class="avatar">${(b.teacherName||'?').split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight:600;">
              ${b.teacherName} <span class="muted">• ${b.teacherSubject}</span>
            </div>
            <div class="muted" style="font-size:14px;">
              ${b.studentName} • ${b.studentEmail}
            </div>
            <div class="muted" style="font-size:14px;">
              ${formatDate(b.date)} at ${formatTime(b.time)}
            </div>
            ${b.notes ? `<div style="font-size:14px; margin-top:6px;">📝 ${b.notes}</div>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="pill">${b.status}</span>
          <button class="btn success" data-action="approve" data-id="${b.id}">Approve</button>
          <button class="btn warning" data-action="reject" data-id="${b.id}">Reject</button>
          <button class="btn ghost" data-action="complete" data-id="${b.id}">Mark Done</button>
          <button class="btn danger" data-action="delete" data-id="${b.id}">Delete</button>
        </div>
      `;
      el.querySelector('[data-action="approve"]').addEventListener('click', () => setBookingStatus(b.id, 'Approved'));
      el.querySelector('[data-action="reject"]').addEventListener('click', () => setBookingStatus(b.id, 'Rejected'));
      el.querySelector('[data-action="complete"]').addEventListener('click', () => setBookingStatus(b.id, 'Completed'));
      el.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (!confirm('Delete this booking?')) return;
        const arr = getBookings().filter(x => x.id !== b.id);
        saveBookings(arr);
        hydrateAdminBookings();
        hydrateTeacherBookings();
        hydrateStudentBookings();
      });
  
      list.appendChild(el);
    });
  }
  
  function setBookingStatus(id, status) {
    const arr = getBookings();
    const idx = arr.findIndex(b => b.id === id);
    if (idx >= 0) {
      arr[idx].status = status;
      saveBookings(arr);
      hydrateAdminBookings();
      hydrateTeacherBookings();
      hydrateStudentBookings();
    }
  }
  
  /************
   * Boot     *
   ************/
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    switch (page) {
      case 'login':   return initLoginPage();
      case 'register':return initRegisterPage();
      case 'student': return initStudentPage();
      case 'teacher': return initTeacherPage();
      case 'admin':   return initAdminPage();
      default: seedUsers();
    }
  });
  