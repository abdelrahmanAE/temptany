/**
 * Bookings Page Controller
 * Handles room booking operations
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
    const bookingForm = document.getElementById('bookingForm');
    const roomSelect = document.getElementById('roomSelect');
    const checkInDate = document.getElementById('checkInDate');
    const checkOutDate = document.getElementById('checkOutDate');
    const notesInput = document.getElementById('notes');
    const checkAvailabilityBtn = document.getElementById('checkAvailability');
    const bookingsBody = document.getElementById('bookingsBody');
    const messageBox = document.getElementById('messageBox');
    
    // Store loaded rooms and bookings
    let availableRooms = [];
    let myBookings = [];
    let nextBookingId = 100; // For demo new bookings
    
    // All rooms data (50 rooms)
    const allRoomsData = [
        // Floor 1
        { roomId: 1, roomNumber: '101', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1 },
        { roomId: 2, roomNumber: '102', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1 },
        { roomId: 3, roomNumber: '103', roomTypeName: 'Single', floor: 1, status: 'Occupied', basePrice: 2500, capacity: 1 },
        { roomId: 4, roomNumber: '104', roomTypeName: 'Double', floor: 1, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 5, roomNumber: '105', roomTypeName: 'Double', floor: 1, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 6, roomNumber: '106', roomTypeName: 'Double', floor: 1, status: 'Maintenance', basePrice: 4000, capacity: 2 },
        { roomId: 7, roomNumber: '107', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1 },
        { roomId: 8, roomNumber: '108', roomTypeName: 'Double', floor: 1, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 9, roomNumber: '109', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1 },
        { roomId: 10, roomNumber: '110', roomTypeName: 'Double', floor: 1, status: 'Occupied', basePrice: 4000, capacity: 2 },
        // Floor 2
        { roomId: 11, roomNumber: '201', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 12, roomNumber: '202', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 13, roomNumber: '203', roomTypeName: 'Double', floor: 2, status: 'Occupied', basePrice: 4000, capacity: 2 },
        { roomId: 14, roomNumber: '204', roomTypeName: 'Suite', floor: 2, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 15, roomNumber: '205', roomTypeName: 'Suite', floor: 2, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 16, roomNumber: '206', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 17, roomNumber: '207', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 18, roomNumber: '208', roomTypeName: 'Suite', floor: 2, status: 'Occupied', basePrice: 7500, capacity: 3 },
        { roomId: 19, roomNumber: '209', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2 },
        { roomId: 20, roomNumber: '210', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2 },
        // Floor 3
        { roomId: 21, roomNumber: '301', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 22, roomNumber: '302', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 23, roomNumber: '303', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 24, roomNumber: '304', roomTypeName: 'Deluxe', floor: 3, status: 'Occupied', basePrice: 10000, capacity: 4 },
        { roomId: 25, roomNumber: '305', roomTypeName: 'Deluxe', floor: 3, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 26, roomNumber: '306', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 27, roomNumber: '307', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 28, roomNumber: '308', roomTypeName: 'Deluxe', floor: 3, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 29, roomNumber: '309', roomTypeName: 'Suite', floor: 3, status: 'Maintenance', basePrice: 7500, capacity: 3 },
        { roomId: 30, roomNumber: '310', roomTypeName: 'Deluxe', floor: 3, status: 'Available', basePrice: 10000, capacity: 4 },
        // Floor 4
        { roomId: 31, roomNumber: '401', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 32, roomNumber: '402', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 33, roomNumber: '403', roomTypeName: 'Deluxe', floor: 4, status: 'Occupied', basePrice: 10000, capacity: 4 },
        { roomId: 34, roomNumber: '404', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 35, roomNumber: '405', roomTypeName: 'Suite', floor: 4, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 36, roomNumber: '406', roomTypeName: 'Suite', floor: 4, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 37, roomNumber: '407', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 38, roomNumber: '408', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 39, roomNumber: '409', roomTypeName: 'Suite', floor: 4, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 40, roomNumber: '410', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4 },
        // Floor 5 - Penthouse
        { roomId: 41, roomNumber: '501', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 42, roomNumber: '502', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 43, roomNumber: '503', roomTypeName: 'Deluxe', floor: 5, status: 'Occupied', basePrice: 10000, capacity: 4 },
        { roomId: 44, roomNumber: '504', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 45, roomNumber: '505', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 46, roomNumber: '506', roomTypeName: 'Suite', floor: 5, status: 'Available', basePrice: 7500, capacity: 3 },
        { roomId: 47, roomNumber: '507', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 48, roomNumber: '508', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 49, roomNumber: '509', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 },
        { roomId: 50, roomNumber: '510', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4 }
    ];
    
    // Demo bookings per user
    const demoBookingsData = {
        'customer1': [ // Omar Ali
            { bookingId: 1, roomId: 3, roomNumber: '103', checkInDate: '2025-12-15', checkOutDate: '2025-12-18', status: 'CheckedIn', totalAmount: 7500 },
            { bookingId: 2, roomId: 10, roomNumber: '110', checkInDate: '2025-12-16', checkOutDate: '2025-12-19', status: 'CheckedIn', totalAmount: 12000 },
            { bookingId: 4, roomId: 24, roomNumber: '304', checkInDate: '2025-12-18', checkOutDate: '2025-12-21', status: 'CheckedIn', totalAmount: 30000 },
            { bookingId: 6, roomId: 43, roomNumber: '503', checkInDate: '2025-12-20', checkOutDate: '2025-12-25', status: 'CheckedIn', totalAmount: 50000 },
            { bookingId: 8, roomId: 15, roomNumber: '205', checkInDate: '2025-12-26', checkOutDate: '2025-12-29', status: 'Confirmed', totalAmount: 22500 }
        ],
        'customer2': [ // Nour Ibrahim
            { bookingId: 3, roomId: 18, roomNumber: '208', checkInDate: '2025-12-17', checkOutDate: '2025-12-20', status: 'CheckedIn', totalAmount: 22500 },
            { bookingId: 5, roomId: 33, roomNumber: '403', checkInDate: '2025-12-19', checkOutDate: '2025-12-22', status: 'CheckedIn', totalAmount: 30000 },
            { bookingId: 7, roomId: 1, roomNumber: '101', checkInDate: '2025-12-25', checkOutDate: '2025-12-28', status: 'Confirmed', totalAmount: 7500 },
            { bookingId: 9, roomId: 21, roomNumber: '301', checkInDate: '2025-12-27', checkOutDate: '2025-12-30', status: 'Pending', totalAmount: 22500 }
        ],
        'admin': [], // Admin can see all
        'ahmed': [], // Staff
        'fatma': []  // Staff
    };
    
    // Navigation Builder
    const navBuilder = new NavigationBuilder(currentUser);
    
    /**
     * Initialize the page
     */
    function init() {
        buildNavigation();
        buildSidebar();
        setMinDates();
        loadMyBookings();
        setupEventListeners();
    }
    
    /**
     * Build navigation
     */
    function buildNavigation() {
        navList.innerHTML = navBuilder.buildMainNav();
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                User.clearSession();
                window.location.href = 'login.html';
            });
        }
    }
    
    /**
     * Build sidebar
     */
    function buildSidebar() {
        sidebarMenu.innerHTML = navBuilder.buildSidebar('bookings.html');
    }
    
    /**
     * Set minimum dates (today)
     */
    function setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        checkInDate.min = today;
        checkOutDate.min = today;
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
     * Load available rooms for selected dates
     */
    async function loadAvailableRooms() {
        const checkIn = checkInDate.value;
        const checkOut = checkOutDate.value;
        
        if (!checkIn || !checkOut) {
            showMessage('Please select check-in and check-out dates first', true);
            return;
        }
        
        if (new Date(checkOut) <= new Date(checkIn)) {
            showMessage('Check-out date must be after check-in date', true);
            return;
        }
        
        try {
            // Filter available rooms (not Occupied or Maintenance)
            const roomsData = allRoomsData.filter(function(room) {
                return room.status === 'Available';
            });
            
            // Convert to Room objects
            availableRooms = roomsData.map(function(r) {
                return Room.fromApiResponse(r);
            });
            
            // Populate select dropdown
            roomSelect.innerHTML = '<option value="">-- Select a Room (' + availableRooms.length + ' available) --</option>';
            
            // Group by room type
            const roomTypes = ['Single', 'Double', 'Suite', 'Deluxe'];
            roomTypes.forEach(function(type) {
                const roomsOfType = availableRooms.filter(function(r) { return r.roomType === type; });
                if (roomsOfType.length > 0) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = type + ' Rooms (EGP ' + roomsOfType[0].price.toLocaleString() + '/night)';
                    
                    roomsOfType.forEach(function(room) {
                        const option = document.createElement('option');
                        option.value = room.id;
                        option.textContent = 'Room ' + room.roomNumber + ' - Floor ' + room.floor;
                        option.dataset.price = room.price;
                        option.dataset.type = room.roomType;
                        optgroup.appendChild(option);
                    });
                    
                    roomSelect.appendChild(optgroup);
                }
            });
            
            showMessage('Found ' + availableRooms.length + ' available rooms! Select one to book.');
            
        } catch (error) {
            showMessage('Failed to load rooms: ' + error.message, true);
        }
    }
    
    /**
     * Calculate and show booking summary
     */
    function updateBookingSummary() {
        const roomId = roomSelect.value;
        const checkIn = checkInDate.value;
        const checkOut = checkOutDate.value;
        
        if (!roomId || !checkIn || !checkOut) return;
        
        const selectedRoom = availableRooms.find(function(r) { return r.id == roomId; });
        if (!selectedRoom) return;
        
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const totalPrice = selectedRoom.price * nights;
        
        // Show summary in notes area or create summary div
        let summaryDiv = document.getElementById('bookingSummary');
        if (!summaryDiv) {
            summaryDiv = document.createElement('div');
            summaryDiv.id = 'bookingSummary';
            summaryDiv.className = 'message-box info';
            notesInput.parentNode.insertBefore(summaryDiv, notesInput);
        }
        
        summaryDiv.innerHTML = `
            <strong>Booking Summary:</strong><br>
            Room: ${selectedRoom.roomNumber} (${selectedRoom.roomType})<br>
            Check-in: ${checkIn} | Check-out: ${checkOut}<br>
            Duration: ${nights} night(s)<br>
            <strong>Total: EGP ${totalPrice.toLocaleString()}</strong>
        `;
        summaryDiv.classList.remove('hidden');
    }
    
    /**
     * Load user's bookings
     */
    async function loadMyBookings() {
        try {
            // Get bookings for current user
            myBookings = demoBookingsData[currentUser.username] || [];
            
            // Convert to Booking objects
            const bookings = myBookings.map(function(b) {
                return Booking.fromApiResponse(b);
            });
            
            // Clear table
            bookingsBody.innerHTML = '';
            
            if (bookings.length === 0) {
                bookingsBody.innerHTML = '<tr><td colspan="7">No bookings yet. Book your first room above!</td></tr>';
                return;
            }
            
            // Add rows using DOM
            bookings.forEach(function(booking) {
                bookingsBody.appendChild(booking.createTableRow(true));
            });
            
            // Add event listeners for action buttons
            addActionListeners();
            
        } catch (error) {
            bookingsBody.innerHTML = '<tr><td colspan="7">Failed to load bookings</td></tr>';
        }
    }
    
    /**
     * Add event listeners for action buttons
     */
    function addActionListeners() {
        const cancelButtons = bookingsBody.querySelectorAll('[data-action="cancel"]');
        
        cancelButtons.forEach(function(btn) {
            btn.addEventListener('click', handleCancelBooking);
        });
    }
    
    /**
     * Handle booking form submission
     */
    async function handleBookingSubmit(event) {
        event.preventDefault();
        
        const roomId = parseInt(roomSelect.value);
        const checkIn = checkInDate.value;
        const checkOut = checkOutDate.value;
        const notes = notesInput.value;
        
        if (!roomId) {
            showMessage('Please select a room first. Click "Check Availability" to see available rooms.', true);
            return;
        }
        
        if (!checkIn || !checkOut) {
            showMessage('Please select check-in and check-out dates', true);
            return;
        }
        
        // Find selected room
        const selectedRoom = availableRooms.find(function(r) { return r.id === roomId; });
        if (!selectedRoom) {
            showMessage('Selected room not found. Please search again.', true);
            return;
        }
        
        // Calculate total
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const totalAmount = selectedRoom.price * nights;
        
        // Confirm booking
        const confirmMsg = `Confirm booking?\n\nRoom: ${selectedRoom.roomNumber} (${selectedRoom.roomType})\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nNights: ${nights}\nTotal: EGP ${totalAmount.toLocaleString()}`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        try {
            // Create new booking (demo mode)
            const newBooking = {
                bookingId: nextBookingId++,
                roomId: roomId,
                roomNumber: selectedRoom.roomNumber,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                status: 'Pending',
                totalAmount: totalAmount,
                notes: notes
            };
            
            // Add to user's bookings
            if (!demoBookingsData[currentUser.username]) {
                demoBookingsData[currentUser.username] = [];
            }
            demoBookingsData[currentUser.username].push(newBooking);
            
            // Mark room as no longer available (for this session)
            const roomIndex = allRoomsData.findIndex(function(r) { return r.roomId === roomId; });
            if (roomIndex >= 0) {
                allRoomsData[roomIndex].status = 'Occupied';
            }
            
            showMessage('🎉 Booking successful! Your booking #' + newBooking.bookingId + ' is pending confirmation. Total: EGP ' + totalAmount.toLocaleString());
            
            // Reset form
            bookingForm.reset();
            roomSelect.innerHTML = '<option value="">-- Select Room --</option>';
            
            // Remove summary
            const summaryDiv = document.getElementById('bookingSummary');
            if (summaryDiv) summaryDiv.remove();
            
            // Reload bookings list
            loadMyBookings();
            
        } catch (error) {
            showMessage('Booking failed: ' + error.message, true);
        }
    }
    
    /**
     * Handle cancel booking
     */
    async function handleCancelBooking(event) {
        const bookingId = parseInt(event.target.dataset.id);
        
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        
        try {
            // Find and update booking status
            const userBookings = demoBookingsData[currentUser.username] || [];
            const bookingIndex = userBookings.findIndex(function(b) { return b.bookingId === bookingId; });
            
            if (bookingIndex >= 0) {
                const booking = userBookings[bookingIndex];
                
                // Free up the room
                const roomIndex = allRoomsData.findIndex(function(r) { return r.roomId === booking.roomId; });
                if (roomIndex >= 0) {
                    allRoomsData[roomIndex].status = 'Available';
                }
                
                // Update booking status
                userBookings[bookingIndex].status = 'Cancelled';
            }
            
            showMessage('Booking #' + bookingId + ' cancelled successfully');
            loadMyBookings();
            
        } catch (error) {
            showMessage('Failed to cancel booking: ' + error.message, true);
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Check availability button
        checkAvailabilityBtn.addEventListener('click', loadAvailableRooms);
        
        // Booking form submit
        bookingForm.addEventListener('submit', handleBookingSubmit);
        
        // Room selection change - show summary
        roomSelect.addEventListener('change', updateBookingSummary);
        
        // Update checkout min date when checkin changes
        checkInDate.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            selectedDate.setDate(selectedDate.getDate() + 1);
            checkOutDate.min = selectedDate.toISOString().split('T')[0];
            
            // Clear checkout if it's before new minimum
            if (checkOutDate.value && new Date(checkOutDate.value) <= new Date(this.value)) {
                checkOutDate.value = '';
            }
            
            // Clear room selection when dates change
            roomSelect.innerHTML = '<option value="">-- Check availability first --</option>';
            const summaryDiv = document.getElementById('bookingSummary');
            if (summaryDiv) summaryDiv.remove();
        });
        
        // Also update summary when checkout changes
        checkOutDate.addEventListener('change', updateBookingSummary);
    }
    
    // Initialize page
    init();
});

