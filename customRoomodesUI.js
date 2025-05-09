document.addEventListener('DOMContentLoaded', () => {
    const customRoomodesBtn = document.getElementById('customRoomodesBtn');
    const customRoomodesModal = document.getElementById('customRoomodesModal');
    const closeCustomRoomodesModalBtn = document.getElementById('closeCustomRoomodesModal');

    const initialView = document.getElementById('customRoomodesInitialView');
    const downloadFullView = document.getElementById('downloadFullView');
    const selectModesView = document.getElementById('selectModesView');

    const downloadFullBtn = document.getElementById('downloadFullBtn');
    const selectModesBtn = document.getElementById('selectModesBtn');

    const exitDownloadFullBtn = document.getElementById('exitDownloadFullBtn');
    const exitSelectModesBtn = document.getElementById('exitSelectModesBtn');

    if (!customRoomodesBtn || !customRoomodesModal || !closeCustomRoomodesModalBtn || 
        !initialView || !downloadFullView || !selectModesView ||
        !downloadFullBtn || !selectModesBtn || !exitDownloadFullBtn || !exitSelectModesBtn) {
        console.error('Custom Roomodes UI elements not found. Ensure IDs in index.html are correct.');
        if (window.devLogger) window.devLogger.error('Custom Roomodes UI elements not found.');
        return;
    }

    // Function to show the main modal
    function openModal() {
        customRoomodesModal.style.display = 'flex';
        showInitialView(); // Reset to initial view when opening
        if (window.devLogger) window.devLogger.info('Custom Roomodes modal opened.');
    }

    // Function to close the main modal
    function closeModal() {
        customRoomodesModal.style.display = 'none';
        if (window.devLogger) window.devLogger.info('Custom Roomodes modal closed.');
    }

    // Function to show a specific view within the modal
    function showView(viewToShow) {
        initialView.style.display = 'none';
        downloadFullView.style.display = 'none';
        selectModesView.style.display = 'none';
        viewToShow.style.display = 'block';
    }

    function showInitialView() {
        showView(initialView);
    }

    customRoomodesBtn.addEventListener('click', openModal);
    closeCustomRoomodesModalBtn.addEventListener('click', closeModal);
    // Close modal if user clicks outside the card
    customRoomodesModal.addEventListener('click', (event) => {
        if (event.target === customRoomodesModal) {
            closeModal();
        }
    });


    // Event listeners for view navigation
    downloadFullBtn.addEventListener('click', () => {
        showView(downloadFullView);
        // Initialize Full Download View (call function from fullDownload.js)
        if (window.initFullDownloadView) {
            window.initFullDownloadView();
        } else {
            console.error('initFullDownloadView function not found.');
            if(window.devLogger) window.devLogger.error('initFullDownloadView function not found.');
        }
    });

    selectModesBtn.addEventListener('click', () => {
        showView(selectModesView);
        // Initialize Select Modes View (call function from selectModes.js)
        if (window.initSelectModesView) {
            window.initSelectModesView();
        } else {
            console.error('initSelectModesView function not found.');
            if(window.devLogger) window.devLogger.error('initSelectModesView function not found.');
        }
    });

    exitDownloadFullBtn.addEventListener('click', showInitialView);
    exitSelectModesBtn.addEventListener('click', showInitialView);

    // Expose functions if needed by other scripts, e.g. for programmatic closing
    window.closeCustomRoomodesModal = closeModal;
});
