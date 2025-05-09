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
    const refreshButton = document.getElementById('refreshButton');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    refreshButton.addEventListener('click', function() {
        fetchLatestRooModes();
    });
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            performSearch(searchInput.value);
        });
    });
    
    function getCategoryFromSlug(slug) {
        // Existing categories
        if (slug.startsWith('design-')) return 'design';
        if (slug.startsWith('dev-')) return 'dev';
        if (slug.startsWith('framework-')) return 'framework';
        if (slug.startsWith('data-')) return 'data';
        if (slug.startsWith('infra-') || slug.startsWith('auth-') || slug.startsWith('cloud-') || slug.startsWith('edge-') || slug.startsWith('baas-')) return 'infra';
        if (slug.startsWith('manager-') || slug.startsWith('lead-')) return 'management';
        if (slug.startsWith('agent-')) return 'agent';
        if (slug.startsWith('spec-') || slug.startsWith('test-') || slug.startsWith('cms-')) return 'specialist';
        
        // Add new category slug logic if needed, e.g.:
        // if (slug.startsWith('plan-')) return 'plan';
        // if (slug.startsWith('debug-')) return 'debug';

        if (slug === 'roo-commander') return 'management';
        if (slug === 'core-architect') return 'management';
        
        return 'other'; // Default or fallback category
    }
    
    function displayModeDetails(mode) {
        modeNameDisplay.textContent = mode.slug;
        copyModeButton.disabled = false;
        
        const category = getCategoryFromSlug(mode.slug);
        
        let detailsHTML = `
            <h2>${mode.name}</h2>
            <div class="badge-category" style="margin-bottom: 10px;">
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

    function clearModeDetails() {
        modeNameDisplay.textContent = '';
        modeDetailsDisplay.innerHTML = '';
        copyModeButton.disabled = true;
        document.querySelectorAll('#searchResults li').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    function formatRoleDefinition(text) {
        if (!text) return '<p>No role definition provided.</p>';
        text = text.includes('[...]') ? text.replace('[...]', '... (truncated)') : text;
        let formatted = '';
        if (text.includes('\n-')) {
            const parts = text.split('\n-');
            const firstParagraph = parts[0].trim();
            if (firstParagraph) formatted += `<p>${firstParagraph}</p>`;
            const listItems = parts.slice(1);
            if (listItems.length > 0) {
                formatted += '<ul>';
                listItems.forEach(item => {
                    formatted += `<li>${item.trim()}</li>`;
                });
                formatted += '</ul>';
            }
        } else if (text.includes('\n\n')) {
            const paragraphs = text.split('\n\n');
            paragraphs.forEach(para => {
                if (para.trim()) formatted += `<p>${para.trim()}</p>`;
            });
        } else {
            formatted = `<p>${text.trim()}</p>`;
        }
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return formatted;
    }
    
    function performSearch(query) {
        searchResults.innerHTML = '';
        clearModeDetails(); 
        
        if (!query.trim() && currentCategory === 'all') {
            searchResults.style.display = 'none';
            noResultsMessage.style.display = 'none';
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        let matchingModes = roomodes.customModes;
        
        if (query.trim()) {
            matchingModes = matchingModes.filter(mode => 
                mode.name.toLowerCase().includes(lowerQuery) || 
                mode.slug.toLowerCase().includes(lowerQuery) ||
                (mode.groups && mode.groups.some(group => group.toLowerCase().includes(lowerQuery))) // Search in groups too
            );
        }
        
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
                const nameMatch = mode.name.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])\s+(.+)$/u);
                if (nameMatch) {
                    li.innerHTML = `<span class="mode-emoji">${nameMatch[1]}</span>${nameMatch[2]} <small>(${mode.slug})</small>`;
                } else {
                    li.textContent = `${mode.name} (${mode.slug})`;
                }
                li.addEventListener('click', () => {
                    displayModeDetails(mode);
                    document.querySelectorAll('#searchResults li').forEach(item => item.classList.remove('selected'));
                    li.classList.add('selected');
                });
                searchResults.appendChild(li);
            });
        }
    }
    
    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });
    
    copyModeButton.addEventListener('click', function() {
        const modeName = modeNameDisplay.textContent;
        if (!modeName) return; 
        navigator.clipboard.writeText(modeName).then(() => {
            const originalIcon = copyModeButton.innerHTML; // Store full HTML (icon + text)
            copyModeButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyModeButton.innerHTML = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            if(window.devLogger) window.devLogger.error('Failed to copy slug: ' + err.message);
        });
    });
    
    if (typeof roomodesData !== 'undefined') {
        roomodes = roomodesData;
    } else {
        console.error("roomodesData is not defined.");
        roomodes = { customModes: [] }; 
    }
    
    window.updateRoomodes = function(newData) {
        roomodes = newData;
        performSearch(searchInput.value); 
        clearModeDetails(); 
    };
    
    performSearch(''); 
});
