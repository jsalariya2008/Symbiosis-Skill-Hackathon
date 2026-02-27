// ===== LOCAL STORAGE DATABASE SIMULATION =====
// This simulates a database using browser localStorage
// In production, replace with real backend API calls

const DB = {
    // ===== USERS =====
    users: {
        // Save a new user
        save(user) {
            const users = this.getAll();
            
            // Check if user already exists
            const existing = users.find(u => u.email === user.email);
            if (existing) {
                throw new Error('User already exists');
            }
            
            // Add timestamp
            user.createdAt = new Date().toISOString();
            
            users.push(user);
            localStorage.setItem('db_users', JSON.stringify(users));
            return user;
        },
        
        // Get all users
        getAll() {
            return JSON.parse(localStorage.getItem('db_users') || '[]');
        },
        
        // Find user by email
        findByEmail(email) {
            const users = this.getAll();
            return users.find(u => u.email === email);
        },
        
        // Find user by ID
        findById(userId) {
            const users = this.getAll();
            return users.find(u => u.id === userId);
        },
        
        // Update user
        update(userId, updates) {
            const users = this.getAll();
            const index = users.findIndex(u => u.id === userId);
            
            if (index !== -1) {
                users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
                localStorage.setItem('db_users', JSON.stringify(users));
                return users[index];
            }
            return null;
        },
        
        // Delete user
        delete(userId) {
            const users = this.getAll();
            const filtered = users.filter(u => u.id !== userId);
            localStorage.setItem('db_users', JSON.stringify(filtered));
            return true;
        }
    },
    
    // ===== SCANS =====
    scans: {
        // Save a new scan
        save(scan) {
            const scans = this.getAll();
            
            const scanWithId = {
                ...scan,
                id: scan.id || 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                createdAt: scan.createdAt || new Date().toISOString()
            };
            
            scans.push(scanWithId);
            localStorage.setItem('db_scans', JSON.stringify(scans));
            
            console.log('✓ Scan saved to database:', scanWithId.id);
            return scanWithId;
        },
        
        // Get all scans
        getAll() {
            return JSON.parse(localStorage.getItem('db_scans') || '[]');
        },
        
        // Get scans by user ID
        getByUser(userId) {
            const scans = this.getAll();
            return scans
                .filter(s => s.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        
        // Get scan by ID
        getById(scanId) {
            const scans = this.getAll();
            return scans.find(s => s.id === scanId);
        },
        
        // Delete scan
        delete(scanId) {
            const scans = this.getAll();
            const filtered = scans.filter(s => s.id !== scanId);
            localStorage.setItem('db_scans', JSON.stringify(filtered));
            return true;
        },
        
        // Get statistics for a user
        getStats(userId) {
            const userScans = this.getByUser(userId);
            
            if (userScans.length === 0) {
                return {
                    totalScans: 0,
                    totalVulnerabilities: 0,
                    fixedIssues: 0,
                    securityScore: 0
                };
            }
            
            const totalScans = userScans.length;
            
            // Count total vulnerabilities
            const totalVulns = userScans.reduce((sum, scan) => 
                sum + (scan.vulnerabilities?.length || 0), 0
            );
            
            // Calculate fixed issues (improvement over time)
            let fixedIssues = 0;
            for (let i = 1; i < userScans.length; i++) {
                const currentVulns = userScans[i].vulnerabilities?.length || 0;
                const previousVulns = userScans[i-1].vulnerabilities?.length || 0;
                
                if (currentVulns < previousVulns) {
                    fixedIssues += (previousVulns - currentVulns);
                }
            }
            
            // Calculate average security score (100 - average risk score)
            const avgRiskScore = userScans.reduce((sum, s) => sum + (s.riskScore || 0), 0) / userScans.length;
            const securityScore = Math.max(0, Math.min(100, Math.round(100 - avgRiskScore)));
            
            return {
                totalScans,
                totalVulnerabilities: totalVulns,
                fixedIssues,
                securityScore
            };
        },
        
        // Get recent scans (last N scans)
        getRecent(userId, limit = 5) {
            return this.getByUser(userId).slice(0, limit);
        }
    },
    
    // ===== TRANSFORMATIONS =====
    transformations: {
        // Save a code transformation
        save(transformation) {
            const transformations = this.getAll();
            
            const transformWithId = {
                ...transformation,
                id: 'transform_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString()
            };
            
            transformations.push(transformWithId);
            localStorage.setItem('db_transformations', JSON.stringify(transformations));
            return transformWithId;
        },
        
        // Get all transformations
        getAll() {
            return JSON.parse(localStorage.getItem('db_transformations') || '[]');
        },
        
        // Get transformations by user
        getByUser(userId) {
            const transformations = this.getAll();
            return transformations
                .filter(t => t.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        
        // Get transformation by ID
        getById(transformId) {
            const transformations = this.getAll();
            return transformations.find(t => t.id === transformId);
        },
        
        // Delete transformation
        delete(transformId) {
            const transformations = this.getAll();
            const filtered = transformations.filter(t => t.id !== transformId);
            localStorage.setItem('db_transformations', JSON.stringify(filtered));
            return true;
        }
    },
    
    // ===== SETTINGS =====
    settings: {
        // Save user settings
        save(userId, settings) {
            const allSettings = this.getAll();
            allSettings[userId] = {
                ...settings,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('db_settings', JSON.stringify(allSettings));
            return allSettings[userId];
        },
        
        // Get all settings
        getAll() {
            return JSON.parse(localStorage.getItem('db_settings') || '{}');
        },
        
        // Get settings for a user
        getByUser(userId) {
            const allSettings = this.getAll();
            return allSettings[userId] || {};
        },
        
        // Update specific setting
        update(userId, key, value) {
            const settings = this.getByUser(userId);
            settings[key] = value;
            return this.save(userId, settings);
        }
    },
    
    // ===== UTILITY FUNCTIONS =====
    
    // Clear all data
    clearAll() {
        localStorage.removeItem('db_users');
        localStorage.removeItem('db_scans');
        localStorage.removeItem('db_transformations');
        localStorage.removeItem('db_settings');
        console.log('✓ All database data cleared');
    },
    
    // Clear only scan data
    clearScans() {
        localStorage.removeItem('db_scans');
        console.log('✓ Scan data cleared');
    },
    
    // Export all data
    exportData() {
        return {
            users: this.users.getAll(),
            scans: this.scans.getAll(),
            transformations: this.transformations.getAll(),
            settings: this.settings.getAll(),
            exportedAt: new Date().toISOString()
        };
    },
    
    // Import data
    importData(data) {
        if (data.users) {
            localStorage.setItem('db_users', JSON.stringify(data.users));
        }
        if (data.scans) {
            localStorage.setItem('db_scans', JSON.stringify(data.scans));
        }
        if (data.transformations) {
            localStorage.setItem('db_transformations', JSON.stringify(data.transformations));
        }
        if (data.settings) {
            localStorage.setItem('db_settings', JSON.stringify(data.settings));
        }
        console.log('✓ Data imported successfully');
    },
    
    // Get database statistics
    getStats() {
        return {
            totalUsers: this.users.getAll().length,
            totalScans: this.scans.getAll().length,
            totalTransformations: this.transformations.getAll().length,
            storageUsed: this.getStorageSize()
        };
    },
    
    // Get storage size in KB
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    },
    
    // Check if storage is available
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// ===== INITIALIZE DATABASE =====
(function initializeDatabase() {
    if (!DB.isAvailable()) {
        console.error('❌ localStorage is not available!');
        alert('Warning: Browser storage is disabled. Data will not be saved.');
        return;
    }
    
    console.log('✓ Database initialized');
    console.log('Storage used:', DB.getStorageSize());
    
    // Log stats
    const stats = DB.getStats();
    console.log('Database stats:', stats);
})();

// ===== EXPORT TO WINDOW =====
if (typeof window !== 'undefined') {
    window.DB = DB;
}

// ===== HELPER FUNCTIONS =====

// Generate unique ID
function generateId(prefix = 'id') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Export helper functions
window.generateId = generateId;
window.formatDate = formatDate;

// ===== DEMO DATA GENERATOR (FOR TESTING) =====

function generateDemoData() {
    console.log('Generating demo data...');
    
    // Create demo user
    const demoUser = {
        id: 'user_demo_123',
        email: 'demo@quantumshield.dev',
        name: 'Demo User',
        avatar: 'D'
    };
    
    // Save demo user (if not exists)
    try {
        DB.users.save(demoUser);
    } catch (e) {
        console.log('Demo user already exists');
    }
    
    // Create demo scans
    const vulnerabilityTypes = [
        'RSA Key Generation',
        'ECDSA Signature',
        'Diffie-Hellman Key Exchange',
        'DSA Signature',
        'Elliptic Curve Cryptography'
    ];
    
    const projectNames = [
        'BankingApp',
        'E-Commerce Platform',
        'Mobile API',
        'Crypto Wallet',
        'Authentication Service',
        'Payment Gateway',
        'Healthcare Portal',
        'IoT Device Firmware'
    ];
    
    for (let i = 0; i < 10; i++) {
        const vulnCount = Math.floor(Math.random() * 20) + 1;
        const vulnerabilities = [];
        
        for (let j = 0; j < vulnCount; j++) {
            vulnerabilities.push({
                type: vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)],
                file: `File${j + 1}.java`,
                line: Math.floor(Math.random() * 100) + 1,
                code: 'KeyPairGenerator.getInstance("RSA")',
                severity: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
                recommendation: 'Replace with CRYSTALS-Kyber'
            });
        }
        
        const riskScore = Math.min(100, vulnCount * (Math.random() * 10 + 5));
        const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
        
        DB.scans.save({
            userId: demoUser.id,
            projectName: projectNames[i % projectNames.length],
            riskScore: Math.round(riskScore),
            riskLevel: riskLevel,
            riskMessage: 'Auto-generated demo scan',
            totalFiles: Math.floor(Math.random() * 20) + 5,
            totalLines: Math.floor(Math.random() * 10000) + 1000,
            vulnerabilities: vulnerabilities,
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    console.log('✓ Demo data generated!');
    console.log('Stats:', DB.getStats());
}

// Export demo data generator
window.generateDemoData = generateDemoData;

// ===== AUTO-CLEANUP OLD DATA =====
// Clean up scans older than 90 days (optional)
function cleanupOldScans(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const allScans = DB.scans.getAll();
    const recentScans = allScans.filter(scan => 
        new Date(scan.createdAt) > cutoffDate
    );
    
    const deletedCount = allScans.length - recentScans.length;
    
    if (deletedCount > 0) {
        localStorage.setItem('db_scans', JSON.stringify(recentScans));
        console.log(`✓ Cleaned up ${deletedCount} old scans`);
    }
    
    return deletedCount;
}

window.cleanupOldScans = cleanupOldScans;

console.log('✓ storage.js loaded successfully');
