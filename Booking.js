/**
 * Booking Class - Represents a room booking/reservation
 * 
 * OOP Concepts Used:
 * - Encapsulation: Booking data with behavior methods
 * - Factory Method: static fromApiResponse()
 * - State Pattern: Status determines available actions
 */
class Booking {
    constructor(id, customerId, roomId, checkInDate, checkOutDate, status, totalAmount, notes) {
        this.id = id;
        this.customerId = customerId;
        this.roomId = roomId;
        this.checkInDate = new Date(checkInDate);
        this.checkOutDate = new Date(checkOutDate);
        this.status = status;
        this.totalAmount = totalAmount || 0;
        this.notes = notes || '';
        
        // Additional display properties (populated from API joins)
        this.customerName = '';
        this.roomNumber = '';
        this.roomType = '';
    }
    
    // Calculate number of nights
    getNights() {
        const diffTime = this.checkOutDate - this.checkInDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // State-based checks - what actions are available
    
    // Can booking be cancelled?
    canCancel() {
        return this.status === 'Pending' || this.status === 'Confirmed';
    }
    
    // Can guest check in?
    canCheckIn() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(this.checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        return this.status === 'Confirmed' && checkIn <= today;
    }
    
    // Can guest check out?
    canCheckOut() {
        return this.status === 'CheckedIn';
    }
    
    // Is booking pending?
    isPending() {
        return this.status === 'Pending';
    }
    
    // Is booking confirmed?
    isConfirmed() {
        return this.status === 'Confirmed';
    }
    
    // Is guest checked in?
    isCheckedIn() {
        return this.status === 'CheckedIn';
    }
    
    // Is booking completed (checked out)?
    isCompleted() {
        return this.status === 'CheckedOut';
    }
    
    // Is booking cancelled?
    isCancelled() {
        return this.status === 'Cancelled';
    }
    
    // Get CSS class for status badge
    getStatusClass() {
        const statusMap = {
            'Pending': 'status-pending',
            'Confirmed': 'status-confirmed',
            'CheckedIn': 'status-checkedin',
            'CheckedOut': 'status-checkedout',
            'Cancelled': 'status-cancelled'
        };
        return statusMap[this.status] || 'status-pending';
    }
    
    // Factory Method - create Booking from API response
    static fromApiResponse(data) {
        const booking = new Booking(
            data.bookingId || data.bookingID,
            data.customerId || data.customerID,
            data.roomId || data.roomID,
            data.checkInDate,
            data.checkOutDate,
            data.status,
            data.totalAmount,
            data.notes
        );
        
        // Set additional display properties if available
        booking.customerName = data.customerName || '';
        booking.roomNumber = data.roomNumber || '';
        booking.roomType = data.roomType || '';
        
        return booking;
    }
    
    // Convert to API object for creating/updating
    toApiObject() {
        return {
            roomId: this.roomId,
            checkInDate: this.formatDateForApi(this.checkInDate),
            checkOutDate: this.formatDateForApi(this.checkOutDate),
            notes: this.notes
        };
    }
    
    // Format date for display (human readable)
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Format date for API (YYYY-MM-DD)
    formatDateForApi(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Template Method - create table row for bookings list
    createTableRow(showActions = true) {
        const tr = document.createElement('tr');
        tr.dataset.bookingId = this.id;
        
        let actionsHtml = '';
        if (showActions) {
            const actions = [];
            if (this.canCancel()) {
                actions.push(`<button class="btn btn-danger btn-small" data-action="cancel" data-id="${this.id}">Cancel</button>`);
            }
            actionsHtml = `<td>${actions.join(' ')}</td>`;
        }
        
        tr.innerHTML = `
            <td>${this.id}</td>
            <td>${this.roomNumber || 'Room ' + this.roomId}</td>
            <td>${this.formatDate(this.checkInDate)}</td>
            <td>${this.formatDate(this.checkOutDate)}</td>
            <td><span class="status ${this.getStatusClass()}">${this.status}</span></td>
            <td>EGP ${this.totalAmount ? this.totalAmount.toLocaleString() : '0'}</td>
            ${actionsHtml}
        `;
        return tr;
    }
    
    // Create table row for check-in list
    createCheckInRow() {
        const tr = document.createElement('tr');
        tr.dataset.bookingId = this.id;
        
        let actionBtn = '';
        if (this.canCheckIn()) {
            actionBtn = `<button class="btn btn-success btn-small" data-action="checkin" data-id="${this.id}">Check In</button>`;
        }
        
        tr.innerHTML = `
            <td>${this.id}</td>
            <td>${this.customerName}</td>
            <td>${this.roomNumber}</td>
            <td>${this.formatDate(this.checkInDate)}</td>
            <td>${this.formatDate(this.checkOutDate)}</td>
            <td><span class="status ${this.getStatusClass()}">${this.status}</span></td>
            <td>${actionBtn}</td>
        `;
        return tr;
    }
    
    // Create table row for check-out list
    createCheckOutRow() {
        const tr = document.createElement('tr');
        tr.dataset.bookingId = this.id;
        
        let actionBtn = '';
        if (this.canCheckOut()) {
            actionBtn = `<button class="btn btn-primary btn-small" data-action="checkout" data-id="${this.id}">Check Out</button>`;
        }
        
        tr.innerHTML = `
            <td>${this.id}</td>
            <td>${this.customerName}</td>
            <td>${this.roomNumber}</td>
            <td>${this.formatDate(this.checkInDate)}</td>
            <td>${this.formatDate(this.checkOutDate)}</td>
            <td><span class="status ${this.getStatusClass()}">${this.status}</span></td>
            <td>${actionBtn}</td>
        `;
        return tr;
    }
}

