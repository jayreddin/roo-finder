# Roo Finder!

![Roo Finder](https://user-images.githubusercontent.com/your-username/roo-finder/main/assets/screenshot.png) <!-- TODO: Update screenshot if UI changed significantly -->

## 🚀 [Live Demo](https://jayreddin.github.io/roo-finder/)

Roo Mode Explorer is an interactive web tool that helps you browse, search, and explore the available modes for Roo Commander. Easily find the perfect mode for your software development tasks by searching, filtering by category, and viewing detailed role definitions.

## 🔖 Version

**Current Version:** v1.2.0 (May 2025) <!-- Assuming a version bump for new features -->

## ✨ Features

- **Dark/Light Mode**: Toggle between themes to suit your preference.
- **Instant Search**: Find modes by name or slug with real-time filtering.
- **Category Filtering**: Browse modes by their functional categories.
- **Auto-Updates**: Fetch the latest official `roo-commander.json` directly from the source repository.
- **Role Definition Display**: View detailed, well-formatted role definitions.
- **Responsive Design**: Works on desktop and mobile devices.
- **Custom `.roomodes` File Generation**:
    - **Download Full Releases**: Fetch and download official release asset files (like `kilocode-vX.Y.Z.zip`, `roo-commander-coll-full-CollectionBuild.zip`, etc.) directly from the [jezweb/roo-commander releases](https://github.com/jezweb/roo-commander/releases). Includes a progress bar for downloads.
    - **Select Specific Modes**: Choose specific modes from the currently loaded list, compile them into a custom `.roomodes` JSON file, and download it for your personalized Roo Commander setup.

## 🔍 Categories

Modes are organized into the following categories:

- Design
- Development
- Frameworks
- Data
- Infrastructure
- Management
- Agents
- Specialists

## 🛠️ Technical Details

Roo Mode Explorer is built with pure HTML, CSS, and JavaScript, without any external frameworks or libraries (except Font Awesome for icons). The application uses:

- Local storage for caching modes data and user preferences (like theme).
- GitHub API to fetch the latest mode definitions and release assets.
- Responsive design principles for cross-device compatibility.
- Client-side JavaScript for dynamic content generation, search, filtering, and file creation/download.

## 🔄 Refresh Functionality

The app includes a refresh button that:

1. Checks the [jezweb/roo-commander](https://github.com/jezweb/roo-commander) repository for updates to the main `roo-commander.json` file.
2. Downloads the latest `roo-commander.json` if newer than the cached version.
3. Parses and displays the updated mode definitions.
4. Visual indicators show whether new data was found and loaded.

## 🔧 Usage

1. **Browse & Search Modes**:
    - Browse all modes or filter by category using the buttons.
    - Search for specific modes using the search bar.
    - Click on any mode in the results to view its details.
    - Copy the mode slug to use in your projects.
2. **Theme**:
    - Toggle between light and dark themes using the theme button (☀️/🌙).
3. **Refresh Data**:
    - Click the "Refresh" button (<i class="fas fa-sync-alt"></i>) to get the latest modes.
4. **Custom `.roomodes` File** (<i class="fas fa-cog"></i> Button):
    - Click the "Custom Modes" button to open the customization pop-up.
    - **Download Full Releases**:
        - Select this option to view a list of the latest available release assets from the `jezweb/roo-commander` repository.
        - Click on any release file to download it. A progress bar will indicate the download status.
        - Click "Exit" to return to the main custom options.
    - **Select Specific Modes**:
        - Select this option to create a custom `.roomodes` file.
        - A list of all available modes from the main `roo-commander.json` will be displayed with checkboxes.
        - Use "Select All" and "Deselect All" buttons for convenience.
        - Check the modes you want to include in your custom file.
        - Click "Save Selections". This will prepare your custom file.
        - The "Save Selections" button will change to "Download .roomodes". Click it to download your generated `.roomodes` file.
        - Click "Exit" to return to the main custom options.
5. **Developer Console**:
    - Double-click the version number in the header attribution to open a developer console for troubleshooting, force refreshing, and cache management.

## 📱 Mobile Support

The application is fully responsive and works well on:
- Desktop browsers
- Tablets
- Mobile phones

## 👨‍💻 Development

To contribute to this project:

1. Fork the repository.
2. Clone it to your local machine: `git clone https://github.com/your-username/roo-finder.git`
3. Create a new branch for your feature or bug fix: `git checkout -b my-new-feature`
4. Make your changes.
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin my-new-feature`
7. Submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🙏 Acknowledgements

- The [Roo Commander project](https://github.com/jezweb/roo-commander) for the mode definitions and inspiration.
- [Font Awesome](https://fontawesome.com/) for the icons.

---

Created with ❤️ by [Jamie Reddin](https://github.com/jayreddin)
