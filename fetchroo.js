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

// Main function to fetch the latest roomodes
async function fetchLatestRooModes() {
    const refreshButton = document.getElementById('refreshButton');
    
    // Add animation class to show the check is in progress
    refreshButton.classList.add('checking');
    
    // Find the latest .roomodes file
    const latestFile = await findLatestRooModesFile();
    
    // Remove checking animation
    refreshButton.classList.remove('checking');
    
    if (!latestFile) {
        // Show error animation
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        return;
    }
    
    // Check if we need to update based on the file's date
    const fileDate = new Date(latestFile.updated_at || latestFile.created_at || null);
    const lastUpdate = lastUpdateTime ? new Date(lastUpdateTime) : null;
    
    // If we have a last update time and the file hasn't changed, no need to update
    if (lastUpdate && fileDate && fileDate <= lastUpdate) {
        // Show "no update needed" animation
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        return;
    }
    
    // Fetch the content of the latest .roomodes file
    const content = await fetchFileContent(latestFile.download_url);
    
    if (!content) {
        // Show error animation
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        return;
    }
    
    // Parse the content
    const parsedData = parseRooModesFile(content);
    
    if (!parsedData || !parsedData.customModes || parsedData.customModes.length === 0) {
        // Show error animation
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
        return;
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
        refreshButton.classList.add('success');
        setTimeout(() => {
            refreshButton.classList.remove('success');
        }, 1500);
    } else {
        // Show error animation
        refreshButton.classList.add('no-update');
        setTimeout(() => {
            refreshButton.classList.remove('no-update');
        }, 1500);
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
            }
        } catch (e) {
            console.error('Error parsing cached roomodes data:', e);
        }
    }
});
