// ===== DASHBOARD INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = checkAuth();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    // Display user info
    displayUserInfo(user);
    // Load dashboard data
    loadDashboardData();
    
    // Setup event listeners
    setupDashboardListeners();
});
// ===== DISPLAY USER INFO =====
function displayUserInfo(user) {
    // Update user avatar
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.textContent = user.avatar || user.name.charAt(0).toUpperCase();
    }
    // Update user name
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = user.name;
    }
 // Update welcome message
    const welcomeMessage = document.querySelector('.welcome-content h1');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    }
}

// ===== LOAD DASHBOARD DATA =====
function loadDashboardData() {
    // Load stats
    loadStats();
    
    // Load recent scans
    loadRecentScans();
    
    // Load risk chart
    loadRiskChart();
}

function loadStats() {
    // In production, fetch from API
    // For demo, use mock data
    const stats = {
        totalScans: 47,
        vulnerabilities: 156,
        fixedIssues: 89,
        securityScore: 72
    };
