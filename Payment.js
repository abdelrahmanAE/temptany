/**
 * Payment Class - Represents a payment transaction
 * 
 * OOP Concepts Used:
 * - Encapsulation: Payment data with behavior
 * - Factory Method: static fromApiResponse()
 * - Builder Pattern: Receipt generation
 */
class Payment {
    constructor(id, bookingId, amount, paymentMethod, paymentDate, status, receiptNumber) {
        this.id = id;
        this.bookingId = bookingId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paymentDate = new Date(paymentDate);
        this.status = status;
        this.receiptNumber = receiptNumber || '';
        
        // Additional display properties
        this.customerName = '';
        this.roomNumber = '';
    }
    
    // Check payment status
    isCompleted() {
        return this.status === 'Completed';
    }
    
    isPending() {
        return this.status === 'Pending';
    }
    
    isRefunded() {
        return this.status === 'Refunded';
    }
    
    // Get CSS class for status badge
    getStatusClass() {
        const statusMap = {
            'Completed': 'status-completed',
            'Pending': 'status-pending',
            'Refunded': 'status-refunded'
        };
        return statusMap[this.status] || 'status-pending';
    }
    
    // Factory Method
    static fromApiResponse(data) {
        const payment = new Payment(
            data.paymentId || data.paymentID,
            data.bookingId || data.bookingID,
            data.amount,
            data.paymentMethod,
            data.paymentDate,
            data.status,
            data.receiptNumber
        );
        payment.customerName = data.customerName || '';
        payment.roomNumber = data.roomNumber || '';
        return payment;
    }
    
    // Convert to API object
    toApiObject() {
        return {
            bookingId: this.bookingId,
            amount: this.amount,
            paymentMethod: this.paymentMethod
        };
    }
    
    // Format date for display
    formatDate() {
        return this.paymentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Format amount with currency (Egyptian Pounds)
    formatAmount() {
        return 'EGP ' + this.amount.toLocaleString();
    }
    
    // Generate receipt number if not exists
    generateReceiptNumber() {
        if (!this.receiptNumber) {
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            this.receiptNumber = `RCP-${timestamp}-${random}`;
        }
        return this.receiptNumber;
    }
    
    // Create table row for payments list
    createTableRow() {
        const tr = document.createElement('tr');
        tr.dataset.paymentId = this.id;
        
        tr.innerHTML = `
            <td>${this.id}</td>
            <td>${this.bookingId}</td>
            <td>${this.formatAmount()}</td>
            <td>${this.paymentMethod}</td>
            <td>${this.formatDate()}</td>
            <td><span class="status ${this.getStatusClass()}">${this.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-small" data-action="receipt" data-id="${this.id}">
                    View Receipt
                </button>
            </td>
        `;
        return tr;
    }
}

/**
 * Receipt Builder - Builds receipt HTML (Builder Pattern)
 */
class ReceiptBuilder {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.receiptData = {
            hotelName: 'El Hotel',
            address: '15 Corniche El Nil, Garden City, Cairo, Egypt',
            phone: '+20 2 2795 1234',
            receiptNumber: '',
            date: '',
            bookingId: '',
            customerName: '',
            roomNumber: '',
            checkInDate: '',
            checkOutDate: '',
            nights: 0,
            paymentMethod: '',
            amount: 0
        };
        return this;
    }
    
    setReceiptNumber(number) {
        this.receiptData.receiptNumber = number;
        return this;
    }
    
    setDate(date) {
        this.receiptData.date = date;
        return this;
    }
    
    setBookingId(id) {
        this.receiptData.bookingId = id;
        return this;
    }
    
    setCustomer(name) {
        this.receiptData.customerName = name;
        return this;
    }
    
    setRoom(roomNumber) {
        this.receiptData.roomNumber = roomNumber;
        return this;
    }
    
    setStayDates(checkIn, checkOut, nights) {
        this.receiptData.checkInDate = checkIn;
        this.receiptData.checkOutDate = checkOut;
        this.receiptData.nights = nights;
        return this;
    }
    
    setPayment(method, amount) {
        this.receiptData.paymentMethod = method;
        this.receiptData.amount = amount;
        return this;
    }
    
    // Build the final receipt HTML
    build() {
        const data = this.receiptData;
        return `
            <div class="receipt-header">
                <h3>${data.hotelName}</h3>
                <p>${data.address}</p>
                <p>Phone: ${data.phone}</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-row">
                    <span>Receipt No:</span>
                    <span>${data.receiptNumber}</span>
                </div>
                <div class="receipt-row">
                    <span>Date:</span>
                    <span>${data.date}</span>
                </div>
                <div class="receipt-row">
                    <span>Booking ID:</span>
                    <span>${data.bookingId}</span>
                </div>
                ${data.customerName ? `
                <div class="receipt-row">
                    <span>Customer:</span>
                    <span>${data.customerName}</span>
                </div>` : ''}
                ${data.roomNumber ? `
                <div class="receipt-row">
                    <span>Room:</span>
                    <span>${data.roomNumber}</span>
                </div>` : ''}
                ${data.nights > 0 ? `
                <div class="receipt-row">
                    <span>Stay:</span>
                    <span>${data.nights} night(s)</span>
                </div>` : ''}
                <div class="receipt-row">
                    <span>Payment Method:</span>
                    <span>${data.paymentMethod}</span>
                </div>
                <div class="receipt-row receipt-total">
                    <span>Total Amount:</span>
                    <span>EGP ${data.amount.toLocaleString()}</span>
                </div>
            </div>
            <div class="receipt-footer">
                <p>Thank you for staying with us!</p>
            </div>
        `;
    }
}

