/**
 * console.js - Handles the hidden developer console functionality
 * Last updated: 2025-05-09 08:08:13 UTC
 * Author: Jamie Reddin (jayreddin)
 */

// Initialize logger
class ConsoleLogger {
    constructor() {
        this.logElement = document.getElementById('consoleLog');
        this.logs = [];
        
        // Try to load logs from storage
        this.loadLogs();
    }
    
    loadLogs() {
        const storedLogs = localStorage.getItem('devConsoleLogs');
        if (storedLogs) {
            try {
                this.logs = JSON.parse(storedLogs);
                this.renderLogs();
            } catch (e) {
                this.logs = [];
            }
        }
    }
    
    saveLogs() {
        // Keep only the last 100 logs to prevent localStorage from growing too large
        const trimmedLogs = this.logs.slice(-100);
        localStorage.setItem('devConsoleLogs', JSON.stringify(trimmedLogs));
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        this.logs.push({
            timestamp,
            message,
            type
        });
        
        this.renderLogs();
        this.saveLogs();
    }
    
    info(message) {
        this.log(message, 'info');
    }
    
    success(message) {
        this.log(message, 'success');
    }
    
    warning(message) {
        this.log(message, 'warning');
    }
    
    error(message) {
        this.log(message, 'error');
    }
    
    clear() {
        this.logs = [];
        this.renderLogs();
        localStorage.removeItem('devConsoleLogs');
    }
    
    renderLogs() {
        if (!this.logElement) return;
        
        this.logElement.innerHTML = '';
        
        for (const log of this.logs) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.type}`;
            
            const timestamp = document.createElement('span');
            timestamp.className = 'log-timestamp';
            
            // Format the timestamp to a nice format (HH:MM:SS AM/PM)
            const date = new Date(log.timestamp);
            const formattedTime = date.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', second:'2-digit', hour12: true});
            timestamp.textContent = formattedTime;
            
            const message = document.createTextNode(log.message);
            
            logEntry.appendChild(timestamp);
            logEntry.appendChild(message);
            
            this.logElement.appendChild(logEntry);
        }
        
        // Auto-scroll to bottom
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }
}

// Initialize the console
document.addEventListener('DOMContentLoaded', function() {
    const versionTrigger = document.getElementById('versionTrigger');
    const devConsoleSidebar = document.getElementById('devConsoleSidebar');
    const closeConsole = document.getElementById('closeConsole');
    const consoleTabs = document.querySelectorAll('.console-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const clearLogsBtn = document.getElementById('clearLogs');
    const forceRefreshBtn = document.getElementById('forceRefreshBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    
    // Create logger instance
    const logger = new ConsoleLogger();
    
    // Make logger available globally
    window.devLogger = logger;
    
    // Track clicks for double-click detection
    let clickTimer = null;
    let clickCount = 0;
    
    // Version click handler
    versionTrigger.addEventListener('click', function() {
        clickCount++;
        
        if (clickCount === 1) {
            clickTimer = setTimeout(function() {
                clickCount = 0;
            }, 400);
        } else if (clickCount === 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            
            // Show the console
            openConsole();
        }
    });
    
    // Function to open console
    function openConsole() {
        devConsoleSidebar.classList.add('open');
        document.body.classList.add('console-open');
        logger.info('Developer console opened');
    }
    
    // Function to close console
    function closeConsole() {
        devConsoleSidebar.classList.remove('open');
        document.body.classList.remove('console-open');
        
        // Make sure to hide any modals
        confirmModal.style.display = 'none';
        
        logger.info('Developer console closed');
    }
    
    // Close console handler
    closeConsole.addEventListener('click', function() {
        closeConsole();
    });
    
    // Tab switching
    consoleTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            consoleTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const tabId = this.dataset.tab + 'Tab';
            document.getElementById(tabId).style.display = 'flex';
        });
    });
    
    // Clear logs button handler
    clearLogsBtn.addEventListener('click', function() {
        logger.clear();
        logger.info('Logs cleared');
    });
    
    // Force refresh button handler
    forceRefreshBtn.addEventListener('click', function() {
        showConfirmDialog(
            'Force Refresh',
            'This will force download the latest .roomodes file. If your local version is newer, it will be overwritten. Continue?',
            function() { // Yes callback
                logger.info('Force refresh initiated');
                if (window.forceRooModesRefresh) {
                    window.forceRooModesRefresh().then(function(result) {
                        if (result.updated) {
                            logger.success('Force refresh completed: ' + result.message);
                        } else {
                            logger.warning('Force refresh completed: ' + result.message);
                        }
                    }).catch(function(error) {
                        logger.error('Force refresh failed: ' + error.message);
                    });
                } else {
                    logger.error('Force refresh function not available');
                }
            }
        );
    });
    
    // Clear cache button handler
    clearCacheBtn.addEventListener('click', function() {
        showConfirmDialog(
            'Clear Cache',
            'This will clear all cached data including logs and roomodes data. Continue?',
            function() { // Yes callback
                localStorage.removeItem('roomodesData');
                localStorage.removeItem('lastRooModesUpdateTime');
                localStorage.removeItem('devConsoleLogs');
                logger.clear();
                logger.info('Cache cleared');
                logger.warning('Please refresh the page to complete the operation');
            }
        );
    });
    
    // Export data button handler
    exportDataBtn.addEventListener('click', function() {
        try {
            const exportData = {
                roomodesData: localStorage.getItem('roomodesData'),
                lastRooModesUpdateTime: localStorage.getItem('lastRooModesUpdateTime'),
                theme: localStorage.getItem('theme'),
                logs: logger.logs,
                exportTime: new Date().toISOString()
            };
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "roo-finder-export-" + new Date().toISOString().split('T')[0] + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            logger.success('Data exported successfully');
        } catch (e) {
            logger.error('Failed to export data: ' + e.message);
        }
    });
    
    // Listen for escape key to close console
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && devConsoleSidebar.classList.contains('open')) {
            closeConsole();
        }
    });
    
    // Confirm dialog handlers
    confirmYes.addEventListener('click', function() {
        if (confirmModal.yesCallback) {
            confirmModal.yesCallback();
        }
        confirmModal.style.display = 'none';
    });
    
    confirmNo.addEventListener('click', function() {
        confirmModal.style.display = 'none';
    });
    
    // Click outside to close confirm modal
    confirmModal.addEventListener('click', function(event) {
        if (event.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
    
    // Initialize logs with app start
    logger.info('Application initialized');
    logger.info('App version: V.1.0.0');
    logger.info(`User logged in: ${new Date().toISOString()}`);
});

// Confirmation dialog function
function showConfirmDialog(title, message, yesCallback) {
    const confirmModal = document.getElementById('confirmModal');
    
    if (!confirmModal) return;
    
    // Update content
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    // Store the callback
    confirmModal.yesCallback = yesCallback;
    
    // Show the modal
    confirmModal.style.display = 'flex';
}
