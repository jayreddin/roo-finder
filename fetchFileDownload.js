/**
 * fetchFileDownload.js - Utility for fetching files and triggering downloads.
 */

// Function to download a file from a URL
async function downloadFile(url, filename, progressCallback) {
    if (window.devLogger) window.devLogger.info(`Starting download for: ${filename} from ${url}`);
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${url}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];
        
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            chunks.push(value);
            loaded += value.length;
            if (total && progressCallback) {
                const percent = Math.round((loaded / total) * 100);
                progressCallback(percent);
            }
        }

        const blob = new Blob(chunks);
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        if (progressCallback) progressCallback(100); // Ensure progress hits 100%
        if (window.devLogger) window.devLogger.success(`Successfully downloaded ${filename}`);
        return true;

    } catch (error) {
        console.error(`Error downloading file ${filename}:`, error);
        if (window.devLogger) window.devLogger.error(`Error downloading ${filename}: ${error.message}`);
        if (progressCallback) progressCallback(-1); // Indicate error
        return false;
    }
}

// Function to download a text content as a file
function downloadTextAsFile(content, filename, mimeType = 'application/json;charset=utf-8') {
    if (window.devLogger) window.devLogger.info(`Preparing to download text content as: ${filename}`);
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.devLogger) window.devLogger.success(`Successfully triggered download for ${filename}`);
        return true;
    } catch (error) {
        console.error(`Error creating download for ${filename}:`, error);
        if (window.devLogger) window.devLogger.error(`Error creating download for ${filename}: ${error.message}`);
        return false;
    }
}


// Expose functions to global window object to be used by other scripts
window.downloadFile = downloadFile;
window.downloadTextAsFile = downloadTextAsFile;
