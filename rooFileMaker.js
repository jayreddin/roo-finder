/**
 * rooFileMaker.js - Compiles a custom .roomodes JSON file from selected modes.
 */

// Function to compile a .roomodes file content from selected modes
function compileRoomodesFile(selectedModesFullData) {
    if (!Array.isArray(selectedModesFullData)) {
        console.error('Invalid data provided to compileRoomodesFile. Expected an array.');
        if (window.devLogger) window.devLogger.error('Invalid data for compileRoomodesFile.');
        return null;
    }
    if (window.devLogger) window.devLogger.info(`Compiling .roomodes file with ${selectedModesFullData.length} modes.`);

    const customRoomodesObject = {
        customModes: selectedModesFullData
    };

    try {
        // Pretty print JSON with 2 spaces for readability
        const jsonString = JSON.stringify(customRoomodesObject, null, 2);
        if (window.devLogger) window.devLogger.success('.roomodes content compiled successfully.');
        return jsonString;
    } catch (error) {
        console.error('Error stringifying custom modes object:', error);
        if (window.devLogger) window.devLogger.error(`Error stringifying .roomodes JSON: ${error.message}`);
        return null;
    }
}

// Expose the function to the global window object
window.compileRoomodesFile = compileRoomodesFile;
