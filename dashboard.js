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
    // Update stat cards (if elements exist)
    const statsElements = {
        totalScans: document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-value'),
        vulnerabilities: document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-value'),
        fixedIssues: document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-value'),
        securityScore: document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-value')
    };
    
    if (statsElements.totalScans) statsElements.totalScans.textContent = stats.totalScans;
    if (statsElements.vulnerabilities) statsElements.vulnerabilities.textContent = stats.vulnerabilities;
    if (statsElements.fixedIssues) statsElements.fixedIssues.textContent = stats.fixedIssues;
    if (statsElements.securityScore) statsElements.securityScore.textContent = stats.securityScore + '%';
}

function loadRecentScans() {
    // Mock data for recent scans
    const scans = [
        {
            project: 'BankingApp',
            date: '2026-02-15',
            files: 12,
            riskScore: 85,
            status: 'completed'
        },
        {
            project: 'E-Commerce',
            date: '2026-02-14',
            files: 8,
            riskScore: 45,
            status: 'completed'
        },
        {
            project: 'Mobile App',
            date: '2026-02-13',
            files: 15,
            riskScore: 22,
            status: 'completed'
        }
    ];
    
