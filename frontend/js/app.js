import { auth, db, signOut, onAuthStateChanged, doc, getDoc, collection, onSnapshot, updateDoc, addDoc } from './firebase-config.js';

// Elements
const userEmailEl = document.getElementById('user-email');
const userRoleEl = document.getElementById('user-role');
const adminControls = document.getElementById('admin-controls');
const btnLogout = document.getElementById('btn-logout');
const binsContainer = document.getElementById('bins-container');
const statTotal = document.getElementById('stat-total');
const statCritical = document.getElementById('stat-critical');
const alertContainer = document.getElementById('alert-container');

// Navigation
const navDashboard = document.getElementById('nav-dashboard');
const navDetection = document.getElementById('nav-detection');
const navAnalytics = document.getElementById('nav-analytics');
const navProfile = document.getElementById('nav-profile');
const navGuide = document.getElementById('nav-guide');
const viewDashboard = document.getElementById('view-dashboard');
const viewDetection = document.getElementById('view-detection');
const viewAnalytics = document.getElementById('view-analytics');
const viewProfile = document.getElementById('view-profile');
const viewGuide = document.getElementById('view-guide');

const topbarAvatarContainer = document.getElementById('topbar-avatar-container');

// Modals
const modalAddBin = document.getElementById('modal-add-bin');
const btnAddBin = document.getElementById('btn-add-bin');
const btnCloseModal = document.getElementById('btn-close-modal');
const addBinForm = document.getElementById('add-bin-form');

const API_BASE = 'https://smart-campus-waste-system.onrender.com/api';
let currentUserRole = 'staff';
let binsData = [];
let fillInterval;

// -- Authentication & Role Check --
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }

  userEmailEl.textContent = user.email;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      currentUserRole = data.role || 'staff';
      userRoleEl.textContent = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1);

      if (currentUserRole === 'admin') {
        userRoleEl.classList.add('admin');
        adminControls.style.display = 'block';
        if (navAnalytics) navAnalytics.style.display = 'flex';
      }

      // Profile enhancements
      if (data.displayName) {
        userEmailEl.textContent = data.displayName;
        const inputName = document.getElementById('profile-display-name');
        if (inputName) inputName.value = data.displayName;
      }
      if (data.avatarBase64) {
        const topImg = document.getElementById('topbar-avatar-img');
        const topIcon = document.getElementById('topbar-avatar-icon');
        const prevImg = document.getElementById('profile-img-preview');
        const prevIcon = document.getElementById('profile-placeholder-icon');

        if (topImg) { topImg.src = data.avatarBase64; topImg.style.display = 'block'; }
        if (topIcon) topIcon.style.display = 'none';

        if (prevImg) { prevImg.src = data.avatarBase64; prevImg.style.display = 'block'; }
        if (prevIcon) prevIcon.style.display = 'none';

        if (typeof currentProfileBase64 !== 'undefined') currentProfileBase64 = data.avatarBase64;
      }
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
  }

  // Load Bins after auth
  loadBins();

  // Start random simulation
  if (!fillInterval) fillInterval = setInterval(simulateBinFill, 5000); // Ticks every 5 seconds
});

btnLogout.addEventListener('click', () => {
  signOut(auth);
});

// -- Navigation --
navDashboard.addEventListener('click', (e) => {
  e.preventDefault();
  navDashboard.classList.add('active'); navGuide.classList.remove('active');
  if (navDetection) navDetection.classList.remove('active');
  if (navAnalytics) navAnalytics.classList.remove('active');
  if (navProfile) navProfile.classList.remove('active');

  viewDashboard.style.display = 'block'; viewGuide.style.display = 'none';
  if (viewDetection) viewDetection.style.display = 'none';
  if (viewAnalytics) viewAnalytics.style.display = 'none';
  if (viewProfile) viewProfile.style.display = 'none';

  document.getElementById('page-title').textContent = 'Dashboard Overview';
  document.getElementById('page-subtitle').textContent = 'Monitor campus waste bins in real-time.';
  if (currentUserRole === 'admin') adminControls.style.display = 'block';
});

if (navDetection) {
  navDetection.addEventListener('click', (e) => {
    e.preventDefault();
    navDetection.classList.add('active'); navDashboard.classList.remove('active'); navGuide.classList.remove('active');
    if (navAnalytics) navAnalytics.classList.remove('active');
    if (navProfile) navProfile.classList.remove('active');

    viewDetection.style.display = 'block'; viewDashboard.style.display = 'none'; viewGuide.style.display = 'none';
    if (viewAnalytics) viewAnalytics.style.display = 'none';
    if (viewProfile) viewProfile.style.display = 'none';

    document.getElementById('page-title').textContent = 'Waste Detection';
    document.getElementById('page-subtitle').textContent = 'Upload an image of your garbage for AI classification.';
    adminControls.style.display = 'none';
  });
}

if (navAnalytics) {
  navAnalytics.addEventListener('click', (e) => {
    e.preventDefault();
    navAnalytics.classList.add('active'); navDashboard.classList.remove('active'); navGuide.classList.remove('active');
    if (navDetection) navDetection.classList.remove('active');
    if (navProfile) navProfile.classList.remove('active');

    viewAnalytics.style.display = 'block'; viewDashboard.style.display = 'none'; viewGuide.style.display = 'none';
    if (viewDetection) viewDetection.style.display = 'none';
    if (viewProfile) viewProfile.style.display = 'none';

    document.getElementById('page-title').textContent = 'Analytics Dashboard';
    document.getElementById('page-subtitle').textContent = 'Visual insights into campus waste management.';
    adminControls.style.display = 'none';
  });
}

if (navProfile) {
  navProfile.addEventListener('click', (e) => {
    if (e) e.preventDefault();
    navProfile.classList.add('active'); navDashboard.classList.remove('active'); navGuide.classList.remove('active');
    if (navDetection) navDetection.classList.remove('active');
    if (navAnalytics) navAnalytics.classList.remove('active');

    viewProfile.style.display = 'block'; viewDashboard.style.display = 'none'; viewGuide.style.display = 'none';
    if (viewDetection) viewDetection.style.display = 'none';
    if (viewAnalytics) viewAnalytics.style.display = 'none';

    document.getElementById('page-title').textContent = 'My Profile Settings';
    document.getElementById('page-subtitle').textContent = 'Update your personal information and avatar.';
    adminControls.style.display = 'none';
  });
}

if (topbarAvatarContainer) {
  topbarAvatarContainer.addEventListener('click', () => {
    if (navProfile) navProfile.click();
  });
}

navGuide.addEventListener('click', (e) => {
  e.preventDefault();
  navGuide.classList.add('active'); navDashboard.classList.remove('active');
  if (navDetection) navDetection.classList.remove('active');
  if (navAnalytics) navAnalytics.classList.remove('active');
  if (navProfile) navProfile.classList.remove('active');

  viewGuide.style.display = 'grid'; viewDashboard.style.display = 'none';
  if (viewDetection) viewDetection.style.display = 'none';
  if (viewAnalytics) viewAnalytics.style.display = 'none';
  if (viewProfile) viewProfile.style.display = 'none';

  document.getElementById('page-title').textContent = 'Waste Guide';
  document.getElementById('page-subtitle').textContent = 'Learn about proper waste segregation.';
  adminControls.style.display = 'none';
});

// -- Bins API Logic --
let unsubscribeBins = null;

function setupRealtimeListener() {
  const binsRef = collection(db, 'bins');
  unsubscribeBins = onSnapshot(binsRef, (snapshot) => {
    binsData = [];
    snapshot.forEach(doc => {
      if (doc.data().location) {
        binsData.push({ id: doc.id, ...doc.data() });
      }
    });
    renderBins();
    renderPriorityList(); // Smart route optimization
  }, (error) => {
    console.error("Firebase Snapshot Error:", error);
    binsContainer.innerHTML = '<div class="loading-text" style="color:#ef4444;">Error loading realtime bins.</div>';
  });
}

function loadBins() {
  setupRealtimeListener();
}

function renderBins() {
  binsContainer.innerHTML = '';
  let criticalCount = 0;

  if (binsData.length === 0) {
    binsContainer.innerHTML = '<div class="loading-text">No bins found. Admins can add new bins.</div>';
    statTotal.textContent = 0;
    statCritical.textContent = 0;
    return;
  }

  // Sort bins: Critical first
  const sortedBins = [...binsData].sort((a, b) => b.fillLevel - a.fillLevel);

  sortedBins.forEach(bin => {
    if (bin.fillLevel > 80) criticalCount++;

    // Status Logic
    let statusClass = 'status-empty';
    if (bin.fillLevel > 80) statusClass = 'status-full';
    else if (bin.fillLevel > 30) statusClass = 'status-moderate';

    const isWet = bin.type === 'Wet';
    const isAdmin = currentUserRole === 'admin';
    const adminHtml = isAdmin ? `
      <div style="display:inline-flex; gap: 8px; margin-left: 10px;">
        <button class="btn-edit-bin" data-id="${bin.id}" data-location="${bin.location}" data-type="${bin.type}" style="background:transparent; border:none; cursor:pointer; color:var(--text-secondary);" title="Edit Bin">
          <i class="fa-solid fa-pen" style="font-size: 1rem;"></i>
        </button>
        <button class="btn-delete-bin" data-id="${bin.id}" style="background:transparent; border:none; cursor:pointer; color:var(--status-red);" title="Delete Bin">
          <i class="fa-solid fa-trash" style="font-size: 1rem;"></i>
        </button>
      </div>` : '';

    const card = document.createElement('div');
    card.className = `bin-card ${statusClass}`;
    card.innerHTML = `
      <div class="bin-header">
        <div>
          <h3 class="bin-location" style="display:flex; align-items:center;">${bin.location} ${adminHtml}</h3>
          <span class="bin-type"><i class="fa-solid fa-${isWet ? 'apple-whole' : 'box'}"></i> ${bin.type} Waste</span>
        </div>
        <div class="bin-status-badge">${bin.status}</div>
      </div>
      <div class="bin-progress">
        <div class="progress-bar" style="width: ${bin.fillLevel}%;"></div>
      </div>
      <div class="bin-footer">
        <div class="fill-text">${Math.round(bin.fillLevel)}%</div>
        <button class="btn-clean" data-id="${bin.id}" ${bin.fillLevel < 5 ? 'disabled' : ''}>
          <i class="fa-solid fa-broom"></i> Mark Cleaned
        </button>
      </div>
    `;
    binsContainer.appendChild(card);
  });

  statTotal.textContent = binsData.length;
  statCritical.textContent = criticalCount;

  // Add event listeners to clean buttons
  document.querySelectorAll('.btn-clean').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const binBtn = e.currentTarget;
      binBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Clearing...';
      binBtn.disabled = true;
      updateBinFill(id, 0); // Reset to 0
    });
  });

  if (currentUserRole === 'admin') {
    document.querySelectorAll('.btn-edit-bin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.getElementById('edit-bin-id').value = e.currentTarget.getAttribute('data-id');
        document.getElementById('edit-bin-location').value = e.currentTarget.getAttribute('data-location');
        document.getElementById('edit-bin-type').value = e.currentTarget.getAttribute('data-type');
        document.getElementById('modal-edit-bin').classList.add('active');
      });
    });

    document.querySelectorAll('.btn-delete-bin').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Permanently delete this bin?')) {
          e.currentTarget.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
          const id = e.currentTarget.getAttribute('data-id');
          await fetch(`${API_BASE}/bins/${id}`, { method: 'DELETE' });
        }
      });
    });
  }
}

// Update Bin Fill Level
async function updateBinFill(id, fillLevel) {
  try {
    const res = await fetch(`${API_BASE}/bins/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillLevel })
    });
    const updatedBin = await res.json();

    // Update local state without full reload for smoothness
    const index = binsData.findIndex(b => b.id === id);
    if (index !== -1) {
      binsData[index] = updatedBin;
      renderBins();
    }
  } catch (error) {
    console.error("Error updating bin:", error);
  }
}

// -- Admin: Add Bin --
if (btnAddBin) {
  btnAddBin.addEventListener('click', () => { modalAddBin.classList.add('active'); });
}
btnCloseModal.addEventListener('click', () => { modalAddBin.classList.remove('active'); });
modalAddBin.addEventListener('click', (e) => { if (e.target === modalAddBin) modalAddBin.classList.remove('active'); });

addBinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const location = document.getElementById('bin-location').value;
  const type = document.getElementById('bin-type').value;

  const submitBtn = document.getElementById('btn-submit-bin');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';

  try {
    await fetch(`${API_BASE}/bins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, type })
    });
    modalAddBin.classList.remove('active');
    addBinForm.reset();
    loadBins();
  } catch (error) {
    console.error("Error adding bin:", error);
    alert("Failed to add bin. Ensure the backend is running.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Add Bin';
  }
});

// -- Admin: Edit Bin --
const modalEditBin = document.getElementById('modal-edit-bin');
const btnCloseEditModal = document.getElementById('btn-close-edit-modal');
const editBinForm = document.getElementById('edit-bin-form');

if (btnCloseEditModal) {
  btnCloseEditModal.addEventListener('click', () => { modalEditBin.classList.remove('active'); });
  modalEditBin.addEventListener('click', (e) => { if (e.target === modalEditBin) modalEditBin.classList.remove('active'); });

  editBinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-bin-id').value;
    const location = document.getElementById('edit-bin-location').value;
    const type = document.getElementById('edit-bin-type').value;

    const submitBtn = document.getElementById('btn-submit-edit-bin');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      await fetch(`${API_BASE}/bins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, type })
      });
      modalEditBin.classList.remove('active');
    } catch (error) {
      console.error("Error editing bin:", error);
      alert("Failed to save changes.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save Changes';
    }
  });
}

// -- Profile Handling --
const profilePreviewContainer = document.getElementById('profile-preview-container');
const profileImageUpload = document.getElementById('profile-image-upload');
const profileImgPreview = document.getElementById('profile-img-preview');
const profilePlaceholderIcon = document.getElementById('profile-placeholder-icon');
let currentProfileBase64 = null;

if (profilePreviewContainer) {
  profilePreviewContainer.addEventListener('click', () => profileImageUpload.click());

  profileImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        // Compress image using canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          currentProfileBase64 = canvas.toDataURL('image/jpeg', 0.8);
          profileImgPreview.src = currentProfileBase64;
          profileImgPreview.style.display = 'block';
          profilePlaceholderIcon.style.display = 'none';
        }
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  const btnSaveProfile = document.getElementById('btn-save-profile');
  const profileMsg = document.getElementById('profile-msg');
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', async () => {
      const displayName = document.getElementById('profile-display-name').value.trim();
      btnSaveProfile.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      btnSaveProfile.disabled = true;
      try {
        const user = auth.currentUser;
        if (user) {
          const updates = {};
          if (displayName) updates.displayName = displayName;
          if (currentProfileBase64) updates.avatarBase64 = currentProfileBase64;
          await updateDoc(doc(db, 'users', user.uid), updates);

          profileMsg.textContent = 'Profile saved successfully!';
          profileMsg.style.color = 'var(--status-green)';

          if (displayName) userEmailEl.textContent = displayName;
          if (currentProfileBase64) {
            document.getElementById('topbar-avatar-img').src = currentProfileBase64;
            document.getElementById('topbar-avatar-img').style.display = 'block';
            document.getElementById('topbar-avatar-icon').style.display = 'none';
          }
        }
      } catch (err) {
        profileMsg.textContent = 'Failed to save profile.';
        profileMsg.style.color = 'var(--status-red)';
      } finally {
        setTimeout(() => { profileMsg.textContent = ''; }, 3000);
        btnSaveProfile.innerHTML = '<i class="fa-solid fa-save"></i> Save Profile';
        btnSaveProfile.disabled = false;
      }
    });
  }
}

// -- Data Simulation (Randomly increase fill levels) --
let alertedBins = new Set(); // Prevent spamming alerts

async function simulateBinFill() {
  if (binsData.length === 0) return;

  // Pick a random bin to fill
  const randomIndex = Math.floor(Math.random() * binsData.length);
  let bin = binsData[randomIndex];

  if (bin.fillLevel < 100) {
    // Increase by 5 to 15 percent
    let newFill = Math.min(100, bin.fillLevel + Math.floor(Math.random() * 11) + 5);

    // Fire and forget update
    fetch(`${API_BASE}/bins/${bin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillLevel: newFill })
    }).then(res => res.json()).then(updatedBin => {
      binsData[randomIndex] = updatedBin;
      renderBins();

      // Alert when newly crosses 80
      if (updatedBin.fillLevel > 80 && !alertedBins.has(updatedBin.id)) {
        alertedBins.add(updatedBin.id);
        showAlert(`Alert: Bin at ${updatedBin.location} is Full!`);
      } else if (updatedBin.fillLevel < 80) {
        alertedBins.delete(updatedBin.id);
      }
    });
  }
}

function showAlert(message) {
  const alertEl = document.createElement('div');
  alertEl.className = 'alert';
  alertEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${message}</span>`;
  alertContainer.appendChild(alertEl);

  setTimeout(() => {
    alertEl.style.opacity = '0';
    alertEl.style.transition = 'opacity 0.3s ease';
    setTimeout(() => alertEl.remove(), 300);
  }, 5000);
}

// -- Smart Route Optimization --
function filterFullBins() {
  return binsData.filter(bin => bin.fillLevel >= 80 || bin.status === 'Full');
}

function sortBinsByPriority(fullBins) {
  return fullBins.map(bin => {
    let priority = bin.fillLevel;
    const loc = bin.location.toLowerCase();
    const isCriticalLocation = loc.includes('cafe') || loc.includes('main') || loc.includes('canteen');
    priority += isCriticalLocation ? 20 : 0;
    return { ...bin, priority };
  }).sort((a, b) => b.priority - a.priority);
}

function renderPriorityList() {
  const priorityContainer = document.getElementById('priority-list');
  const section = document.getElementById('priority-section');
  if (!priorityContainer || !section) return;

  const fullBins = filterFullBins();
  if (fullBins.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  priorityContainer.innerHTML = '';

  const sortedBins = sortBinsByPriority(fullBins);

  sortedBins.forEach((bin, index) => {
    // Flag bin as red/top-priority if it reaches 100% full
    const isCriticallyFull = bin.fillLevel >= 99;
    const card = document.createElement('div');
    card.className = `priority-card ${isCriticallyFull ? 'top-priority' : ''}`;

    const loc = bin.location.toLowerCase();
    const isCriticalLoc = loc.includes('cafe') || loc.includes('main') || loc.includes('canteen');

    card.innerHTML = `
      <div class="priority-rank">#${index + 1}</div>
      <div class="priority-info">
        <h4>${bin.location} ${isCriticalLoc ? '<i class="fa-solid fa-fire text-gradient" title="High Traffic Area"></i>' : ''}</h4>
        <span><i class="fa-solid fa-${bin.type === 'Wet' ? 'apple-whole' : 'box'}"></i> ${bin.type} Waste - <strong style="color:var(--status-red)">${Math.round(bin.fillLevel)}% Full</strong></span>
      </div>
      <button class="btn-clean" data-id="${bin.id}">
        <i class="fa-solid fa-broom"></i> Clean
      </button>
    `;
    priorityContainer.appendChild(card);
  });

  document.querySelectorAll('#priority-list .btn-clean').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const binBtn = e.currentTarget;
      binBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      binBtn.disabled = true;
      updateBinFill(id, 0);
    });
  });
}

// -- Waste Detection Logic --
const uploadArea = document.getElementById('upload-area');
const wasteImageUpload = document.getElementById('waste-image-upload');
const previewSection = document.getElementById('preview-section');
const wastePreview = document.getElementById('waste-preview');
const btnAnalyze = document.getElementById('btn-analyze');
const detectionResult = document.getElementById('detection-result');

let uploadedFile = null;
let base64Image = null;

if (uploadArea) {
  uploadArea.addEventListener('click', () => wasteImageUpload.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  });

  wasteImageUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  });
}

function handleImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  uploadedFile = file;
  previewImage(file);
}

function previewImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    base64Image = e.target.result;
    wastePreview.src = base64Image;
    previewSection.style.display = 'block';
    detectionResult.innerHTML = '';
    btnAnalyze.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

if (btnAnalyze) {
  btnAnalyze.addEventListener('click', analyzeImage);
}

async function analyzeImage() {
  if (!uploadedFile) return;

  btnAnalyze.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing image...';
  btnAnalyze.disabled = true;
  detectionResult.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadedFile.name, image: base64Image })
    });
    const data = await res.json();

    if (data.result) {
      displayResult(data.result);

      // Save log to Firestore
      try {
        await addDoc(collection(db, 'detection_logs'), {
          filename: uploadedFile.name,
          result: data.result,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save detection log", err);
      }
    } else {
      detectionResult.innerHTML = '<div style="color:var(--status-red)">Analysis failed. Try again.</div>';
    }
  } catch (err) {
    console.error(err);
    detectionResult.innerHTML = '<div style="color:var(--status-red)">Server error. Ensure backend is running.</div>';
  } finally {
    btnAnalyze.innerHTML = '<i class="fa-solid fa-microchip"></i> Analyze Waste';
    btnAnalyze.disabled = false;
  }
}

function displayResult(result) {
  const isWet = result === 'Wet Waste';
  const colorClass = isWet ? 'wet' : 'dry';
  const icon = isWet ? '<i class="fa-solid fa-water"></i>' : '♻️';

  detectionResult.innerHTML = `
    <div class="result-badge ${colorClass}">
      <i class="fa-solid fa-circle-check"></i> 
      This looks like: ${result} ${icon}
    </div>
  `;
}
