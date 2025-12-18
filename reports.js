/**
 * Reports Page Controller
 * Generates and displays various reports
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = User.loadFromSession();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check permission
    if (!currentUser.hasPermission('reports')) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // DOM Elements
    const navList = document.getElementById('navList');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const reportForm = document.getElementById('reportForm');
    const reportTypeSelect = document.getElementById('reportType');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const reportResults = document.getElementById('reportResults');
    const reportTitle = document.getElementById('reportTitle');
    const reportStats = document.getElementById('reportStats');
    const reportTableHead = document.getElementById('reportTableHead');
    const reportTableBody = document.getElementById('reportTableBody');
    const messageBox = document.getElementById('messageBox');
    
    // Navigation Builder
    const navBuilder = new NavigationBuilder(currentUser);
    
    /**
     * Initialize page
     */
    function init() {
        buildNavigation();
        buildSidebar();
        setDefaultDates();
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
        sidebarMenu.innerHTML = navBuilder.buildSidebar('reports.html');
    }
    
    /**
     * Set default dates (last 30 days)
     */
    function setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        endDateInput.value = today.toISOString().split('T')[0];
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
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
     * Handle report form submit
     */
    async function handleReportSubmit(event) {
        event.preventDefault();
        
        const reportType = reportTypeSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!reportType || !startDate || !endDate) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        if (new Date(endDate) < new Date(startDate)) {
            showMessage('End date must be after start date', true);
            return;
        }
        
        try {
            switch (reportType) {
                case 'occupancy':
                    await generateOccupancyReport(startDate, endDate);
                    break;
                case 'revenue':
                    await generateRevenueReport(startDate, endDate);
                    break;
                case 'bookings':
                    await generateBookingsReport(startDate, endDate);
                    break;
                default:
                    showMessage('Invalid report type', true);
            }
            
        } catch (error) {
            showMessage('Failed to generate report: ' + error.message, true);
        }
    }
    
    /**
     * Generate Occupancy Report
     */
    async function generateOccupancyReport(startDate, endDate) {
        // Demo data - in production: await api.getOccupancyReport(startDate, endDate)
        const data = {
            summary: {
                totalRooms: 10,
                averageOccupancy: 65,
                peakOccupancy: 90,
                totalNights: 150
            },
            details: [
                { date: '2025-12-01', occupied: 6, available: 4, occupancyRate: 60 },
                { date: '2025-12-02', occupied: 7, available: 3, occupancyRate: 70 },
                { date: '2025-12-03', occupied: 8, available: 2, occupancyRate: 80 },
                { date: '2025-12-04', occupied: 9, available: 1, occupancyRate: 90 },
                { date: '2025-12-05', occupied: 5, available: 5, occupancyRate: 50 }
            ]
        };
        
        reportTitle.textContent = 'Occupancy Report';
        
        // Display summary stats
        reportStats.innerHTML = `
            <div class="stat-card">
                <h4>Total Rooms</h4>
                <div class="stat-number">${data.summary.totalRooms}</div>
            </div>
            <div class="stat-card">
                <h4>Avg Occupancy</h4>
                <div class="stat-number">${data.summary.averageOccupancy}%</div>
            </div>
            <div class="stat-card">
                <h4>Peak Occupancy</h4>
                <div class="stat-number">${data.summary.peakOccupancy}%</div>
            </div>
            <div class="stat-card">
                <h4>Total Room Nights</h4>
                <div class="stat-number">${data.summary.totalNights}</div>
            </div>
        `;
        
        // Display table
        reportTableHead.innerHTML = `
            <tr>
                <th>Date</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Occupancy Rate</th>
            </tr>
        `;
        
        reportTableBody.innerHTML = data.details.map(function(row) {
            return `
                <tr>
                    <td>${row.date}</td>
                    <td>${row.occupied}</td>
                    <td>${row.available}</td>
                    <td>${row.occupancyRate}%</td>
                </tr>
            `;
        }).join('');
        
        reportResults.style.display = 'block';
    }
    
    /**
     * Generate Revenue Report
     */
    async function generateRevenueReport(startDate, endDate) {
        // Demo data - in production: await api.getRevenueReport(startDate, endDate)
        const data = {
            summary: {
                totalRevenue: 152000,
                transactions: 6,
                averageTransaction: 25333.33,
                topMethod: 'Card'
            },
            details: [
                { month: 'December 2025', revenue: 152000, transactions: 6, avgAmount: 25333.33 }
            ]
        };
        
        reportTitle.textContent = 'Revenue Report';
        
        // Display summary stats
        reportStats.innerHTML = `
            <div class="stat-card">
                <h4>Total Revenue</h4>
                <div class="stat-number">$${data.summary.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <h4>Transactions</h4>
                <div class="stat-number">${data.summary.transactions}</div>
            </div>
            <div class="stat-card">
                <h4>Avg Transaction</h4>
                <div class="stat-number">$${data.summary.averageTransaction.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h4>Top Payment Method</h4>
                <div class="stat-number">${data.summary.topMethod}</div>
            </div>
        `;
        
        // Display table
        reportTableHead.innerHTML = `
            <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Transactions</th>
                <th>Avg Amount</th>
            </tr>
        `;
        
        reportTableBody.innerHTML = data.details.map(function(row) {
            return `
                <tr>
                    <td>${row.month}</td>
                    <td>$${row.revenue.toLocaleString()}</td>
                    <td>${row.transactions}</td>
                    <td>$${row.avgAmount.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        
        reportResults.style.display = 'block';
    }
    
    /**
     * Generate Bookings Report
     */
    async function generateBookingsReport(startDate, endDate) {
        // Demo data - in production: await api.getBookingsReport(startDate, endDate)
        const data = {
            summary: {
                totalBookings: 50,
                confirmed: 35,
                cancelled: 5,
                checkedOut: 10
            },
            details: [
                { status: 'Confirmed', count: 35, percentage: 70 },
                { status: 'CheckedIn', count: 5, percentage: 10 },
                { status: 'CheckedOut', count: 5, percentage: 10 },
                { status: 'Cancelled', count: 5, percentage: 10 }
            ]
        };
        
        reportTitle.textContent = 'Bookings Summary Report';
        
        // Display summary stats
        reportStats.innerHTML = `
            <div class="stat-card">
                <h4>Total Bookings</h4>
                <div class="stat-number">${data.summary.totalBookings}</div>
            </div>
            <div class="stat-card">
                <h4>Confirmed</h4>
                <div class="stat-number">${data.summary.confirmed}</div>
            </div>
            <div class="stat-card">
                <h4>Completed</h4>
                <div class="stat-number">${data.summary.checkedOut}</div>
            </div>
            <div class="stat-card">
                <h4>Cancelled</h4>
                <div class="stat-number">${data.summary.cancelled}</div>
            </div>
        `;
        
        // Display table
        reportTableHead.innerHTML = `
            <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
            </tr>
        `;
        
        reportTableBody.innerHTML = data.details.map(function(row) {
            return `
                <tr>
                    <td><span class="status status-${row.status.toLowerCase()}">${row.status}</span></td>
                    <td>${row.count}</td>
                    <td>${row.percentage}%</td>
                </tr>
            `;
        }).join('');
        
        reportResults.style.display = 'block';
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        reportForm.addEventListener('submit', handleReportSubmit);
    }
    
    // Initialize page
    init();
});

