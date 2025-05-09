// Parse the JSON data from the external file
let roomodes;
let currentCategory = 'all';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const modeNameDisplay = document.getElementById('modeNameDisplay');
    const modeDetailsDisplay = document.getElementById('modeDetailsDisplay');
    const copyModeButton = document.getElementById('copyModeButton');
    const themeToggle = document.getElementById('themeToggle');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // Initialize theme based on user preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Category filtering functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set current category
            currentCategory = this.dataset.category;
            
            // Perform search with current input value
            performSearch(searchInput.value);
        });
    });
    
    // Function to categorize modes based on slug pattern
    function getCategoryFromSlug(slug) {
        if (slug.startsWith('design-')) return 'design';
        if (slug.startsWith('dev-')) return 'dev';
        if (slug.startsWith('framework-')) return 'framework';
        if (slug.startsWith('data-')) return 'data';
        if (slug.startsWith('infra-')) return 'infra';
        if (slug.startsWith('auth-') || slug.startsWith('cloud-') || slug.startsWith('edge-') || slug.startsWith('baas-')) return 'infra';
        if (slug.startsWith('manager-') || slug.startsWith('lead-')) return 'management';
        if (slug.startsWith('agent-')) return 'agent';
        if (slug.startsWith('spec-') || slug.startsWith('test-') || slug.startsWith('cms-')) return 'specialist';
        
        // Default for other types or special cases
        if (slug === 'roo-commander') return 'management';
        if (slug === 'core-architect') return 'management';
        
        return 'other';
    }
    
    // Function to display mode details with enhanced formatting
    function displayModeDetails(mode) {
        modeNameDisplay.textContent = mode.slug;
        copyModeButton.disabled = false;
        
        // Determine category for badge display
        const category = getCategoryFromSlug(mode.slug);
        
        // Format the details display with improved role definition layout
        let detailsHTML = `
            <h2>${mode.name}</h2>
            <div class="badge-category">
                <span class="badge badge-category">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </div>
            <h3>Role Definition:</h3>
            <div class="role-definition">
                ${formatRoleDefinition(mode.roleDefinition)}
            </div>
            <h3>Groups:</h3>
            <div class="badge-groups">
                ${mode.groups.map(group => `<span class="badge">${group}</span>`).join('')}
            </div>
        `;
        
        modeDetailsDisplay.innerHTML = detailsHTML;
    }
    
    // Enhanced function to format role definition with better layout
    function formatRoleDefinition(text) {
        // Replace truncated text
        text = text.includes('[...]') ? text.replace('[...]', '... (truncated)') : text;
        
        // Format paragraphs
        let formatted = '';
        
        // Convert bullet points or lists
        if (text.includes('\n-')) {
            const parts = text.split('\n-');
            const firstParagraph = parts[0].trim();
            const listItems = parts.slice(1);
            
            formatted += `<p>${firstParagraph}</p>`;
            
            if (listItems.length > 0) {
                formatted += '<ul>';
                listItems.forEach(item => {
                    formatted += `<li>${item.trim()}</li>`;
                });
                formatted += '</ul>';
            }
        } else if (text.includes('\n\n')) {
            // Multiple paragraphs
            const paragraphs = text.split('\n\n');
            paragraphs.forEach(para => {
                formatted += `<p>${para.trim()}</p>`;
            });
        } else {
            // Single paragraph
            formatted = `<p>${text}</p>`;
        }
        
        // Highlight key terms
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        return formatted;
    }
    
    // Modified search function to include category filtering
    function performSearch(query) {
        searchResults.innerHTML = '';
        
        if (!query.trim() && currentCategory === 'all') {
            searchResults.style.display = 'none';
            noResultsMessage.style.display = 'none';
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        let matchingModes = roomodes.customModes;
        
        // Filter by search query if provided
        if (query.trim()) {
            matchingModes = matchingModes.filter(mode => 
                mode.name.toLowerCase().includes(lowerQuery) || 
                mode.slug.toLowerCase().includes(lowerQuery)
            );
        }
        
        // Filter by category if not 'all'
        if (currentCategory !== 'all') {
            matchingModes = matchingModes.filter(mode => 
                getCategoryFromSlug(mode.slug) === currentCategory
            );
        }
        
        if (matchingModes.length === 0) {
            searchResults.style.display = 'none';
            noResultsMessage.style.display = 'block';
        } else {
            searchResults.style.display = 'block';
            noResultsMessage.style.display = 'none';
            
            matchingModes.forEach(mode => {
                const li = document.createElement('li');
                
                // Extract emoji if present in the name
                const nameMatch = mode.name.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])\s+(.+)$/u);
                
                if (nameMatch) {
                    // Create with emoji
                    li.innerHTML = `<span class="mode-emoji">${nameMatch[1]}</span>${nameMatch[2]} <small>(${mode.slug})</small>`;
                } else {
                    // No emoji found
                    li.textContent = `${mode.name} (${mode.slug})`;
                }
                
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
    
    // Show all modes when first loading
    performSearch('');
});
