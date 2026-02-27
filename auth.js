// ===== AUTHENTICATION FUNCTIONS =====

// ===== LOGIN HANDLER =====
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // Basic validation
    if (!email || !password) {
        showFormError('Please fill in all fields');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simulate API call (replace with real authentication)
    setTimeout(() => {
        // Mock authentication - in production, validate with backend
        const user = {
            id: 'user_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            avatar: email.charAt(0).toUpperCase()
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', 'mock_token_' + Date.now());
        
        if (remember) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Show success
        showFormSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    }, 1500);
}

// ===== REGISTER HANDLER =====
function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.querySelector('input[name="terms"]').checked;
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
        showFormError('Please fill in all fields');
        return;
    }
    
    if (password.length < 8) {
        showFormError('Password must be at least 8 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showFormError('Passwords do not match');
        return;
    }
    
    if (!terms) {
        showFormError('Please agree to the Terms of Service');
        return;
    }
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Create user
        const user = {
            id: 'user_' + Date.now(),
            email: email,
            name: fullName,
            avatar: fullName.charAt(0).toUpperCase()
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', 'mock_token_' + Date.now());
        
        // Show success
        showFormSuccess('Account created! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    }, 1500);
}

// ===== PASSWORD STRENGTH CHECKER =====
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            strengthIndicator.className = 'password-strength ' + strength;
        });
    }
});

function calculatePasswordStrength(password) {
    if (password.length === 0) return '';
    if (password.length < 8) return 'weak';
    
    let strength = 0;
    
    // Check length
    if (password.length >= 12) strength++;
    
    // Check for numbers
    if (/\d/.test(password)) strength++;
    
    // Check for lowercase and uppercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    
    // Check for special characters
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'medium';
    return 'strong';
}

// ===== FORM ERROR/SUCCESS MESSAGES =====
function showFormError(message) {
    // Remove any existing messages
    const existingError = document.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error show';
    errorDiv.textContent = message;
    errorDiv.style.background = '#f8d7da';
    errorDiv.style.border = '1px solid #f5c6cb';
    errorDiv.style.color = '#721c24';
    errorDiv.style.padding = '12px 15px';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.marginBottom = '20px';
    
    // Insert at top of form
    const form = document.querySelector('.auth-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showFormSuccess(message) {
    // Remove any existing messages
    const existingSuccess = document.querySelector('.form-success');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success show';
    successDiv.textContent = message;
    
    // Insert at top of form
    const form = document.querySelector('.auth-form');
    form.insertBefore(successDiv, form.firstChild);
}

// ===== CHECK IF ALREADY LOGGED IN =====
document.addEventListener('DOMContentLoaded', function() {
    // If on login/register page and already logged in, redirect to dashboard
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('register.html')) {
        
        const user = localStorage.getItem('user');
        if (user) {
            window.location.href = 'dashboard.html';
        }
    }
});

// ===== EXPORT FUNCTIONS =====
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
