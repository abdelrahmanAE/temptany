/**
 * Room Class - Represents a hotel room
 * 
 * OOP Concepts Used:
 * - Encapsulation: Room data bundled with methods
 * - Factory Method: static fromApiResponse()
 * - Template Method: createRoomCard() for DOM creation
 */
class Room {
    constructor(id, roomNumber, roomType, floor, status, price, capacity, description) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.floor = floor;
        this.status = status;
        this.price = price;
        this.capacity = capacity;
        this.description = description || '';
    }
    
    // Check if room is available
    isAvailable() {
        return this.status === 'Available';
    }
    
    // Check if room is occupied
    isOccupied() {
        return this.status === 'Occupied';
    }
    
    // Check if room is under maintenance
    isUnderMaintenance() {
        return this.status === 'Maintenance';
    }
    
    // Get CSS class for status badge
    getStatusClass() {
        return 'status-' + this.status.toLowerCase();
    }
    
    // Calculate price for given number of nights
    calculatePrice(nights) {
        return this.price * nights;
    }
    
    // Factory Method - create Room from API response
    static fromApiResponse(data) {
        return new Room(
            data.roomId || data.roomID,
            data.roomNumber,
            data.roomTypeName || data.roomType || data.typeName,
            data.floor,
            data.status,
            data.basePrice || data.price,
            data.capacity,
            data.description
        );
    }
    
    // Convert to API object
    toApiObject() {
        return {
            roomId: this.id,
            roomNumber: this.roomNumber,
            roomType: this.roomType,
            floor: this.floor,
            status: this.status,
            price: this.price,
            capacity: this.capacity
        };
    }
    
    // Template Method - creates DOM element for room card
    createRoomCard() {
        const card = document.createElement('div');
        card.className = 'room-detail-card';
        card.innerHTML = `
            <h4>Room ${this.roomNumber}</h4>
            <p><strong>Type:</strong> ${this.roomType}</p>
            <p><strong>Floor:</strong> ${this.floor}</p>
            <p><strong>Capacity:</strong> ${this.capacity} person(s)</p>
            <p><strong>Status:</strong> <span class="status ${this.getStatusClass()}">${this.status}</span></p>
            ${this.description ? `<p>${this.description}</p>` : ''}
            <p class="room-price">EGP ${this.price.toLocaleString()}/night</p>
        `;
        return card;
    }
    
    // Create option element for select dropdown
    createSelectOption() {
        const option = document.createElement('option');
        option.value = this.id;
        option.textContent = `Room ${this.roomNumber} - ${this.roomType} (EGP ${this.price.toLocaleString()}/night)`;
        option.disabled = !this.isAvailable();
        return option;
    }
    
    // Create table row element
    createTableRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${this.roomNumber}</td>
            <td>${this.roomType}</td>
            <td>${this.floor}</td>
            <td>${this.capacity}</td>
            <td>$${this.price}</td>
            <td><span class="status ${this.getStatusClass()}">${this.status}</span></td>
        `;
        return tr;
    }
}

/**
 * RoomType Class - Represents a type of room
 */
class RoomType {
    constructor(id, typeName, description, basePrice, capacity) {
        this.id = id;
        this.typeName = typeName;
        this.description = description;
        this.basePrice = basePrice;
        this.capacity = capacity;
    }
    
    static fromApiResponse(data) {
        return new RoomType(
            data.roomTypeId || data.roomTypeID,
            data.typeName,
            data.description,
            data.basePrice,
            data.capacity
        );
    }
}

