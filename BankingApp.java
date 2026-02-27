font-weight: 600;
    color: #333;
}

.file-status {
    font-size: 0.9em;
    color: #666;
}

.file-status.success {
    color: #28a745;
}

.file-status.error {
    color: #dc3545;
}

/* ===== TOAST NOTIFICATION ===== */
.toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: #28a745;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: none;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease;
    z-index: 1000;
}

.toast.show {
    display: flex;
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.toast-icon {
    font-size: 1.2em;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
    .code-panels {
        grid-template-columns: 1fr;
    }
    
    .code-arrow {
        transform: rotate(90deg);
        padding: 10px 0;
    }
    
    .details-content {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .transformer-sidebar {
        position: fixed;
        left: 0;
        top: 70px;
        height: calc(100vh - 70px);
        transform: translateX(-100%);
        z-index: 100;
    }
    
    .transformer-sidebar.open {
        transform: translateX(0);
    }
    
    .transformer-main {
        padding: 20px;
    }
    
    .transformer-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
