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
    
    const tableBody = document.getElementById('recentScans');
    if (!tableBody) return;
    
    tableBody.innerHTML = scans.map(scan => `
        <tr>
            <td><strong>${scan.project}</strong></td>
            <td>${formatDate(scan.date)}</td>
            <td>${scan.files}</td>
            <td class="risk-score-cell ${getRiskClass(scan.riskScore)}">${scan.riskScore}/100</td>
            <td><span class="status-badge ${scan.status}">${scan.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="viewScanDetails('${scan.project}')">
                    View Details
                </button>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getRiskClass(score) {
    if (score >= 70) return 'risk-high';
    if (score >= 40) return 'risk-medium';
    return 'risk-low';
}

function viewScanDetails(project) {
    // Redirect to results page or show modal
    alert(`View details for ${project} - Feature coming soon!`);
}

function loadRiskChart() {
    const canvas = document.getElementById('riskChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Mock data
    const data = {
        labels: ['RSA', 'ECDSA', 'DH', 'DSA', 'ECC'],
        values: [45, 32, 18, 12, 8]
    };
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple bar chart
    const maxValue = Math.max(...data.values);
    const barWidth = 60;
    const barSpacing = 100;
    const chartHeight = 300;
    const colors = ['#667eea', '#764ba2', '#e74c3c', '#f39c12', '#3498db'];
    
    data.values.forEach((value, i) => {
        const height = (value / maxValue) * chartHeight;
        const x = 50 + i * barSpacing;
        const y = canvas.height - height - 50;
        
        // Draw bar
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, barWidth, height);
        
        // Draw value on top
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + barWidth / 2, y - 10);
        
        // Draw label
        ctx.font = '14px Arial';
        ctx.fillText(data.labels[i], x + barWidth / 2, canvas.height - 20);
    });
}

// ===== EVENT LISTENERS =====
function setupDashboardListeners() {
    // User menu toggle
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', toggleUserMenu);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('userDropdown');
        const userMenu = document.querySelector('.user-menu');
        
        if (dropdown && !userMenu.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// ===== EXPORT FUNCTIONS =====
window.toggleUserMenu = toggleUserMenu;
window.viewScanDetails = viewScanDetails;

function scanPhishing() {
    const text = document.getElementById("phishText").value.toLowerCase();
    const url = document.getElementById("phishUrl").value.toLowerCase();
    const resultBox = document.getElementById("phishResult");

    if (!text && !url) {
        resultBox.innerHTML = "⚠️ Enter message or URL";
        return;
    }

    let score = 0;
    let findings = [];

    const phishingKeywords = [
        "quantum upgrade",
        "quantum safe",
        "upgrade encryption",
        "security upgrade required",
        "urgent action",
        "click immediately",
        "verify wallet",
        "crypto upgrade",
        "update security now"
    ];

    const brands = ["paypal", "metamask", "coinbase", "bank", "google", "microsoft"];
    const suspiciousTLDs = [".xyz", ".top", ".ru", ".tk", ".click"];

    phishingKeywords.forEach(word => {
        if (text.includes(word)) {
            score += 2;
            findings.push("⚠️ Phishing phrase detected: " + word);
        }
    });

    brands.forEach(brand => {
        if (text.includes(brand)) {
            score += 1;
            findings.push("⚠️ Brand impersonation: " + brand);
        }
    });

    if (url) {
        suspiciousTLDs.forEach(tld => {
            if (url.endsWith(tld)) {
                score += 2;
                findings.push("⚠️ Suspicious domain extension");
            }
        });

        if (url.includes("-")) {
            score += 1;
            findings.push("⚠️ Possible impersonation domain");
        }
    }

    let risk = "LOW";
    let color = "green";

    if (score >= 6) {
        risk = "HIGH";
        color = "red";
    } else if (score >= 3) {
        risk = "MEDIUM";
        color = "orange";
    }

    resultBox.innerHTML =
        `<span style="color:${color}">
            Risk Level: ${risk} (Score: ${score})
        </span><br>${findings.join("<br>")}`;
}
