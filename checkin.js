/**
 * Check-In/Out Page Controller
 * Handles guest check-in and check-out operations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = User.loadFromSession();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check permission (Staff only)
    if (!currentUser.hasPermission('checkin')) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // DOM Elements
    const navList = document.getElementById('navList');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const searchForm = document.getElementById('searchForm');
    const showTodayBtn = document.getElementById('showTodayBtn');
    const checkInBody = document.getElementById('checkInBody');
    const checkOutBody = document.getElementById('checkOutBody');
    const messageBox = document.getElementById('messageBox');
    
    // Modal Elements
    const checkInModal = document.getElementById('checkInModal');
    const checkOutModal = document.getElementById('checkOutModal');
    const checkInForm = document.getElementById('checkInForm');
    const checkOutForm = document.getElementById('checkOutForm');
    
    // Navigation Builder
    const navBuilder = new NavigationBuilder(currentUser);
    
    // Store current booking for modal
    let currentBooking = null;
    
    /**
     * Initialize page
     */
    function init() {
        buildNavigation();
        buildSidebar();
        loadPendingCheckIns();
        loadCurrentGuests();
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
        sidebarMenu.innerHTML = navBuilder.buildSidebar('checkin.html');
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
     * Load pending check-ins
     */
    async function loadPendingCheckIns() {
        try {
            // Demo data - in production: await api.getPendingCheckIns()
            const bookingsData = [
                { 
                    bookingId: 7, 
                    customerId: 2,
                    customerName: 'Nour Ibrahim', 
                    roomId: 1,
                    roomNumber: '101', 
                    checkInDate: '2025-12-25', 
                    checkOutDate: '2025-12-28',
                    status: 'Confirmed',
                    totalAmount: 7500
                },
                { 
                    bookingId: 8, 
                    customerId: 1,
                    customerName: 'Omar Ali', 
                    roomId: 15,
                    roomNumber: '205', 
                    checkInDate: '2025-12-26', 
                    checkOutDate: '2025-12-29',
                    status: 'Confirmed',
                    totalAmount: 12000
                }
            ];
            
            const bookings = bookingsData.map(function(b) {
                return Booking.fromApiResponse(b);
            });
            
            checkInBody.innerHTML = '';
            
            if (bookings.length === 0) {
                checkInBody.innerHTML = '<tr><td colspan="7">No pending check-ins</td></tr>';
                return;
            }
            
            bookings.forEach(function(booking) {
                checkInBody.appendChild(booking.createCheckInRow());
            });
            
            // Add check-in button listeners
            checkInBody.querySelectorAll('[data-action="checkin"]').forEach(function(btn) {
                btn.addEventListener('click', openCheckInModal);
            });
            
        } catch (error) {
            checkInBody.innerHTML = '<tr><td colspan="7">Failed to load</td></tr>';
        }
    }
    
    /**
     * Load current guests (for check-out)
     */
    async function loadCurrentGuests() {
        try {
            // Demo data - in production: await api.getCurrentGuests()
            const bookingsData = [
                { 
                    bookingId: 1, 
                    customerId: 1,
                    customerName: 'Omar Ali', 
                    roomId: 3,
                    roomNumber: '103', 
                    checkInDate: '2025-12-15', 
                    checkOutDate: '2025-12-18',
                    status: 'CheckedIn',
                    totalAmount: 7500
                },
                { 
                    bookingId: 2, 
                    customerId: 1,
                    customerName: 'Omar Ali', 
                    roomId: 10,
                    roomNumber: '110', 
                    checkInDate: '2025-12-16', 
                    checkOutDate: '2025-12-19',
                    status: 'CheckedIn',
                    totalAmount: 12000
                },
                { 
                    bookingId: 3, 
                    customerId: 2,
                    customerName: 'Nour Ibrahim', 
                    roomId: 23,
                    roomNumber: '208', 
                    checkInDate: '2025-12-17', 
                    checkOutDate: '2025-12-20',
                    status: 'CheckedIn',
                    totalAmount: 22500
                },
                { 
                    bookingId: 4, 
                    customerId: 1,
                    customerName: 'Omar Ali', 
                    roomId: 34,
                    roomNumber: '304', 
                    checkInDate: '2025-12-18', 
                    checkOutDate: '2025-12-21',
                    status: 'CheckedIn',
                    totalAmount: 30000
                },
                { 
                    bookingId: 5, 
                    customerId: 2,
                    customerName: 'Nour Ibrahim', 
                    roomId: 43,
                    roomNumber: '403', 
                    checkInDate: '2025-12-19', 
                    checkOutDate: '2025-12-22',
                    status: 'CheckedIn',
                    totalAmount: 30000
                },
                { 
                    bookingId: 6, 
                    customerId: 1,
                    customerName: 'Omar Ali', 
                    roomId: 53,
                    roomNumber: '503', 
                    checkInDate: '2025-12-20', 
                    checkOutDate: '2025-12-25',
                    status: 'CheckedIn',
                    totalAmount: 50000
                }
            ];
            
            const bookings = bookingsData.map(function(b) {
                return Booking.fromApiResponse(b);
            });
            
            checkOutBody.innerHTML = '';
            
            if (bookings.length === 0) {
                checkOutBody.innerHTML = '<tr><td colspan="7">No current guests</td></tr>';
                return;
            }
            
            bookings.forEach(function(booking) {
                checkOutBody.appendChild(booking.createCheckOutRow());
            });
            
            // Add check-out button listeners
            checkOutBody.querySelectorAll('[data-action="checkout"]').forEach(function(btn) {
                btn.addEventListener('click', openCheckOutModal);
            });
            
        } catch (error) {
            checkOutBody.innerHTML = '<tr><td colspan="7">Failed to load</td></tr>';
        }
    }
    
    /**
     * Open check-in modal
     */
    function openCheckInModal(event) {
        const bookingId = event.target.dataset.id;
        const row = event.target.closest('tr');
        
        // Populate modal
        document.getElementById('checkInBookingId').value = bookingId;
        document.getElementById('modalBookingId').textContent = bookingId;
        document.getElementById('modalCustomer').textContent = row.cells[1].textContent;
        document.getElementById('modalRoom').textContent = row.cells[2].textContent;
        
        checkInModal.classList.add('show');
    }
    
    /**
     * Open check-out modal
     */
    function openCheckOutModal(event) {
        const bookingId = event.target.dataset.id;
        const row = event.target.closest('tr');
        
        // Populate modal
        document.getElementById('checkOutBookingId').value = bookingId;
        document.getElementById('outModalBookingId').textContent = bookingId;
        document.getElementById('outModalCustomer').textContent = row.cells[1].textContent;
        document.getElementById('outModalRoom').textContent = row.cells[2].textContent;
        document.getElementById('outModalAmount').textContent = '0.00'; // Would come from API
        
        checkOutModal.classList.add('show');
    }
    
    /**
     * Close modals
     */
    function closeModals() {
        checkInModal.classList.remove('show');
        checkOutModal.classList.remove('show');
    }
    
    /**
     * Handle check-in form submit
     */
    async function handleCheckIn(event) {
        event.preventDefault();
        
        const bookingId = document.getElementById('checkInBookingId').value;
        const notes = document.getElementById('checkInNotes').value;
        
        try {
            // In production: await api.checkIn(bookingId, notes)
            console.log('Checking in booking:', bookingId, notes);
            
            showMessage('Guest checked in successfully');
            closeModals();
            loadPendingCheckIns();
            loadCurrentGuests();
            
        } catch (error) {
            showMessage('Check-in failed: ' + error.message, true);
        }
    }
    
    /**
     * Handle check-out form submit
     */
    async function handleCheckOut(event) {
        event.preventDefault();
        
        const bookingId = document.getElementById('checkOutBookingId').value;
        const notes = document.getElementById('checkOutNotes').value;
        
        try {
            // In production: await api.checkOut(bookingId, notes)
            console.log('Checking out booking:', bookingId, notes);
            
            showMessage('Guest checked out successfully');
            closeModals();
            loadPendingCheckIns();
            loadCurrentGuests();
            
        } catch (error) {
            showMessage('Check-out failed: ' + error.message, true);
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Modal close buttons
        document.getElementById('closeCheckInModal').addEventListener('click', closeModals);
        document.getElementById('closeCheckOutModal').addEventListener('click', closeModals);
        
        // Modal form submissions
        checkInForm.addEventListener('submit', handleCheckIn);
        checkOutForm.addEventListener('submit', handleCheckOut);
        
        // Close modal on outside click
        checkInModal.addEventListener('click', function(e) {
            if (e.target === checkInModal) closeModals();
        });
        checkOutModal.addEventListener('click', function(e) {
            if (e.target === checkOutModal) closeModals();
        });
        
        // Show today's check-ins
        showTodayBtn.addEventListener('click', loadPendingCheckIns);
        
        // Search form
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Implement search logic
            showMessage('Search functionality - connect to API', false);
        });
    }
    
    // Initialize page
    init();
});

