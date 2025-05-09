/**
 * selectModes.js - Handles selection of modes and compiling a custom .roomodes file.
 */
document.addEventListener('DOMContentLoaded', () => {
    const modesSelectionListDiv = document.getElementById('modesSelectionList');
    const selectAllModesBtn = document.getElementById('selectAllModesBtn');
    const deselectAllModesBtn = document.getElementById('deselectAllModesBtn');
    const saveSelectedModesBtn = document.getElementById('saveSelectedModesBtn');
    const downloadCustomFileBtn = document.getElementById('downloadCustomFileBtn');

    let allModesData = []; // To store the full list of modes from roo-commander.json

    if (!modesSelectionListDiv || !selectAllModesBtn || !deselectAllModesBtn || !saveSelectedModesBtn || !downloadCustomFileBtn) {
        console.error('Select Modes UI elements not found.');
        if(window.devLogger) window.devLogger.error('Select Modes UI elements not found.');
        return;
    }

    function displayModeSelection(modes) {
        modesSelectionListDiv.innerHTML = '';
        if (!modes || modes.length === 0) {
            modesSelectionListDiv.innerHTML = '<p>No modes available to select.</p>';
            return;
        }

        modes.forEach(mode => {
            const listItem = document.createElement('div');
            listItem.classList.add('list-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `mode-${mode.slug}`;
            checkbox.value = mode.slug;
            checkbox.dataset.modeName = mode.name; // Store name for easier access

            const label = document.createElement('label');
            label.htmlFor = `mode-${mode.slug}`;
            label.textContent = `${mode.name} (${mode.slug})`;
            
            listItem.appendChild(checkbox);
            listItem.appendChild(label);
            modesSelectionListDiv.appendChild(listItem);
        });
    }

    selectAllModesBtn.addEventListener('click', () => {
        const checkboxes = modesSelectionListDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
        if(window.devLogger) window.devLogger.info('All modes selected.');
    });

    deselectAllModesBtn.addEventListener('click', () => {
        const checkboxes = modesSelectionListDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        if(window.devLogger) window.devLogger.info('All modes deselected.');
    });

    saveSelectedModesBtn.addEventListener('click', () => {
        const selectedSlugs = [];
        const checkboxes = modesSelectionListDiv.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => selectedSlugs.push(cb.value));

        if (selectedSlugs.length === 0) {
            alert('Please select at least one mode.'); // Or use a more integrated notification
            if(window.devLogger) window.devLogger.warning('Save attempt with no modes selected.');
            return;
        }

        if(window.devLogger) window.devLogger.info(`Saving ${selectedSlugs.length} selected modes.`);

        // Filter the full allModesData to get the objects for selected slugs
        const selectedModesFullData = allModesData.filter(mode => selectedSlugs.includes(mode.slug));

        if (window.compileRoomodesFile) {
            const fileContent = window.compileRoomodesFile(selectedModesFullData);
            if (fileContent) {
                // Store content for download button
                downloadCustomFileBtn.dataset.fileContent = fileContent;
                saveSelectedModesBtn.style.display = 'none';
                downloadCustomFileBtn.style.display = 'block';
                if(window.devLogger) window.devLogger.success('Custom .roomodes content compiled and ready for download.');
            } else {
                 if(window.devLogger) window.devLogger.error('Failed to compile custom .roomodes content.');
                alert('Error compiling the .roomodes file.');
            }
        } else {
            console.error('compileRoomodesFile function not found.');
            if(window.devLogger) window.devLogger.error('compileRoomodesFile function not found.');
            alert('Error: File compilation utility is not available.');
        }
    });

    downloadCustomFileBtn.addEventListener('click', () => {
        const fileContent = downloadCustomFileBtn.dataset.fileContent;
        if (fileContent) {
            if (window.downloadTextAsFile) {
                const success = window.downloadTextAsFile(fileContent, '.roomodes'); // Filename is just ".roomodes"
                if (success) {
                    if(window.devLogger) window.devLogger.success('Custom .roomodes file download initiated.');
                    // Optionally, reset the view or close the modal
                    // For now, just revert buttons
                    downloadCustomFileBtn.style.display = 'none';
                    saveSelectedModesBtn.style.display = 'block';
                    downloadCustomFileBtn.removeAttribute('data-file-content');
                } else {
                    alert('Failed to initiate download.');
                }
            } else {
                console.error('downloadTextAsFile function not found.');
                if(window.devLogger) window.devLogger.error('downloadTextAsFile function not found.');
                alert('Error: File download utility is not available.');
            }
        } else {
             if(window.devLogger) window.devLogger.warning('No file content available for download.');
            alert('No file content to download. Please save selections first.');
        }
    });
    
    // Expose init function
    window.initSelectModesView = () => {
        if(window.devLogger) window.devLogger.info('Initializing Select Modes View.');
        // Reset button states
        saveSelectedModesBtn.style.display = 'block';
        downloadCustomFileBtn.style.display = 'none';
        downloadCustomFileBtn.removeAttribute('data-file-content');

        // Load modes from the global roomodesData (sourced from roo-commander.json via script.js)
        if (typeof roomodes !== 'undefined' && roomodes.customModes) {
            allModesData = roomodes.customModes; // Store for filtering later
            displayModeSelection(allModesData);
            if(window.devLogger) window.devLogger.info(`Loaded ${allModesData.length} modes for selection.`);
        } else {
            console.error('Global roomodes data not found or invalid.');
            if(window.devLogger) window.devLogger.error('Global roomodes data not found for Select Modes view.');
            modesSelectionListDiv.innerHTML = '<p style="color: red;">Error: Could not load modes data.</p>';
            allModesData = [];
        }
    };
});
