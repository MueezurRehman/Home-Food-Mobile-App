# 🍽️ HomeFoodApp

A modern React Native application for managing food orders in hostel environments. Built with Firebase integration, real-time order tracking, and a beautiful futuristic UI design.

![React Native](https://img.shields.io/badge/React_Native-0.71.11-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-22.2.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Android](https://img.shields.io/badge/Android-API_21+-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-11.0+-000000?style=for-the-badge&logo=ios&logoColor=white)

## 📱 Features

### 🎯 Core Functionality
- **Real-time Order Management**: Live updates using Firebase Firestore
- **Order Status Tracking**: Pending, Delivered, and Canceled states
- **Meal Filtering**: Separate tracking for Lunch and Dinner orders
- **Customer Management**: Track orders by customer name and hostel
- **Analytics Dashboard**: Visual charts showing order statistics

### 🎨 UI/UX Features
- **Futuristic Design**: Modern, sleek interface with custom components
- **Responsive Layout**: Optimized for both Android and iOS
- **Custom Animations**: Smooth transitions and interactive elements
- **Dark/Light Mode Support**: Automatic theme switching
- **Boot Splash Screen**: Professional app launch experience

### 🔧 Technical Features
- **TypeScript**: Full type safety and better development experience
- **Firebase Integration**: Real-time database and authentication
- **Modular Architecture**: Reusable components and clean code structure
- **Performance Optimized**: Efficient rendering and memory management

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (>= 18.0.0)
- **React Native CLI** (>= 0.71.0)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Java Development Kit (JDK)** (>= 11)
- **CocoaPods** (for iOS dependencies)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/HomeFoodApp.git
   cd HomeFoodApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Firebase Configuration**
   
   Create a Firebase project and download the configuration files:
   - Place `google-services.json` in `android/app/`
   - Place `GoogleService-Info.plist` in `ios/HomeFoodApp/`
   
   **⚠️ Important**: These files are already in `.gitignore` for security. You'll need to add your own Firebase configuration files.

5. **Environment Setup**
   
   Create a `gradle.properties` file in the `android/` directory with your signing configuration:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=your-release-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=your-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=your-store-password
   MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
   ```

### Running the App

#### Android
```bash
# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android
```

#### iOS
```bash
# Start Metro bundler
npm start

# Run on iOS (in a new terminal, macOS only)
npm run ios
```

## 📁 Project Structure

```
HomeFoodApp/
├── android/                 # Android-specific code
│   ├── app/
│   │   ├── build.gradle     # Android build configuration
│   │   └── src/
│   └── gradle.properties    # Gradle configuration
├── ios/                     # iOS-specific code
│   ├── HomeFoodApp/
│   │   ├── AppDelegate.swift
│   │   └── Info.plist
│   └── Podfile
├── assets/                  # Static assets
│   └── bootsplash/         # Boot splash screen assets
├── src/                    # Source code
│   ├── App.tsx             # Main app component
│   ├── HomeScreen.tsx      # Main screen component
│   ├── OrdersPanel.tsx     # Orders management component
│   ├── FuturisticButton.tsx # Custom button component
│   └── HomeScreenStyles.ts # Styling definitions
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🛠️ Technologies Used

### Frontend
- **React Native** (0.71.11) - Cross-platform mobile development
- **TypeScript** (5.0.4) - Type-safe JavaScript
- **React** (18.2.0) - UI library

### Backend & Services
- **Firebase Firestore** - Real-time database
- **Firebase App** - Core Firebase services

### UI/UX Libraries
- **React Native Chart Kit** - Data visualization
- **React Native Vector Icons** - Icon library
- **React Native Linear Gradient** - Gradient backgrounds
- **React Native BootSplash** - Splash screen
- **React Native SVG** - SVG support

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Babel** - JavaScript transpilation

## 📊 Key Components

### HomeScreen
The main application screen that displays:
- Order statistics and analytics
- Real-time order lists
- Interactive charts and graphs
- Order management controls

### OrdersPanel
A reusable component for displaying order lists with:
- Customizable styling
- Order filtering capabilities
- Status-based color coding
- Interactive order items

### FuturisticButton
A custom button component featuring:
- Modern design with shadows and gradients
- Customizable colors and styles
- Disabled state handling
- Smooth animations

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Download configuration files for your platforms
4. Update the app with your Firebase project details

### Build Configuration
- **Android**: Configure signing keys in `android/gradle.properties`
- **iOS**: Update bundle identifier and signing in Xcode
- **Environment**: Set up environment variables for different build types

## 🚀 Deployment

### Android
1. Generate a signed APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. The APK will be generated in `android/app/build/outputs/apk/release/`

### iOS
1. Open the project in Xcode:
   ```bash
   open ios/HomeFoodApp.xcworkspace
   ```

2. Configure signing and build for release
3. Archive and upload to App Store Connect

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Firebase team for robust backend services
- All contributors who helped improve this project

## 📞 Support

If you have any questions or need help with the project:

- Create an [Issue](https://github.com/yourusername/HomeFoodApp/issues)
- Contact: [your.email@example.com](mailto:your.email@example.com)

## 🔮 Roadmap

### Upcoming Features
- [ ] Push notifications for new orders
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Order history and reporting
- [ ] Customer management system
- [ ] Payment integration
- [ ] Admin panel for restaurant management

### Performance Improvements
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Memory usage optimization
- [ ] Faster app startup time

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

</div>