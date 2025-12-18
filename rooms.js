/**
 * Rooms Page Controller
 * Display and filter hotel rooms
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navList = document.getElementById('navList');
    const filterForm = document.getElementById('filterForm');
    const checkInDate = document.getElementById('checkInDate');
    const checkOutDate = document.getElementById('checkOutDate');
    const roomTypeSelect = document.getElementById('roomType');
    const showAllBtn = document.getElementById('showAllBtn');
    const roomsGrid = document.getElementById('roomsGrid');
    const messageBox = document.getElementById('messageBox');
    
    // Store all rooms
    let allRooms = [];
    
    /**
     * Initialize page
     */
    function init() {
        updateNavigation();
        setMinDates();
        loadAllRooms();
        setupEventListeners();
    }
    
    /**
     * Update navigation based on login status
     */
    function updateNavigation() {
        const currentUser = User.loadFromSession();
        
        if (currentUser) {
            navList.innerHTML = `
                <li><a href="index.html">Home</a></li>
                <li><a href="rooms.html" class="active">Rooms</a></li>
                <li><a href="dashboard.html">Dashboard</a></li>
                <li><a href="#" id="logoutBtn">Logout</a></li>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                User.clearSession();
                window.location.href = 'login.html';
            });
        }
    }
    
    /**
     * Set minimum dates
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
     * Load all rooms
     */
    async function loadAllRooms() {
        try {
            // Demo data - 50 rooms across 5 floors (matching database)
            const roomsData = [
                // Floor 1 - Ground Floor (10 rooms)
                { roomId: 1, roomNumber: '101', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1, description: 'Ground floor single room with garden view' },
                { roomId: 2, roomNumber: '102', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1, description: 'Ground floor single room with garden view' },
                { roomId: 3, roomNumber: '103', roomTypeName: 'Single', floor: 1, status: 'Occupied', basePrice: 2500, capacity: 1, description: 'Ground floor single room near reception' },
                { roomId: 4, roomNumber: '104', roomTypeName: 'Double', floor: 1, status: 'Available', basePrice: 4000, capacity: 2, description: 'Ground floor double room with garden view' },
                { roomId: 5, roomNumber: '105', roomTypeName: 'Double', floor: 1, status: 'Available', basePrice: 4000, capacity: 2, description: 'Ground floor double room with garden view' },
                { roomId: 6, roomNumber: '106', roomTypeName: 'Double', floor: 1, status: 'Maintenance', basePrice: 4000, capacity: 2, description: 'Ground floor double room - under renovation' },
                { roomId: 7, roomNumber: '107', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1, description: 'Ground floor single room accessible' },
                { roomId: 8, roomNumber: '108', roomTypeName: 'Double', floor: 1, status: 'Available', basePrice: 4000, capacity: 2, description: 'Ground floor double room accessible' },
                { roomId: 9, roomNumber: '109', roomTypeName: 'Single', floor: 1, status: 'Available', basePrice: 2500, capacity: 1, description: 'Ground floor single room quiet zone' },
                { roomId: 10, roomNumber: '110', roomTypeName: 'Double', floor: 1, status: 'Occupied', basePrice: 4000, capacity: 2, description: 'Ground floor double room near pool' },
                
                // Floor 2 (10 rooms)
                { roomId: 11, roomNumber: '201', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2, description: 'Second floor double room with city view' },
                { roomId: 12, roomNumber: '202', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2, description: 'Second floor double room with city view' },
                { roomId: 13, roomNumber: '203', roomTypeName: 'Double', floor: 2, status: 'Occupied', basePrice: 4000, capacity: 2, description: 'Second floor double room corner unit' },
                { roomId: 14, roomNumber: '204', roomTypeName: 'Suite', floor: 2, status: 'Available', basePrice: 7500, capacity: 3, description: 'Second floor suite with balcony' },
                { roomId: 15, roomNumber: '205', roomTypeName: 'Suite', floor: 2, status: 'Available', basePrice: 7500, capacity: 3, description: 'Second floor suite with living area' },
                { roomId: 16, roomNumber: '206', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2, description: 'Second floor double room quiet zone' },
                { roomId: 17, roomNumber: '207', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2, description: 'Second floor double room' },
                { roomId: 18, roomNumber: '208', roomTypeName: 'Suite', floor: 2, status: 'Occupied', basePrice: 7500, capacity: 3, description: 'Second floor suite premium' },
                { roomId: 19, roomNumber: '209', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2, description: 'Second floor double room' },
                { roomId: 20, roomNumber: '210', roomTypeName: 'Double', floor: 2, status: 'Available', basePrice: 4000, capacity: 2, description: 'Second floor double room with Nile view' },
                
                // Floor 3 (10 rooms)
                { roomId: 21, roomNumber: '301', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3, description: 'Third floor suite with Nile view' },
                { roomId: 22, roomNumber: '302', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3, description: 'Third floor suite with balcony' },
                { roomId: 23, roomNumber: '303', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3, description: 'Third floor suite corner unit' },
                { roomId: 24, roomNumber: '304', roomTypeName: 'Deluxe', floor: 3, status: 'Occupied', basePrice: 10000, capacity: 4, description: 'Third floor deluxe room premium' },
                { roomId: 25, roomNumber: '305', roomTypeName: 'Deluxe', floor: 3, status: 'Available', basePrice: 10000, capacity: 4, description: 'Third floor deluxe room with jacuzzi' },
                { roomId: 26, roomNumber: '306', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3, description: 'Third floor suite' },
                { roomId: 27, roomNumber: '307', roomTypeName: 'Suite', floor: 3, status: 'Available', basePrice: 7500, capacity: 3, description: 'Third floor suite with city view' },
                { roomId: 28, roomNumber: '308', roomTypeName: 'Deluxe', floor: 3, status: 'Available', basePrice: 10000, capacity: 4, description: 'Third floor deluxe room' },
                { roomId: 29, roomNumber: '309', roomTypeName: 'Suite', floor: 3, status: 'Maintenance', basePrice: 7500, capacity: 3, description: 'Third floor suite - maintenance' },
                { roomId: 30, roomNumber: '310', roomTypeName: 'Deluxe', floor: 3, status: 'Available', basePrice: 10000, capacity: 4, description: 'Third floor deluxe room with Nile view' },
                
                // Floor 4 (10 rooms)
                { roomId: 31, roomNumber: '401', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4, description: 'Fourth floor deluxe room panoramic view' },
                { roomId: 32, roomNumber: '402', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4, description: 'Fourth floor deluxe room with terrace' },
                { roomId: 33, roomNumber: '403', roomTypeName: 'Deluxe', floor: 4, status: 'Occupied', basePrice: 10000, capacity: 4, description: 'Fourth floor deluxe room VIP' },
                { roomId: 34, roomNumber: '404', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4, description: 'Fourth floor deluxe room executive' },
                { roomId: 35, roomNumber: '405', roomTypeName: 'Suite', floor: 4, status: 'Available', basePrice: 7500, capacity: 3, description: 'Fourth floor suite' },
                { roomId: 36, roomNumber: '406', roomTypeName: 'Suite', floor: 4, status: 'Available', basePrice: 7500, capacity: 3, description: 'Fourth floor suite with office' },
                { roomId: 37, roomNumber: '407', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4, description: 'Fourth floor deluxe room' },
                { roomId: 38, roomNumber: '408', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4, description: 'Fourth floor deluxe room honeymoon' },
                { roomId: 39, roomNumber: '409', roomTypeName: 'Suite', floor: 4, status: 'Available', basePrice: 7500, capacity: 3, description: 'Fourth floor suite family' },
                { roomId: 40, roomNumber: '410', roomTypeName: 'Deluxe', floor: 4, status: 'Available', basePrice: 10000, capacity: 4, description: 'Fourth floor deluxe room with Nile view' },
                
                // Floor 5 - Penthouse (10 rooms)
                { roomId: 41, roomNumber: '501', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room with rooftop access' },
                { roomId: 42, roomNumber: '502', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room panoramic Nile view' },
                { roomId: 43, roomNumber: '503', roomTypeName: 'Deluxe', floor: 5, status: 'Occupied', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room presidential' },
                { roomId: 44, roomNumber: '504', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room with private terrace' },
                { roomId: 45, roomNumber: '505', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room executive suite' },
                { roomId: 46, roomNumber: '506', roomTypeName: 'Suite', floor: 5, status: 'Available', basePrice: 7500, capacity: 3, description: 'Fifth floor suite with city view' },
                { roomId: 47, roomNumber: '507', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room royal' },
                { roomId: 48, roomNumber: '508', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room with jacuzzi' },
                { roomId: 49, roomNumber: '509', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room honeymoon suite' },
                { roomId: 50, roomNumber: '510', roomTypeName: 'Deluxe', floor: 5, status: 'Available', basePrice: 10000, capacity: 4, description: 'Penthouse deluxe room VIP with butler service' }
            ];
            
            // Convert to Room objects
            allRooms = roomsData.map(function(r) {
                return Room.fromApiResponse(r);
            });
            
            displayRooms(allRooms);
            
        } catch (error) {
            showMessage('Failed to load rooms: ' + error.message, true);
        }
    }
    
    /**
     * Display rooms in grid
     */
    function displayRooms(rooms) {
        // Clear grid
        roomsGrid.innerHTML = '';
        
        if (rooms.length === 0) {
            roomsGrid.innerHTML = '<p>No rooms found matching your criteria.</p>';
            return;
        }
        
        // Add room cards using DOM
        rooms.forEach(function(room) {
            roomsGrid.appendChild(room.createRoomCard());
        });
    }
    
    /**
     * Filter rooms based on form inputs
     */
    async function filterRooms(event) {
        event.preventDefault();
        
        const checkIn = checkInDate.value;
        const checkOut = checkOutDate.value;
        const roomType = roomTypeSelect.value;
        
        // Start with all rooms
        let filteredRooms = allRooms.slice();
        
        // Validate dates if both provided
        if (checkIn && checkOut) {
            if (new Date(checkOut) <= new Date(checkIn)) {
                showMessage('Check-out date must be after check-in date', true);
                return;
            }
        }
        
        // If any date is provided, filter by availability
        if (checkIn || checkOut) {
            filteredRooms = filteredRooms.filter(function(room) {
                return room.isAvailable();
            });
        }
        
        // Filter by room type
        if (roomType) {
            filteredRooms = filteredRooms.filter(function(room) {
                return room.roomType === roomType;
            });
        }
        
        // Display results
        displayRooms(filteredRooms);
        
        // Show appropriate message
        if (filteredRooms.length === 0) {
            showMessage('No rooms found matching your criteria', true);
        } else if (checkIn && checkOut) {
            showMessage('Found ' + filteredRooms.length + ' available room(s) for selected dates');
        } else if (roomType) {
            showMessage('Found ' + filteredRooms.length + ' ' + roomType + ' room(s)');
        } else {
            showMessage('Found ' + filteredRooms.length + ' available room(s)');
        }
    }
    
    /**
     * Show all rooms
     */
    function showAllRooms() {
        filterForm.reset();
        displayRooms(allRooms);
        showMessage('Showing all ' + allRooms.length + ' rooms');
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        filterForm.addEventListener('submit', filterRooms);
        showAllBtn.addEventListener('click', showAllRooms);
        
        // Update checkout min when checkin changes
        checkInDate.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            selectedDate.setDate(selectedDate.getDate() + 1);
            checkOutDate.min = selectedDate.toISOString().split('T')[0];
        });
    }
    
    // Initialize page
    init();
});

