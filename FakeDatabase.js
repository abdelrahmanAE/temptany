/**
 * FakeDatabase - LocalStorage-based fake database
 * Stores user data in browser localStorage
 * 
 * OOP Concepts:
 * - Singleton Pattern: Single instance manages all fake data
 * - Factory Pattern: Creates user objects
 * - Repository Pattern: Handles data storage/retrieval
 */
class FakeDatabase {
    constructor() {
        this.storageKey = 'fakeHotelUsers';
        this.currentUserIdKey = 'fakeHotelCurrentUserId';
        this.demoModeKey = 'hotelDemoMode';
        
        // Initialize if empty
        this.initialize();
    }
    
    /**
     * Initialize fake database with default users
     */
    initialize() {
        if (!this.getAllUsers().length) {
            // Add default demo users
            const defaultUsers = [
                {
                    userId: 1,
                    username: 'admin',
                    email: 'admin@elhotel.eg',
                    firstName: 'Admin',
                    lastName: 'User',
                    phone: '',
                    passwordHash: this.hashPassword('admin123'),
                    role: 'Admin',
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    userId: 2,
                    username: 'ahmed',
                    email: 'ahmed@elhotel.eg',
                    firstName: 'Ahmed',
                    lastName: 'Hassan',
                    phone: '01012345678',
                    passwordHash: this.hashPassword('admin123'),
                    role: 'Staff',
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    userId: 3,
                    username: 'customer1',
                    email: 'omar@gmail.com',
                    firstName: 'Omar',
                    lastName: 'Ali',
                    phone: '01155566677',
                    passwordHash: this.hashPassword('admin123'),
                    role: 'Customer',
                    createdAt: new Date().toISOString(),
                    isActive: true
                }
            ];
            
            this.saveAllUsers(defaultUsers);
            this.setCurrentUserId(3); // Set next available ID
        }
    }
    
    /**
     * Simple password hashing simulation
     * In real app, use BCrypt or similar
     */
    hashPassword(password) {
        // Simple hash simulation - just for demo
        // In production, use proper hashing like BCrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'fake_hash_' + Math.abs(hash).toString(36);
    }
    
    /**
     * Verify password against hash
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
    
    /**
     * Get all users from localStorage
     */
    getAllUsers() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading fake database:', error);
            return [];
        }
    }
    
    /**
     * Save all users to localStorage
     */
    saveAllUsers(users) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Error saving to fake database:', error);
            return false;
        }
    }
    
    /**
     * Get user by username
     */
    getUserByUsername(username) {
        const users = this.getAllUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }
    
    /**
     * Get user by email
     */
    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    
    /**
     * Get user by ID
     */
    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.userId === userId);
    }
    
    /**
     * Check if username exists
     */
    usernameExists(username) {
        return this.getUserByUsername(username) !== undefined;
    }
    
    /**
     * Check if email exists
     */
    emailExists(email) {
        return this.getUserByEmail(email) !== undefined;
    }
    
    /**
     * Create new user
     */
    createUser(userData) {
        const users = this.getAllUsers();
        
        // Check if username exists
        if (this.usernameExists(userData.username)) {
            throw new Error('Username already exists');
        }
        
        // Check if email exists
        if (this.emailExists(userData.email)) {
            throw new Error('Email already exists');
        }
        
        // Get next user ID
        const nextId = this.getNextUserId();
        
        // Create user object
        const newUser = {
            userId: nextId,
            username: userData.username,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone || '',
            passwordHash: this.hashPassword(userData.password),
            role: 'Customer',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        // Add to users array
        users.push(newUser);
        
        // Save to localStorage
        if (this.saveAllUsers(users)) {
            this.setCurrentUserId(nextId + 1);
            return newUser;
        } else {
            throw new Error('Failed to save user to database');
        }
    }
    
    /**
     * Authenticate user (login)
     */
    authenticate(username, password) {
        const user = this.getUserByUsername(username);
        
        if (!user) {
            throw new Error('Invalid username or password');
        }
        
        if (!user.isActive) {
            throw new Error('Account is disabled');
        }
        
        if (!this.verifyPassword(password, user.passwordHash)) {
            throw new Error('Invalid username or password');
        }
        
        // Return user data (without password hash)
        return {
            userId: user.userId,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        };
    }
    
    /**
     * Get next available user ID
     */
    getNextUserId() {
        const currentId = parseInt(localStorage.getItem(this.currentUserIdKey) || '0');
        return currentId + 1;
    }
    
    /**
     * Set current user ID counter
     */
    setCurrentUserId(userId) {
        localStorage.setItem(this.currentUserIdKey, userId.toString());
    }
    
    /**
     * Check if demo mode is enabled
     */
    isDemoMode() {
        return localStorage.getItem(this.demoModeKey) === 'true';
    }
    
    /**
     * Enable demo mode
     */
    enableDemoMode() {
        localStorage.setItem(this.demoModeKey, 'true');
    }
    
    /**
     * Disable demo mode (use real API)
     */
    disableDemoMode() {
        localStorage.setItem(this.demoModeKey, 'false');
    }
    
    /**
     * Toggle demo mode
     */
    toggleDemoMode() {
        if (this.isDemoMode()) {
            this.disableDemoMode();
        } else {
            this.enableDemoMode();
        }
        return this.isDemoMode();
    }
    
    /**
     * Clear all fake data (for testing)
     */
    clearAll() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.currentUserIdKey);
        this.initialize();
    }
    
    /**
     * Get statistics
     */
    getStats() {
        const users = this.getAllUsers();
        return {
            totalUsers: users.length,
            customers: users.filter(u => u.role === 'Customer').length,
            staff: users.filter(u => u.role === 'Staff').length,
            admins: users.filter(u => u.role === 'Admin').length
        };
    }
}

// Create global instance
const fakeDB = new FakeDatabase();

