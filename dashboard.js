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
