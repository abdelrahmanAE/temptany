/**
 * User Class - Following Head First OOP principles
 * Encapsulates user data and behavior
 *
 * OOP Concepts Used:
 * - Encapsulation: Private fields with controlled access , 2nd chapter head first OOP
 * - Factory Method: static fromApiResponse()
 * - Single Responsibility: Only handles user-related logic
 */
class User {
  // Constructor - initialize object state
  constructor(id, username, email, role) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.isLoggedIn = false;
  }

  // Getter - controlled access to role
  getRole() {
    return this.role;
  }

  // Check if user is admin
  isAdmin() {
    return this.role === "Admin";
  }

  // Check if user is staff (includes admin)
  isStaff() {
    return this.role === "Staff" || this.role === "Admin";
  }

  // Check if user is customer
  isCustomer() {
    return this.role === "Customer";
  }

  // Check if user has specific permission
  // Uses permission mapping (Strategy-like pattern)
  hasPermission(permission) {
    const permissions = {
      Admin: [
        "all",
        "dashboard",
        "rooms",
        "bookings",
        "checkin",
        "checkout",
        "payments",
        "reports",
        "staff",
      ],
      Staff: [
        "dashboard",
        "rooms",
        "bookings",
        "checkin",
        "checkout",
        "payments",
        "reports",
      ],
      Customer: ["dashboard", "rooms", "bookings", "payments"],
    };

    const userPermissions = permissions[this.role] || [];
    return (
      userPermissions.includes("all") || userPermissions.includes(permission)
    );
  }

  // Factory Method Pattern - creates User from API response
  static fromApiResponse(data) {
    return new User(data.userId, data.username, data.email, data.role);
  }

  // Convert to plain object for API
  toApiObject() {
    return {
      userId: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
    };
  }

  // Serialize and save to session storage
  saveToSession() {
    sessionStorage.setItem("currentUser", JSON.stringify(this.toApiObject()));
  }

  // Factory Method - loads User from session storage
  static loadFromSession() {
    const data = sessionStorage.getItem("currentUser");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const user = User.fromApiResponse(parsed);
        user.isLoggedIn = true;
        return user;
      } catch (e) {
        console.error("Failed to parse user from session:", e);
        return null;
      }
    }
    return null;
  }

  // Clear session (logout)
  static clearSession() {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
  }

  // Check if user is logged in (static utility)
  static isAuthenticated() {
    return sessionStorage.getItem("authToken") !== null;
  }

  // Get auth token
  static getToken() {
    return sessionStorage.getItem("authToken");
  }
}

// Navigation Builder - builds nav based on user role
// Follows Single Responsibility Principle
class NavigationBuilder {
  constructor(user) {
    this.user = user;
  }
  // DOM
  // Build main navigation HTML
  buildMainNav() {
    const items = [
      { text: "Home", href: "index.html" },
      { text: "Dashboard", href: "dashboard.html" },
      { text: "Logout", href: "#", id: "logoutBtn" },
    ];

    return items
      .map(
        (item) => `
            <li>
                <a href="${item.href}" ${item.id ? `id="${item.id}"` : ""}>
                    ${item.text}
                </a>
            </li>
        `
      )
      .join("");
  }

  // Build sidebar menu HTML based on permissions
  buildSidebar(currentPage) {
    const menuItems = [
      { text: "Dashboard", href: "dashboard.html", permission: "dashboard" },
      { text: "Rooms", href: "rooms.html", permission: "rooms" },
      { text: "Bookings", href: "bookings.html", permission: "bookings" },
      { text: "Check-In/Out", href: "checkin.html", permission: "checkin" },
      { text: "Payments", href: "payments.html", permission: "payments" },
      { text: "Reports", href: "reports.html", permission: "reports" },
      { text: "Staff", href: "staff.html", permission: "staff" },
    ];

    return menuItems
      .filter((item) => this.user.hasPermission(item.permission))
      .map((item) => {
        const isActive = item.href === currentPage ? 'class="active"' : "";
        return `<li><a href="${item.href}" ${isActive}>${item.text}</a></li>`;
      })
      .join("");
  }
}
