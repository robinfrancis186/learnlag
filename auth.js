class Auth {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.checkAuthState();
    }

    initializeElements() {
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.authTabs = document.querySelectorAll('.auth-tab');
        this.forgotPasswordLink = document.getElementById('forgotPassword');
        this.googleButton = document.querySelector('.social-button.google');
        this.appleButton = document.querySelector('.social-button.apple');
    }

    initializeEventListeners() {
        // Tab switching
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        this.forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));

        // Social auth
        this.googleButton.addEventListener('click', () => this.handleGoogleAuth());
        this.appleButton.addEventListener('click', () => this.handleAppleAuth());
    }

    switchTab(tabName) {
        // Update tab buttons
        this.authTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update form visibility
        this.loginForm.classList.toggle('active', tabName === 'login');
        this.signupForm.classList.toggle('active', tabName === 'signup');
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const user = await this.loginUser(email, password);
            if (user) {
                this.setAuthToken(user.token);
                this.redirectToApp();
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        try {
            const user = await this.createUser(name, email, password);
            if (user) {
                this.setAuthToken(user.token);
                this.redirectToApp();
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async loginUser(email, password) {
        // For demonstration, using localStorage. In production, use a proper backend
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        return {
            ...user,
            token: this.generateToken()
        };
    }

    async createUser(name, email, password) {
        // For demonstration, using localStorage. In production, use a proper backend
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.email === email)) {
            throw new Error('Email already exists');
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return {
            ...newUser,
            token: this.generateToken()
        };
    }

    handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        
        if (!email) {
            this.showError('Please enter your email address');
            return;
        }

        // In production, implement proper password reset flow
        alert('Password reset link has been sent to your email');
    }

    handleGoogleAuth() {
        // Implement Google OAuth
        alert('Google authentication will be implemented');
    }

    handleAppleAuth() {
        // Implement Apple Sign In
        alert('Apple authentication will be implemented');
    }

    generateToken() {
        // In production, use proper JWT tokens
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    checkAuthState() {
        const token = this.getAuthToken();
        if (token) {
            this.redirectToApp();
        }
    }

    redirectToApp() {
        window.location.href = 'index.html';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;

        const container = document.querySelector('.auth-form.active');
        container.insertBefore(errorDiv, container.firstChild);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
}); 