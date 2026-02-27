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

