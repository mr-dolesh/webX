// Global Variables
let currentUser = null;
let currentRole = null;
let reportType = 'lost';
let adminCurrentTab = 'all';
let userCurrentTab = 'all';
let selectedRole = null;

// Cache DOM elements to avoid repeated queries
const DOMCache = {
    loginScreen: null,
    adminDashboard: null,
    userDashboard: null,
    loginForm: null,
    adminItemsGrid: null,
    userItemsGrid: null,
    adminSearch: null,
    adminCategoryFilter: null,
    userSearch: null,
    userCategoryFilter: null,
    notification: null,
    userNotification: null,
    reportModal: null,
    reportForm: null,
    tabs: { admin: null, user: null },
    roleCards: null,
    stats: {}
};

// Debounce timers
let adminSearchTimer = null;
let userSearchTimer = null;

// Sample Data - Use Map for O(1) lookups instead of array find operations
const itemsMap = new Map([
    [1, { id: 1, status: 'lost', itemStatus: 'pending', name: 'iPhone 13 Pro', category: 'Electronics', description: 'Black iPhone with cracked screen protector', location: 'Library 3rd Floor', date: '2026-01-28', contact: 'student@university.edu', phone: '555-0123', reportedBy: 'user@university.edu' }],
    [2, { id: 2, status: 'found', itemStatus: 'active', name: 'Blue Backpack', category: 'Accessories', description: 'Nike backpack with laptop inside', location: 'Student Center', date: '2026-01-27', contact: 'security@university.edu', phone: '555-0100', reportedBy: 'admin@university.edu' }],
    [3, { id: 3, status: 'lost', itemStatus: 'active', name: 'Student ID Card', category: 'IDs', description: 'Name: Sarah Johnson', location: 'Cafeteria', date: '2026-01-29', contact: 'sarah.j@university.edu', phone: '555-0145', reportedBy: 'sarah.j@university.edu' }],
    [4, { id: 4, status: 'found', itemStatus: 'returned', name: 'AirPods Pro', category: 'Electronics', description: 'White case with initials "MK"', location: 'Gym Locker Room', date: '2026-01-26', contact: 'gym@university.edu', phone: '555-0200', reportedBy: 'user@university.edu' }],
    [5, { id: 5, status: 'lost', itemStatus: 'active', name: 'Textbook - Calculus II', category: 'Books', description: 'Green cover with notes inside', location: 'Math Building Room 204', date: '2026-01-25', contact: 'math.student@university.edu', phone: '555-0167', reportedBy: 'user@university.edu' }],
    [6, { id: 6, status: 'found', itemStatus: 'pending', name: 'Black Wallet', category: 'Accessories', description: 'Leather wallet, contains cards', location: 'Parking Lot C', date: '2026-01-28', contact: 'security@university.edu', phone: '555-0100', reportedBy: 'admin@university.edu' }],
    [7, { id: 7, status: 'lost', itemStatus: 'returned', name: 'Prescription Glasses', category: 'Accessories', description: 'Ray-Ban frames, black', location: 'Science Lab B12', date: '2026-01-27', contact: 'lab.user@university.edu', phone: '555-0189', reportedBy: 'lab.user@university.edu' }]
]);

// Helper to get items as array when needed
const getItemsArray = () => Array.from(itemsMap.values());

// Generate unique IDs efficiently
let nextItemId = 8;

// Role Selection
function selectRole(role) {
    selectedRole = role;
    DOMCache.roleCards.forEach(card => card.classList.remove('selected'));
    event.target.closest('.role-card').classList.add('selected');
}

// Initialize DOM Cache
function initDOMCache() {
    DOMCache.loginScreen = document.getElementById('loginScreen');
    DOMCache.adminDashboard = document.getElementById('adminDashboard');
    DOMCache.userDashboard = document.getElementById('userDashboard');
    DOMCache.loginForm = document.getElementById('loginForm');
    DOMCache.adminItemsGrid = document.getElementById('adminItemsGrid');
    DOMCache.userItemsGrid = document.getElementById('userItemsGrid');
    DOMCache.adminSearch = document.getElementById('adminSearch');
    DOMCache.adminCategoryFilter = document.getElementById('adminCategoryFilter');
    DOMCache.userSearch = document.getElementById('userSearch');
    DOMCache.userCategoryFilter = document.getElementById('userCategoryFilter');
    DOMCache.notification = document.getElementById('notification');
    DOMCache.userNotification = document.getElementById('userNotification');
    DOMCache.reportModal = document.getElementById('reportModal');
    DOMCache.reportForm = document.getElementById('reportForm');
    DOMCache.tabs.admin = document.querySelectorAll('#adminDashboard .tab');
    DOMCache.tabs.user = document.querySelectorAll('#userDashboard .tab');
    DOMCache.roleCards = document.querySelectorAll('.role-card');
    DOMCache.stats = {
        adminTotalItems: document.getElementById('adminTotalItems'),
        adminPending: document.getElementById('adminPending'),
        adminReturned: document.getElementById('adminReturned'),
        adminActive: document.getElementById('adminActive'),
        userMyReports: document.getElementById('userMyReports'),
        userTotalActive: document.getElementById('userTotalActive'),
        userRecentReturns: document.getElementById('userRecentReturns')
    };
}

// Login Handler
DOMCache.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    
    if (!selectedRole) {
        alert('Please select a role (Admin or Student)');
        return;
    }

    currentUser = email;
    currentRole = selectedRole;

    DOMCache.loginScreen.classList.add('hidden');
    
    if (selectedRole === 'admin') {
        DOMCache.adminDashboard.classList.remove('hidden');
        renderAdminItems();
    } else {
        DOMCache.userDashboard.classList.remove('hidden');
        document.getElementById('userEmail').textContent = '👨‍🎓 ' + email;
        renderUserItems();
    }
});

// Logout Function
function logout() {
    currentUser = null;
    currentRole = null;
    selectedRole = null;
    DOMCache.adminDashboard.classList.add('hidden');
    DOMCache.userDashboard.classList.add('hidden');
    DOMCache.loginScreen.classList.remove('hidden');
    DOMCache.loginForm.reset();
    DOMCache.roleCards.forEach(card => card.classList.remove('selected'));
}

// Notification System
function showNotification(message, isAdmin = false) {
    const notif = isAdmin ? DOMCache.notification : DOMCache.userNotification;
    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
}

// Tab Switching
function switchAdminTab(tab) {
    adminCurrentTab = tab;
    DOMCache.tabs.admin.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderAdminItems();
}

function switchUserTab(tab) {
    userCurrentTab = tab;
    DOMCache.tabs.user.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderUserItems();
}

// Filter Functions with Debouncing
function filterAdminItems() {
    clearTimeout(adminSearchTimer);
    adminSearchTimer = setTimeout(renderAdminItems, 150);
}

function filterUserItems() {
    clearTimeout(userSearchTimer);
    userSearchTimer = setTimeout(renderUserItems, 150);
}

// Admin Rendering
function renderAdminItems() {
    const grid = DOMCache.adminItemsGrid;
    const searchTerm = DOMCache.adminSearch.value.toLowerCase();
    const categoryFilter = DOMCache.adminCategoryFilter.value;

    const itemsArray = getItemsArray();
    let filtered = itemsArray.filter(item => {
        const matchesTab = adminCurrentTab === 'all' || 
                          (adminCurrentTab === 'pending' && item.itemStatus === 'pending') ||
                          (adminCurrentTab === 'active' && item.itemStatus === 'active') ||
                          (adminCurrentTab === 'returned' && item.itemStatus === 'returned');
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                             item.description.toLowerCase().includes(searchTerm) ||
                             item.location.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesTab && matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No reports found</p></div>';
        return;
    }

    // Use DocumentFragment for better performance when inserting multiple elements
    const fragment = document.createDocumentFragment();
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = filtered.map(item => `
        <div class="item-card">
            <div class="item-header">
                <span class="item-status status-${item.status}">${item.status.toUpperCase()}</span>
                <span class="item-status status-${item.itemStatus}">${item.itemStatus.toUpperCase()}</span>
            </div>
            <div class="item-title">${item.name}</div>
            <div class="item-details">📦 ${item.category}</div>
            <div class="item-details">${item.description}</div>
            <div class="item-details">📅 ${item.date}</div>
            <div class="item-location">📍 ${item.location}</div>
            <div class="item-details" style="margin-top: 10px;">👤 ${item.contact}</div>
            ${item.phone ? `<div class="item-details">📞 ${item.phone}</div>` : ''}
            <div class="admin-actions">
                ${item.itemStatus === 'pending' ? 
                    `<button class="btn btn-secondary btn-small" onclick="approveItem(${item.id})">✅ Approve</button>
                     <button class="btn btn-danger btn-small" onclick="rejectItem(${item.id})">❌ Reject</button>` : ''}
                ${item.itemStatus === 'active' ? 
                    `<button class="btn btn-primary btn-small" onclick="markReturned(${item.id})">✓ Mark Returned</button>` : ''}
                <button class="btn btn-danger btn-small" onclick="deleteItem(${item.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
    
    while (tempContainer.firstChild) {
        fragment.appendChild(tempContainer.firstChild);
    }
    
    grid.innerHTML = '';
    grid.appendChild(fragment);

    updateAdminStats();
}

// User Rendering
function renderUserItems() {
    const grid = DOMCache.userItemsGrid;
    const searchTerm = DOMCache.userSearch.value.toLowerCase();
    const categoryFilter = DOMCache.userCategoryFilter.value;

    const itemsArray = getItemsArray();
    let filtered = itemsArray.filter(item => {
        // In "My Reports" tab, show all user's own reports regardless of status
        if (userCurrentTab === 'myReports') {
            return item.reportedBy === currentUser;
        }
        
        // For all other tabs, only show active items (hide pending and returned)
        // Unless it's the user's own report
        if (item.itemStatus !== 'active') {
            if (item.reportedBy !== currentUser) return false;
        }
        
        const matchesTab = userCurrentTab === 'all' || 
                          (userCurrentTab === 'lost' && item.status === 'lost') ||
                          (userCurrentTab === 'found' && item.status === 'found');
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                             item.description.toLowerCase().includes(searchTerm) ||
                             item.location.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesTab && matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No items found</p></div>';
        return;
    }

    const fragment = document.createDocumentFragment();
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = filtered.map(item => {
        const isMyReport = item.reportedBy === currentUser;
        const showContactButton = !isMyReport && item.itemStatus === 'active';
        
        return `
            <div class="item-card">
                <div class="item-header">
                    <span class="item-status status-${item.status}">${item.status.toUpperCase()}</span>
                    ${isMyReport ? `<span class="item-status status-${item.itemStatus}">${item.itemStatus.toUpperCase()}</span>` : ''}
                </div>
                <div class="item-title">${item.name}</div>
                <div class="item-details">📦 ${item.category}</div>
                <div class="item-details">${item.description}</div>
                <div class="item-details">📅 ${item.date}</div>
                <div class="item-location">📍 ${item.location}</div>
                ${showContactButton ? 
                    `<div class="item-actions">
                        <button class="btn btn-primary btn-small" onclick="contactOwner('${item.contact}')">📧 Contact Owner</button>
                    </div>` : ''}
                ${isMyReport && userCurrentTab === 'myReports' ? 
                    `<div class="item-details" style="margin-top: 10px; padding: 10px; background: ${item.itemStatus === 'returned' ? '#c6f6d5' : item.itemStatus === 'pending' ? '#feebc8' : '#f0f4ff'}; border-radius: 5px; font-weight: 600;">
                        ${item.itemStatus === 'returned' ? '✅ Item Returned!' : item.itemStatus === 'pending' ? '⏳ Awaiting Admin Approval' : '✓ Active & Visible'}
                    </div>` : ''}
            </div>
        `;
    }).join('');
    
    while (tempContainer.firstChild) {
        fragment.appendChild(tempContainer.firstChild);
    }
    
    grid.innerHTML = '';
    grid.appendChild(fragment);

    updateUserStats();
}

// Update Statistics - Use cached DOM elements and Map.size for efficiency
function updateAdminStats() {
    const itemsArray = getItemsArray();
    DOMCache.stats.adminTotalItems.textContent = itemsMap.size;
    DOMCache.stats.adminPending.textContent = itemsArray.filter(i => i.itemStatus === 'pending').length;
    DOMCache.stats.adminReturned.textContent = itemsArray.filter(i => i.itemStatus === 'returned').length;
    DOMCache.stats.adminActive.textContent = itemsArray.filter(i => i.itemStatus === 'active').length;
}

function updateUserStats() {
    const itemsArray = getItemsArray();
    DOMCache.stats.userMyReports.textContent = itemsArray.filter(i => i.reportedBy === currentUser).length;
    DOMCache.stats.userTotalActive.textContent = itemsArray.filter(i => i.itemStatus === 'active').length;
    DOMCache.stats.userRecentReturns.textContent = itemsArray.filter(i => i.itemStatus === 'returned').length;
}

// Admin Actions - Use Map for O(1) lookups
function approveItem(id) {
    const item = itemsMap.get(id);
    if (item) {
        item.itemStatus = 'active';
        showNotification('Item approved and made visible to students', true);
        renderAdminItems();
    }
}

function rejectItem(id) {
    if (confirm('Are you sure you want to reject this report?')) {
        if (itemsMap.delete(id)) {
            showNotification('Report rejected and removed', true);
            renderAdminItems();
        }
    }
}

function markReturned(id) {
    const item = itemsMap.get(id);
    if (item) {
        item.itemStatus = 'returned';
        showNotification('Item marked as returned! 🎉', true);
        renderAdminItems();
    }
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        if (itemsMap.delete(id)) {
            showNotification('Report deleted', true);
            renderAdminItems();
        }
    }
}

// Contact Owner
function contactOwner(email) {
    alert(`Contact the owner at: ${email}\n\nYou can send them an email to arrange pickup!`);
}

// Modal Functions
function openReportModal(type) {
    reportType = type;
    document.getElementById('modalTitle').textContent = type === 'lost' ? 'Report Lost Item' : 'Report Found Item';
    DOMCache.reportModal.classList.add('active');
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

function closeModal() {
    DOMCache.reportModal.classList.remove('active');
    DOMCache.reportForm.reset();
}

// Form Submission
DOMCache.reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newItem = {
        id: nextItemId++,
        status: reportType,
        itemStatus: 'pending',
        name: document.getElementById('itemName').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value,
        date: document.getElementById('date').value,
        contact: currentUser,
        phone: document.getElementById('contactPhone').value,
        reportedBy: currentUser
    };
    itemsMap.set(newItem.id, newItem);
    closeModal();
    showNotification('Your report has been submitted and is pending admin review!', false);
    renderUserItems();
});
// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initDOMCache);
