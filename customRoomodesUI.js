document.addEventListener('DOMContentLoaded', () => {
    const customRoomodesBtn = document.getElementById('customRoomodesBtn');
    const customRoomodesModal = document.getElementById('customRoomodesModal');
    const closeCustomRoomodesModalBtn = document.getElementById('closeCustomRoomodesModal');

    const initialView = document.getElementById('customRoomodesInitialView');
    const downloadFullView = document.getElementById('downloadFullView');
    const selectModesView = document.getElementById('selectModesView');

    // Footers for each view
    const downloadFullFooter = document.getElementById('downloadFullFooter');
    const selectModesFooter = document.getElementById('selectModesFooter');

    const downloadFullBtn = document.getElementById('downloadFullBtn'); // Button in initial view
    const selectModesBtn = document.getElementById('selectModesBtn');   // Button in initial view

    const exitDownloadFullBtn = document.getElementById('exitDownloadFullBtn');
    const exitSelectModesBtn = document.getElementById('exitSelectModesBtn');

    // Role Definition Modal elements
    const roleDefinitionModal = document.getElementById('roleDefinitionModal');
    const closeRoleDefinitionModalBtn = document.getElementById('closeRoleDefinitionModalBtn');
    const backRoleDefinitionModalBtn = document.getElementById('backRoleDefinitionModalBtn');
    const roleDefinitionModalTitle = document.getElementById('roleDefinitionModalTitle');
    const roleDefinitionModalContent = document.getElementById('roleDefinitionModalContent');


    if (!customRoomodesBtn || !customRoomodesModal || !closeCustomRoomodesModalBtn || 
        !initialView || !downloadFullView || !selectModesView ||
        !downloadFullFooter || !selectModesFooter ||
        !downloadFullBtn || !selectModesBtn || !exitDownloadFullBtn || !exitSelectModesBtn ||
        !roleDefinitionModal || !closeRoleDefinitionModalBtn || !backRoleDefinitionModalBtn || !roleDefinitionModalTitle || !roleDefinitionModalContent
        ) {
        console.error('Custom Roomodes UI or Role Definition Modal elements not found.');
        if (window.devLogger) window.devLogger.error('Critical UI elements for modals are missing.');
        return;
    }

    function openModal() {
        customRoomodesModal.style.display = 'flex';
        showInitialView(); 
        if (window.devLogger) window.devLogger.info('Custom Roomodes modal opened.');
    }

    function closeModal() {
        customRoomodesModal.style.display = 'none';
        if (window.devLogger) window.devLogger.info('Custom Roomodes modal closed.');
    }

    function showView(viewToShow, footerToShow) {
        // Hide all views
        initialView.style.display = 'none';
        downloadFullView.style.display = 'none';
        selectModesView.style.display = 'none';
        // Hide all footers
        downloadFullFooter.style.display = 'none';
        selectModesFooter.style.display = 'none';

        if (viewToShow) viewToShow.style.display = 'block';
        if (footerToShow) footerToShow.style.display = 'flex'; // Footers use flex
    }

    function showInitialView() {
        showView(initialView, null); // Initial view has no specific footer in the modal-footer div
    }

    customRoomodesBtn.addEventListener('click', openModal);
    closeCustomRoomodesModalBtn.addEventListener('click', closeModal);
    customRoomodesModal.addEventListener('click', (event) => {
        if (event.target === customRoomodesModal) closeModal();
    });

    downloadFullBtn.addEventListener('click', () => {
        showView(downloadFullView, downloadFullFooter);
        if (window.initFullDownloadView) window.initFullDownloadView();
        else if(window.devLogger) window.devLogger.error('initFullDownloadView function not found.');
    });

    selectModesBtn.addEventListener('click', () => {
        showView(selectModesView, selectModesFooter);
        if (window.initSelectModesView) window.initSelectModesView();
        else if(window.devLogger) window.devLogger.error('initSelectModesView function not found.');
    });

    exitDownloadFullBtn.addEventListener('click', showInitialView);
    exitSelectModesBtn.addEventListener('click', showInitialView);

    // Role Definition Modal Logic
    function openRoleDefinitionModal(modeName, definition) {
        roleDefinitionModalTitle.textContent = `Role: ${modeName}`;
        
        // Basic summarization: first paragraph or up to 300 chars.
        let summary = definition;
        if (definition) {
            const firstParagraphEnd = definition.indexOf('\n\n');
            if (firstParagraphEnd > 0 && firstParagraphEnd < 300) {
                summary = definition.substring(0, firstParagraphEnd) + "\n...";
            } else if (definition.length > 300) {
                summary = definition.substring(0, 300) + "...";
            }
        } else {
            summary = "No definition provided.";
        }

        roleDefinitionModalContent.innerHTML = `<p>${summary.replace(/\n/g, '<br>')}</p>`; // Simple display
        roleDefinitionModal.style.display = 'flex';
        if (window.devLogger) window.devLogger.info(`Role definition modal opened for ${modeName}.`);
    }

    function closeRoleDefinitionModal() {
        roleDefinitionModal.style.display = 'none';
        if (window.devLogger) window.devLogger.info('Role definition modal closed.');
    }

    closeRoleDefinitionModalBtn.addEventListener('click', closeRoleDefinitionModal);
    backRoleDefinitionModalBtn.addEventListener('click', closeRoleDefinitionModal);
    roleDefinitionModal.addEventListener('click', (event) => {
        if (event.target === roleDefinitionModal) closeRoleDefinitionModal();
    });

    // Expose functions
    window.closeCustomRoomodesModal = closeModal;
    window.openRoleDefinitionModal = openRoleDefinitionModal; // For selectModes.js to call
});
