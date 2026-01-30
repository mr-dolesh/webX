// Global Variables
let currentUser = null;
let currentRole = null;
let reportType = 'lost';
let adminCurrentTab = 'all';
let userCurrentTab = 'all';
let selectedRole = null;

// Sample Data
const items = [
    { 
        id: 1, 
        status: 'lost', 
        itemStatus: 'pending', 
        name: 'iPhone 13 Pro', 
        category: 'Electronics', 
        description: 'Black iPhone with cracked screen protector', 
        location: 'Library 3rd Floor', 
        date: '2026-01-28', 
        contact: 'student@university.edu', 
        phone: '555-0123', 
        reportedBy: 'user@university.edu' 
    },
    { 
        id: 2, 
        status: 'found', 
        itemStatus: 'active', 
        name: 'Blue Backpack', 
        category: 'Accessories', 
        description: 'Nike backpack with laptop inside', 
        location: 'Student Center', 
        date: '2026-01-27', 
        contact: 'security@university.edu', 
        phone: '555-0100', 
        reportedBy: 'admin@university.edu' 
    },
    { 
        id: 3, 
        status: 'lost', 
        itemStatus: 'active', 
        name: 'Student ID Card', 
        category: 'IDs', 
        description: 'Name: Sarah Johnson', 
        location: 'Cafeteria', 
        date: '2026-01-29', 
        contact: 'sarah.j@university.edu', 
        phone: '555-0145', 
        reportedBy: 'sarah.j@university.edu' 
    },
    { 
        id: 4, 
        status: 'found', 
        itemStatus: 'returned', 
        name: 'AirPods Pro', 
        category: 'Electronics', 
        description: 'White case with initials "MK"', 
        location: 'Gym Locker Room', 
        date: '2026-01-26', 
        contact: 'gym@university.edu', 
        phone: '555-0200', 
        reportedBy: 'user@university.edu' 
    },
    { 
        id: 5, 
        status: 'lost', 
        itemStatus: 'active', 
        name: 'Textbook - Calculus II', 
        category: 'Books', 
        description: 'Green cover with notes inside', 
        location: 'Math Building Room 204', 
        date: '2026-01-25', 
        contact: 'math.student@university.edu', 
        phone: '555-0167', 
        reportedBy: 'user@university.edu' 
    },
    { 
        id: 6, 
        status: 'found', 
        itemStatus: 'pending', 
        name: 'Black Wallet', 
        category: 'Accessories', 
        description: 'Leather wallet, contains cards', 
        location: 'Parking Lot C', 
        date: '2026-01-28', 
        contact: 'security@university.edu', 
        phone: '555-0100', 
        reportedBy: 'admin@university.edu' 
    },
    { 
        id: 7, 
        status: 'lost', 
        itemStatus: 'returned', 
        name: 'Prescription Glasses', 
        category: 'Accessories', 
        description: 'Ray-Ban frames, black', 
        location: 'Science Lab B12', 
        date: '2026-01-27', 
        contact: 'lab.user@university.edu', 
        phone: '555-0189', 
        reportedBy: 'lab.user@university.edu' 
    }
];

// Role Selection
function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.role-card').classList.add('selected');
}

// Login Handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    
    if (!selectedRole) {
        alert('Please select a role (Admin or Student)');
        return;
    }

    currentUser = email;
    currentRole = selectedRole;

    document.getElementById('loginScreen').classList.add('hidden');
    
    if (selectedRole === 'admin') {
        document.getElementById('adminDashboard').classList.remove('hidden');
        renderAdminItems();
    } else {
        document.getElementById('userDashboard').classList.remove('hidden');
        document.getElementById('userEmail').textContent = '👨‍🎓 ' + email;
        renderUserItems();
    }
});

// Logout Function
function logout() {
    currentUser = null;
    currentRole = null;
    selectedRole = null;
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('userDashboard').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginForm').reset();
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
}

// Notification System
function showNotification(message, isAdmin = false) {
    const notif = isAdmin ? document.getElementById('notification') : document.getElementById('userNotification');
    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
}

// Tab Switching
function switchAdminTab(tab) {
    adminCurrentTab = tab;
    document.querySelectorAll('#adminDashboard .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderAdminItems();
}

function switchUserTab(tab) {
    userCurrentTab = tab;
    document.querySelectorAll('#userDashboard .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderUserItems();
}

// Filter Functions
function filterAdminItems() {
    renderAdminItems();
}

function filterUserItems() {
    renderUserItems();
}

// Admin Rendering
function renderAdminItems() {
    const grid = document.getElementById('adminItemsGrid');
    const searchTerm = document.getElementById('adminSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('adminCategoryFilter').value;

    let filtered = items.filter(item => {
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

    grid.innerHTML = filtered.map(item => `
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

    updateAdminStats();
}

// User Rendering
function renderUserItems() {
    const grid = document.getElementById('userItemsGrid');
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('userCategoryFilter').value;

    let filtered = items.filter(item => {
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

    grid.innerHTML = filtered.map(item => {
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

    updateUserStats();
}

// Update Statistics
function updateAdminStats() {
    document.getElementById('adminTotalItems').textContent = items.length;
    document.getElementById('adminPending').textContent = items.filter(i => i.itemStatus === 'pending').length;
    document.getElementById('adminReturned').textContent = items.filter(i => i.itemStatus === 'returned').length;
    document.getElementById('adminActive').textContent = items.filter(i => i.itemStatus === 'active').length;
}

function updateUserStats() {
    document.getElementById('userMyReports').textContent = items.filter(i => i.reportedBy === currentUser).length;
    document.getElementById('userTotalActive').textContent = items.filter(i => i.itemStatus === 'active').length;
    document.getElementById('userRecentReturns').textContent = items.filter(i => i.itemStatus === 'returned').length;
}

// Admin Actions
function approveItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.itemStatus = 'active';
        showNotification('Item approved and made visible to students', true);
        renderAdminItems();
    }
}

function rejectItem(id) {
    if (confirm('Are you sure you want to reject this report?')) {
        const index = items.findIndex(i => i.id === id);
        if (index > -1) {
            items.splice(index, 1);
            showNotification('Report rejected and removed', true);
            renderAdminItems();
        }
    }
}

function markReturned(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.itemStatus = 'returned';
        showNotification('Item marked as returned! 🎉', true);
        renderAdminItems();
    }
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        const index = items.findIndex(i => i.id === id);
        if (index > -1) {
            items.splice(index, 1);
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
    document.getElementById('reportModal').classList.add('active');
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

function closeModal() {
    document.getElementById('reportModal').classList.remove('active');
    document.getElementById('reportForm').reset();
}

// Form Submission
document.getElementById('reportForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newItem = {
        id: items.length + 1,
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
    items.unshift(newItem);
    closeModal();
    showNotification('Your report has been submitted and is pending admin review!', false);
    renderUserItems();
});