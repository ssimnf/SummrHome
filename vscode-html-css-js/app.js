(function () {
  const DATA = window.SUMMRHOME_DATA;
  const DEFAULT_OTP = '363636';

  const state = {
    step: 'gps',
    city: 'Sreerampore',
    neighborhood: 'Serampore College Gate',
    gpsStatus: 'Choose your town or click Detect via GPS',
    otpSent: false,
    user: null,
    activeTab: 'pg',
    pgSearch: '',
    pgCollege: 'All',
    pgScope: 'all',
    bazaarSearch: '',
    bazaarCategory: 'All',
    bazaarItems: DATA.bazaarItems.slice(),
    bazaarChats: {},
    pgs: DATA.pgs.slice(),
    roommates: DATA.roommates.slice(),
    roomieSleep: 'Night Owl',
    roomieFood: 'Non-Veg',
    roomieRequests: [],
    bookings: [
      { id: 'bk1', pgTitle: 'Prothom Alo', student: 'Rohan Das', sharing: 'Single', date: '2026-12-05', status: 'Pending' }
    ],
    alerts: DATA.alerts.slice()
  };

  function getNeighborhoods(city) {
    const t = DATA.towns.find((x) => x.city === city);
    return t ? t.neighborhoods : ['Station Road', 'College Gate'];
  }

  function getColleges(city) {
    const t = DATA.towns.find((x) => x.city === city);
    return t ? t.colleges : [city + ' College'];
  }

  function getProfileStatus() {
    const u = state.user || {};
    const studentDigits = (u.mobile || '').replace(/\D/g, '').slice(-10);
    const guardianDigits = (u.guardianMobile || '').replace(/\D/g, '').slice(-10);
    const checks = [
      { label: 'Full Name', done: Boolean((u.name || '').trim()) },
      { label: 'Contact Number', done: studentDigits.length === 10 },
      { label: 'College Name', done: Boolean((u.college || '').trim()) },
      { label: 'Guardian Name', done: Boolean((u.guardianName || '').trim()) },
      { label: 'Guardian Contact', done: guardianDigits.length === 10 },
      { label: 'Student Photo', done: Boolean(u.photo) }
    ];
    const done = checks.filter((c) => c.done).length;
    return {
      percentage: Math.round((done / checks.length) * 100),
      isComplete: done === checks.length,
      missing: checks.filter((c) => !c.done).map((c) => c.label)
    };
  }

  function renderAvatar(photo, sizePx) {
    const px = sizePx || 48;
    if (photo) {
      return `<span class="avatar-circle" style="width:${px}px;height:${px}px;"><img src="${photo}" alt="Student photo" /></span>`;
    }
    const iconPx = Math.round(px * 0.56);
    return `<span class="avatar-circle" style="width:${px}px;height:${px}px;" title="Vacant profile photo"><svg width="${iconPx}" height="${iconPx}" viewBox="0 0 24 24" fill="#0f172a" aria-hidden="true"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5z"/></svg></span>`;
  }

  function detectGPS() {
    if (!navigator.geolocation) {
      state.gpsStatus = 'Geolocation unavailable in this browser. Pick your town below.';
      render();
      return;
    }
    state.gpsStatus = 'Requesting browser GPS permission...';
    render();
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        let nearest = DATA.towns[0];
        let best = Infinity;
        DATA.towns.forEach(function (t) {
          const d = Math.hypot(pos.coords.latitude - t.lat, pos.coords.longitude - t.lng);
          if (d < best) { best = d; nearest = t; }
        });
        state.city = nearest.city;
        state.neighborhood = nearest.neighborhoods[0];
        state.gpsStatus = 'GPS matched: ' + nearest.city + ' (' + state.neighborhood + ')';
        render();
      },
      function () {
        state.gpsStatus = 'GPS declined or unavailable. Select your local town below.';
        render();
      },
      { timeout: 6000 }
    );
  }

  function renderGPS() {
    const nbs = getNeighborhoods(state.city);
    return `
      <div class="container" style="padding-top:28px;padding-bottom:36px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:24px;">
          <span class="brand"><span class="sun-logo" aria-hidden="true">&#9728;&#xFE0E;</span><span>SummrHome</span></span>
          <span class="meta-line">Step 1 of 2 · GPS Location</span>
        </div>
        <div class="grid-2">
          <div class="panel gps-hero" style="background:#0f172a;color:#fff;border-color:#0f172a;">
            <p style="font-size:12px;color:#5eead4;font-weight:600;margin-bottom:10px;">Hyperlocal Campus Network</p>
            <h1 style="font-size:28px;line-height:1.2;margin-bottom:14px;">Homes and student essentials in your neighborhood.</h1>
            <p style="font-size:14px;color:#cbd5e1;">Works across Sreerampore, Rishra, Uttarpara, Chinsurah, Chandannagar, Konnagar, Kolkata & Howrah.</p>
          </div>
          <div class="panel gps-form">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;">
              <h2>Detect your current area</h2>
              <button class="btn btn-outline" id="btn-gps">Detect via GPS</button>
            </div>
            <div class="status-box status-ok">${state.gpsStatus}</div>
            <label>Select Local Town / City</label>
            <div class="town-grid" style="margin-bottom:16px;">
              ${DATA.towns.map((t) => `
                <button class="town-btn ${t.city === state.city ? 'active' : ''}" data-town="${t.city}">
                  <div style="font-weight:600;font-size:12px;">${t.city}</div>
                  <div style="font-size:11px;opacity:0.75;">${t.district}</div>
                </button>
              `).join('')}
            </div>
            <label for="gps-nb">Neighborhood / Para in ${state.city}</label>
            <select id="gps-nb" style="margin-bottom:20px;">
              ${nbs.map((n) => `<option value="${n}" ${n === state.neighborhood ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
            <div style="text-align:right;">
              <button class="btn btn-primary" id="btn-confirm-gps">Confirm Location & Continue to Login</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLogin() {
    const cols = getColleges(state.city);
    return `
      <div class="container" style="padding-top:28px;padding-bottom:36px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:24px;">
          <span class="brand"><span class="sun-logo" aria-hidden="true">&#9728;&#xFE0E;</span><span>SummrHome</span></span>
          <button class="btn btn-outline" id="btn-back-gps">Change GPS</button>
        </div>
        <div class="panel" style="max-width:580px;margin:0 auto;">
          <p class="meta-line meta-accent" style="margin-bottom:6px;">${state.city} · ${state.neighborhood}</p>
          <h1 style="font-size:24px;margin-bottom:6px;">Sign In & Mobile OTP Verification</h1>
          <p class="meta-line" style="margin-bottom:18px;">Enter your mobile number and click Send OTP to continue.</p>
          <form id="login-form">
            <label for="role">Role</label>
            <select id="role" style="margin-bottom:12px;">
              <option value="student">Student</option>
              <option value="owner">PG Owner / Admin</option>
              <option value="guardian">Guardian</option>
            </select>
            <label for="ugender">Gender (Filters Respective PGs & Roomies)</label>
            <select id="ugender" style="margin-bottom:12px;">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <label for="uname">Full Name</label>
            <input id="uname" placeholder="Enter your full name" required style="margin-bottom:12px;" />
            <label for="uemail">ID / Email</label>
            <input id="uemail" placeholder="you@college.edu" required style="margin-bottom:12px;" />
            <label for="umobile">Mobile Number (10 digits)</label>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
              <div style="display:flex;flex:1;align-items:center;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#fff;">
                <span class="mono" style="padding:10px 12px;background:#f1f5f9;border-right:1px solid #cbd5e1;font-size:13px;font-weight:600;color:#334155;user-select:none;">+91</span>
                <input id="umobile" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" required class="mono" style="border:none;border-radius:0;flex:1;outline:none;" />
              </div>
              <button type="button" class="btn btn-dark" id="btn-send-otp">${state.otpSent ? 'Resend OTP' : 'Send OTP'}</button>
            </div>
            <div id="otp-box" style="display:${state.otpSent ? 'block' : 'none'};margin-bottom:12px;" class="status-box status-ok">
              <label for="uotp" id="uotp-label">Demo OTP is 363636</label>
              <input id="uotp" value="" inputmode="numeric" maxlength="6" placeholder="Enter 363636" class="mono" />
            </div>
            <label for="ucollege">College in ${state.city}</label>
            <select id="ucollege" style="margin-bottom:12px;">
              ${cols.map((c) => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <label for="upass">Password</label>
            <input id="upass" type="password" placeholder="Enter password" required style="margin-bottom:14px;" />
            <div id="login-error" class="meta-line" style="color:#b91c1c;margin-bottom:10px;"></div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Verify & Enter SummrHome</button>
          </form>
        </div>
      </div>
    `;
  }

  function renderHeader() {
    const pStatus = state.user.role === 'student' ? getProfileStatus() : null;
    const dashLabel = state.user.role === 'owner' ? 'Owner Console' : state.user.role === 'guardian' ? 'Guardian Safety' : `My Profile (${pStatus.percentage}%)`;
    return `
      <header class="topbar">
        <div class="container topbar-inner">
          <button class="brand" data-tab="pg"><span class="sun-logo" aria-hidden="true">&#9728;&#xFE0E;</span><span>SummrHome</span></button>
          <nav class="nav-links">
            <button class="nav-link ${state.activeTab === 'pg' ? 'active' : ''}" data-tab="pg">Find PG</button>
            ${state.user.role !== 'owner' ? `<button class="nav-link ${state.activeTab === 'bazaar' ? 'active' : ''}" data-tab="bazaar">Student Bazaar</button>` : ''}
            <button class="nav-link ${state.activeTab === 'roomies' ? 'active' : ''}" data-tab="roomies">Roomie Match</button>
            <button class="nav-link ${state.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">${dashLabel}</button>
          </nav>
          <button class="btn btn-dark" id="btn-logout" style="padding:6px 12px;">
            ${state.user.role === 'student' ? renderAvatar(state.user.photo, 24) : ''}
            <span>${state.user.name} · Sign Out</span>
          </button>
        </div>
      </header>
      <div class="section-strip">
        <div class="container section-strip-inner">
          <span class="meta-line">Active Area: <strong style="color:#0f766e;">${state.city} · ${state.neighborhood}</strong></span>
          <button class="btn btn-outline" id="btn-change-area" style="padding:6px 12px;font-size:12px;">Change Area</button>
        </div>
      </div>
    `;
  }

  function renderPGSection() {
    const cols = getColleges(state.city);
    const activeGender = state.user.gender || 'Male';
    const isStudent = state.user.role === 'student';
    const list = state.pgs.filter((pg) => {
      if (isStudent) {
        if (activeGender === 'Female' && pg.gender === 'Boys') return false;
        if (activeGender === 'Male' && pg.gender === 'Girls') return false;
      }
      if (state.pgScope === 'local' && pg.city !== state.city) return false;
      if (state.pgCollege !== 'All' && !pg.nearCollege.toLowerCase().includes(state.pgCollege.toLowerCase()) && !state.pgCollege.toLowerCase().includes(pg.nearCollege.toLowerCase())) return false;
      if (state.pgSearch && !(`${pg.title} ${pg.city} ${pg.neighborhood} ${pg.nearCollege}`).toLowerCase().includes(state.pgSearch.toLowerCase())) return false;
      return true;
    });

    return `
      <div class="container" style="padding-top:28px;padding-bottom:48px;">
        <div class="panel" style="margin-bottom:24px;">
          <h1 style="font-size:26px;">Verified Student PGs & Hostels</h1>
          <p class="meta-line" style="margin-top:4px;">Showing ${isStudent ? activeGender + ' (Boys/Girls + Co-ed)' : 'all'} PGs near ${state.city} · ${state.neighborhood}</p>
          <div class="filters-grid">
            <input id="pg-search" placeholder="Search Prothom Alo, para..." value="${state.pgSearch}" />
            <select id="pg-college">
              <option value="All">All Colleges in ${state.city}</option>
              ${cols.map((c) => `<option value="${c}" ${state.pgCollege === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <select id="pg-scope">
              <option value="all" ${state.pgScope === 'all' ? 'selected' : ''}>${state.city} & Nearby Towns</option>
              <option value="local" ${state.pgScope === 'local' ? 'selected' : ''}>Only ${state.city}</option>
            </select>
            ${isStudent ? `
              <select id="pg-gender">
                <option value="Male" ${activeGender === 'Male' ? 'selected' : ''}>Male (Boys & Co-ed)</option>
                <option value="Female" ${activeGender === 'Female' ? 'selected' : ''}>Female (Girls & Co-ed)</option>
              </select>
            ` : ''}
          </div>
        </div>
        <div class="grid-3">
          ${list.map((pg) => `
            <article class="card">
              <div class="card-img"><img src="${pg.photo}" alt="${pg.title}" /></div>
              <div class="card-body">
                <div>
                  <div class="meta-line"><span class="meta-accent">${pg.city}</span> · ${pg.neighborhood} · ${pg.gender}</div>
                  <h2 class="card-title">${pg.title}</h2>
                  <p class="meta-line" style="margin-top:4px;">Near ${pg.nearCollege} · ${pg.sharing}</p>
                </div>
                <div class="card-footer">
                  <div>
                    <div class="price mono">₹${pg.rent.toLocaleString('en-IN')}<span style="font-size:11px;font-weight:400;color:#64748b;">/mo</span></div>
                    <div class="meta-line meta-accent">${pg.freeBeds} beds free</div>
                  </div>
                  <button class="btn btn-dark" data-book-pg="${pg.id}">View & Book</button>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderBazaarSection() {
    const cats = ['All', 'Books & Notes', 'Electronics', 'Furniture', 'Cycles & Commute', 'Room Essentials'];
    const items = state.bazaarItems.filter((item) => {
      if (state.bazaarCategory !== 'All' && item.category !== state.bazaarCategory) return false;
      if (state.bazaarSearch && !(`${item.title} ${item.city} ${item.neighborhood} ${item.desc}`).toLowerCase().includes(state.bazaarSearch.toLowerCase())) return false;
      return true;
    });

    return `
      <div class="container" style="padding-top:28px;padding-bottom:48px;">
        <div class="panel" style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <h1 style="font-size:26px;">Student Bazaar — Campus Classifieds</h1>
              <p class="meta-line">${state.bazaarItems.length} college essentials across Hooghly & Kolkata neighborhoods</p>
            </div>
            <button class="btn btn-primary" id="btn-open-post">+ Post an Ad</button>
          </div>
          <div class="tab-group" style="margin-top:16px;">
            ${cats.map((c) => `<button class="btn ${state.bazaarCategory === c ? 'btn-dark' : 'btn-outline'}" data-cat="${c}">${c}</button>`).join('')}
          </div>
          <div class="filters-grid">
            <input id="bazaar-search" placeholder="Search kettle, chair, cycle, router, GATE books..." value="${state.bazaarSearch}" />
          </div>
        </div>
        <div class="grid-3">
          ${items.map((item) => `
            <article class="card">
              <div class="card-img"><img src="${item.photo}" alt="${item.title}" /></div>
              <div class="card-body">
                <div>
                  <div class="meta-line"><span class="meta-accent">${item.category}</span> · ${item.condition}</div>
                  <h2 class="card-title">${item.title}</h2>
                  <p class="meta-line" style="margin-top:4px;">${item.neighborhood}, ${item.city}</p>
                </div>
                <div class="card-footer">
                  <div>
                    <div class="price mono">${item.price === 0 ? 'FREE' : '₹' + item.price.toLocaleString('en-IN')}</div>
                    <div class="meta-line">By ${item.seller}</div>
                  </div>
                  <button class="btn btn-dark" data-contact-item="${item.id}">Chat / View</button>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderRoomiesSection() {
    const activeGender = state.user.gender || 'Male';
    const scored = state.roommates
      .filter((rm) => (rm.gender || 'Male') === activeGender)
      .map((rm) => {
        let score = 50;
        if (rm.sleep === state.roomieSleep) score += 25;
        if (rm.food === state.roomieFood) score += 15;
        if (rm.city === state.city) score += 9;
        return Object.assign({}, rm, { score: Math.min(99, score) });
      })
      .sort((a, b) => b.score - a.score);

    return `
      <div class="container" style="padding-top:28px;padding-bottom:48px;">
        <div class="panel" style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <h1 style="font-size:26px;">Roomie & Cost Match (${activeGender} Only)</h1>
              <p class="meta-line">Match by sleep & food vibe, then split a Twin PG room & Bazaar starter kit.</p>
            </div>
          </div>
          <div class="filters-grid">
            <div>
              <label for="rm-gender">Gender</label>
              <select id="rm-gender">
                <option value="Male" ${activeGender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${activeGender === 'Female' ? 'selected' : ''}>Female</option>
              </select>
            </div>
            <div>
              <label for="rm-sleep">Your Sleep Rhythm</label>
              <select id="rm-sleep">
                <option value="Night Owl" ${state.roomieSleep === 'Night Owl' ? 'selected' : ''}>Night Owl</option>
                <option value="Early Riser" ${state.roomieSleep === 'Early Riser' ? 'selected' : ''}>Early Riser</option>
              </select>
            </div>
            <div>
              <label for="rm-food">Food Preference</label>
              <select id="rm-food">
                <option value="Non-Veg" ${state.roomieFood === 'Non-Veg' ? 'selected' : ''}>Non-Veg</option>
                <option value="Veg" ${state.roomieFood === 'Veg' ? 'selected' : ''}>Veg</option>
              </select>
            </div>
          </div>
        </div>
        <div class="grid-3">
          ${scored.map((rm) => {
            const teamed = state.roomieRequests.indexOf(rm.id) !== -1;
            return `
              <article class="card">
                <div class="card-body">
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                      <span class="meta-line"><span class="meta-accent">${rm.city}</span> · ${rm.neighborhood}</span>
                      <strong class="mono" style="color:#0f766e;">${rm.score}% Match</strong>
                    </div>
                    <h2 class="card-title">${rm.name}</h2>
                    <p class="meta-line">${rm.year} · ${rm.college}</p>
                    <p style="font-size:13px;color:#475569;margin-top:8px;">${rm.bio}</p>
                    <p class="meta-line" style="margin-top:8px;">Target PG: <strong>${rm.targetPG}</strong> (${rm.sharing}) · ${rm.sleep} · ${rm.food}</p>
                  </div>
                  <div class="card-footer">
                    <div class="price mono">₹${rm.budget.toLocaleString('en-IN')}<span style="font-size:11px;font-weight:400;color:#64748b;">/mo</span></div>
                    <button class="btn ${teamed ? 'btn-primary' : 'btn-dark'}" data-team-rm="${rm.id}">${teamed ? 'Teamed Up' : 'Team Up'}</button>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderDashboardSection() {
    if (state.user.role === 'owner') {
      return `
        <div class="container" style="padding-top:28px;padding-bottom:48px;">
          <div class="panel" style="margin-bottom:24px;">
            <h1>PG Owner Console</h1>
            <p class="meta-line">Approve student booking requests and manage bed counts.</p>
            <table style="margin-top:16px;">
              <thead><tr><th>Student</th><th>PG</th><th>Sharing</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${state.bookings.map((b) => `
                  <tr>
                    <td>${b.student}</td>
                    <td>${b.pgTitle}</td>
                    <td>${b.sharing}</td>
                    <td><strong>${b.status}</strong></td>
                    <td>
                      ${b.status === 'Pending' ? `<button class="btn btn-primary" data-approve-bk="${b.id}">Approve</button>` : 'Done'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (state.user.role === 'guardian') {
      return `
        <div class="container" style="padding-top:28px;padding-bottom:48px;">
          <div class="panel" style="margin-bottom:20px;">
            <h1>Guardian Safety Portal</h1>
            <p class="meta-line">Linked Ward · Prothom Alo, Sreerampore</p>
            <div style="margin-top:16px;">
              ${state.alerts.map((a) => `
                <div class="status-box ${a.status === 'Pending Approval' ? 'status-warn' : 'status-ok'}" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                  <div><strong>${a.type}</strong> · ${a.time}<br/>${a.msg}</div>
                  ${a.status === 'Pending Approval' ? `<button class="btn btn-primary" data-approve-alert="${a.id}">Approve</button>` : `<strong>${a.status}</strong>`}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    const pStatus = getProfileStatus();
    const cols = getColleges(state.city);
    const sDigits = (state.user.mobile || '').replace(/\D/g, '').slice(-10);
    const gDigits = (state.user.guardianMobile || '').replace(/\D/g, '').slice(-10);

    return `
      <div class="container" style="padding-top:28px;padding-bottom:48px;">
        <div class="panel" style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;padding-bottom:18px;border-bottom:1px solid #f1f5f9;">
            <div style="display:flex;align-items:center;gap:16px;">
              ${renderAvatar(state.user.photo, 84)}
              <div>
                <div class="meta-line meta-accent">Student Profile · ${state.city}</div>
                <h1 style="font-size:22px;">${state.user.name}</h1>
                <p class="meta-line">${state.user.college || 'Add college name'} · <span class="mono">${state.user.mobile}</span></p>
                <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
                  <label class="btn btn-dark" style="margin:0;padding:7px 12px;font-size:12px;">
                    ${state.user.photo ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" id="prof-photo-input" accept="image/*" style="display:none;" />
                  </label>
                  ${state.user.photo ? '<button type="button" class="btn btn-outline" id="prof-photo-remove" style="padding:7px 12px;font-size:12px;">Remove</button>' : ''}
                </div>
              </div>
            </div>
            <div style="min-width:260px;flex:0 1 320px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;">
              <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px;">
                <span>Profile Completion</span>
                <span class="mono" style="color:${pStatus.isComplete ? '#0f766e' : '#b45309'};">${pStatus.percentage}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${pStatus.percentage}%;background:${pStatus.isComplete ? '#0f766e' : '#d97706'};"></div>
              </div>
              <p class="meta-line" style="margin-top:6px;">
                ${pStatus.isComplete ? '100% complete — you can contact PG owners and book beds.' : 'Missing for PG booking: ' + pStatus.missing.join(', ')}
              </p>
            </div>
          </div>

          <form id="student-profile-form" style="margin-top:18px;">
            <div class="filters-grid" style="margin-top:0;">
              <div>
                <label for="sp-name">Student Full Name</label>
                <input id="sp-name" value="${state.user.name || ''}" required />
              </div>
              <div>
                <label for="sp-mobile">Student Contact (+91, 10 digits)</label>
                <div style="display:flex;align-items:center;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#fff;">
                  <span class="mono" style="padding:10px 10px;background:#f1f5f9;border-right:1px solid #cbd5e1;font-size:12px;font-weight:600;">+91</span>
                  <input id="sp-mobile" type="tel" inputmode="numeric" maxlength="10" value="${sDigits}" required class="mono" style="border:none;border-radius:0;" />
                </div>
              </div>
              <div>
                <label for="sp-college">College Name</label>
                <select id="sp-college">
                  ${cols.map((c) => `<option value="${c}" ${state.user.college === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div>
                <label for="sp-gname">Guardian Name</label>
                <input id="sp-gname" value="${state.user.guardianName || ''}" placeholder="Parent / local guardian name" required />
              </div>
              <div>
                <label for="sp-gmobile">Guardian Contact (+91, 10 digits)</label>
                <div style="display:flex;align-items:center;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#fff;">
                  <span class="mono" style="padding:10px 10px;background:#f1f5f9;border-right:1px solid #cbd5e1;font-size:12px;font-weight:600;">+91</span>
                  <input id="sp-gmobile" type="tel" inputmode="numeric" maxlength="10" value="${gDigits}" placeholder="10-digit number" required class="mono" style="border:none;border-radius:0;" />
                </div>
              </div>
              <div style="display:flex;align-items:end;">
                <button type="submit" class="btn btn-primary" style="width:100%;min-height:44px;">Save Student Profile</button>
              </div>
            </div>
            <div id="sp-msg" class="meta-line meta-accent" style="margin-top:10px;"></div>
          </form>
        </div>

        <div class="panel">
          <h1>My PG Bookings</h1>
          <div style="margin-top:14px;">
            ${state.bookings.map((b) => `
              <div class="status-box status-ok">${b.pgTitle} (${b.sharing}) · Status: <strong>${b.status}</strong></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function openModal(html) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop" id="modal-bg"><div class="modal-box">${html}</div></div>`;
    document.getElementById('modal-bg').addEventListener('click', function (e) {
      if (e.target.id === 'modal-bg') root.innerHTML = '';
    });
  }

  function render() {
    const app = document.getElementById('app');
    if (state.step === 'gps') {
      app.innerHTML = renderGPS();
      document.getElementById('btn-gps').onclick = detectGPS;
      document.querySelectorAll('[data-town]').forEach((btn) => {
        btn.onclick = function () {
          state.city = btn.getAttribute('data-town');
          state.neighborhood = getNeighborhoods(state.city)[0];
          state.pgCollege = 'All';
          render();
        };
      });
      document.getElementById('gps-nb').onchange = function (e) {
        state.neighborhood = e.target.value;
      };
      document.getElementById('btn-confirm-gps').onclick = function () {
        state.step = 'login';
        render();
      };
      return;
    }

    if (state.step === 'login') {
      app.innerHTML = renderLogin();
      document.getElementById('btn-back-gps').onclick = function () {
        state.step = 'gps';
        render();
      };
      const mobileInput = document.getElementById('umobile');
      const otpInputEl = document.getElementById('uotp');
      mobileInput.oninput = function (e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        if (state.otpSent) {
          state.otpSent = false;
          document.getElementById('otp-box').style.display = 'none';
          document.getElementById('btn-send-otp').textContent = 'Send OTP';
          otpInputEl.value = '';
        }
      };
      otpInputEl.oninput = function (e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
      };
      document.getElementById('btn-send-otp').onclick = function () {
        const mob = mobileInput.value.replace(/\D/g, '');
        if (mob.length !== 10) {
          document.getElementById('login-error').textContent = 'Enter a valid 10-digit mobile number after +91.';
          return;
        }
        state.otpSent = true;
        document.getElementById('otp-box').style.display = 'block';
        document.getElementById('uotp-label').textContent = 'OTP sent to +91 ' + mob + ' · Demo OTP is 363636';
        otpInputEl.value = '';
        document.getElementById('btn-send-otp').textContent = 'Resend OTP';
        document.getElementById('login-error').textContent = '';
      };
      document.getElementById('login-form').onsubmit = function (e) {
        e.preventDefault();
        const mob = mobileInput.value.replace(/\D/g, '');
        if (mob.length !== 10) {
          document.getElementById('login-error').textContent = 'Enter a valid 10-digit mobile number after +91.';
          return;
        }
        if (!state.otpSent) {
          document.getElementById('login-error').textContent = 'Click Send OTP to verify your mobile number.';
          return;
        }
        const enteredOtp = otpInputEl.value.trim();
        if (enteredOtp !== DEFAULT_OTP) {
          document.getElementById('login-error').textContent = 'Invalid OTP. Please check and try again.';
          return;
        }
        const role = document.getElementById('role').value;
        state.user = {
          role: role,
          gender: document.getElementById('ugender').value || 'Male',
          name: document.getElementById('uname').value,
          email: document.getElementById('uemail').value,
          mobile: '+91 ' + mob.slice(0, 5) + ' ' + mob.slice(5),
          college: document.getElementById('ucollege').value,
          guardianName: '',
          guardianMobile: '',
          photo: ''
        };
        state.step = 'app';
        state.activeTab = role === 'student' ? 'pg' : 'dashboard';
        render();
      };
      return;
    }

    let body = '';
    if (state.activeTab === 'pg') body = renderPGSection();
    else if (state.activeTab === 'bazaar' && state.user.role !== 'owner') body = renderBazaarSection();
    else if (state.activeTab === 'roomies') body = renderRoomiesSection();
    else body = renderDashboardSection();

    app.innerHTML = renderHeader() + body;

    document.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.onclick = function () {
        state.activeTab = btn.getAttribute('data-tab');
        render();
      };
    });

    document.getElementById('btn-logout').onclick = function () {
      state.user = null;
      state.otpSent = false;
      state.step = 'login';
      render();
    };

    const changeAreaBtn = document.getElementById('btn-change-area');
    if (changeAreaBtn) {
      changeAreaBtn.onclick = function () {
        state.step = 'gps';
        render();
      };
    }

    if (state.activeTab === 'pg') {
      document.getElementById('pg-search').oninput = function (e) {
        state.pgSearch = e.target.value;
        render();
      };
      document.getElementById('pg-college').onchange = function (e) {
        state.pgCollege = e.target.value;
        render();
      };
      document.getElementById('pg-scope').onchange = function (e) {
        state.pgScope = e.target.value;
        render();
      };
      const pgGenderEl = document.getElementById('pg-gender');
      if (pgGenderEl) {
        pgGenderEl.onchange = function (e) {
          state.user.gender = e.target.value;
          render();
        };
      }
      document.querySelectorAll('[data-book-pg]').forEach((btn) => {
        btn.onclick = function () {
          const pg = state.pgs.find((p) => p.id === btn.getAttribute('data-book-pg'));
          const pStatus = getProfileStatus();
          const locked = state.user.role === 'student' && !pStatus.isComplete;

          if (!locked) {
            openModal(`
              <h2>${pg.title}</h2>
              <p class="meta-line" style="margin:6px 0 12px;">${pg.neighborhood}, ${pg.city} · Near ${pg.nearCollege} · ${pg.sharing}</p>
              <div class="status-box status-ok"><strong>Owner:</strong> ${pg.ownerName} · <span class="mono">${pg.ownerMobile}</span></div>
              <p class="meta-line" style="margin-bottom:14px;">Rent: <strong class="mono">₹${pg.rent.toLocaleString('en-IN')}/mo</strong> · ${pg.freeBeds} beds free</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-primary" id="btn-confirm-book">Send Booking Request</button>
                <button class="btn btn-outline" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>
              </div>
            `);
            document.getElementById('btn-confirm-book').onclick = function () {
              state.bookings.unshift({
                id: 'bk-' + Date.now(),
                pgTitle: pg.title,
                student: state.user.name,
                sharing: 'Double',
                date: '2026-12-01',
                status: 'Pending'
              });
              openModal(`<h3>Booking Request Sent</h3><p class="meta-line" style="margin:10px 0;">Request sent to ${pg.ownerName} (${pg.ownerMobile}) for ${pg.title}.</p><button class="btn btn-primary" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>`);
            };
            return;
          }

          openModal(`
            <h2>${pg.title}</h2>
            <p class="meta-line" style="margin:6px 0 12px;">${pg.neighborhood}, ${pg.city} · Near ${pg.nearCollege} · ${pg.sharing} · <strong class="mono">₹${pg.rent.toLocaleString('en-IN')}/mo</strong></p>
            <div class="status-box status-warn">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                ${renderAvatar(state.user.photo, 44)}
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;font-weight:700;">
                    <span>Complete Student Profile to Contact Owner & Book</span>
                    <span class="mono">${pStatus.percentage}%</span>
                  </div>
                  <div class="progress-track" style="margin-top:4px;"><div class="progress-fill" style="width:${pStatus.percentage}%;background:#d97706;"></div></div>
                </div>
              </div>
              <div style="font-size:12px;">Owner contact is locked until 100% completion. Missing: <strong>${pStatus.missing.join(', ')}</strong></div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-primary" id="btn-go-profile">Complete Profile Now</button>
              <button class="btn btn-outline" onclick="document.getElementById('modal-root').innerHTML=''">Keep Browsing</button>
            </div>
          `);
          document.getElementById('btn-go-profile').onclick = function () {
            document.getElementById('modal-root').innerHTML = '';
            state.activeTab = 'dashboard';
            render();
          };
        };
      });
    }

    if (state.activeTab === 'bazaar') {
      document.querySelectorAll('[data-cat]').forEach((btn) => {
        btn.onclick = function () {
          state.bazaarCategory = btn.getAttribute('data-cat');
          render();
        };
      });
      document.getElementById('bazaar-search').oninput = function (e) {
        state.bazaarSearch = e.target.value;
        render();
      };
      document.getElementById('btn-open-post').onclick = function () {
        openModal(`
          <h2 style="margin-bottom:12px;">Post Item to Student Bazaar</h2>
          <form id="post-ad-form">
            <label>Item Title</label>
            <input id="ad-title" required placeholder="e.g., Study Lamp or Engineering Books" style="margin-bottom:10px;" />
            <label>Category</label>
            <select id="ad-cat" style="margin-bottom:10px;">
              <option>Books & Notes</option><option>Electronics</option><option>Furniture</option><option>Cycles & Commute</option><option>Room Essentials</option>
            </select>
            <label>Price (₹ — enter 0 for Free)</label>
            <input id="ad-price" type="number" value="400" style="margin-bottom:10px;" />
            <label>Description</label>
            <textarea id="ad-desc" rows="3" required style="margin-bottom:10px;"></textarea>
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;">
              <input id="ad-show-phone" type="checkbox" style="width:auto;min-height:auto;" />
              <span>Show my phone number on this ad (optional — buyers can always chat)</span>
            </label>
            <button type="submit" class="btn btn-primary">Publish Ad</button>
          </form>
        `);
        document.getElementById('post-ad-form').onsubmit = function (e) {
          e.preventDefault();
          state.bazaarItems.unshift({
            id: 'b-' + Date.now(),
            title: document.getElementById('ad-title').value,
            category: document.getElementById('ad-cat').value,
            price: Number(document.getElementById('ad-price').value) || 0,
            condition: 'Used',
            city: state.city,
            neighborhood: state.neighborhood,
            seller: state.user.name,
            mobile: state.user.mobile,
            showPhone: Boolean(document.getElementById('ad-show-phone').checked),
            photo: '../public/images/bazaar-desk.jpg',
            desc: document.getElementById('ad-desc').value
          });
          document.getElementById('modal-root').innerHTML = '';
          render();
        };
      };
      document.querySelectorAll('[data-contact-item]').forEach((btn) => {
        btn.onclick = function () {
          const item = state.bazaarItems.find((i) => i.id === btn.getAttribute('data-contact-item'));
          function openBazaarModal(revealPhone) {
            const msgs = state.bazaarChats[item.id] || [];
            const phoneBlock = item.showPhone
              ? (revealPhone
                ? `<div class="status-box status-ok"><strong>Seller:</strong> ${item.seller} · <span class="mono">${item.mobile}</span></div>`
                : `<div class="status-box status-ok" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;"><span><strong>Seller:</strong> ${item.seller}</span><button type="button" class="btn btn-outline" id="btn-reveal-phone" style="padding:6px 10px;font-size:12px;">Show Seller Phone</button></div>`)
              : `<div class="status-box status-warn"><strong>Seller:</strong> ${item.seller} · Phone hidden for privacy (OLX-style). Use chat below.</div>`;

            openModal(`
              <h2>${item.title}</h2>
              <p class="meta-line" style="margin:6px 0 12px;">${item.neighborhood}, ${item.city} · ${item.condition}</p>
              <p style="font-size:14px;margin-bottom:14px;">${item.desc}</p>
              ${phoneBlock}
              <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:12px;background:#f8fafc;">
                <div style="font-size:12px;font-weight:700;margin-bottom:8px;">Chat with ${item.seller}</div>
                <div style="max-height:140px;overflow-y:auto;margin-bottom:8px;">
                  ${msgs.length ? msgs.map((m) => `<div style="font-size:12px;padding:6px 8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:6px;"><strong>${m.sender}:</strong> ${m.text}</div>`).join('') : '<p class="meta-line">Send a message to ask about condition or pickup timing.</p>'}
                </div>
                <form id="bazaar-chat-form" style="display:flex;gap:8px;">
                  <input id="bazaar-chat-input" placeholder="Message seller..." required style="flex:1;" />
                  <button type="submit" class="btn btn-primary">Send</button>
                </form>
              </div>
              <button class="btn btn-dark" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>
            `);

            const revealBtn = document.getElementById('btn-reveal-phone');
            if (revealBtn) {
              revealBtn.onclick = function () {
                openBazaarModal(true);
              };
            }
            document.getElementById('bazaar-chat-form').onsubmit = function (e) {
              e.preventDefault();
              const inp = document.getElementById('bazaar-chat-input');
              if (!inp.value.trim()) return;
              if (!state.bazaarChats[item.id]) state.bazaarChats[item.id] = [];
              state.bazaarChats[item.id].push({ sender: state.user.name, text: inp.value.trim() });
              openBazaarModal(revealPhone);
            };
          }
          openBazaarModal(false);
        };
      });
    }

    if (state.activeTab === 'roomies') {
      document.getElementById('rm-gender').onchange = function (e) {
        state.user.gender = e.target.value;
        render();
      };
      document.getElementById('rm-sleep').onchange = function (e) {
        state.roomieSleep = e.target.value;
        render();
      };
      document.getElementById('rm-food').onchange = function (e) {
        state.roomieFood = e.target.value;
        render();
      };
      document.querySelectorAll('[data-team-rm]').forEach((btn) => {
        btn.onclick = function () {
          const id = btn.getAttribute('data-team-rm');
          const idx = state.roomieRequests.indexOf(id);
          if (idx === -1) state.roomieRequests.push(id);
          else state.roomieRequests.splice(idx, 1);
          render();
        };
      });
    }

    if (state.activeTab === 'dashboard') {
      const photoInput = document.getElementById('prof-photo-input');
      if (photoInput) {
        photoInput.onchange = function (e) {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function () {
            if (typeof reader.result === 'string') {
              state.user.photo = reader.result;
              render();
            }
          };
          reader.readAsDataURL(file);
        };
      }
      const removeBtn = document.getElementById('prof-photo-remove');
      if (removeBtn) {
        removeBtn.onclick = function () {
          state.user.photo = '';
          render();
        };
      }
      const spForm = document.getElementById('student-profile-form');
      if (spForm) {
        const spMob = document.getElementById('sp-mobile');
        const spGMob = document.getElementById('sp-gmobile');
        spMob.oninput = function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); };
        spGMob.oninput = function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); };
        spForm.onsubmit = function (e) {
          e.preventDefault();
          const sNum = spMob.value.replace(/\D/g, '');
          const gNum = spGMob.value.replace(/\D/g, '');
          if (sNum.length !== 10 || gNum.length !== 10) {
            document.getElementById('sp-msg').style.color = '#b91c1c';
            document.getElementById('sp-msg').textContent = 'Both student and guardian contacts must be 10 digits after +91.';
            return;
          }
          state.user.name = document.getElementById('sp-name').value.trim();
          state.user.mobile = '+91 ' + sNum.slice(0, 5) + ' ' + sNum.slice(5);
          state.user.college = document.getElementById('sp-college').value;
          state.user.guardianName = document.getElementById('sp-gname').value.trim();
          state.user.guardianMobile = '+91 ' + gNum.slice(0, 5) + ' ' + gNum.slice(5);
          render();
          const msg = document.getElementById('sp-msg');
          if (msg) msg.textContent = 'Profile saved (' + getProfileStatus().percentage + '% complete).';
        };
      }
      document.querySelectorAll('[data-approve-bk]').forEach((btn) => {
        btn.onclick = function () {
          const bk = state.bookings.find((b) => b.id === btn.getAttribute('data-approve-bk'));
          if (bk) bk.status = 'Approved';
          render();
        };
      });
      document.querySelectorAll('[data-approve-alert]').forEach((btn) => {
        btn.onclick = function () {
          const al = state.alerts.find((a) => a.id === btn.getAttribute('data-approve-alert'));
          if (al) al.status = 'Approved';
          render();
        };
      });
    }
  }

  render();
})();
