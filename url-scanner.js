// ===== URL SCANNER IMPLEMENTATION =====

let selectedPlatform = 'github';

// ===== PLATFORM SELECTION =====
function selectPlatform(platform) {
    selectedPlatform = platform;
    
    // Update UI
    document.querySelectorAll('.platform-option').forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`[data-platform="${platform}"]`).classList.add('active');
    
    // Update placeholder
    const urlInput = document.getElementById('repoUrl');
    const placeholders = {
        'github': 'https://github.com/username/repository',
        'gitlab': 'https://gitlab.com/username/repository',
        'bitbucket': 'https://bitbucket.org/username/repository',
        'website': 'https://example.com'
    };
    
    urlInput.placeholder = placeholders[platform];
}

// ===== FILL EXAMPLE URL =====
function fillExample(platform) {
    const examples = {
        'github': 'https://github.com/bitcoin/bitcoin',
        'gitlab': 'https://gitlab.com/gitlab-org/gitlab',
        'website': 'https://example.com'
    };
    
    document.getElementById('repoUrl').value = examples[platform];
    selectPlatform(platform);
}

// ===== START URL SCAN =====
async function startUrlScan() {
    const urlInput = document.getElementById('repoUrl').value.trim();
    
    if (!urlInput) {
        alert('Please enter a repository URL');
        return;
    }
    
    // Validate URL
    if (!isValidUrl(urlInput)) {
        alert('Please enter a valid URL');
        return;
    }
    
    // Show progress section
    document.getElementById('progressSection').classList.add('active');
    document.querySelector('.scan-button').disabled = true;
    
    try {
        // Step 1: Fetch repository
        await updateProgress(1, 'Fetching repository information...');
        const repoData = await fetchRepository(urlInput);
        await sleep(1000);
        
        // Step 2: Download files
        await updateProgress(2, `Downloading ${repoData.fileCount} files...`);
        const files = await downloadFiles(repoData);
        await sleep(1500);
        
        // Step 3: Analyze code
        await updateProgress(3, `Analyzing ${files.length} source files...`);
        const results = await analyzeFiles(files);
        await sleep(2000);
        
        // Step 4: Generate report
        await updateProgress(4, 'Generating comprehensive report...');
        await sleep(1000);
        
        // Save results
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && window.DB) {
            DB.scans.save({
                userId: user.id,
                projectName: repoData.name,
                sourceUrl: urlInput,
                ...results
            });
        }
        
        localStorage.setItem('scanResults', JSON.stringify(results));
        
        // Redirect to results
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 1000);
        
    } catch (error) {
        console.error('Scan error:', error);
        alert('Error scanning repository: ' + error.message);
        document.getElementById('progressSection').classList.remove('active');
        document.querySelector('.scan-button').disabled = false;
    }
}

// ===== UPDATE PROGRESS =====
async function updateProgress(step, message) {
    // Update progress bar
    const progress = (step / 4) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').textContent = Math.round(progress) + '%';
    
    // Update step icons
    for (let i = 1; i <= step; i++) {
        const icon = document.getElementById(`step${i}Icon`);
        if (i < step) {
            icon.classList.remove('active');
            icon.classList.add('completed');
            icon.textContent = '✓';
        } else if (i === step) {
            icon.classList.add('active');
        }
    }
    
    // Update status message
    document.getElementById(`step${step}Status`).textContent = message;
}

// ===== FETCH REPOSITORY DATA =====
async function fetchRepository(url) {
    // Parse URL to determine platform and repo details
    const urlInfo = parseRepoUrl(url);
    
    if (urlInfo.platform === 'github') {
        return await fetchGitHubRepo(urlInfo);
    } else if (urlInfo.platform === 'gitlab') {
        return await fetchGitLabRepo(urlInfo);
    } else if (urlInfo.platform === 'website') {
        return await fetchWebsite(url);
    }
    
    throw new Error('Unsupported platform');
}

// ===== PARSE REPOSITORY URL =====
function parseRepoUrl(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        
        if (hostname.includes('github.com')) {
            return {
                platform: 'github',
                owner: pathParts[0],
                repo: pathParts[1],
                url: url
            };
        } else if (hostname.includes('gitlab.com')) {
            return {
                platform: 'gitlab',
                owner: pathParts[0],
                repo: pathParts[1],
                url: url
            };
        } else {
            return {
                platform: 'website',
                url: url
            };
        }
    } catch (e) {
        throw new Error('Invalid URL format');
    }
}

// ===== FETCH GITHUB REPOSITORY (WITH AUTHENTICATION) =====
async function fetchGitHubRepo(urlInfo) {
    // Get token from localStorage
    const token = localStorage.getItem('github_token');
    
    // Setup headers
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    // Add authentication if token exists
    if (token) {
        headers['Authorization'] = `token ${token}`;
        console.log('✓ Using authenticated GitHub API (5,000 req/hour)');
    } else {
        console.log('⚠️ Using unauthenticated GitHub API (60 req/hour)');
    }
    
    const apiUrl = `https://api.github.com/repos/${urlInfo.owner}/${urlInfo.repo}`;
    
    try {
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Repository not found');
            } else if (response.status === 401) {
                throw new Error('Invalid or expired GitHub token. Please update in Settings.');
            } else if (response.status === 403) {
                throw new Error('Rate limit exceeded. Please add a GitHub token in Settings.');
            } else {
                throw new Error(`GitHub API error: ${response.status}`);
            }
        }
        
        const repoData = await response.json();
        
        // Check if repo is private and we have access
        if (repoData.private && !token) {
            throw new Error('This is a private repository. Please add a GitHub token in Settings.');
        }
        
        // Get repository tree (list of files)
        const treeUrl = `https://api.github.com/repos/${urlInfo.owner}/${urlInfo.repo}/git/trees/${repoData.default_branch}?recursive=1`;
        const treeResponse = await fetch(treeUrl, { headers });
        
        if (!treeResponse.ok) {
            throw new Error('Failed to fetch repository files');
        }
        
        const treeData = await treeResponse.json();
        
        // Filter for source code files
        const sourceFiles = treeData.tree.filter(file => 
            file.type === 'blob' && isSourceCodeFile(file.path)
        );
        
        return {
            name: repoData.name,
            description: repoData.description,
            stars: repoData.stargazers_count,
            language: repoData.language,
            fileCount: sourceFiles.length,
            files: sourceFiles,
            defaultBranch: repoData.default_branch,
            owner: urlInfo.owner,
            repo: urlInfo.repo,
            isPrivate: repoData.private
        };
    } catch (error) {
        throw error;
    }
}

// ===== DOWNLOAD FILES FROM GITHUB =====
async function downloadFiles(repoData) {
    const downloadedFiles = [];
    const maxFiles = 100; // Limit for demo (to avoid rate limits)
    
    // Take first N files
    const filesToDownload = repoData.files.slice(0, maxFiles);
    
    for (const file of filesToDownload) {
        try {
            // Download file content
            const rawUrl = `https://raw.githubusercontent.com/${repoData.owner}/${repoData.repo}/${repoData.defaultBranch}/${file.path}`;
            const response = await fetch(rawUrl);
            const content = await response.text();
            
            downloadedFiles.push({
                name: file.path.split('/').pop(),
                path: file.path,
                content: content,
                size: file.size
            });
            
            // Small delay to avoid rate limiting
            await sleep(50);
            
        } catch (error) {
            console.error(`Failed to download ${file.path}:`, error);
        }
    }
    
    return downloadedFiles;
}

// ===== ANALYZE FILES =====
async function analyzeFiles(files) {
    let allVulns = [];
    let totalLines = 0;
    
    for (const file of files) {
        const lines = file.content.split('\n');
        totalLines += lines.length;
        
        // Use existing scanner logic
        const vulns = scanCode(file.content, file.path, lines);
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

// ===== CHECK IF SOURCE CODE FILE =====
function isSourceCodeFile(path) {
    const extensions = ['.java', '.cpp', '.c', '.h', '.py', '.js', '.ts', 
                       '.go', '.php', '.rb', '.cs', '.swift', '.kt', '.rs'];
    
    return extensions.some(ext => path.toLowerCase().endsWith(ext));
}

// ===== SCAN CODE (REUSE EXISTING FUNCTION) =====
function scanCode(code, filename, lines) {
    const vulnerabilities = [];
    
    // Reuse patterns from scanner.js
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
            recommendation: 'Use Kyber for key exchange combined with AES'
        },
        {
            regex: /Signature\.getInstance\s*\(\s*["'].*ECDSA["']\s*\)/g,
            type: 'ECDSA Signature',
            severity: 'HIGH',
            recommendation: 'Replace with CRYSTALS-Dilithium'
        },
        {
            regex: /KeyAgreement\.getInstance\s*\(\s*["']DH["']\s*\)/g,
            type: 'Diffie-Hellman Key Exchange',
            severity: 'MEDIUM',
            recommendation: 'Replace with Kyber KEM'
        }
    ];
    
    PATTERNS.forEach(pattern => {
        lines.forEach((line, index) => {
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

// ===== CALCULATE RISK =====
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

// ===== GET RISK LEVEL =====
function getRiskLevel(score) {
    if (score >= 70) {
        return {
            level: 'HIGH',
            message: 'CRITICAL - Immediate migration required!',
            color: '#dc3545'
        };
    } else if (score >= 40) {
        return {
            level: 'MEDIUM',
            message: 'WARNING - Plan migration within 6 months.',
            color: '#ffc107'
        };
    } else {
        return {
            level: 'LOW',
            message: 'GOOD - Minimal quantum vulnerability.',
            color: '#28a745'
        };
    }
}

// ===== UTILITY FUNCTIONS =====
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId() {
    return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
// ===== CHECK REMAINING RATE LIMIT =====
async function checkRateLimit() {
    const token = localStorage.getItem('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');
    
    const headers = {};
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }
    
    try {
        const response = await fetch('https://api.github.com/rate_limit', { headers });
        const data = await response.json();
        
        console.log('GitHub API Rate Limit:', data.rate);
        
        return {
            limit: data.rate.limit,
            remaining: data.rate.remaining,
            reset: new Date(data.rate.reset * 1000)
        };
    } catch (error) {
        console.error('Failed to check rate limit:', error);
        return null;
    }
}

// Call this before scanning
async function showRateLimitInfo() {
    const rateLimit = await checkRateLimit();
    
    if (rateLimit) {
        console.log(`API Calls Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
        
        if (rateLimit.remaining < 10) {
            alert(`⚠️ Warning: Only ${rateLimit.remaining} API calls remaining!\n\nResets at: ${rateLimit.reset.toLocaleString()}\n\nConsider adding a GitHub token in Settings for 5,000 requests/hour.`);
        }
    }
}

// Export functions
window.selectPlatform = selectPlatform;
window.fillExample = fillExample;
window.startUrlScan = startUrlScan;
