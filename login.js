/**
 * Login Page Controller
 * Uses DOM manipulation for all UI interactions
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - get references
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageBox = document.getElementById('messageBox');
    
    // Check if already logged in
    if (User.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    /**
     * Show message to user
     * @param {string} message - Message text
     * @param {boolean} isError - Is this an error message?
     */
    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.className = 'message-box ' + (isError ? 'error' : 'success');
        messageBox.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            messageBox.classList.add('hidden');
        }, 5000);
    }
    
    /**
     * Validate form inputs
     * @returns {boolean} - Is form valid?
     */
    function validateForm() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username) {
            showMessage('Please enter your username', true);
            usernameInput.focus();
            return false;
        }
        
        if (!password) {
            showMessage('Please enter your password', true);
            passwordInput.focus();
            return false;
        }
        
        return true;
    }
    
    /**
     * Login using fake database
     */
    function loginWithFakeDB(username, password) {
        if (!fakeDB || typeof fakeDB.authenticate !== 'function') {
            throw new Error('Fake database not available');
        }
        
        try {
            const userData = fakeDB.authenticate(username, password);
            
            return {
                token: 'fake-token-' + Date.now() + '-' + userData.userId,
                user: userData
            };
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Login using real API
     */
    async function loginWithAPI(username, password) {
        try {
            const response = await api.login(username, password);
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    
    // Fake database will be used automatically if API fails
    
    /**
     * Handle form submission
     * @param {Event} event - Form submit event
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        try {
            // Check if fakeDB is available
            const useFakeDB = fakeDB && typeof fakeDB.authenticate === 'function';
            let response;
            
            // Try real API first
            try {
                console.log('Attempting to login with real API...');
                response = await loginWithAPI(username, password);
            } catch (apiError) {
                // If API fails and fakeDB is available, fall back to fake database
                if (useFakeDB && (apiError.message.includes('Failed to fetch') || 
                    apiError.message.includes('NetworkError') || 
                    apiError.message.includes('ERR_CONNECTION_REFUSED'))) {
                    
                    console.log('API unavailable, using fake database instead...');
                    response = loginWithFakeDB(username, password);
                } else {
                    throw apiError;
                }
            }
            
            // Save token to session
            sessionStorage.setItem('authToken', response.token);
            
            // Create User object from response and save to session
            const user = User.fromApiResponse(response.user);
            user.saveToSession();
            
            showMessage('Login successful! Redirecting...');
            
            // Redirect to dashboard after short delay
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            // Login failed
            showMessage('Invalid username or password', true);
            submitBtn.textContent = 'Login';
            submitBtn.disabled = false;
        }
    }
    
    // Event Listeners
    loginForm.addEventListener('submit', handleSubmit);
    
    // Clear form on page load
    loginForm.reset();
    usernameInput.focus();
});

