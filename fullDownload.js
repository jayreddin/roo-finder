/**
 * fullDownload.js - Handles fetching and displaying GitHub releases.
 */
document.addEventListener('DOMContentLoaded', () => {
    const releasesListDiv = document.getElementById('releasesList');
    const progressBar = document.getElementById('downloadProgressBar');
    const progressContainer = document.getElementById('downloadProgressContainer');

    if (!releasesListDiv || !progressBar || !progressContainer) {
        console.error('Full Download UI elements not found.');
        if (window.devLogger) window.devLogger.error('Full Download UI elements not found.');
        return;
    }

    const GITHUB_RELEASES_URL = 'https://api.github.com/repos/jezweb/roo-commander/releases';

    async function fetchReleases() {
        if (window.devLogger) window.devLogger.info('Fetching releases from GitHub...');
        releasesListDiv.innerHTML = '<p>Loading releases...</p>';
        try {
            const response = await fetch(GITHUB_RELEASES_URL);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const releases = await response.json();
            if (window.devLogger) window.devLogger.success(`Successfully fetched ${releases.length} releases.`);
            displayReleases(releases);
        } catch (error) {
            console.error('Error fetching releases:', error);
            releasesListDiv.innerHTML = `<p style="color: red;">Error loading releases: ${error.message}</p>`;
            if (window.devLogger) window.devLogger.error(`Error fetching releases: ${error.message}`);
        }
    }

    function displayReleases(releases) {
        releasesListDiv.innerHTML = ''; 
        if (releases.length === 0) {
            releasesListDiv.innerHTML = '<p>No releases found.</p>';
            return;
        }

        releases.forEach(release => {
            if (release.assets && release.assets.length > 0) {
                release.assets.forEach(asset => {
                    const listItem = document.createElement('div');
                    listItem.classList.add('list-item');

                    const link = document.createElement('a');
                    link.href = asset.browser_download_url;
                    link.textContent = asset.name;
                    link.classList.add('release-link');
                    // link.target = '_blank'; // Removed, will use JS download

                    const size = (asset.size / (1024 * 1024)).toFixed(2); 
                    const details = document.createElement('span');
                    details.classList.add('release-details');
                    details.textContent = `${size} MB`;
                    
                    link.addEventListener('click', async (e) => {
                        e.preventDefault(); 
                        if (window.devLogger) window.devLogger.info(`Download initiated for ${asset.name}`);
                        progressContainer.style.display = 'block';
                        progressContainer.classList.remove('fade-out');
                        progressBar.value = 0;
                        
                        await window.downloadFile(
                            asset.browser_download_url, 
                            asset.name,
                            (percent) => {
                                progressBar.value = percent;
                                if (percent === -1) { 
                                     if (window.devLogger) window.devLogger.error(`Download failed for ${asset.name}`);
                                     setTimeout(() => {
                                        progressContainer.classList.add('fade-out');
                                        setTimeout(() => progressContainer.style.display = 'none', 500); // Hide after fade
                                     }, 2000);
                                } else if (percent === 100) {
                                    if (window.devLogger) window.devLogger.success(`Download complete for ${asset.name}`);
                                     setTimeout(() => {
                                        progressContainer.classList.add('fade-out');
                                        setTimeout(() => progressContainer.style.display = 'none', 500);
                                     }, 1000); // Shorter delay for success
                                }
                            }
                        );
                    });
                    listItem.appendChild(link);
                    listItem.appendChild(details);
                    releasesListDiv.appendChild(listItem);
                });
            }
        });
    }
    
    window.initFullDownloadView = () => {
        if (window.devLogger) window.devLogger.info('Initializing Full Download View.');
        progressContainer.style.display = 'none'; 
        progressContainer.classList.remove('fade-out');
        progressBar.value = 0;
        fetchReleases();
    };
});
