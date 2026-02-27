// ===== GLOBAL VARIABLES =====
const API_URL = 'http://localhost:8080/api';
let selectedFiles = [];

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    if (window.location.pathname.includes('results.html')) {
        displayResults();
    } else {
        initUploadPage();
    }
});

// ===== UPLOAD PAGE FUNCTIONS =====
function initUploadPage() {
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.getElementById('uploadBox');
    const scanButton = document.getElementById('scanButton');

    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });
    }

    // Drag and drop handlers
    if (uploadBox) {
        uploadBox.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadBox.classList.add('drag-over');
        });

        uploadBox.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadBox.classList.remove('drag-over');
        });

        uploadBox.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadBox.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });

        // Click to open file dialog
        uploadBox.addEventListener('click', function(e) {
            if (e.target !== fileInput && !e.target.closest('.file-label')) {
                fileInput.click();
            }
        });
    }
}

function handleFiles(files) {
    selectedFiles = Array.from(files);
    displaySelectedFiles();
    
    const scanButton = document.getElementById('scanButton');
    if (scanButton) {
        scanButton.disabled = selectedFiles.length === 0;
    }
}

function displaySelectedFiles() {
    const container = document.getElementById('selectedFiles');
    if (!container) return;

    if (selectedFiles.length === 0) {
        container.classList.remove('show');
        return;
    }

    container.classList.add('show');
    container.innerHTML = '<h3>Selected Files:</h3>';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-item-icon">📄</div>
            <div class="file-item-name">${file.name}</div>
            <div class="file-item-size">${formatFileSize(file.size)}</div>
        `;
        container.appendChild(fileItem);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== SCAN FUNCTION =====
async function scanFiles() {
    if (selectedFiles.length === 0) {
        alert('Please select at least one file!');
        return;
    }

    // Show loading
    const loading = document.getElementById('loading');
    const scanButton = document.getElementById('scanButton');
    
    if (loading) loading.classList.add('show');
    if (scanButton) scanButton.disabled = true;

    try {
        // Scan files locally (no backend needed for demo)
        const results = await scanFilesLocally(selectedFiles);
        
        // Save results
        localStorage.setItem('scanResults', JSON.stringify(results));
        
        // Navigate to results
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 2000);
        
    } catch (error) {
        console.error('Scan error:', error);
        alert('Error scanning files: ' + error.message);
        if (loading) loading.classList.remove('show');
        if (scanButton) scanButton.disabled = false;
    }
}

async function scanFilesLocally(files) {
    let allVulns = [];
    let totalLines = 0;

    for (const file of files) {
        const content = await readFileContent(file);
        const lines = content.split('\n');
        totalLines += lines.length;
        
        const vulns = scanCode(content, file.name, lines);
        allVulns = allVulns.concat(vulns);
    }

    const riskScore = calculateRisk(allVulns);
    const riskData = getRiskLevel(riskScore);

    return {
        scanId: generateId(),
        riskScore: riskScore,
        riskLevel: riskData.level,
        riskMessage: riskData.message,
        riskColor: riskData.color,
        totalFiles: files.length,
        totalLines: totalLines,
        vulnerabilities: allVulns,
        timestamp: new Date().toISOString()
    };
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// ===== VULNERABILITY DETECTION =====
const PATTERNS = [
    {
        regex: /KeyPairGenerator\.getInstance\s*\(\s*["']RSA["']\s*\)/g,
        type: 'RSA Key Generation',
        severity: 'HIGH',
        recommendation: 'Replace with CRYSTALS-Kyber for key encapsulation'
    },
    {
        regex: /Cipher\.getInstance\s*\(\s*["']RSA/g,
        type: 'RSA Encryption',
        severity: 'HIGH',
        recommendation: 'Use Kyber for key exchange combined with AES for encryption'
    },
    {
        regex: /Signature\.getInstance\s*\(\s*["'].*ECDSA["']\s*\)/g,
        type: 'ECDSA Signature',
        severity: 'HIGH',
        recommendation: 'Replace with CRYSTALS-Dilithium or FALCON digital signatures'
    },
    {
        regex: /KeyAgreement\.getInstance\s*\(\s*["']DH["']\s*\)/g,
        type: 'Diffie-Hellman Key Exchange',
        severity: 'MEDIUM',
        recommendation: 'Replace with Kyber key encapsulation mechanism'
    },
    {
        regex: /EllipticCurve|ECParameterSpec|ECGenParameterSpec/g,
        type: 'Elliptic Curve Cryptography',
        severity: 'HIGH',
        recommendation: 'Migrate to lattice-based or hash-based cryptography'
    },
    {
        regex: /\bDSA\b|DSAKeyPairGenerator/g,
        type: 'DSA Signature',
        severity: 'HIGH',
        recommendation: 'Replace with CRYSTALS-Dilithium digital signatures'
    },
    {
        regex: /RSA_new|RSA_generate_key|RSA_public_encrypt/g,
        type: 'OpenSSL RSA (C/C++)',
        severity: 'HIGH',
        recommendation: 'Use liboqs for post-quantum alternatives in C/C++'
    },
    {
        regex: /from\s+Crypto\.PublicKey\s+import\s+RSA|RSA\.generate/g,
        type: 'Python RSA',
        severity: 'HIGH',
        recommendation: 'Use pqcrypto library for quantum-safe algorithms in Python'
    },
    {
        regex: /crypto\.createSign|crypto\.createVerify/g,
        type: 'Node.js Crypto (possibly RSA/ECDSA)',
        severity: 'MEDIUM',
        recommendation: 'Verify algorithm used; migrate to post-quantum alternatives'
    }
];

function scanCode(code, filename, lines) {
    const vulnerabilities = [];

    PATTERNS.forEach(pattern => {
        lines.forEach((line, index) => {
            // Reset regex
            pattern.regex.lastIndex = 0;
            
            if (pattern.regex.test(line)) {
                vulnerabilities.push({
                    file: filename,
                    line: index + 1,
                    code: line.trim(),
                    type: pattern.type,
                    severity: pattern.severity,
                    recommendation: pattern.recommendation
                });
            }
        });
    });

    return vulnerabilities;
}

function calculateRisk(vulnerabilities) {
    let score = 0;
    
    vulnerabilities.forEach(vuln => {
        switch (vuln.severity) {
            case 'HIGH':
                score += 15;
                break;
            case 'MEDIUM':
                score += 8;
                break;
            case 'LOW':
                score += 5;
                break;
        }
    });
    
    return Math.min(score, 100);
}

function getRiskLevel(score) {
    if (score >= 70) {
        return {
            level: 'HIGH',
            message: 'CRITICAL - Immediate migration required! Your code has significant quantum vulnerabilities.',
            color: '#dc3545'
        };
    } else if (score >= 40) {
        return {
            level: 'MEDIUM',
            message: 'WARNING - Plan migration within 6 months. Moderate quantum vulnerabilities detected.',
            color: '#ffc107'
        };
    } else {
        return {
            level: 'LOW',
            message: 'GOOD - Minimal quantum vulnerability detected. Continue monitoring for best practices.',
            color: '#28a745'
        };
    }
}

// ===== RESULTS PAGE FUNCTIONS =====
function displayResults() {
    const resultsStr = localStorage.getItem('scanResults');
    
    if (!resultsStr) {
        window.location.href = 'index.html';
        return;
    }

    const results = JSON.parse(resultsStr);
    
    // Display scan date
    const scanDate = document.getElementById('scanDate');
    if (scanDate) {
        const date = new Date(results.timestamp);
        scanDate.textContent = `Scanned on ${date.toLocaleString()}`;
    }

    // Display stats
    const filesScanned = document.getElementById('filesScanned');
    const vulnsFound = document.getElementById('vulnsFound');
    const linesScanned = document.getElementById('linesScanned');
    
    if (filesScanned) filesScanned.textContent = results.totalFiles;
    if (vulnsFound) vulnsFound.textContent = results.vulnerabilities.length;
    if (linesScanned) linesScanned.textContent = results.totalLines || 0;

    // Display risk score
    const scoreElement = document.getElementById('score');
    const riskLevelElement = document.getElementById('riskLevel');
    const riskMessageElement = document.getElementById('riskMessage');
    
    if (scoreElement) {
        scoreElement.textContent = results.riskScore;
        scoreElement.className = results.riskLevel.toLowerCase() + '-risk';
    }
    
    if (riskLevelElement) {
        const badge = document.createElement('span');
        badge.className = `risk-badge ${results.riskLevel.toLowerCase()}`;
        badge.textContent = `${results.riskLevel} RISK`;
        riskLevelElement.innerHTML = '';
        riskLevelElement.appendChild(badge);
    }
    
    if (riskMessageElement) {
        riskMessageElement.textContent = results.riskMessage;
    }

    // Display vulnerabilities
    displayVulnerabilities(results.vulnerabilities);

    // Create chart
    createVulnerabilityChart(results.vulnerabilities);
}

function displayVulnerabilities(vulnerabilities) {
    const vulnList = document.getElementById('vulnList');
    if (!vulnList) return;

    if (vulnerabilities.length === 0) {
        vulnList.innerHTML = `
            <div class="no-vuln">
                ✅ Excellent! No quantum vulnerabilities detected.<br>
                Your code appears to be quantum-safe.
            </div>
        `;
        return;
    }

    vulnList.innerHTML = '';
    
    vulnerabilities.forEach((vuln, index) => {
        const vulnCard = document.createElement('div');
        vulnCard.className = `vuln-item ${vuln.severity.toLowerCase()}`;
        
        vulnCard.innerHTML = `
            <div class="vuln-header">
                <div class="vuln-number">${index + 1}</div>
                <div class="vuln-type">${vuln.type}</div>
                <span class="severity-badge ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
            </div>
            <div class="vuln-details">
                <p><strong>📁 File:</strong> ${vuln.file}</p>
                <p><strong>📍 Line:</strong> ${vuln.line}</p>
                <p><strong>💻 Code:</strong> <code>${escapeHtml(vuln.code)}</code></p>
                <div class="vuln-recommendation">
                    <p><strong>✅ Recommendation:</strong> ${vuln.recommendation}</p>
                </div>
            </div>
        `;
        
        vulnList.appendChild(vulnCard);
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== CHART CREATION =====
function createVulnerabilityChart(vulnerabilities) {
    const canvas = document.getElementById('vulnChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Count vulnerabilities by type
    const typeCounts = {};
    vulnerabilities.forEach(vuln => {
        typeCounts[vuln.type] = (typeCounts[vuln.type] || 0) + 1;
    });

    const types = Object.keys(typeCounts);
    const counts = Object.values(typeCounts);

    if (types.length === 0) {
        ctx.font = '20px Segoe UI';
        ctx.fillStyle = '#28a745';
        ctx.textAlign = 'center';
        ctx.fillText('✓ No vulnerabilities found!', canvas.width / 2, canvas.height / 2);
        return;
    }

    const maxCount = Math.max(...counts);
    const barWidth = Math.min(60, (canvas.width - 40) / types.length - 20);
    const chartHeight = canvas.height - 80;
    const colors = ['#667eea', '#764ba2', '#e74c3c', '#f39c12', '#3498db'];

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    types.forEach((type, i) => {
        const height = (counts[i] / maxCount) * chartHeight;
        const x = 40 + i * (barWidth + 20);
        const y = canvas.height - height - 50;

        // Draw bar
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barWidth, height);

        // Draw count on top
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(counts[i], x + barWidth / 2, y - 10);

        // Draw label
        ctx.save();
        ctx.translate(x + barWidth / 2, canvas.height - 30);
        ctx.rotate(-Math.PI / 4);
        ctx.font = '12px Segoe UI';
        ctx.textAlign = 'right';
        ctx.fillText(type.substring(0, 20), 0, 0);
        ctx.restore();
    });

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Vulnerability Types Found', canvas.width / 2, 25);
}

// ===== PDF GENERATION =====
function downloadReport() {
    const results = JSON.parse(localStorage.getItem('scanResults'));
    if (!results) {
        alert('No scan results found');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(102, 126, 234);
    doc.text('Quantum Security Report', 105, 20, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const date = new Date(results.timestamp);
    doc.text(`Generated: ${date.toLocaleString()}`, 105, 28, { align: 'center' });

    // Summary Box
    doc.setFillColor(248, 249, 250);
    doc.rect(20, 35, 170, 35, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('SUMMARY', 25, 43);
    
    doc.setFont(undefined, 'normal');
    doc.text(`Risk Score: ${results.riskScore}/100 (${results.riskLevel} RISK)`, 25, 50);
    doc.text(`Files Scanned: ${results.totalFiles}`, 25, 57);
    doc.text(`Vulnerabilities Found: ${results.vulnerabilities.length}`, 25, 64);

    // Vulnerabilities Section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Detected Vulnerabilities', 20, 80);

    let y = 90;
    
    if (results.vulnerabilities.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(40, 167, 69);
        doc.text('✓ No vulnerabilities detected! Your code is quantum-safe.', 25, y);
    } else {
        results.vulnerabilities.forEach((vuln, index) => {
            // Check if we need a new page
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            
            // Set color based on severity
            if (vuln.severity === 'HIGH') {
                doc.setTextColor(220, 53, 69);
            } else if (vuln.severity === 'MEDIUM') {
                doc.setTextColor(255, 193, 7);
            } else {
                doc.setTextColor(40, 167, 69);
            }
            
            doc.text(`${index + 1}. ${vuln.type}`, 25, y);
            
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.setFont(undefined, 'normal');
            doc.text(`File: ${vuln.file} | Line: ${vuln.line}`, 25, y + 5);
            doc.text(`Severity: ${vuln.severity}`, 25, y + 10);
            
            // Word wrap for recommendation
            const lines = doc.splitTextToSize(`Fix: ${vuln.recommendation}`, 160);
            doc.text(lines, 25, y + 15);
            
            y += 25 + (lines.length * 5);
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Generated by Quantum Shield', 105, 285, { align: 'center' });
    }

    // Save
    doc.save(`quantum-security-report-${results.scanId}.pdf`);
}

// ===== NAVIGATION =====
function goBack() {
    localStorage.removeItem('scanResults');
    window.location.href = 'index.html';
}

// ===== UTILITY FUNCTIONS =====
function generateId() {
    return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
function transformCode(vulnType, code) {
    // Navigate to transformer page with pre-filled data
    const params = new URLSearchParams({
        type: vulnType,
        code: encodeURIComponent(code)
    });
    
    window.location.href = `code-transformer.html?${params.toString()}`;
}

// Make function available globally
window.transformCode = transformCode;
