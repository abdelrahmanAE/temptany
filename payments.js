/**
 * Payments Page Controller
 * Handles payment processing and receipt generation
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
    const paymentForm = document.getElementById('paymentForm');
    const paymentFormSection = document.getElementById('paymentFormSection');
    const bookingIdInput = document.getElementById('bookingId');
    const amountInput = document.getElementById('amount');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const loadBookingBtn = document.getElementById('loadBookingBtn');
    const paymentsBody = document.getElementById('paymentsBody');
    const messageBox = document.getElementById('messageBox');
    
    // Receipt Modal Elements
    const receiptModal = document.getElementById('receiptModal');
    const receiptContent = document.getElementById('receiptContent');
    const printReceiptBtn = document.getElementById('printReceiptBtn');
    
    // Navigation Builder
    const navBuilder = new NavigationBuilder(currentUser);
    
    // Receipt Builder instance
    const receiptBuilder = new ReceiptBuilder();
    
    /**
     * Initialize page
     */
    function init() {
        buildNavigation();
        buildSidebar();
        
        // Show payment form only for staff
        if (!currentUser.isStaff()) {
            paymentFormSection.style.display = 'none';
        }
        
        loadPayments();
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
        sidebarMenu.innerHTML = navBuilder.buildSidebar('payments.html');
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
     * Load booking details
     */
    async function loadBookingDetails() {
        const bookingId = bookingIdInput.value;
        
        if (!bookingId) {
            showMessage('Please enter a booking ID', true);
            return;
        }
        
        try {
            // Demo - in production: await api.getBookingById(bookingId)
            // Simulate loading booking data
            const bookingAmount = 150.00; // Would come from API
            amountInput.value = bookingAmount;
            showMessage('Booking loaded. Amount: $' + bookingAmount);
            
        } catch (error) {
            showMessage('Failed to load booking: ' + error.message, true);
        }
    }
    
    /**
     * Load payment history
     */
    async function loadPayments() {
        try {
            // Demo data - in production: await api.getPayments() or api.getMyPayments()
            const paymentsData = [
                { 
                    paymentId: 1, 
                    bookingId: 1, 
                    amount: 7500, 
                    paymentMethod: 'Card', 
                    paymentDate: '2025-12-15T10:30:00', 
                    status: 'Completed',
                    receiptNumber: 'RCP-20251215-001'
                },
                { 
                    paymentId: 2, 
                    bookingId: 2, 
                    amount: 12000, 
                    paymentMethod: 'Cash', 
                    paymentDate: '2025-12-16T14:45:00', 
                    status: 'Completed',
                    receiptNumber: 'RCP-20251216-002'
                },
                { 
                    paymentId: 3, 
                    bookingId: 3, 
                    amount: 22500, 
                    paymentMethod: 'Online', 
                    paymentDate: '2025-12-17T09:15:00', 
                    status: 'Completed',
                    receiptNumber: 'RCP-20251217-003'
                },
                { 
                    paymentId: 4, 
                    bookingId: 4, 
                    amount: 30000, 
                    paymentMethod: 'Card', 
                    paymentDate: '2025-12-18T11:00:00', 
                    status: 'Completed',
                    receiptNumber: 'RCP-20251218-004'
                },
                { 
                    paymentId: 5, 
                    bookingId: 5, 
                    amount: 30000, 
                    paymentMethod: 'Cash', 
                    paymentDate: '2025-12-19T16:30:00', 
                    status: 'Completed',
                    receiptNumber: 'RCP-20251219-005'
                },
                { 
                    paymentId: 6, 
                    bookingId: 6, 
                    amount: 50000, 
                    paymentMethod: 'Card', 
                    paymentDate: '2025-12-20T12:00:00', 
                    status: 'Completed',
                    receiptNumber: 'RCP-20251220-006'
                }
            ];
            
            const payments = paymentsData.map(function(p) {
                return Payment.fromApiResponse(p);
            });
            
            paymentsBody.innerHTML = '';
            
            if (payments.length === 0) {
                paymentsBody.innerHTML = '<tr><td colspan="7">No payments found</td></tr>';
                return;
            }
            
            payments.forEach(function(payment) {
                paymentsBody.appendChild(payment.createTableRow());
            });
            
            // Add receipt button listeners
            paymentsBody.querySelectorAll('[data-action="receipt"]').forEach(function(btn) {
                btn.addEventListener('click', showReceipt);
            });
            
        } catch (error) {
            paymentsBody.innerHTML = '<tr><td colspan="7">Failed to load payments</td></tr>';
        }
    }
    
    /**
     * Handle payment form submit
     */
    async function handlePaymentSubmit(event) {
        event.preventDefault();
        
        const bookingId = bookingIdInput.value;
        const amount = parseFloat(amountInput.value);
        const paymentMethod = paymentMethodSelect.value;
        
        if (!bookingId || !amount || !paymentMethod) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        try {
            const paymentData = {
                bookingId: parseInt(bookingId),
                amount: amount,
                paymentMethod: paymentMethod
            };
            
            // In production: await api.createPayment(paymentData)
            console.log('Processing payment:', paymentData);
            
            showMessage('Payment processed successfully!');
            paymentForm.reset();
            loadPayments();
            
        } catch (error) {
            showMessage('Payment failed: ' + error.message, true);
        }
    }
    
    /**
     * Show receipt modal
     */
    function showReceipt(event) {
        const paymentId = event.target.dataset.id;
        const row = event.target.closest('tr');
        
        // Get data from row
        const bookingId = row.cells[1].textContent;
        const amount = row.cells[2].textContent.replace('$', '');
        const method = row.cells[3].textContent;
        const date = row.cells[4].textContent;
        
        // Generate receipt number if not exists
        const receiptNo = 'RCP-' + Date.now().toString(36).toUpperCase();
        
        // Build receipt using Builder pattern
        const receiptHtml = receiptBuilder
            .reset()
            .setReceiptNumber(receiptNo)
            .setDate(date)
            .setBookingId(bookingId)
            .setPayment(method, parseFloat(amount))
            .build();
        
        receiptContent.innerHTML = receiptHtml;
        receiptModal.classList.add('show');
    }
    
    /**
     * Close receipt modal
     */
    function closeReceiptModal() {
        receiptModal.classList.remove('show');
    }
    
    /**
     * Print receipt
     */
    function printReceipt() {
        window.print();
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Payment form
        paymentForm.addEventListener('submit', handlePaymentSubmit);
        
        // Load booking button
        loadBookingBtn.addEventListener('click', loadBookingDetails);
        
        // Receipt modal
        document.getElementById('closeReceiptModal').addEventListener('click', closeReceiptModal);
        printReceiptBtn.addEventListener('click', printReceipt);
        
        // Close modal on outside click
        receiptModal.addEventListener('click', function(e) {
            if (e.target === receiptModal) closeReceiptModal();
        });
    }
    
    // Initialize page
    init();
});

