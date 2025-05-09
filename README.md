# Roo Mode Explorer

![Roo Mode Explorer](https://user-images.githubusercontent.com/your-username/roo-finder/main/assets/screenshot.png)

## 🚀 [Live Demo](https://jayreddin.github.io/roo-finder/)

Roo Mode Explorer is an interactive web tool that helps you browse, search, and explore the available modes for Roo Commander. Easily find the perfect mode for your software development tasks by searching or filtering by categories.

## 🔖 Version

**Current Version:** v1.0.0 (May 2025)

## ✨ Features

- **Dark/Light Mode**: Toggle between themes to suit your preference
- **Instant Search**: Find modes by name or slug with real-time filtering
- **Category Filtering**: Browse modes by their functional categories
- **Auto-Updates**: Fetch the latest modes directly from the source repository
- **Role Definition Display**: View detailed, well-formatted role definitions
- **Responsive Design**: Works on desktop and mobile devices

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

- Local storage for caching modes data
- GitHub API to fetch the latest mode definitions
- Responsive design principles for cross-device compatibility

## 🔄 Refresh Functionality

The app includes a refresh button that:

1. Checks the [jezweb/roo-commander](https://github.com/jezweb/roo-commander) repository for updates
2. Downloads the latest `.roomodes` file if newer than the cached version
3. Parses and displays the updated mode definitions
4. Visual indicators show whether new data was found and loaded

## 🔧 Usage

1. Browse all modes or filter by category using the buttons
2. Search for specific modes using the search bar
3. Click on any mode in the results to view its details
4. Copy the mode slug to use in your projects
5. Toggle between light and dark themes using the theme button
6. Refresh to get the latest modes by clicking the refresh button

## 📱 Mobile Support

The application is fully responsive and works well on:
- Desktop browsers
- Tablets
- Mobile phones

## 👨‍💻 Development

To contribute to this project:

1. Fork the repository
2. Clone it to your local machine
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Roo Commander project for the mode definitions
- Font Awesome for the icons

---

Created with ❤️ by [Jamie Reddin](https://github.com/jayreddin)
