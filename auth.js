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
