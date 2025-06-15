# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **denpro** (電気計算ツール), a React Native mobile app for electrical engineering calculations. The app is designed for electrical technicians and engineers to perform quick calculations on-site, including voltage drop calculations, wire sizing, and voltage drop rate calculations.

## Key Commands

### Development
- `npm start` - Start Expo development server
- `npm run ios` - Start with iOS simulator  
- `npm run android` - Start with Android emulator
- `npm run web` - Start web version
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run Jest tests with watch mode

### Building & Deployment
- `npx eas build --platform ios` - Build iOS app via EAS
- `npx eas build --platform android` - Build Android app via EAS
- `npx eas submit --platform ios` - Submit to App Store

## Architecture

### File-based Routing (Expo Router)
The app uses Expo Router with file-based routing structure:
- `app/_layout.tsx` - Root layout with theme context provider
- `app/(tabs)/` - Tab-based navigation structure
- `app/calculations/` - Individual calculation screens
- `app/settings/` - Settings and configuration screens

### Theme System
The app implements a custom theme context in `app/_layout.tsx`:
- Theme state managed via React Context (`ThemeContext`)
- Supports automatic dark/light mode detection
- Manual theme toggle functionality available
- Theme state accessible throughout the app via `useTheme()` hook

### Calculation Modules
Each calculation type has its own screen in `app/calculations/`:
- `voltage-drop.tsx` - Basic voltage drop calculations
- `voltage-drop-rate.tsx` - Advanced voltage drop rate calculations  
- `wire-size.tsx` - Wire sizing calculations

Each calculation screen follows a consistent pattern:
- React hooks for input state management
- Custom calculation logic with electrical formulas
- Animated results display
- Formula explanation functionality
- Responsive design for different screen sizes

### Key Dependencies
- **Expo Router** - File-based navigation and routing
- **React Native Reanimated** - High-performance animations
- **Expo Linear Gradient** - Gradient backgrounds and styling
- **@expo/vector-icons** - Ionicons icon set
- **@react-native-picker/picker** - Native picker components

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` maps to root)
- Expo TypeScript base configuration extended

### Code Quality
- ESLint with Expo config and Prettier integration
- Pre-configured Jest testing environment
- Flat ESLint configuration format (modern setup)

## Platform Support
- **Primary**: iOS (App Store published)
- **Secondary**: Android (configured but not actively deployed)
- **Development**: Web support via Expo web

## Testing
- Jest testing framework with `jest-expo` preset
- Component snapshot testing configured
- Test files located in `components/__tests__/`
- Run tests with `npm test` (includes watch mode)