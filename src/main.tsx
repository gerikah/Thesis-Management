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

  // 1. Authentication Simulation
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username') as HTMLInputElement;
      
      // Simulation: Assign roles based on username or just pick a random one
      const roles = ['Administrator', 'Coordinator', 'Adviser'];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      // Update UI
      if (userDisplayName) userDisplayName.innerText = username.value || 'User';
      if (userDisplayRole) userDisplayRole.innerText = randomRole;
      
      // Alert simulation
      alert(`Login Successful!\nRole: ${randomRole}\nRouting to ${randomRole} Dashboard...`);
      
      // Switch view
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
  const evaluateModal = document.getElementById('evaluate-modal');
  const btnNewThesis = document.getElementById('btn-new-thesis');
  
  const openModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
  };
  
  const closeModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  };

  // Open Workspace Modal on row click
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.clickable-row');
    if (row && !target.classList.contains('btn-evaluate')) {
      openModal('workspace-modal');
    }
    
    if (target.classList.contains('btn-evaluate')) {
      openModal('evaluate-modal');
    }
  });

  // Close buttons
  document.getElementById('close-modal')?.addEventListener('click', () => closeModal('workspace-modal'));
  document.getElementById('close-modal-btn')?.addEventListener('click', () => closeModal('workspace-modal'));
  document.getElementById('close-evaluate')?.addEventListener('click', () => closeModal('evaluate-modal'));
  document.getElementById('cancel-evaluate')?.addEventListener('click', () => closeModal('evaluate-modal'));
  
  if (btnNewThesis) {
    btnNewThesis.addEventListener('click', () => {
      // Switch to register view
      const registerNavItem = document.querySelector('[data-view="register"]') as HTMLElement;
      if (registerNavItem) registerNavItem.click();
    });
  }

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
    if (e.target === evaluateModal) closeModal('evaluate-modal');
  });
});
