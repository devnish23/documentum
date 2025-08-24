# Smart Grocery Inventory Manager

A comprehensive family-focused grocery inventory management app with barcode scanning, collaborative features, and multilingual support (English & Tamil).

## 🚀 Features

### Core Features
- **📱 Barcode Scanning**: Camera-based product recognition with automatic inventory addition
- **👨‍👩‍👧‍👦 Family Collaboration**: Multi-user management with real-time sync
- **📊 Smart Notifications**: Low stock alerts, expiry warnings, and family updates
- **🛒 Order Management**: Automated reordering from merchants
- **🌐 Multilingual**: Full English and Tamil language support
- **📱 Cross-Platform**: iOS and Android support

### Technical Features
- **🔍 Real-time Barcode Recognition**: UPC, EAN, Code 128 support
- **☁️ Cloud Sync**: Firebase integration for data synchronization
- **🔔 Push Notifications**: Firebase Cloud Messaging
- **📸 Image Management**: Product photos and family avatars
- **🔐 Secure Authentication**: Firebase Auth with phone verification
- **💾 Offline Support**: Local SQLite storage with sync

## 📱 Screenshots

[Coming Soon]

## 🛠 Technology Stack

### Frontend
- **React Native 0.72.6**: Cross-platform mobile development
- **TypeScript 5.2.2**: Type-safe development
- **Redux Toolkit**: State management
- **React Navigation 6**: Navigation system
- **NativeBase**: UI component library
- **React Native Camera**: Barcode scanning
- **React Native SQLite**: Local storage

### Backend
- **Node.js**: Runtime environment
- **Express.js**: API framework
- **PostgreSQL**: Primary database
- **Prisma ORM**: Database management
- **Firebase**: Authentication, storage, messaging
- **Twilio**: SMS notifications

### External APIs
- **UPC Item DB**: Barcode product lookup
- **Open Food Facts**: Product information
- **Unsplash API**: Product images

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio / Xcode
- PostgreSQL 14+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/smart-grocery/inventory-manager.git
cd smart-grocery
```

2. **Install dependencies**
```bash
npm run setup
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development servers**
```bash
# Start Metro bundler
npm start

# Start backend (in another terminal)
npm run backend:dev

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📁 Project Structure

```
smart-grocery/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── store/             # Redux store and slices
│   ├── services/          # API services and utilities
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   ├── constants/         # App constants
│   ├── types/             # TypeScript type definitions
│   ├── assets/            # Images, fonts, etc.
│   └── i18n/              # Internationalization
├── backend/               # Backend API server
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
├── __tests__/             # Test files
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=http://localhost:3000
API_TIMEOUT=10000

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your_app_id

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/smart_grocery

# External APIs
UPC_API_KEY=your_upc_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# App Configuration
APP_NAME=Smart Grocery
APP_VERSION=1.0.0
ENVIRONMENT=development
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# iOS
npm run test:e2e

# Android
npm run test:e2e:android
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 📦 Building

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## 🚀 Deployment

### Backend Deployment
```bash
npm run deploy:backend
```

### App Store Deployment
```bash
npm run deploy:app
```

## 📊 Performance Metrics

- **App Launch**: < 3 seconds
- **Barcode Scanning**: < 2-3 seconds
- **API Response**: < 2 seconds
- **Memory Usage**: < 150MB
- **App Size**: < 100MB

## 🔒 Security

- **Authentication**: Firebase Auth with phone verification
- **Data Encryption**: AES-256 for sensitive data
- **API Security**: JWT tokens with 24-hour expiry
- **Privacy**: GDPR compliant data handling

## 🌐 Internationalization

The app supports English and Tamil languages with:
- Complete UI translation
- Dynamic content localization
- Cultural adaptations
- RTL support for Tamil

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/smart-grocery/inventory-manager/wiki)
- **Issues**: [GitHub Issues](https://github.com/smart-grocery/inventory-manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/smart-grocery/inventory-manager/discussions)

## 🙏 Acknowledgments

- React Native community
- Firebase team
- Open Food Facts project
- Tamil language contributors

---

**Made with ❤️ by the Smart Grocery Team** 