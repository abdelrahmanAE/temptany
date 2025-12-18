/**
 * DemoModeToggle Component
 * Allows users to toggle between fake database and real API
 */
class DemoModeToggle {
    constructor() {
        this.toggle = null;
        this.indicator = null;
    }
    
    /**
     * Create toggle button
     */
    createToggle() {
        const container = document.createElement('div');
        container.id = 'demoModeToggle';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: white;
            border: 2px solid #2c5282;
            border-radius: 8px;
            padding: 10px 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 14px;
        `;
        
        const label = document.createElement('label');
        label.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'demoModeCheckbox';
        checkbox.checked = fakeDB.isDemoMode();
        checkbox.style.cssText = 'width: 20px; height: 20px; cursor: pointer;';
        
        const text = document.createElement('span');
        text.textContent = '🔧 Demo Mode';
        text.style.cssText = 'font-weight: bold; color: #2c5282;';
        
        this.indicator = document.createElement('span');
        this.indicator.id = 'demoModeStatus';
        this.updateIndicator();
        
        label.appendChild(checkbox);
        label.appendChild(text);
        label.appendChild(this.indicator);
        container.appendChild(label);
        
        // Add event listener
        checkbox.addEventListener('change', () => {
            this.handleToggle();
        });
        
        this.toggle = checkbox;
        return container;
    }
    
    /**
     * Update indicator text
     */
    updateIndicator() {
        if (!this.indicator) return;
        
        const isDemo = fakeDB.isDemoMode();
        this.indicator.textContent = isDemo ? ' (ON)' : ' (OFF)';
        this.indicator.style.color = isDemo ? '#c05621' : '#38a169';
    }
    
    /**
     * Handle toggle change
     */
    handleToggle() {
        const isEnabled = this.toggle.checked;
        
        if (isEnabled) {
            fakeDB.enableDemoMode();
            this.showNotification('Demo Mode Enabled - Using browser localStorage', false);
        } else {
            fakeDB.disableDemoMode();
            this.showNotification('Demo Mode Disabled - Using real API', false);
        }
        
        this.updateIndicator();
        
        // Reload page to apply changes
        setTimeout(() => {
            if (confirm('Demo mode changed. Reload page to apply changes?')) {
                window.location.reload();
            }
        }, 500);
    }
    
    /**
     * Show notification
     */
    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 10px;
            z-index: 1001;
            background: ${isError ? '#fed7d7' : '#c6f6d5'};
            border: 1px solid ${isError ? '#c53030' : '#38a169'};
            color: ${isError ? '#c53030' : '#276749'};
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Initialize and add to page
     */
    init() {
        const container = this.createToggle();
        document.body.appendChild(container);
    }
}

// Auto-initialize if on login or register page
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for scripts to load
    setTimeout(function() {
        // Make sure FakeDatabase is loaded
        if (typeof fakeDB !== 'undefined' && typeof fakeDB.isDemoMode === 'function') {
            const toggle = new DemoModeToggle();
            toggle.init();
        } else {
            console.warn('FakeDatabase not loaded. Demo mode toggle unavailable.');
        }
    }, 100);
});

