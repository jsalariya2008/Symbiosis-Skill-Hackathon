// ===== THEME TOGGLE =====
let isDarkMode = false;

function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-icon').textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelector('.theme-icon').textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
});

// ===== MOBILE MENU TOGGLE =====
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (navMenu && navMenu.classList.contains('active')) {
        if (!event.target.closest('.nav-menu') && !event.target.closest('.hamburger')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});
