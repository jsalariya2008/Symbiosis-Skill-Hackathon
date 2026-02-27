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
