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
  
  type Thesis = {
    id: string;
    title: string;
    groupCode: string;
    batchYear: string;
    section: string;
    researchTopic: string;
    dateArchived: string;
    mainAdviser: string;
    panelMembers: string[];
    abstract: string;
    authors: { name: string; studentNumber?: string }[];
  };

  const theses: Thesis[] = [
    {
      id: 'g01-2026',
      title: 'AI-Based Traffic Management for Manila',
      groupCode: 'G01',
      batchYear: '2025-2026',
      section: '5-1',
      researchTopic: 'AI / Machine Learning',
      dateArchived: 'Mar 15, 2026',
      mainAdviser: 'Engr. Dela Cruz',
      panelMembers: ['Dr. Bautista', 'Engr. Reyes', 'Engr. Santos'],
      abstract: 'This thesis presents an AI-assisted traffic management prototype for congested Manila intersections. It uses image-based vehicle detection and adaptive signal timing to reduce queue length, improve traffic flow, and support faster decision-making for local traffic administrators.',
      authors: [{ name: 'Santos, J.' }, { name: 'Reyes, M.' }, { name: 'Cruz, L.' }]
    },
    {
      id: 'g02-2026',
      title: 'IoT Smart Farming in Bulacan',
      groupCode: 'G02',
      batchYear: '2025-2026',
      section: '5-2',
      researchTopic: 'IoT / Embedded Systems',
      dateArchived: 'Mar 14, 2026',
      mainAdviser: 'Dr. Bautista',
      panelMembers: ['Engr. Dela Cruz', 'Engr. Gomez', 'Engr. Lim'],
      abstract: 'This project develops an IoT-based monitoring and automation system for small farms in Bulacan. The system collects soil moisture, temperature, and humidity readings, then assists irrigation decisions through a web dashboard designed for practical farm use.',
      authors: [{ name: 'Perez, A.' }, { name: 'Gomez, R.' }, { name: 'Lim, C.' }]
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
      
      // Close menu on mobile after click
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

  const showThesisDetails = (thesis: Thesis) => {
    setText('modal-title', thesis.title);
    setText('modal-title-val', thesis.title);
    setText('modal-authors-val', thesis.authors.map(author => author.name).join(', '));
    setText('modal-date-val', thesis.dateArchived);
    setText('modal-group-code-val', `${thesis.groupCode}-${thesis.batchYear}`);
    setText('modal-adviser-val', thesis.mainAdviser || 'Not specified');
    setText('modal-panel-val', thesis.panelMembers.length ? thesis.panelMembers.join(', ') : 'Not specified');
    setText('modal-abstract-val', thesis.abstract || 'No abstract available.');

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
  const btnAddAuthor = document.getElementById('add-author-btn');
  let authorCount = 1;

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
          <input type="text" class="author-name" placeholder="Full Name">
        </div>
        <div class="form-group">
          <label>Student Number</label>
          <input type="text" class="author-student-number" placeholder="20XX-XXXXX-MN-0">
        </div>
      `;
      authorsContainer.appendChild(authorRow);
    });
  }
  
  // 7. Backend Integration - Fetching Data
  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

  const fetchDashboardMetrics = async () => {
    try {
      // Replace with actual API call: const response = await fetch(`${API_URL}/metrics`);
      // const data = await response.json();
      
      const data = {
        total: theses.length,
        batchCount: new Set(theses.map(thesis => thesis.batchYear)).size,
        sectionCount: new Set(theses.map(thesis => thesis.section)).size
      };

      const kpiTotal = document.getElementById('kpi-total');
      const kpiBatch = document.getElementById('kpi-batch');
      const kpiSection = document.getElementById('kpi-section');
      
      if (kpiTotal) kpiTotal.innerText = data.total.toString();
      if (kpiBatch) kpiBatch.innerText = data.batchCount.toString();
      if (kpiSection) kpiSection.innerText = data.sectionCount.toString();
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchTheses = async () => {
    try {
      // Replace with actual API call: const response = await fetch(`${API_URL}/theses`);
      // const theses = await response.json();
      
      const recentBody = document.getElementById('recent-theses-body');
      const repoBody = document.getElementById('repository-theses-body');
      
      if (recentBody) {
        recentBody.innerHTML = theses.length ? theses.slice(0, 5).map(thesis => `
          <tr class="clickable-row" data-id="${thesis.id}">
            <td>${thesis.title || 'Untitled'}</td>
            <td>${thesis.authors.map(author => author.name).join(', ')}</td>
            <td>${thesis.batchYear}</td>
            <td>${thesis.section}</td>
            <td><span class="status-badge status-passed">${thesis.researchTopic}</span></td>
            <td>${thesis.dateArchived}</td>
          </tr>
        `).join('') : '<tr><td colspan="6" style="text-align: center;">No theses found.</td></tr>';
      }

      if (repoBody) {
        repoBody.innerHTML = theses.length ? theses.map(thesis => `
          <tr class="clickable-row" data-id="${thesis.id}">
            <td>${thesis.groupCode}-${thesis.batchYear}</td>
            <td>${thesis.title || 'Untitled'}</td>
            <td>${thesis.authors.map(author => author.name).join(', ')}</td>
            <td>${thesis.section}</td>
          </tr>
        `).join('') : '<tr><td colspan="4" style="text-align: center;">No theses found.</td></tr>';
      }
    } catch (error) {
      console.error('Failed to fetch theses:', error);
    }
  };

  // Initial Data Load
  fetchDashboardMetrics();
  fetchTheses();

  // 8. Form Submission Integration
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = (document.getElementById('thesis-title') as HTMLInputElement)?.value;
      const groupCode = (document.getElementById('thesis-group-code') as HTMLInputElement)?.value;
      const batchYear = (document.getElementById('thesis-batch-year') as HTMLInputElement)?.value;
      const section = (document.getElementById('thesis-section') as HTMLInputElement)?.value;
      const researchType = (document.getElementById('thesis-research-type') as HTMLSelectElement)?.value;
      const researchTopic = (document.getElementById('thesis-research-topic') as HTMLSelectElement)?.value;
      const mainAdviser = (document.getElementById('thesis-main-adviser') as HTMLSelectElement)?.value;
      const panelMembers = (document.getElementById('thesis-panel-members') as HTMLInputElement)?.value;
      const abstract = (document.getElementById('thesis-abstract') as HTMLTextAreaElement)?.value;
      
      const authorNames = Array.from(document.querySelectorAll('.author-name')).map(el => (el as HTMLInputElement).value).filter(val => val);
      const studentNumbers = Array.from(document.querySelectorAll('.author-student-number')).map(el => (el as HTMLInputElement).value).filter(val => val);
      
      const newThesis = {
        id: `${groupCode}-${Date.now()}`,
        title,
        groupCode,
        batchYear,
        section,
        researchType,
        researchTopic,
        mainAdviser,
        panelMembers: panelMembers ? panelMembers.split(',').map(name => name.trim()).filter(Boolean) : [],
        abstract,
        dateArchived: new Date().toLocaleDateString(),
        authors: authorNames.map((name, index) => ({ name, studentNumber: studentNumbers[index] }))
      };

      try {
        // Uncomment when backend is ready
        /*
        const response = await fetch(`${API_URL}/theses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newThesis)
        });
        
        if (response.ok) {
          alert('Thesis successfully archived!');
          (registrationForm as HTMLFormElement).reset();
          fetchDashboardMetrics();
          fetchTheses();
        } else {
          alert('Failed to archive thesis.');
        }
        */
        
        console.log('Sending to backend:', newThesis);
        alert('Form submitted! (Check console for payload. Backend integration pending.)');
        theses.unshift(newThesis);
        (registrationForm as HTMLFormElement).reset();
        fetchDashboardMetrics();
        fetchTheses();
      } catch (error) {
        console.error('Submission error:', error);
        alert('An error occurred during submission.');
      }
    });
  }

  // Close modals when clicking overlay
  window.addEventListener('click', (e) => {
    if (e.target === workspaceModal) closeModal('workspace-modal');
  });
});
