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

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards and steps
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.feature-card, .step').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});

// ===== USER AUTHENTICATION STATE =====
function checkAuth() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    return checkAuth() !== null;
}

function getUser() {
    return checkAuth();
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    window.location.href = '../pages/landing.html';
}

// ===== EXPORT FUNCTIONS =====
window.toggleTheme = toggleTheme;
window.toggleMenu = toggleMenu;
window.checkAuth = checkAuth;
window.isLoggedIn = isLoggedIn;
window.getUser = getUser;
window.logout = logout;
