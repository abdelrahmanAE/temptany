/**
 * Register Page Controller
 * Handles user registration with form validation
 * Supports both real API and fake database (localStorage)
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registerForm = document.getElementById('registerForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const messageBox = document.getElementById('messageBox');
    
    // Check if already logged in
    if (User.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Initialize fake database
    if (typeof fakeDB === 'undefined') {
        console.error('FakeDatabase not loaded! Make sure FakeDatabase.js is included before this script.');
    }
    
    // Fake database will be used automatically if API fails
    
    /**
     * Show message to user
     */
    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.className = 'message-box ' + (isError ? 'error' : 'success');
        messageBox.classList.remove('hidden');
        
        if (!isError) {
            setTimeout(function() {
                messageBox.classList.add('hidden');
            }, 5000);
        }
    }
    
    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Validate form inputs
     */
    function validateForm() {
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!firstName) {
            showMessage('Please enter your first name', true);
            firstNameInput.focus();
            return false;
        }
        
        if (!lastName) {
            showMessage('Please enter your last name', true);
            lastNameInput.focus();
            return false;
        }
        
        if (!email) {
            showMessage('Please enter your email', true);
            emailInput.focus();
            return false;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', true);
            emailInput.focus();
            return false;
        }
        
        if (!username) {
            showMessage('Please enter a username', true);
            usernameInput.focus();
            return false;
        }
        
        if (username.length < 3) {
            showMessage('Username must be at least 3 characters', true);
            usernameInput.focus();
            return false;
        }
        
        if (!password) {
            showMessage('Please enter a password', true);
            passwordInput.focus();
            return false;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', true);
            passwordInput.focus();
            return false;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', true);
            confirmPasswordInput.focus();
            return false;
        }
        
        return true;
    }
    
    
    /**
     * Register using fake database
     */
    function registerWithFakeDB(userData) {
        if (!fakeDB || typeof fakeDB.createUser !== 'function') {
            throw new Error('Fake database not available');
        }
        
        try {
            // Create user in fake database
            const newUser = fakeDB.createUser(userData);
            
            console.log('User registered in fake database:', newUser);
            
            return {
                success: true,
                message: 'Registration successful! Your account has been created.',
                user: {
                    userId: newUser.userId,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            };
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Register using real API
     */
    async function registerWithAPI(userData) {
        try {
            const response = await api.register(userData);
            return {
                success: true,
                message: 'Registration successful! Your account has been created and saved to database.',
                user: response.user || null
            };
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Handle form submission
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const userData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };
        
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
        
        try {
            // Check if fakeDB is available
            const useFakeDB = fakeDB && typeof fakeDB.createUser === 'function';
            let result;
            
            // Try real API first
            try {
                console.log('Attempting to register with real API...');
                result = await registerWithAPI(userData);
            } catch (apiError) {
                // If API fails and fakeDB is available, fall back to fake database
                if (useFakeDB && (apiError.message.includes('Failed to fetch') || 
                    apiError.message.includes('NetworkError') || 
                    apiError.message.includes('ERR_CONNECTION_REFUSED'))) {
                    
                    console.log('API unavailable, using fake database instead...');
                    result = registerWithFakeDB(userData);
                    result.message = 'Registration successful! Data saved to browser storage.';
                } else {
                    throw apiError;
                }
            }
            
            // Show success message
            showMessage('✅ ' + result.message);
            
            // Redirect to login after delay
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            const errorMessage = error.message || 'Registration failed. Please try again.';
            
            // Show appropriate error message
            if (errorMessage.includes('Username already exists')) {
                showMessage('❌ Username already exists. Please choose a different username.', true);
            } else if (errorMessage.includes('Email already exists')) {
                showMessage('❌ Email already exists. Please use a different email.', true);
            } else {
                showMessage('❌ Registration failed: ' + errorMessage, true);
            }
            
            // Reset button
            submitBtn.textContent = 'Register';
            submitBtn.disabled = false;
        }
    }
    
    // Event Listeners
    registerForm.addEventListener('submit', handleSubmit);
    
    // Real-time password match validation
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value && this.value !== passwordInput.value) {
            this.style.borderColor = '#c53030';
        } else {
            this.style.borderColor = '#ccc';
        }
    });
    
    // Focus first input
    firstNameInput.focus();
});

