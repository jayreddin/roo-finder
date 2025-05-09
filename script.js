// Parse the JSON data from the external file
let roomodes;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const modeNameDisplay = document.getElementById('modeNameDisplay');
    const modeDetailsDisplay = document.getElementById('modeDetailsDisplay');
    const copyModeButton = document.getElementById('copyModeButton');
    
    // Function to display mode details
    function displayModeDetails(mode) {
        modeNameDisplay.textContent = mode.slug;
        copyModeButton.disabled = false;
        
        // Format the details display
        let detailsHTML = `
            <h2>${mode.name}</h2>
            <h3>Role Definition:</h3>
            <p>${formatRoleDefinition(mode.roleDefinition)}</p>
            <h3>Groups:</h3>
            <ul>
                ${mode.groups.map(group => `<li>${group}</li>`).join('')}
            </ul>
        `;
        
        modeDetailsDisplay.innerHTML = detailsHTML;
    }
    
    // Helper function to format role definition (handle truncated text)
    function formatRoleDefinition(text) {
        if (text.includes('[...]')) {
            return text.replace('[...]', '... (truncated)');
        }
        return text;
    }
    
    // Search function
    function performSearch(query) {
        searchResults.innerHTML = '';
        
        if (!query.trim()) {
            searchResults.style.display = 'none';
            noResultsMessage.style.display = 'none';
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const matchingModes = roomodes.customModes.filter(mode => 
            mode.name.toLowerCase().includes(lowerQuery) || 
            mode.slug.toLowerCase().includes(lowerQuery)
        );
        
        if (matchingModes.length === 0) {
            searchResults.style.display = 'none';
            noResultsMessage.style.display = 'block';
        } else {
            searchResults.style.display = 'block';
            noResultsMessage.style.display = 'none';
            
            matchingModes.forEach(mode => {
                const li = document.createElement('li');
                li.textContent = `${mode.name} (${mode.slug})`;
                li.addEventListener('click', () => {
                    displayModeDetails(mode);
                    // Remove selected class from all items
                    document.querySelectorAll('#searchResults li').forEach(item => {
                        item.classList.remove('selected');
                    });
                    // Add selected class to clicked item
                    li.classList.add('selected');
                });
                searchResults.appendChild(li);
            });
        }
    }
    
    // Event listener for search input
    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });
    
    // Copy mode slug to clipboard
    copyModeButton.addEventListener('click', function() {
        const modeName = modeNameDisplay.textContent;
        navigator.clipboard.writeText(modeName).then(() => {
            // Visual feedback that copy happened
            const originalText = copyModeButton.textContent;
            copyModeButton.textContent = 'Copied!';
            setTimeout(() => {
                copyModeButton.textContent = originalText;
            }, 2000);
        });
    });
    
    // Initialize with data from external file
    roomodes = roomodesData;
});
