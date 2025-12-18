/**
 * Staff Management Page Controller
 * Handles staff CRUD operations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = User.loadFromSession();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check permission (Admin only)
    if (!currentUser.isAdmin()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // DOM Elements
    const navList = document.getElementById('navList');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const staffForm = document.getElementById('staffForm');
    const staffBody = document.getElementById('staffBody');
    const messageBox = document.getElementById('messageBox');
    
    // Edit Modal Elements
    const editStaffModal = document.getElementById('editStaffModal');
    const editStaffForm = document.getElementById('editStaffForm');
    
    // Navigation Builder
    const navBuilder = new NavigationBuilder(currentUser);
    
    /**
     * Initialize page
     */
    function init() {
        buildNavigation();
        buildSidebar();
        setDefaultHireDate();
        loadStaff();
        setupEventListeners();
    }
    
    /**
     * Build navigation
     */
    function buildNavigation() {
        navList.innerHTML = navBuilder.buildMainNav();
        
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            User.clearSession();
            window.location.href = 'login.html';
        });
    }
    
    /**
     * Build sidebar
     */
    function buildSidebar() {
        sidebarMenu.innerHTML = navBuilder.buildSidebar('staff.html');
    }
    
    /**
     * Set default hire date to today
     */
    function setDefaultHireDate() {
        const hireDateInput = document.getElementById('hireDate');
        hireDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    /**
     * Show message
     */
    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.className = 'message-box ' + (isError ? 'error' : 'success');
        messageBox.classList.remove('hidden');
        
        setTimeout(function() {
            messageBox.classList.add('hidden');
        }, 5000);
    }
    
    /**
     * Load staff list
     */
    async function loadStaff() {
        try {
            // Demo data - in production: await api.getStaff()
            const staffData = [
                { 
                    staffId: 1, 
                    firstName: 'Ahmed', 
                    lastName: 'Hassan',
                    email: 'ahmed@elhotel.eg',
                    position: 'Manager',
                    phone: '01012345678',
                    hireDate: '2023-01-15',
                    isActive: true
                },
                { 
                    staffId: 2, 
                    firstName: 'Fatma', 
                    lastName: 'Mohamed',
                    email: 'fatma@elhotel.eg',
                    position: 'Receptionist',
                    phone: '01098765432',
                    hireDate: '2023-06-20',
                    isActive: true
                },
                { 
                    staffId: 3, 
                    firstName: 'Mahmoud', 
                    lastName: 'Sayed',
                    email: 'mahmoud@elhotel.eg',
                    position: 'Housekeeping',
                    phone: '01122334455',
                    hireDate: '2024-02-10',
                    isActive: true
                },
                { 
                    staffId: 4, 
                    firstName: 'Youssef', 
                    lastName: 'Kamal',
                    email: 'youssef@elhotel.eg',
                    position: 'Maintenance',
                    phone: '01055667788',
                    hireDate: '2024-05-01',
                    isActive: false
                },
                { 
                    staffId: 5, 
                    firstName: 'Mariam', 
                    lastName: 'Adel',
                    email: 'mariam@elhotel.eg',
                    position: 'Receptionist',
                    phone: '01199887766',
                    hireDate: '2024-08-01',
                    isActive: true
                }
            ];
            
            staffBody.innerHTML = '';
            
            if (staffData.length === 0) {
                staffBody.innerHTML = '<tr><td colspan="8">No staff members found</td></tr>';
                return;
            }
            
            staffData.forEach(function(staff) {
                const tr = document.createElement('tr');
                tr.dataset.staffId = staff.staffId;
                
                const statusClass = staff.isActive ? 'status-available' : 'status-cancelled';
                const statusText = staff.isActive ? 'Active' : 'Inactive';
                
                tr.innerHTML = `
                    <td>${staff.staffId}</td>
                    <td>${staff.firstName} ${staff.lastName}</td>
                    <td>${staff.email}</td>
                    <td>${staff.position}</td>
                    <td>${staff.phone}</td>
                    <td>${staff.hireDate}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-secondary btn-small" data-action="edit" data-id="${staff.staffId}">Edit</button>
                        ${staff.isActive ? 
                            `<button class="btn btn-danger btn-small" data-action="deactivate" data-id="${staff.staffId}">Deactivate</button>` :
                            `<button class="btn btn-success btn-small" data-action="activate" data-id="${staff.staffId}">Activate</button>`
                        }
                    </td>
                `;
                
                staffBody.appendChild(tr);
            });
            
            // Add action button listeners
            staffBody.querySelectorAll('[data-action="edit"]').forEach(function(btn) {
                btn.addEventListener('click', openEditModal);
            });
            
            staffBody.querySelectorAll('[data-action="deactivate"]').forEach(function(btn) {
                btn.addEventListener('click', handleDeactivate);
            });
            
            staffBody.querySelectorAll('[data-action="activate"]').forEach(function(btn) {
                btn.addEventListener('click', handleActivate);
            });
            
        } catch (error) {
            staffBody.innerHTML = '<tr><td colspan="8">Failed to load staff</td></tr>';
        }
    }
    
    /**
     * Handle add staff form submit
     */
    async function handleAddStaff(event) {
        event.preventDefault();
        
        const staffData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            position: document.getElementById('position').value,
            salary: parseFloat(document.getElementById('salary').value) || 0,
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            hireDate: document.getElementById('hireDate').value
        };
        
        // Validation
        if (!staffData.firstName || !staffData.lastName || !staffData.email) {
            showMessage('Please fill in all required fields', true);
            return;
        }
        
        if (!staffData.username || !staffData.password) {
            showMessage('Username and password are required', true);
            return;
        }
        
        try {
            // In production: await api.createStaff(staffData)
            console.log('Creating staff:', staffData);
            
            showMessage('Staff member added successfully');
            staffForm.reset();
            setDefaultHireDate();
            loadStaff();
            
        } catch (error) {
            showMessage('Failed to add staff: ' + error.message, true);
        }
    }
    
    /**
     * Open edit modal
     */
    function openEditModal(event) {
        const staffId = event.target.dataset.id;
        const row = event.target.closest('tr');
        
        // Parse name
        const fullName = row.cells[1].textContent.split(' ');
        const firstName = fullName[0];
        const lastName = fullName.slice(1).join(' ');
        
        // Populate modal
        document.getElementById('editStaffId').value = staffId;
        document.getElementById('editFirstName').value = firstName;
        document.getElementById('editLastName').value = lastName;
        document.getElementById('editPhone').value = row.cells[4].textContent;
        document.getElementById('editPosition').value = row.cells[3].textContent;
        document.getElementById('editSalary').value = '';
        
        editStaffModal.classList.add('show');
    }
    
    /**
     * Close edit modal
     */
    function closeEditModal() {
        editStaffModal.classList.remove('show');
    }
    
    /**
     * Handle edit staff form submit
     */
    async function handleEditStaff(event) {
        event.preventDefault();
        
        const staffId = document.getElementById('editStaffId').value;
        const staffData = {
            firstName: document.getElementById('editFirstName').value.trim(),
            lastName: document.getElementById('editLastName').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            position: document.getElementById('editPosition').value,
            salary: parseFloat(document.getElementById('editSalary').value) || null
        };
        
        try {
            // In production: await api.updateStaff(staffId, staffData)
            console.log('Updating staff:', staffId, staffData);
            
            showMessage('Staff member updated successfully');
            closeEditModal();
            loadStaff();
            
        } catch (error) {
            showMessage('Failed to update staff: ' + error.message, true);
        }
    }
    
    /**
     * Handle deactivate staff
     */
    async function handleDeactivate(event) {
        const staffId = event.target.dataset.id;
        
        if (!confirm('Are you sure you want to deactivate this staff member?')) {
            return;
        }
        
        try {
            // In production: await api.deactivateStaff(staffId)
            console.log('Deactivating staff:', staffId);
            
            showMessage('Staff member deactivated');
            loadStaff();
            
        } catch (error) {
            showMessage('Failed to deactivate: ' + error.message, true);
        }
    }
    
    /**
     * Handle activate staff
     */
    async function handleActivate(event) {
        const staffId = event.target.dataset.id;
        
        try {
            // In production: await api.activateStaff(staffId)
            console.log('Activating staff:', staffId);
            
            showMessage('Staff member activated');
            loadStaff();
            
        } catch (error) {
            showMessage('Failed to activate: ' + error.message, true);
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Add staff form
        staffForm.addEventListener('submit', handleAddStaff);
        
        // Edit modal
        document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
        editStaffForm.addEventListener('submit', handleEditStaff);
        
        // Close modal on outside click
        editStaffModal.addEventListener('click', function(e) {
            if (e.target === editStaffModal) closeEditModal();
        });
    }
    
    // Initialize page
    init();
});

