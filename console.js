/**
 * console.js - Handles the hidden developer console functionality
 * Last updated: 2025-05-14 09:11:57 UTC // Updated timestamp
 * Author: Jamie Reddin (jayreddin)
 */

class ConsoleLogger {
    constructor() {
        this.logElement = document.getElementById('consoleLog');
        this.logs = [];
        this.loadLogs();
    }

    loadLogs() {
        if (!this.logElement) return; // Guard against missing element
        const storedLogs = localStorage.getItem('devConsoleLogs');
        if (storedLogs) {
            try {
                this.logs = JSON.parse(storedLogs);
            } catch (e) {
                this.logs = []; // Reset if parsing fails
                console.error("Error parsing devConsoleLogs from localStorage:", e);
            }
        }
        this.renderLogs(); // Render after loading or resetting
    }

    saveLogs() {
        if (!this.logElement) return;
        const trimmedLogs = this.logs.slice(-100); // Keep only the last 100 logs
        try {
            localStorage.setItem('devConsoleLogs', JSON.stringify(trimmedLogs));
        } catch (e) {
            console.error("Error saving devConsoleLogs to localStorage:", e);
        }
    }

    log(message, type = 'info') {
        if (!this.logElement) return;
        const timestamp = new Date().toISOString();
        this.logs.push({ timestamp, message, type });
        this.renderLogs();
        this.saveLogs(); // Save after each log
    }

    info(message) { this.log(message, 'info'); }
    success(message) { this.log(message, 'success'); }
    warning(message) { this.log(message, 'warning'); }
    error(message) { this.log(message, 'error'); }

    clear() {
        this.logs = [];
        this.renderLogs(); // Update display
        localStorage.removeItem('devConsoleLogs'); // Clear from storage
    }

    renderLogs() {
        if (!this.logElement) return;
        this.logElement.innerHTML = ''; // Clear existing logs
        for (const log of this.logs) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.type}`;
            
            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'log-timestamp';
            const date = new Date(log.timestamp);
            timestampSpan.textContent = date.toLocaleTimeString([], { hour: 'numeric', minute:'2-digit', second:'2-digit', hour12: true });
            
            const messageNode = document.createTextNode(log.message);
            
            logEntry.appendChild(timestampSpan);
            logEntry.appendChild(messageNode);
            this.logElement.appendChild(logEntry);
        }
        this.logElement.scrollTop = this.logElement.scrollHeight; // Auto-scroll
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const versionTrigger = document.getElementById('versionTrigger');
    const devConsoleSidebar = document.getElementById('devConsoleSidebar');
    const closeConsoleBtn = document.getElementById('closeConsole');
    const consoleTabs = document.querySelectorAll('.console-tab');
    const tabContents = document.querySelectorAll('.tab-content'); // Corrected selector
    const clearLogsBtn = document.getElementById('clearLogs');
    const forceRefreshBtn = document.getElementById('forceRefreshBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    if (!devConsoleSidebar || !closeConsoleBtn || !versionTrigger) {
        console.error("Essential console DOM elements are missing.");
        return;
    }
    
    const logger = new ConsoleLogger();
    window.devLogger = logger; // Make logger global

    // Ensure console is hidden on initial load by making sure .open is not present
    devConsoleSidebar.classList.remove('open');
    document.body.classList.remove('console-open');


    let clickTimer = null;
    let clickCount = 0;

    versionTrigger.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(() => { clickCount = 0; }, 400);
        } else if (clickCount === 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            toggleConsole(); // Use a toggle function
        }
    });

    function openConsole() {
        devConsoleSidebar.classList.add('open');
        document.body.classList.add('console-open');
        logger.info('Developer console opened');
        // Ensure the active tab content is displayed
        const activeTab = document.querySelector('.console-tab.active');
        if (activeTab) {
            const tabId = activeTab.dataset.tab + 'Tab';
            document.getElementById(tabId).classList.add('active');
        } else { // Default to logs tab if none active
            document.querySelector('.console-tab[data-tab="logs"]').classList.add('active');
            document.getElementById('logsTab').classList.add('active');
        }
    }

    function closeConsole() {
        devConsoleSidebar.classList.remove('open');
        document.body.classList.remove('console-open');
        if (confirmModal) confirmModal.style.display = 'none'; // Hide confirm modal if open
        logger.info('Developer console closed');
    }

    function toggleConsole() {
        if (devConsoleSidebar.classList.contains('open')) {
            closeConsole();
        } else {
            openConsole();
        }
    }

    closeConsoleBtn.addEventListener('click', closeConsole);

    consoleTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            consoleTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active')); // Use class for active
            const tabId = this.dataset.tab + 'Tab';
            const activeContent = document.getElementById(tabId);
            if (activeContent) activeContent.classList.add('active');
        });
    });
    
    // Set default active tab content
    const initialActiveTab = document.querySelector('.console-tab.active');
    if (initialActiveTab) {
        const initialTabId = initialActiveTab.dataset.tab + 'Tab';
        const initialActiveContent = document.getElementById(initialTabId);
        if (initialActiveContent) initialActiveContent.classList.add('active');
    } else { // Default to logs if no tab is marked active in HTML
         const logsTabButton = document.querySelector('.console-tab[data-tab="logs"]');
         const logsTabContent = document.getElementById('logsTab');
         if (logsTabButton && logsTabContent) {
            logsTabButton.classList.add('active');
            logsTabContent.classList.add('active');
         }
    }


    if(clearLogsBtn) clearLogsBtn.addEventListener('click', () => { logger.clear(); logger.info('Logs cleared'); });
    if(forceRefreshBtn) forceRefreshBtn.addEventListener('click', () => { /* ... existing force refresh ... */ });
    if(clearCacheBtn) clearCacheBtn.addEventListener('click', () => { /* ... existing clear cache ... */ });
    if(exportDataBtn) exportDataBtn.addEventListener('click', () => { /* ... existing export data ... */ });
    
    // Ensure confirm dialog function exists and is correctly used by other parts
    // function showConfirmDialog(...) remains the same

    // ... (rest of the console.js, including showConfirmDialog, forceRefresh, clearCache, exportData listeners)
    // Ensure these listeners also check for element existence if they are in console.js
    // Example for forceRefreshBtn:
    if (forceRefreshBtn) {
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
<<<<<<< HEAD
            }
        );
    });
    
    // Clear Cache button handler
    clearCacheBtn.addEventListener('click', function() {
        showConfirmDialog(
            'Clear Cache',
            'This will clear all locally stored data including your search history and preferences. Continue?',
            function() { // Yes callback
                logger.info('Cache clearing initiated');
                try {
                    // Clear all localStorage except dev console logs
                    const devLogs = localStorage.getItem('devConsoleLogs');
                    localStorage.clear();
                    if (devLogs) {
                        localStorage.setItem('devConsoleLogs', devLogs);
                    }
                    logger.success('Cache cleared successfully');
                } catch (error) {
                    logger.error('Cache clearing failed: ' + error.message);
                }
            }
        );
    });
    
    // Export Data button handler
    exportDataBtn.addEventListener('click', function() {
        logger.info('Data export initiated');
        try {
            const exportData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                exportData[key] = localStorage.getItem(key);
            }
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileName = 'roo-finder-data-' + new Date().toISOString().slice(0, 10) + '.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.style.display = 'none';
            
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
            
            logger.success('Data exported successfully as ' + exportFileName);
        } catch (error) {
            logger.error('Data export failed: ' + error.message);
        }
    });
    
    // Generic confirm dialog function
=======
            );
        });
    }
    // Similar guards for clearCacheBtn and exportDataBtn

>>>>>>> ea3c76e (123)
    function showConfirmDialog(title, message, yesCallback) {
        const titleElement = document.getElementById('confirm-title');
        const messageElement = document.getElementById('confirm-message');
        
<<<<<<< HEAD
        titleElement.textContent = title;
        messageElement.textContent = message;
        
        confirmModal.style.display = 'flex';
        
        // Handle button clicks
        const handleYes = function() {
            confirmYes.removeEventListener('click', handleYes);
            confirmNo.removeEventListener('click', handleNo);
            confirmModal.style.display = 'none';
            yesCallback();
        };
        
        const handleNo = function() {
            confirmYes.removeEventListener('click', handleYes);
            confirmNo.removeEventListener('click', handleNo);
            confirmModal.style.display = 'none';
            logger.info(title + ' operation cancelled');
        };
        
=======
        if (!confirmModal || !titleElement || !messageElement || !confirmYes || !confirmNo) {
            console.error("Confirmation modal elements not found.");
            logger.error("Confirmation modal elements not found, cannot show dialog.");
            return;
        }

        titleElement.textContent = title;
        messageElement.textContent = message;
        confirmModal.style.display = 'flex';
        
        const handleYes = function() {
            confirmYes.removeEventListener('click', handleYes); // Clean up
            confirmNo.removeEventListener('click', handleNo);   // Clean up
            confirmModal.style.display = 'none';
            if (yesCallback) yesCallback();
        };
        
        const handleNo = function() {
            confirmYes.removeEventListener('click', handleYes); // Clean up
            confirmNo.removeEventListener('click', handleNo);   // Clean up
            confirmModal.style.display = 'none';
            logger.info(title + ' operation cancelled by user.');
        };
        
        // Remove previous listeners before adding new ones to prevent multiple executions
        confirmYes.removeEventListener('click', handleYes); 
        confirmNo.removeEventListener('click', handleNo); 
        
>>>>>>> ea3c76e (123)
        confirmYes.addEventListener('click', handleYes);
        confirmNo.addEventListener('click', handleNo);
    }
});
