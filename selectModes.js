/**
 * selectModes.js - Handles selection of modes and compiling a custom .roomodes file.
 */
document.addEventListener('DOMContentLoaded', () => {
    const modesSelectionListDiv = document.getElementById('modesSelectionList');
    const selectAllModesBtn = document.getElementById('selectAllModesBtn');
    const deselectAllModesBtn = document.getElementById('deselectAllModesBtn');
    const saveSelectedModesBtn = document.getElementById('saveSelectedModesBtn');
    const downloadCustomFileBtn = document.getElementById('downloadCustomFileBtn');

    let allModesData = []; 

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
            checkbox.id = `mode-sel-${mode.slug}`; // Ensure unique ID
            checkbox.value = mode.slug;
            checkbox.dataset.modeName = mode.name; 

            const label = document.createElement('label');
            label.htmlFor = `mode-sel-${mode.slug}`;
            label.textContent = `${mode.name} (${mode.slug})`;
            
            const roleButton = document.createElement('button');
            roleButton.textContent = 'Role';
            roleButton.classList.add('btn', 'btn-role', 'btn-small'); // Added .btn for consistency
            roleButton.addEventListener('click', () => {
                if (window.openRoleDefinitionModal) {
                    window.openRoleDefinitionModal(mode.name, mode.roleDefinition);
                } else {
                    if(window.devLogger) window.devLogger.error('openRoleDefinitionModal function not found.');
                }
            });

            const leftWrapper = document.createElement('div'); // Wrapper for checkbox and label
            leftWrapper.style.display = 'flex';
            leftWrapper.style.alignItems = 'center';
            leftWrapper.style.flexGrow = '1';
            leftWrapper.appendChild(checkbox);
            leftWrapper.appendChild(label);

            listItem.appendChild(leftWrapper);
            listItem.appendChild(roleButton);
            modesSelectionListDiv.appendChild(listItem);
        });
    }

    selectAllModesBtn.addEventListener('click', () => {
        modesSelectionListDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        if(window.devLogger) window.devLogger.info('All modes selected.');
    });

    deselectAllModesBtn.addEventListener('click', () => {
        modesSelectionListDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        if(window.devLogger) window.devLogger.info('All modes deselected.');
    });

    saveSelectedModesBtn.addEventListener('click', () => {
        const selectedSlugs = Array.from(modesSelectionListDiv.querySelectorAll('input[type="checkbox"]:checked'))
                                 .map(cb => cb.value);

        if (selectedSlugs.length === 0) {
            alert('Please select at least one mode.'); 
            if(window.devLogger) window.devLogger.warning('Save attempt with no modes selected.');
            return;
        }

        if(window.devLogger) window.devLogger.info(`Saving ${selectedSlugs.length} selected modes.`);
        const selectedModesFullData = allModesData.filter(mode => selectedSlugs.includes(mode.slug));

        if (window.compileRoomodesFile) {
            const fileContent = window.compileRoomodesFile(selectedModesFullData);
            if (fileContent) {
                downloadCustomFileBtn.dataset.fileContent = fileContent;
                saveSelectedModesBtn.style.display = 'none';
                downloadCustomFileBtn.style.display = 'inline-flex'; // Match .btn display
                if(window.devLogger) window.devLogger.success('Custom .roomodes content compiled.');
            } else {
                if(window.devLogger) window.devLogger.error('Failed to compile custom .roomodes content.');
                alert('Error compiling the .roomodes file.');
            }
        } else {
            if(window.devLogger) window.devLogger.error('compileRoomodesFile function not found.');
            alert('Error: File compilation utility is not available.');
        }
    });

    downloadCustomFileBtn.addEventListener('click', () => {
        const fileContent = downloadCustomFileBtn.dataset.fileContent;
        const fileName = ".roomodes"; // Explicitly set filename with leading dot

        if (fileContent) {
            if (window.downloadTextAsFile) {
                const success = window.downloadTextAsFile(fileContent, fileName); 
                if (success) {
                    if(window.devLogger) window.devLogger.success(`Custom ${fileName} file download initiated.`);
                    downloadCustomFileBtn.style.display = 'none';
                    saveSelectedModesBtn.style.display = 'inline-flex'; // Match .btn display
                    downloadCustomFileBtn.removeAttribute('data-file-content');
                } else {
                    alert('Failed to initiate download.');
                }
            } else {
                if(window.devLogger) window.devLogger.error('downloadTextAsFile function not found.');
                alert('Error: File download utility is not available.');
            }
        } else {
            if(window.devLogger) window.devLogger.warning('No file content for download.');
            alert('No file content to download. Please save selections first.');
        }
    });
    
    window.initSelectModesView = () => {
        if(window.devLogger) window.devLogger.info('Initializing Select Modes View.');
        saveSelectedModesBtn.style.display = 'inline-flex'; // Match .btn display
        downloadCustomFileBtn.style.display = 'none';
        downloadCustomFileBtn.removeAttribute('data-file-content');

        if (typeof roomodes !== 'undefined' && roomodes.customModes) {
            allModesData = roomodes.customModes; 
            displayModeSelection(allModesData);
            if(window.devLogger) window.devLogger.info(`Loaded ${allModesData.length} modes for selection.`);
        } else {
            if(window.devLogger) window.devLogger.error('Global roomodes data not found for Select Modes view.');
            modesSelectionListDiv.innerHTML = '<p style="color: red;">Error: Could not load modes data.</p>';
            allModesData = [];
        }
    };
});
