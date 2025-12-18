/**
 * ApiService - Handles all HTTP requests to the backend
 *
 * OOP Concepts Used:
 * - Single Responsibility: Only handles API communication
 * - Facade Pattern: Provides simple interface to complex HTTP operations
 * - Singleton-like: Usually one instance per app
 */
class ApiService {
  constructor(baseUrl) {
    // Base URL for API - change this to your backend URL
    // Try HTTP first if HTTPS fails (for development)
    this.baseUrl = baseUrl || "http://localhost:5000/api";
    this.httpsUrl = "https://localhost:5001/api";
  }

  // Get auth token from session storage
  getAuthToken() {
    return sessionStorage.getItem("authToken");
  }

  // Build headers with authentication
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API errors consistently
  handleError(error) {
    console.error("API Error:", error);
    throw error;
  }

  // ========================================
  // Generic HTTP Methods
  // ========================================

  // Generic GET request
  async get(endpoint) {
    try {
      //    waiting to complete the process
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        // fetching HTTP
        method: "GET",
        headers: this.getHeaders(),
      });
      //   3ks al intital boolean value
      if (!response.ok) {
        // 200-299
        const errorData = await response.json().catch(() => ({})); // sent to JSON
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      this.handleError(error); // handling errors to console
    }
  }

  // Generic POST request
  async post(endpoint, data) {
    // Try HTTP first, then HTTPS if HTTP fails
    let lastError = null;

    for (const baseUrl of [this.baseUrl, this.httpsUrl]) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        // If it's a network error, try the other URL
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          continue;
        }
        // If it's a business logic error, throw it immediately
        throw error;
      }
    }

    // If both URLs failed, throw the last error
    this.handleError(lastError);
  }

  // Generic PUT request
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ========================================
  // Auth Endpoints
  // ========================================

  async login(username, password) {
    return this.post("/auth/login", { username, password });
  }

  async register(userData) {
    return this.post("/auth/register", userData);
  }

  // ========================================
  // Room Endpoints
  // ========================================

  async getRooms() {
    return this.get("/rooms");
  }

  async getRoomById(id) {
    return this.get(`/rooms/${id}`);
  }

  async getAvailableRooms(checkIn, checkOut) {
    return this.get(`/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`);
  }

  async getRoomTypes() {
    return this.get("/rooms/types");
  }

  // ========================================
  // Booking Endpoints
  // ========================================

  async getBookings() {
    return this.get("/bookings");
  }

  async getBookingById(id) {
    return this.get(`/bookings/${id}`);
  }

  async getMyBookings() {
    return this.get("/bookings/my");
  }

  async createBooking(bookingData) {
    return this.post("/bookings", bookingData);
  }

  async updateBooking(id, bookingData) {
    return this.put(`/bookings/${id}`, bookingData);
  }

  async cancelBooking(id) {
    return this.put(`/bookings/${id}/cancel`, {});
  }

  async confirmBooking(id) {
    return this.put(`/bookings/${id}/confirm`, {});
  }

  // ========================================
  // Check-In/Out Endpoints
  // ========================================

  async checkIn(bookingId, notes) {
    return this.post(`/bookings/${bookingId}/checkin`, { notes });
  }

  async checkOut(bookingId, notes) {
    return this.post(`/bookings/${bookingId}/checkout`, { notes });
  }

  async getPendingCheckIns() {
    return this.get("/bookings/pending-checkins");
  }

  async getCurrentGuests() {
    return this.get("/bookings/current-guests");
  }

  // ========================================
  // Payment Endpoints
  // ========================================

  async getPayments() {
    return this.get("/payments");
  }

  async getPaymentById(id) {
    return this.get(`/payments/${id}`);
  }

  async getPaymentsByBooking(bookingId) {
    return this.get(`/payments/booking/${bookingId}`);
  }

  async createPayment(paymentData) {
    return this.post("/payments", paymentData);
  }

  async refundPayment(id) {
    return this.put(`/payments/${id}/refund`, {});
  }

  // ========================================
  // Report Endpoints
  // ========================================

  async getOccupancyReport(startDate, endDate) {
    return this.get(`/reports/occupancy?start=${startDate}&end=${endDate}`);
  }

  async getRevenueReport(startDate, endDate) {
    return this.get(`/reports/revenue?start=${startDate}&end=${endDate}`);
  }

  async getBookingsReport(startDate, endDate) {
    return this.get(`/reports/bookings?start=${startDate}&end=${endDate}`);
  }

  // ========================================
  // Staff Endpoints
  // ========================================

  async getStaff() {
    return this.get("/staff");
  }

  async getStaffById(id) {
    return this.get(`/staff/${id}`);
  }

  async createStaff(staffData) {
    return this.post("/staff", staffData);
  }

  async updateStaff(id, staffData) {
    return this.put(`/staff/${id}`, staffData);
  }

  async deactivateStaff(id) {
    return this.put(`/staff/${id}/deactivate`, {});
  }

  // ========================================
  // Customer Endpoints
  // ========================================

  async getCustomers() {
    return this.get("/customers");
  }

  async getCustomerById(id) {
    return this.get(`/customers/${id}`);
  }

  async updateCustomer(id, customerData) {
    return this.put(`/customers/${id}`, customerData);
  }
}

// Create global API instance
const api = new ApiService();
