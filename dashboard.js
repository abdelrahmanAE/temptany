/**
 * Dashboard Page Controller
 * Main dashboard with stats and recent activity
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = User.loadFromSession();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // DOM Elements
    const navList = document.getElementById('navList');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const statsGrid = document.getElementById('statsGrid');
    const recentBookingsBody = document.getElementById('recentBookingsBody');
    
    // Navigation Builder
    const navBuilder = new NavigationBuilder(currentUser);
    
    /**
     * Initialize the page
     */
    function init() {
        buildNavigation();
        buildSidebar();
        displayWelcome();
        loadStats();
        updateSectionTitle();
        loadRecentBookings();
    }
    
    /**
     * Update section title based on user role
     */
    function updateSectionTitle() {
        const sectionTitle = document.querySelector('.data-section h3');
        if (sectionTitle) {
            if (currentUser.isCustomer()) {
                sectionTitle.textContent = 'My Bookings';
            } else {
                sectionTitle.textContent = 'Recent Bookings (All Customers)';
            }
        }
    }
    
    /**
     * Build main navigation
     */
    function buildNavigation() {
        navList.innerHTML = navBuilder.buildMainNav();
        
        // Add logout handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
    
    /**
     * Build sidebar menu
     */
    function buildSidebar() {
        sidebarMenu.innerHTML = navBuilder.buildSidebar('dashboard.html');
    }
    
    /**
     * Display welcome message
     */
    function displayWelcome() {
        const now = new Date();
        let greeting = 'Good evening';
        
        if (now.getHours() < 12) {
            greeting = 'Good morning';
        } else if (now.getHours() < 17) {
            greeting = 'Good afternoon';
        }
        
        welcomeMessage.innerHTML = `
            <p>${greeting}, <strong>${currentUser.username}</strong>!</p>
            <p>Role: ${currentUser.role} | Today: ${now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
        `;
    }
    
    /**
     * Load and display statistics based on user role
     */
    async function loadStats() {
        try {
            let stats;
            
            if (currentUser.isStaff() || currentUser.isAdmin()) {
                // Staff/Admin see hotel-wide statistics
                stats = [
                    { title: 'Total Rooms', value: 50 },
                    { title: 'Available', value: 41 },
                    { title: 'Occupied', value: 7 },
                    { title: "Today's Check-ins", value: 2 }
                ];
            } else {
                // Customers see their own statistics
                const myBookings = {
                    'customer1': { total: 5, active: 3, upcoming: 1, completed: 1 },  // Omar Ali
                    'customer2': { total: 4, active: 2, upcoming: 2, completed: 0 }   // Nour Ibrahim
                };
                
                const myStats = myBookings[currentUser.username] || { total: 0, active: 0, upcoming: 0, completed: 0 };
                
                stats = [
                    { title: 'My Bookings', value: myStats.total },
                    { title: 'Active Stays', value: myStats.active },
                    { title: 'Upcoming', value: myStats.upcoming },
                    { title: 'Completed', value: myStats.completed }
                ];
            }
            
            statsGrid.innerHTML = stats.map(function(stat) {
                return `
                    <div class="stat-card">
                        <h4>${stat.title}</h4>
                        <div class="stat-number">${stat.value}</div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Failed to load stats:', error);
            statsGrid.innerHTML = '<p>Failed to load statistics</p>';
        }
    }
    
    /**
     * Load recent bookings based on user role
     */
    async function loadRecentBookings() {
        try {
            // All bookings data (for admin/staff)
            const allBookings = [
                { bookingId: 1, customerName: 'Omar Ali', customerId: 1, roomNumber: '103', checkInDate: '2025-12-15', status: 'CheckedIn' },
                { bookingId: 2, customerName: 'Omar Ali', customerId: 1, roomNumber: '110', checkInDate: '2025-12-16', status: 'CheckedIn' },
                { bookingId: 3, customerName: 'Nour Ibrahim', customerId: 2, roomNumber: '208', checkInDate: '2025-12-17', status: 'CheckedIn' },
                { bookingId: 4, customerName: 'Omar Ali', customerId: 1, roomNumber: '304', checkInDate: '2025-12-18', status: 'CheckedIn' },
                { bookingId: 5, customerName: 'Nour Ibrahim', customerId: 2, roomNumber: '403', checkInDate: '2025-12-19', status: 'CheckedIn' },
                { bookingId: 6, customerName: 'Omar Ali', customerId: 1, roomNumber: '503', checkInDate: '2025-12-20', status: 'CheckedIn' },
                { bookingId: 7, customerName: 'Nour Ibrahim', customerId: 2, roomNumber: '101', checkInDate: '2025-12-25', status: 'Confirmed' },
                { bookingId: 8, customerName: 'Omar Ali', customerId: 1, roomNumber: '205', checkInDate: '2025-12-26', status: 'Confirmed' },
                { bookingId: 9, customerName: 'Nour Ibrahim', customerId: 2, roomNumber: '301', checkInDate: '2025-12-27', status: 'Pending' }
            ];
            
            // Filter bookings based on user role
            let bookingsToShow;
            
            if (currentUser.isStaff() || currentUser.isAdmin()) {
                // Staff and Admin see all bookings
                bookingsToShow = allBookings;
            } else {
                // Customers only see their own bookings
                // Map demo usernames to customer IDs
                const customerIdMap = {
                    'customer1': 1,  // Omar Ali
                    'customer2': 2   // Nour Ibrahim
                };
                
                const myCustomerId = customerIdMap[currentUser.username] || 0;
                
                bookingsToShow = allBookings.filter(function(booking) {
                    return booking.customerId === myCustomerId;
                });
            }
            
            if (bookingsToShow.length === 0) {
                recentBookingsBody.innerHTML = '<tr><td colspan="5">No bookings found</td></tr>';
                return;
            }
            
            // Update table header based on role
            const tableHeader = document.querySelector('#recentBookingsTable thead tr');
            if (currentUser.isCustomer()) {
                // Customers don't need to see their own name
                tableHeader.innerHTML = `
                    <th>Booking ID</th>
                    <th>Room</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                `;
                
                recentBookingsBody.innerHTML = bookingsToShow.map(function(booking) {
                    const statusClass = 'status-' + booking.status.toLowerCase();
                    // Calculate checkout (3 days after check-in for demo)
                    const checkIn = new Date(booking.checkInDate);
                    const checkOut = new Date(checkIn);
                    checkOut.setDate(checkOut.getDate() + 3);
                    const checkOutStr = checkOut.toISOString().split('T')[0];
                    
                    return `
                        <tr>
                            <td>${booking.bookingId}</td>
                            <td>${booking.roomNumber}</td>
                            <td>${booking.checkInDate}</td>
                            <td>${checkOutStr}</td>
                            <td><span class="status ${statusClass}">${booking.status}</span></td>
                        </tr>
                    `;
                }).join('');
            } else {
                // Staff/Admin see customer names
                recentBookingsBody.innerHTML = bookingsToShow.map(function(booking) {
                    const statusClass = 'status-' + booking.status.toLowerCase();
                    return `
                        <tr>
                            <td>${booking.bookingId}</td>
                            <td>${booking.customerName}</td>
                            <td>${booking.roomNumber}</td>
                            <td>${booking.checkInDate}</td>
                            <td><span class="status ${statusClass}">${booking.status}</span></td>
                        </tr>
                    `;
                }).join('');
            }
            
        } catch (error) {
            console.error('Failed to load bookings:', error);
            recentBookingsBody.innerHTML = '<tr><td colspan="5">Failed to load bookings</td></tr>';
        }
    }
    
    /**
     * Handle logout
     */
    function handleLogout(event) {
        event.preventDefault();
        User.clearSession();
        window.location.href = 'login.html';
    }
    
    // Initialize page
    init();
});

