/**
 * PUP CpE Thesis Management Portal
 * Vanilla JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('PUP CpE Dashboard Logic Loaded');
  // Elements
  const authPage = document.getElementById('auth-page');
  const mainApp = document.getElementById('main-app');
  const loginForm = document.getElementById('login-form');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const navItems = document.querySelectorAll('.nav-item');
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayRole = document.getElementById('user-display-role');
  
  const theses = [
    {
      id: 'g01-2026',
      title: 'AI-Based Traffic Management for Manila',
      groupCode: 'G01',
      batchYear: '2025-2026',
      section: '5-1',
      dateArchived: 'Mar 15, 2026',
      mainAdviser: 'Engr. Dela Cruz',
      panelMembers: ['Dr. Bautista', 'Engr. Reyes', 'Engr. Santos'],
      abstract: 'This thesis presents an AI-assisted traffic management prototype for congested Manila intersections. It uses image-based vehicle detection and adaptive signal timing to reduce queue length, improve traffic flow, and support faster decision-making for local traffic administrators.',
      authors: ['Santos, J.', 'Reyes, M.', 'Cruz, L.']
    },
    {
      id: 'g02-2026',
      title: 'IoT Smart Farming in Bulacan',
      groupCode: 'G02',
      batchYear: '2025-2026',
      section: '5-2',
      dateArchived: 'Mar 14, 2026',
      mainAdviser: 'Dr. Bautista',
      panelMembers: ['Engr. Dela Cruz', 'Engr. Gomez', 'Engr. Lim'],
      abstract: 'This project develops an IoT-based monitoring and automation system for small farms in Bulacan. The system collects soil moisture, temperature, and humidity readings, then assists irrigation decisions through a web dashboard designed for practical farm use.',
      authors: ['Perez, A.', 'Gomez, R.', 'Lim, C.']
    }
  ];

  // User session state
  let isAuthenticated = false;
  let userRole = 'Guest';

  // Show main app and hide auth page on initial load
  if (authPage) authPage.classList.add('hidden');
  if (mainApp) mainApp.classList.remove('hidden');
  
  // Set guest user display
  if (userDisplayName) userDisplayName.innerText = 'Guest';
  if (userDisplayRole) userDisplayRole.innerText = 'View Only';

  // 1. Authentication Simulation - Only triggered when adding a thesis
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username') as HTMLInputElement;
      
      // Only admin/thesis head can add theses
      const validAdmins = ['admin', 'thesis_head', 'coordinator'];
      const isAdmin = validAdmins.includes(username.value.toLowerCase());
      
      if (!isAdmin) {
        alert('Access Denied!\nOnly Administrators and Thesis Heads can archive theses.\n\nFor demo purposes, use:\nadmin, thesis_head, or coordinator');
        return;
      }
      
      // Update UI
      isAuthenticated = true;
      userRole = 'Administrator';
      if (userDisplayName) userDisplayName.innerText = username.value || 'Admin';
      if (userDisplayRole) userDisplayRole.innerText = userRole;
      
      // Alert simulation
      alert(`Login Successful!\nRole: ${userRole}\nYou can now archive theses.`);
      
      // Switch view
      if (authPage) authPage.classList.add('hidden');
      if (mainApp) mainApp.classList.remove('hidden');
    });
  }
  
  // Back to Dashboard button
  const cancelLoginBtn = document.getElementById('cancel-login-btn');
  if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', () => {
      if (authPage) authPage.classList.add('hidden');
      if (mainApp) mainApp.classList.remove('hidden');
    });
  }

  // 2. Sidebar Toggle (Mobile)
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // 3. Navigation Logic
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      
      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active class to clicked nav item
      item.classList.add('active');
      
      // Hide all views
      document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
      
      // Show target view
      const targetView = document.getElementById(`${view}-view`);
      if (targetView) {
        console.log(`Switching to view: ${view}`);
        targetView.classList.remove('hidden');
      }
      
      // Close sidebar on mobile after click
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
      }
    });
  });

  // 4. Modal Management
  const workspaceModal = document.getElementById('workspace-modal');
  const btnNewThesis = document.getElementById('btn-new-thesis');
  
  const openModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
  };
  
  const closeModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  };

  // Archive Thesis button - Check authentication first
  if (btnNewThesis) {
    btnNewThesis.addEventListener('click', () => {
      if (!isAuthenticated) {
        // Show auth modal
        if (authPage) {
          authPage.classList.remove('hidden');
        }
      } else {
        // Switch to register view if authenticated
        document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
        const registerView = document.getElementById('register-view');
        if (registerView) registerView.classList.remove('hidden');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      }
    });
  }

  const setText = (id: string, value: string) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const showThesisDetails = (thesis: typeof theses[number]) => {
    setText('modal-title', thesis.title);
    setText('modal-title-val', thesis.title);
    setText('modal-authors-val', thesis.authors.join(', '));
    setText('modal-date-val', thesis.dateArchived);
    setText('modal-group-code-val', `${thesis.groupCode}-${thesis.batchYear}`);
    setText('modal-adviser-val', thesis.mainAdviser);
    setText('modal-panel-val', thesis.panelMembers.join(', '));
    setText('modal-abstract-val', thesis.abstract);

    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="overview"]')?.classList.add('active');
    document.getElementById('tab-overview')?.classList.add('active');
    openModal('workspace-modal');
  };

  // Open Workspace Modal on thesis row click
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.clickable-row') as HTMLElement | null;
    if (row) {
      const thesis = theses.find(item => item.id === row.dataset.id);
      if (thesis) showThesisDetails(thesis);
    }
  });

  // Dashboard "View All" Button
  const btnViewAll = document.getElementById('btn-view-all');
  if (btnViewAll) {
    btnViewAll.addEventListener('click', () => {
      const repoNav = document.querySelector('[data-view="repository"]') as HTMLElement;
      if (repoNav) repoNav.click();
    });
  }

  // Close buttons
  document.getElementById('close-modal')?.addEventListener('click', () => closeModal('workspace-modal'));
  document.getElementById('close-modal-btn')?.addEventListener('click', () => closeModal('workspace-modal'));
  // 5. Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${tabId}`) {
          content.classList.add('active');
        }
      });
    });
  });

  // 6. Dynamic Author Addition
  const authorsContainer = document.getElementById('authors-container');
  const btnAddAuthor = document.querySelector('#register-view .btn-secondary');
  let authorCount = 2;

  if (btnAddAuthor && authorsContainer) {
    btnAddAuthor.addEventListener('click', () => {
      if (authorCount >= 5) {
        alert('Maximum of 5 authors per group.');
        return;
      }
      authorCount++;
      
      const authorRow = document.createElement('div');
      authorRow.className = 'form-grid';
      authorRow.style.marginBottom = '1rem';
      authorRow.innerHTML = `
        <div class="form-group">
          <label>Author ${authorCount}</label>
          <input type="text" placeholder="Full Name">
        </div>
        <div class="form-group">
          <label>Student Number</label>
          <input type="text" placeholder="20XX-XXXXX-MN-0">
        </div>
      `;
      authorsContainer.appendChild(authorRow);
    });
  }

  // Close modals when clicking overlay
  window.addEventListener('click', (e) => {
    if (e.target === workspaceModal) closeModal('workspace-modal');
  });
});
