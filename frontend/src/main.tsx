/**
 * PUP CpE Thesis Management Portal
 * Vanilla JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('PUP CpE Dashboard Logic Loaded');
  // Elements
  const loginForm = document.getElementById('login-form');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const navItems = document.querySelectorAll('.nav-item');
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayRole = document.getElementById('user-display-role');
  
<<<<<<< HEAD
  // Store loaded theses globally for modal access and filtering
  let loadedTheses: any[] = [];
  let isAuthenticated = false;
=======
  // Store loaded theses globally for modal access
  let loadedTheses: any[] = [];
  let isAuthenticated = false; // Track admin login status
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8

  // 1. Authentication Simulation
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username') as HTMLInputElement;
      const password = document.getElementById('password') as HTMLInputElement;
      
      // Hardcoded check for Admin rights
      if (username.value === 'admin' && password.value === '123456') {
        isAuthenticated = true;
        closeModal('login-modal');
        
        // Update UI
        const avatarEl = document.getElementById('user-avatar-display');
        if (avatarEl) avatarEl.innerText = 'AD';
        if (userDisplayName) userDisplayName.innerText = 'Admin User';
        if (userDisplayRole) userDisplayRole.innerText = 'Thesis Coordinator';
        
        // Automatically switch to register view upon successful login
        const registerNavItem = document.querySelector('[data-view="register"]') as HTMLElement;
        if (registerNavItem) registerNavItem.click();
        
        (loginForm as HTMLFormElement).reset();
      } else {
        alert('Invalid credentials. Hint: use admin / 123456');
      }
<<<<<<< HEAD
      
      // Update UI
      isAuthenticated = true;
      if (userDisplayName) userDisplayName.innerText = username.value || 'Admin';
      if (userDisplayRole) userDisplayRole.innerText = 'Thesis Coordinator';
      
      // Switch view
      if (authPage) authPage.classList.add('hidden');
      if (mainApp) mainApp.classList.remove('hidden');
      
      (loginForm as HTMLFormElement).reset();
    });
  }
  
  // Back to Dashboard button
  const cancelLoginBtn = document.getElementById('cancel-login-btn');
  if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', () => {
      if (authPage) authPage.classList.add('hidden');
      if (mainApp) mainApp.classList.remove('hidden');
=======
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
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
      
      // Intercept Register view if user is not authenticated
      if (view === 'register' && !isAuthenticated) {
        openModal('login-modal');
        return;
      }

      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active class to clicked nav item
      item.classList.add('active');
      
      // Hide all views
      document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
      
      // Show target view
      const targetView = document.getElementById(`${view}-view`);
      if (targetView) {
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
  const evaluateModal = document.getElementById('evaluate-modal');
  const btnNewThesis = document.getElementById('btn-new-thesis');
  const btnImportCsv = document.getElementById('btn-import-csv');
  const csvUploadInput = document.getElementById('csv-upload') as HTMLInputElement;
  
  const openModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
  };
  
  const closeModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  };

<<<<<<< HEAD
  // Archive Thesis button - Check authentication first
  if (btnNewThesis) {
    btnNewThesis.addEventListener('click', () => {
      if (!isAuthenticated) {
        if (authPage) authPage.classList.remove('hidden');
      } else {
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

  const showThesisDetails = (thesis: any) => {
    // Set modal title to thesis title
    setText('modal-title', thesis.thesis_title);
    
    // Update Authors
    const authorsElement = document.getElementById('modal-authors-val');
    if (authorsElement) {
      if (thesis.author_name) {
        authorsElement.innerHTML = thesis.author_name.split(',').map((a: string) => a.trim()).join('<br>');
      } else {
        authorsElement.textContent = 'No authors listed';
      }
    }

    // Update date values
    const dateObj = new Date(thesis.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Update Batch Year
    setText('modal-batch-year-val', thesis.batch_year || 'N/A');

    // Update Date Archived
    setText('modal-date-val', dateStr);

    // Update Group Code
    setText('modal-group-code-val', thesis.group_code || 'N/A');

    // Update Adviser
    setText('modal-adviser-val', thesis.main_adviser || 'Unassigned');
    
    // Update Panel Members
    const panelValElem = document.getElementById('modal-panel-val');
    if (panelValElem) {
      if (thesis.final_panel_members) {
        panelValElem.innerHTML = thesis.final_panel_members.split(',').map((p: string) => p.trim()).join('<br>');
      } else {
        panelValElem.textContent = 'No record';
      }
    }

    // Update Section/Block
    setText('modal-section-val', thesis.section_block || 'N/A');
    
    // Update Abstract
    setText('modal-abstract-val', thesis.abstract || 'No abstract provided');
    
    // Hide tab buttons since we're using new layout
    document.querySelectorAll('.tab-btn').forEach(btn => (btn as HTMLElement).style.display = 'none');

    // Hide Save Changes button
    document.querySelectorAll('#workspace-modal button').forEach(btn => {
      if (btn.textContent?.toLowerCase().includes('save')) {
        (btn as HTMLElement).style.display = 'none';
      }
    });

    openModal('workspace-modal');
  };

  // Open Workspace Modal on thesis row click
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.clickable-row') as HTMLElement | null;
    if (row) {
      const thesisId = row.getAttribute('data-id');
      const thesis = loadedTheses.find(item => item.archive_id == thesisId);
      if (thesis) showThesisDetails(thesis);
=======
  // Open Workspace Modal on row click
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.clickable-row');
    const isViewBtn = target.classList.contains('btn-view-abstract');
    
    if (row || isViewBtn) {
      const thesisId = isViewBtn ? target.getAttribute('data-id') : row?.getAttribute('data-id');
      
      if (thesisId) {
        const thesis = loadedTheses.find(t => t.id == thesisId);
        if (thesis) {
          const titleEl = document.getElementById('modal-display-title');
          const authorsEl = document.getElementById('modal-display-authors');
          const abstractEl = document.getElementById('modal-display-abstract');
          const adviserEl = document.getElementById('modal-display-adviser');
          
          if (titleEl) titleEl.innerText = thesis.title;
          if (authorsEl) authorsEl.innerText = thesis.group_members || 'No authors listed';
          if (abstractEl) abstractEl.innerText = thesis.abstract || 'No abstract available';
          if (adviserEl) adviserEl.innerText = thesis.main_adviser || 'Unassigned';
        }
      }
      openModal('workspace-modal');
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
    }
  });

  // Close buttons
  document.getElementById('close-modal')?.addEventListener('click', () => closeModal('workspace-modal'));
  document.getElementById('close-modal-btn')?.addEventListener('click', () => closeModal('workspace-modal'));
<<<<<<< HEAD
=======
  
  if (btnNewThesis) {
    btnNewThesis.addEventListener('click', () => {
      if (!isAuthenticated) {
        openModal('login-modal');
        return;
      }
      // Switch to register view
      const registerNavItem = document.querySelector('[data-view="register"]') as HTMLElement;
      if (registerNavItem) registerNavItem.click();
    });
  }

  document.getElementById('close-login')?.addEventListener('click', () => closeModal('login-modal'));

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
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8

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
      authorRow.className = 'form-grid author-row';
      authorRow.style.marginBottom = '1rem';
      authorRow.innerHTML = `
        <div class="form-group">
          <label>Author ${authorCount}</label>
<<<<<<< HEAD
          <input type="text" class="author-name" placeholder="Full Name" required>
        </div>
        <div class="form-group">
          <label>Student Number</label>
          <input type="text" class="author-student-number" placeholder="20XX-XXXXX-MN-0">
=======
          <input type="text" class="author-name-input" placeholder="Full Name" required>
        </div>
        <div class="form-group">
          <label>Student Number</label>
          <input type="text" class="author-student-no-input" placeholder="20XX-XXXXX-MN-0" required>
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
        </div>
      `;
      authorsContainer.appendChild(authorRow);
    });
  }

<<<<<<< HEAD
  // Auto-populate section from group code
  const regGroupCodeInput = document.getElementById('reg-group-code') as HTMLInputElement;
  const regSectionInput = document.getElementById('reg-section') as HTMLInputElement;

  if (regGroupCodeInput && regSectionInput) {
    regGroupCodeInput.addEventListener('input', () => {
        const groupCode = regGroupCodeInput.value;
        // If group code is a 4-digit number (e.g., 5101), derive section (e.g., 5-1)
        if (/^\d{4}$/.test(groupCode)) {
            regSectionInput.value = `BSCPE ${groupCode.substring(0, 1)}-${groupCode.substring(1, 2)}`;
        }
    });
  }

  // 7. Backend Integration - Fetching Data
  const fetchTheses = async () => {
    try {
      const response = await fetch('http://localhost/Thesis-Management/backend/fetch_theses.php');
      const result = await response.json();
      
      if (result.status === 'success') {
        loadedTheses = result.data;
        updateUI();
      } else {
        console.error('Backend Error:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch theses:', error);
    }
  };

  const updateUI = () => {
    // 1. Update KPIs
    const kpiTotal = document.getElementById('kpi-total');
    const kpiBatch = document.getElementById('kpi-batch');
    const kpiSection = document.getElementById('kpi-section');
    
    if (kpiTotal) kpiTotal.innerText = loadedTheses.length.toString();
    if (kpiBatch) kpiBatch.innerText = new Set(loadedTheses.map(t => t.batch_year)).size.toString();
    if (kpiSection) kpiSection.innerText = new Set(loadedTheses.map(t => t.section_block)).size.toString();

    // 2. Update Dashboard Table
    const recentBody = document.getElementById('recent-theses-body');
    if (recentBody) {
      recentBody.innerHTML = loadedTheses.length ? loadedTheses.slice(0, 7).map(thesis => {
        let authors = thesis.author_name || 'No authors';
        if (authors !== 'No authors' && authors.includes(',')) {
          authors = authors.split(',')[0].trim() + ' et al.';
        }
        const dateObj = new Date(thesis.created_at);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `
          <tr data-id="${thesis.archive_id}">
            <td style="font-weight: 500; width: 50%;">${thesis.thesis_title}</td>
            <td>${authors}</td>
            <td>${thesis.batch_year}</td>
            <td>${dateStr}</td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="4" style="text-align: center;">No theses found.</td></tr>';
    }

    // 3. Update Repository Table
    // Finds the table body by ID, or falls back to automatically finding the tbody inside the repository view
    const repoBody = document.getElementById('repository-table-body') || document.querySelector('#repository-view tbody');
    if (repoBody) {
      repoBody.innerHTML = loadedTheses.length ? loadedTheses.map(thesis => {
        let authors = thesis.author_name || 'No authors';
        if (authors !== 'No authors' && authors.includes(',')) {
          authors = authors.split(',')[0].trim() + ' et al.';
        }
        return `
        <tr class="clickable-row" data-id="${thesis.archive_id}">
          <td>${thesis.batch_year}</td>
          <td style="font-weight: 500; width: 50%;">${thesis.thesis_title}</td>
          <td>${authors}</td>
          <td>${thesis.section_block || 'N/A'}</td>
        </tr>
      `}).join('') : '<tr><td colspan="4" style="text-align: center;">No theses found.</td></tr>';
    }
  };

  // 8. Form Submission Logic
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const group_code = (document.getElementById('reg-group-code') as HTMLInputElement).value;
      const batch_year = (document.getElementById('reg-batch-year') as HTMLInputElement).value;
      const section_block = (document.getElementById('reg-section') as HTMLInputElement).value;
      const thesis_title = (document.getElementById('reg-title') as HTMLInputElement).value;
      const abstract = (document.getElementById('reg-abstract') as HTMLTextAreaElement).value;
      const main_adviser = (document.getElementById('reg-main-adviser') as HTMLInputElement).value;
      const final_panel_members = (document.getElementById('reg-panel-members') as HTMLInputElement)?.value || '';
      
      const authors: any[] = [];
      document.querySelectorAll('.author-row').forEach(row => {
        const nameInput = row.querySelector('.author-name') as HTMLInputElement;
        const studentNumInput = row.querySelector('.author-student-number') as HTMLInputElement;
        if (nameInput && nameInput.value.trim() !== '') {
          authors.push({ name: nameInput.value.trim(), student_number: studentNumInput ? studentNumInput.value.trim() : '' });
        }
      });

      const payload = {
        group_code,
        batch_year,
        section_block,
        thesis_title,
        abstract,
        main_adviser,
        final_panel_members,
        authors
      };

      try {
        const response = await fetch('http://localhost/Thesis-Management/backend/save_thesis.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
          alert('Thesis successfully archived!');
          (registrationForm as HTMLFormElement).reset();
          
          // Reset author rows to 1
          const container = document.getElementById('authors-container');
          if (container) {
            const rows = container.querySelectorAll('.author-row');
            rows.forEach((row, i) => { if (i > 0) row.remove(); });
            authorCount = 1;
          }

          fetchTheses(); // Refresh data
          // Switch to dashboard
          document.querySelector('[data-view="dashboard"]')?.dispatchEvent(new Event('click'));
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Failed to save thesis:', error);
        alert('An error occurred while saving.');
      }
    });
  }

  // 9. Bulk Import CSV Logic
  if (btnImportCsv && csvUploadInput) {
    btnImportCsv.addEventListener('click', () => {
      if (!isAuthenticated) {
        if (authPage) authPage.classList.remove('hidden');
      } else {
        csvUploadInput.click();
      }
    });

    csvUploadInput.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.csv')) {
        alert('Invalid file format. Please upload a .csv file.');
        return;
      }

      const formData = new FormData();
      formData.append('csv_file', file);

      try {
        alert('Uploading and processing CSV... Please wait.');
        const response = await fetch('http://localhost/Thesis-Management/backend/import_csv.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (result.status === 'success') {
          alert(`Import successful! ${result.imported_count} records added.`);
          fetchTheses(); // Refresh data table
        } else {
          alert(`Import failed: ${result.message}`);
        }
      } catch (error) {
        console.error('Failed to import CSV:', error);
        alert('An error occurred while processing the file.');
      } finally {
        csvUploadInput.value = ''; // Reset file input to allow re-upload
      }
    });
  }

  // Initial Data Load
  fetchTheses();

=======
  // 7. Auto-resize Abstract Textarea
  const abstractInput = document.getElementById('abstract-input') as HTMLTextAreaElement;
  if (abstractInput) {
    abstractInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  }

>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
  // Close modals when clicking overlay
  window.addEventListener('click', (e) => {
    if (e.target === workspaceModal) closeModal('workspace-modal');
    if (e.target === evaluateModal) closeModal('evaluate-modal');
    if (e.target === document.getElementById('login-modal')) closeModal('login-modal');
  });

  // 8. Capture Registration Form Data
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Capture specific archival data (Abstract and Panel Members)
      const abstractInput = document.getElementById('abstract-input') as HTMLTextAreaElement;
      const panelChair = document.getElementById('panel-chair') as HTMLInputElement;
      const panelMember1 = document.getElementById('panel-member-1') as HTMLInputElement;
      const panelMember2 = document.getElementById('panel-member-2') as HTMLInputElement;
      
      // Collect other basic data for the log
      const groupCode = document.getElementById('group-code') as HTMLInputElement;
      const mainAdviser = document.getElementById('main-adviser') as HTMLInputElement;
      const coAdviser = document.getElementById('co-adviser') as HTMLInputElement;
      const title = document.getElementById('thesis-title') as HTMLInputElement;
      const yearLevel = document.getElementById('year-level') as HTMLInputElement;
      const section = document.getElementById('section') as HTMLInputElement;
      
      // Extract Authors Array
      const authors: any[] = [];
      const authorNames = document.querySelectorAll('.author-name-input');
      const studentNos = document.querySelectorAll('.author-student-no-input');
      
      authorNames.forEach((input, index) => {
        authors.push({
          name: (input as HTMLInputElement).value,
          student_number: (studentNos[index] as HTMLInputElement).value
        });
      });
      
      // Basic Frontend Validation
      const parsedYear = parseInt(yearLevel?.value);
      if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 5) {
        alert("Validation Error: Year level must be a valid number between 1 and 5.");
        return;
      }

      const requestData = {
        group_code: groupCode?.value || '',
        title: title?.value || '',
        abstract: abstractInput?.value || '',
        batch_year: parsedYear,
        section: section?.value || '',
        authors: authors,
        panels: {
          'Main Adviser': mainAdviser?.value,
          'Co-Adviser': coAdviser?.value,
          'Panel Chair': panelChair?.value,
          'Panel Member 1': panelMember1?.value,
          'Panel Member 2': panelMember2?.value
        }
      };

      fetch('http://localhost/Thesis-Management/backend/save_thesis.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      .then(async response => {
        const text = await response.text();
        try {
          return JSON.parse(text); // Try to read it as JSON
        } catch (e) {
          console.error('Non-JSON response from server:', text);
          throw new Error('Server returned invalid data. Check console for details.');
        }
      })
      .then(data => {
        if (data.status === 'success') {
          alert(data.message);
          (registrationForm as HTMLFormElement).reset();
          
          loadTheses(); // Refresh the table data
          const repoNav = document.querySelector('[data-view="repository"]') as HTMLElement;
          if (repoNav) repoNav.click(); // Auto-switch to the Repository View
        } else {
          alert('Failed to save thesis: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred connecting to the server. Check your console logs.');
      });
    });
  }

  // 9. Load Theses into Repository
  const repositoryTableBody = document.getElementById('repository-table-body');
  const recentThesesBody = document.getElementById('recent-theses-body');
  const totalThesesCount = document.getElementById('total-theses-count');
  
  const loadTheses = () => {
    if (!repositoryTableBody) return;
    repositoryTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading database records...</td></tr>';
    
    fetch('http://localhost/Thesis-Management/backend/fetch_theses.php')
      .then(res => res.json())
      .then(response => {
        if (response.status === 'success') {
          // Store locally for modal
          loadedTheses = response.data;

          // Update Total KPI
          if (totalThesesCount) {
            totalThesesCount.innerText = response.data.length.toString();
          }

          repositoryTableBody.innerHTML = '';
          if (response.data.length === 0) {
            repositoryTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No theses found in repository.</td></tr>';
            if (recentThesesBody) {
              recentThesesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent theses found.</td></tr>';
            }
            return;
          }
          
          response.data.forEach((thesis: any) => {
            const tr = document.createElement('tr');
            tr.className = 'clickable-row';
            tr.setAttribute('data-id', thesis.id);
            
            tr.innerHTML = `
              <td>${thesis.group_code}</td>
              <td style="font-weight: 500;">${thesis.title}</td>
              <td>${thesis.main_adviser || 'Unassigned'}</td>
              <td><span class="status-badge status-passed">Archived</span></td>
              <td style="text-align: right;">
                  <button class="btn btn-primary btn-view-abstract" data-id="${thesis.id}" style="font-size: 0.7rem; padding: 0.4rem 0.8rem;">View</button>
              </td>
            `;
            repositoryTableBody.appendChild(tr);
          });

          // Populate Dashboard Recent Theses (Max 7)
          if (recentThesesBody) {
            recentThesesBody.innerHTML = '';
            const recentTheses = response.data.slice(0, 7); // Limit to top 7
            
            recentTheses.forEach((thesis: any) => {
              const tr = document.createElement('tr');
              tr.className = 'clickable-row';
              tr.setAttribute('data-id', thesis.id);
              
              // Format date nicely (e.g., "Mar 15, 2026")
              const dateObj = new Date(thesis.created_at);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              tr.innerHTML = `
                <td style="font-weight: 500;">${thesis.title}</td>
                <td>${thesis.group_members || 'No authors'}</td>
                <td>${thesis.main_adviser || 'Unassigned'}</td>
                <td><span class="status-badge status-passed">Archived</span></td>
                <td>${dateStr}</td>
              `;
              recentThesesBody.appendChild(tr);
            });
          }
        }
      })
      .catch(err => console.error('Error fetching theses:', err));
  };

  // Initial load when page starts
  loadTheses();
});
