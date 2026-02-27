// ===== GLOBAL STATE =====
let currentTemplate = null;
let selectedCategory = 'all';
let batchFiles = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeTransformer();
    loadTemplates();
    setupEventListeners();
    initializeSyntaxHighlighting();
});

function initializeTransformer() {
    // Check if coming from results page with vulnerability data
    const urlParams = new URLSearchParams(window.location.search);
    const vulnType = urlParams.get('type');
    const vulnCode = urlParams.get('code');
    
    if (vulnType && vulnCode) {
        // Auto-load relevant template
        const template = findTemplateByType(vulnType);
        if (template) {
            selectTemplate(template.id);
            document.getElementById('beforeCode').value = decodeURIComponent(vulnCode);
            updateCodePreview('before');
        }
    }
}

// ===== TEMPLATE LOADING =====
function loadTemplates() {
    const templateList = document.getElementById('templateList');
    if (!templateList) return;
    
    templateList.innerHTML = '';
    
    Object.values(CODE_TEMPLATES).forEach(template => {
        if (selectedCategory === 'all' || template.language === selectedCategory) {
            const templateItem = createTemplateItem(template);
            templateList.appendChild(templateItem);
        }
    });
}

function createTemplateItem(template) {
    const div = document.createElement('div');
    div.className = 'template-item';
    div.dataset.templateId = template.id;
    
    div.innerHTML = `
        <div class="template-name">${template.name}</div>
        <div class="template-desc">${template.description}</div>
        <div class="template-tags">
            ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
        </div>
    `;
    
    div.onclick = () => selectTemplate(template.id);
    
    return div;
}

function selectTemplate(templateId) {
    currentTemplate = CODE_TEMPLATES[templateId];
    
    if (!currentTemplate) {
        console.error('Template not found:', templateId);
        return;
    }
    
    // Update UI - highlight selected template
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`[data-template-id="${templateId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Update template info banner
    const templateInfo = document.getElementById('templateInfo');
    if (templateInfo) {
        templateInfo.className = 'template-info selected';
        templateInfo.innerHTML = `
            <div class="info-content">
                <div class="info-icon">✓</div>
                <div class="info-text">
                    <strong>Selected:</strong> ${currentTemplate.name} - ${currentTemplate.description}
                </div>
            </div>
        `;
    }
    
    // Load template code into editors
    const beforeCode = document.getElementById('beforeCode');
    const afterCode = document.getElementById('afterCode');
    
    if (beforeCode) beforeCode.value = currentTemplate.before;
    if (afterCode) afterCode.value = currentTemplate.after;
    
    // Update code previews with syntax highlighting
    updateCodePreview('before');
    updateCodePreview('after');
    
    // Show transformation details
    showTransformationDetails();
}

// ===== CODE PREVIEW & SYNTAX HIGHLIGHTING =====
function initializeSyntaxHighlighting() {
    // Initialize highlight.js if available
    if (typeof hljs !== 'undefined') {
        hljs.configure({
            languages: ['java', 'cpp', 'python', 'javascript', 'go', 'php', 'ruby']
        });
    }
}

function updateCodePreview(panel) {
    const textarea = document.getElementById(`${panel}Code`);
    const preview = document.getElementById(`${panel}Preview`);
    
    if (!textarea || !preview) return;
    
    const code = preview.querySelector('code');
    if (!code) return;
    
    // Set code content
    code.textContent = textarea.value;
    
    // Set language class
    const language = currentTemplate ? currentTemplate.language : 'java';
    code.className = `language-${language}`;
    
    // Apply syntax highlighting if available
    if (typeof hljs !== 'undefined') {
        hljs.highlightElement(code);
    }
}

// ===== TRANSFORMATION =====
function applyTransformation() {
    if (!currentTemplate) {
        showToast('Please select a template first', 'warning');
        return;
    }
    
    const beforeCode = document.getElementById('beforeCode');
    if (!beforeCode) return;
    
    const code = beforeCode.value;
    
    if (!code.trim()) {
        showToast('Please enter code to transform', 'warning');
        return;
    }
    
    // Show loading state
    const transformBtn = document.querySelector('[onclick="applyTransformation()"]');
    if (transformBtn) {
        transformBtn.disabled = true;
        transformBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Transforming...</span>';
    }
    
    // Simulate transformation process
    setTimeout(() => {
        // Perform transformation
        const transformedCode = performCodeTransformation(code);
        
        const afterCode = document.getElementById('afterCode');
        if (afterCode) {
            afterCode.value = transformedCode;
            updateCodePreview('after');
        }
        
        // Show transformation details
        showTransformationDetails();
        
        // Reset button
        if (transformBtn) {
            transformBtn.disabled = false;
            transformBtn.innerHTML = '<span class="btn-icon">✨</span><span>Transform Code</span>';
        }
        
        showToast('Code transformed successfully!', 'success');
    }, 1000);
}

function performCodeTransformation(code) {

    let transformed = code;

    // RSA → Kyber
    transformed = transformed.replace(
        /KeyPairGenerator\.getInstance\("RSA"\)/g,
        'KeyPairGenerator.getInstance("Kyber", "BCPQC")'
    );

    transformed = transformed.replace(
        /RSA\.generate\(2048\)/g,
        'generate_keypair()'
    );

    // ECC / ECDSA → Dilithium
    transformed = transformed.replace(
        /SHA256withECDSA/g,
        'Dilithium'
    );

    transformed = transformed.replace(
        /ECDSA/g,
        'Dilithium'
    );

    // Diffie-Hellman → Kyber
    transformed = transformed.replace(
        /DiffieHellman|DH/g,
        'Kyber'
    );

    return transformed;
}

// ===== TRANSFORMATION DETAILS =====
function showTransformationDetails() {
    if (!currentTemplate) return;
    
    const detailsSection = document.getElementById('transformationDetails');
    if (!detailsSection) return;
    
    detailsSection.style.display = 'block';
    
    // Populate changes
    const changesList = document.getElementById('changesList');
    if (changesList) {
        changesList.innerHTML = currentTemplate.changes
            .map(change => `<li>${change}</li>`)
            .join('');
    }
    
    // Populate improvements
    const improvementsList = document.getElementById('improvementsList');
    if (improvementsList) {
        improvementsList.innerHTML = currentTemplate.improvements
            .map(improvement => `<li>${improvement}</li>`)
            .join('');
    }
    
    // Populate notes
    const notesDiv = document.getElementById('implementationNotes');
    if (notesDiv) {
        notesDiv.textContent = currentTemplate.notes;
    }
    
    // Populate libraries
    const librariesDiv = document.getElementById('librariesList');
    if (librariesDiv) {
        librariesDiv.innerHTML = currentTemplate.libraries
            .map(lib => `<span class="library-badge">${lib}</span>`)
            .join('');
    }
}

function toggleDetails() {
    const details = document.getElementById('transformationDetails');
    if (details) {
        details.style.display = 'none';
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Category selection
    document.querySelectorAll('.category').forEach(cat => {
        cat.addEventListener('click', function() {
            document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            selectedCategory = this.dataset.category;
            loadTemplates();
        });
    });
    
    // Code textarea changes
    const beforeCode = document.getElementById('beforeCode');
    if (beforeCode) {
        beforeCode.addEventListener('input', function() {
            updateCodePreview('before');
        });
    }
}

function filterTemplates() {
    const searchInput = document.getElementById('templateSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.template-item').forEach(item => {
        const name = item.querySelector('.template-name').textContent.toLowerCase();
        const desc = item.querySelector('.template-desc').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || desc.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ===== CODE ACTIONS =====
function copyCode(panel) {
    const textarea = document.getElementById(`${panel}Code`);
    if (!textarea) return;
    
    // Select and copy text
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        const label = panel === 'before' ? 'Vulnerable' : 'Quantum-safe';
        showToast(`${label} code copied to clipboard!`, 'success');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(textarea.value).then(() => {
            const label = panel === 'before' ? 'Vulnerable' : 'Quantum-safe';
            showToast(`${label} code copied to clipboard!`, 'success');
        }).catch(() => {
            showToast('Failed to copy code', 'error');
        });
    }
    
    // Deselect
    window.getSelection().removeAllRanges();
}

function downloadCode() {
    const afterCode = document.getElementById('afterCode');
    if (!afterCode) return;
    
    const code = afterCode.value;
    
    if (!code.trim()) {
        showToast('No code to download', 'warning');
        return;
    }
    
    const extension = getFileExtension(currentTemplate ? currentTemplate.language : 'java');
    const filename = `quantum-safe-code.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showToast('Code downloaded!', 'success');
}

function getFileExtension(language) {
    const extensions = {
        'java': 'java',
        'python': 'py',
        'cpp': 'cpp',
        'javascript': 'js',
        'go': 'go',
        'php': 'php',
        'ruby': 'rb',
        'c': 'c'
    };
    return extensions[language] || 'txt';
}

function swapCode() {
    const beforeCode = document.getElementById('beforeCode');
    const afterCode = document.getElementById('afterCode');
    
    if (!beforeCode || !afterCode) return;
    
    const temp = beforeCode.value;
    beforeCode.value = afterCode.value;
    afterCode.value = temp;
    
    updateCodePreview('before');
    updateCodePreview('after');
    
    showToast('Code panels swapped', 'info');
}

// ===== FILE UPLOAD =====
function uploadCode() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.click();
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const beforeCode = document.getElementById('beforeCode');
        if (beforeCode) {
            beforeCode.value = e.target.result;
            updateCodePreview('before');
            showToast(`File "${file.name}" loaded`, 'success');
        }
    };
    reader.onerror = function() {
        showToast('Error reading file', 'error');
    };
    reader.readAsText(file);
}

// ===== BATCH TRANSFORM =====
function toggleBatchTransform() {
    const batchContent = document.getElementById('batchContent');
    if (batchContent) {
        batchContent.style.display = batchContent.style.display === 'none' ? 'block' : 'none';
    }
}

function handleBatchUpload(event) {
    batchFiles = Array.from(event.target.files);
    displayBatchFiles();
    
    const batchBtn = document.getElementById('batchTransformBtn');
    if (batchBtn) {
        batchBtn.style.display = batchFiles.length > 0 ? 'block' : 'none';
    }
}

function displayBatchFiles() {
    const batchFilesDiv = document.getElementById('batchFiles');
    if (!batchFilesDiv) return;
    
    batchFilesDiv.innerHTML = '';
    
    batchFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'batch-file-item';
        fileItem.innerHTML = `
            <div class="file-icon">📄</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-status" id="status-${index}">Ready to transform</div>
            </div>
        `;
        batchFilesDiv.appendChild(fileItem);
    });
}

async function processBatchTransform() {
    if (!currentTemplate) {
        showToast('Please select a template first', 'warning');
        return;
    }
    
    if (batchFiles.length === 0) {
        showToast('No files to transform', 'warning');
        return;
    }
    
    const transformedFiles = [];
    
    for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        const statusDiv = document.getElementById(`status-${i}`);
        
        if (statusDiv) {
            statusDiv.textContent = 'Processing...';
            statusDiv.className = 'file-status';
        }
        
        try {
            const content = await readFileContent(file);
            const transformed = performCodeTransformation(content);
            
            transformedFiles.push({
                name: file.name,
                content: transformed
            });
            
            if (statusDiv) {
                statusDiv.textContent = '✓ Transformed';
                statusDiv.className = 'file-status success';
            }
        } catch (error) {
            console.error('Error transforming file:', error);
            if (statusDiv) {
                statusDiv.textContent = '✗ Error';
                statusDiv.className = 'file-status error';
            }
        }
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Download all files
    downloadBatchFiles(transformedFiles);
    showToast(`${transformedFiles.length} files transformed!`, 'success');
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
    });
}

function downloadBatchFiles(files) {
    // Download each file individually
    files.forEach((file, index) => {
        setTimeout(() => {
            const blob = new Blob([file.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `transformed-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
        }, index * 200); // Stagger downloads
    });
}

// ===== HELPER FUNCTIONS =====
function findTemplateByType(vulnType) {
    // Map vulnerability types to templates
    const typeMap = {
        'RSA Key Generation': 'java_rsa_to_kyber',
        'RSA Encryption': 'java_rsa_to_kyber',
        'ECDSA Signature': 'java_ecdsa_to_dilithium',
        'Python RSA': 'python_rsa_to_kyber',
        'OpenSSL RSA (C/C++)': 'cpp_rsa_to_kyber',
        'Diffie-Hellman Key Exchange': 'java_dh_to_kyber',
        'DSA Signature': 'java_dsa_to_dilithium'
    };
    
    const templateId = typeMap[vulnType];
    return templateId ? CODE_TEMPLATES[templateId] : null;
}

function toggleSidebar() {
    const sidebar = document.querySelector('.transformer-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastMessage = toast.querySelector('.toast-message');
    if (toastMessage) {
        toastMessage.textContent = message;
    }
    
    // Update color based on type
    const colors = {
        'success': '#28a745',
        'warning': '#ffc107',
        'error': '#dc3545',
        'info': '#667eea'
    };
    
    toast.style.background = colors[type] || colors.info;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== EXPORT FUNCTIONS TO WINDOW =====
window.selectTemplate = selectTemplate;
window.applyTransformation = applyTransformation;
window.copyCode = copyCode;
window.downloadCode = downloadCode;
window.swapCode = swapCode;
window.uploadCode = uploadCode;
window.handleFileUpload = handleFileUpload;
window.toggleBatchTransform = toggleBatchTransform;
window.handleBatchUpload = handleBatchUpload;
window.processBatchTransform = processBatchTransform;
window.filterTemplates = filterTemplates;
window.toggleDetails = toggleDetails;
window.toggleSidebar = toggleSidebar;
