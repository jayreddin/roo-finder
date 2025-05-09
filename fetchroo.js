// fetchroo.js - Handles fetching and parsing the latest .roomodes file

// Store the last update time
let lastUpdateTime = localStorage.getItem('lastRooModesUpdateTime') || null;

// Function to convert .roomodes content to JavaScript object
function parseRooModesFile(content) {
    // If the file is in JSON format
    try {
        // Try parsing as JSON first
        return JSON.parse(content);
    } catch (e) {
        // If it's not valid JSON, try extracting data from the text format
        try {
            // Create a temporary function to evaluate the content safely
            // This assumes the .roomodes file has content that can be evaluated as JavaScript
            const tempObj = { customModes: [] };
            
            // Try to parse the content line by line
            const lines = content.split('\n');
            let currentMode = null;
            
            for (const line of lines) {
                if (line.trim().startsWith('"slug":')) {
                    if (currentMode) {
                        tempObj.customModes.push(currentMode);
                    }
                    currentMode = {};
                    const slug = line.match(/"slug":\s*"([^"]+)"/);
                    if (slug && slug[1]) {
                        currentMode.slug = slug[1];
                    }
                } else if (currentMode && line.trim().startsWith('"name":')) {
                    const name = line.match(/"name":\s*"([^"]+)"/);
                    if (name && name[1]) {
                        currentMode.name = name[1];
                    }
                } else if (currentMode && line.trim().startsWith('"roleDefinition":')) {
                    const roleDef = line.match(/"roleDefinition":\s*"([^"]+)"/);
                    if (roleDef && roleDef[1]) {
                        currentMode.roleDefinition = roleDef[1].replace(/\\n/g, '\n');
                    }
                } else if (currentMode && line.trim().startsWith('"groups":')) {
                    const groupsMatch = line.match(/"groups":\s*(\[[^\]]+\])/);
                    if (groupsMatch && groupsMatch[1]) {
                        try {
                            currentMode.groups = JSON.parse(groupsMatch[1]);
                        } catch (e) {
                            currentMode.groups = [];
                        }
                    }
                }
            }
            
            if (currentMode) {
                tempObj.customModes.push(currentMode);
            }
            
            // If we have parsed modes, return them
            if (tempObj.customModes.length > 0) {
                return tempObj;
            }
            
            // If the parsing above didn't work, try a more aggressive approach
            const evalCode = `(function() { return ${content}; })()`;
            const result = eval(evalCode);
            return result;
        } catch (innerError) {
            console.error("Failed to parse .roomodes file:", innerError);
            return null;
        }
    }
}

// Function to get the file list from the repository
async function getRepoFilesList() {
    try {
        const apiUrl = 'https://api.github.com/repos/jezweb/roo-commander/contents';
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`GitHub API responded with status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching repository contents:', error);
        return null;
    }
}

// Function to find the latest .roomodes file in the repository
async function findLatestRooModesFile() {
    const files = await getRepoFilesList();
    if (!files) return null;
    
    // Look for .roomodes files
    const roomodesFiles = files.filter(file => file.name.endsWith('.roomodes'));
    
    if (roomodesFiles.length === 0) {
        console.warn('No .roomodes files found in the repository');
        return null;
    }
    
    // Sort by date if available, otherwise by name
    roomodesFiles.sort((a, b) => {
        // Default to sorting by name
        return b.name.localeCompare(a.name);
    });
    
    // Return the most recent file
    return roomodesFiles[0];
}

// Function to fetch the file content
async function fetchFileContent(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file content: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching file content:', error);
        return null;
    }
}

// Function to save roomodes data to localStorage
function saveRooModes(data) {
    try {
        // Save the parsed data
        localStorage.setItem('roomodesData', JSON.stringify(data));
        
        // Update the last update time
        const now = new Date().toISOString();
        localStorage.setItem('lastRooModesUpdateTime', now);
        lastUpdateTime = now;
        
        return true;
    } catch (error) {
        console.error('Error saving roomodes data:', error);
        return false;
    }
}

// Function for force refreshing (to be used from the console)
async function forceRooModesRefresh() {
    // Check if developer logger is available
    const logger = window.devLogger;
    
    if (logger) {
        logger.info('Starting forced refresh from repository');
    }
    
    // Find the latest .roomodes file
    const latestFile = await findLatestRooModesFile();
    
    if (!latestFile) {
        if (logger) {
            logger.error('No .roomodes file found in the repository');
        }
        return { updated: false, message: 'No .roomodes file found in the repository' };
    }
    
    // Log file details
    if (logger) {
        logger.info(`Latest file found: ${latestFile.name} (${new Date(latestFile.updated_at || latestFile.created_at || null).toLocaleString()})`);
    }
    
    // Check if the file is newer than our current data
    const fileDate = new Date(latestFile.updated_at || latestFile.created_at || null);
    const lastUpdate = lastUpdateTime ? new Date(lastUpdateTime) : null;
    
    let isNewer = !lastUpdate || (fileDate > lastUpdate);
    
    if (!isNewer && logger) {
        logger.warning(`Repository file (${fileDate.toLocaleString()}) is older than local data (${lastUpdate.toLocaleString()})`);
        logger.info('Continuing with force refresh regardless of timestamps');
    }
    
    // Fetch the content of the latest .roomodes file
    const content = await fetchFileContent(latestFile.download_url);
    
    if (!content) {
        if (logger) {
            logger.error('Failed to fetch file content');
        }
        return { updated: false, message: 'Failed to fetch file content' };
    }
    
    // Log content details
    if (logger) {
        logger.info(`File content fetched (${content.length} bytes)`);
    }
    
    // Parse the content
    const parsedData = parseRooModesFile(content);
    
    if (!parsedData || !parsedData.customModes || parsedData.customModes.length === 0) {
        if (logger) {
            logger.error('Failed to parse file content or no modes found');
        }
        return { updated: false, message: 'Failed to parse file content or no modes found' };
    }
    
    // Log mode count
    if (logger) {
        logger.info(`Parsed ${parsedData.customModes.length} modes from file`);
    }
    
    // Save the new data
    const saved = saveRooModes(parsedData);
    
    if (saved) {
        // Update the global roomodes data
        if (window.updateRoomodes) {
            window.updateRoomodes(parsedData);
            if (logger) {
                logger.success('Roomodes data updated in application');
            }
        } else {
            window.roomodesData = parsedData;
            if (logger) {
                logger.success('Roomodes data updated globally');
            }
        }
        
        return { 
            updated: true, 
            message: `Successfully updated with ${parsedData.customModes.length} modes from ${latestFile.name}${isNewer ? '' : ' (forced overwrite of newer local data)'}` 
        };
    } else {
        if (logger) {
            logger.error('Failed to save roomodes data');
        }
        return { updated: false, message: 'Failed to save roomodes data' };
    }
}

// Make the function available globally
window.forceRooModesRefresh = forceRooModesRefresh;

// Main function to fetch the latest roomodes
async function fetchLatestRooModes() {
    const refreshButton = document.getElementById('refreshButton');
    const logger = window.devLogger;
    
    // Remove any existing animation classes first
    refreshButton.classList.remove('success', 'no-update');
    
    // Add animation class to show the check is in progress
    refreshButton.classList.add('checking');
    
    if (logger) {
        logger.info('Checking for updates from repository');
    }
    
    // Find the latest .roomodes file
    const latestFile = await findLatestRooModesFile();
    
    // Remove checking animation
    refreshButton.classList.remove('checking');
    
    if (!latestFile) {
        // Show error animation
        refreshButton.classList.remove('success'); // Ensure no other animation is active
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        
        if (logger) {
            logger.error('No .roomodes file found in the repository');
        }
        return;
    }
    
    // Log file details if logger is available
    if (logger) {
        logger.info(`Latest file found: ${latestFile.name} (${new Date(latestFile.updated_at || latestFile.created_at || null).toLocaleString()})`);
    }
    
    // Check if we need to update based on the file's date
    const fileDate = new Date(latestFile.updated_at || latestFile.created_at || null);
    const lastUpdate = lastUpdateTime ? new Date(lastUpdateTime) : null;
    
    // If we have a last update time and the file hasn't changed, no need to update
    if (lastUpdate && fileDate && fileDate <= lastUpdate) {
        // Show "no update needed" animation
        refreshButton.classList.remove('success'); // Ensure no other animation is active
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        
        if (logger) {
            logger.info(`No update needed. Local data (${lastUpdate.toLocaleString()}) is newer than or equal to repository (${fileDate.toLocaleString()})`);
        }
        return;
    }
    
    // Fetch the content of the latest .roomodes file
    const content = await fetchFileContent(latestFile.download_url);
    
    if (!content) {
        // Show error animation
        refreshButton.classList.remove('success'); // Ensure no other animation is active
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        
        if (logger) {
            logger.error('Failed to fetch file content');
        }
        return;
    }
    
    // Log content details if logger is available
    if (logger) {
        logger.info(`File content fetched (${content.length} bytes)`);
    }
    
    // Parse the content
    const parsedData = parseRooModesFile(content);
    
    if (!parsedData || !parsedData.customModes || parsedData.customModes.length === 0) {
        // Show error animation
        refreshButton.classList.remove('success'); // Ensure no other animation is active
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        
        if (logger) {
            logger.error('Failed to parse file content or no modes found');
        }
        return;
    }
    
    // Log mode count if logger is available
    if (logger) {
        logger.info(`Parsed ${parsedData.customModes.length} modes from file`);
    }
    
    // Save the new data
    const saved = saveRooModes(parsedData);
    
    if (saved) {
        // Update the global roomodes data
        if (window.updateRoomodes) {
            window.updateRoomodes(parsedData);
        } else {
            window.roomodesData = parsedData;
        }
        
        // Show success animation
        refreshButton.classList.remove('no-update'); // Ensure no other animation is active
        refreshButton.classList.add('success');
        setTimeout(() => {
            refreshButton.classList.remove('success');
        }, 1500);
        
        if (logger) {
            logger.success(`Update successful. ${parsedData.customModes.length} modes loaded from ${latestFile.name}`);
        }
    } else {
        // Show error animation
        refreshButton.classList.remove('success'); // Ensure no other animation is active
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        
        if (logger) {
            logger.error('Failed to save roomodes data');
        }
    }
}

// Check for cached data on load
document.addEventListener('DOMContentLoaded', function() {
    const cachedData = localStorage.getItem('roomodesData');
    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            if (parsedData && parsedData.customModes && parsedData.customModes.length > 0) {
                // Update the global roomodes data
                if (window.updateRoomodes) {
                    window.updateRoomodes(parsedData);
                } else {
                    window.roomodesData = parsedData;
                }
                
                // Log if logger is available
                if (window.devLogger) {
                    window.devLogger.info(`Loaded ${parsedData.customModes.length} modes from cache`);
                    window.devLogger.info(`Last update: ${new Date(lastUpdateTime || "").toLocaleString() || "Unknown"}`);
                }
            }
        } catch (e) {
            console.error('Error parsing cached roomodes data:', e);
            if (window.devLogger) {
                window.devLogger.error(`Failed to parse cached data: ${e.message}`);
            }
        }
    } else {
        if (window.devLogger) {
            window.devLogger.info('No cached data found, using default data');
        }
    }
});
