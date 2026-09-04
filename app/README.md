# GoCourier Student App

Production Expo (iOS + Android) app that mirrors the customer site: campus food + extras, server cart, Razorpay checkout, and the same Food / Extras brand tokens.

## Stack

- Expo SDK 57, Expo Router, TypeScript
- NativeWind 4 + Tailwind 3 (site tokens: primary `#ff0040` / extras `#c8f542`)
- Redux Toolkit
- Axios + SecureStore Bearer JWT (cookies are not used on native)
- `react-native-razorpay` via a **development client** (not Expo Go)

## Setup

```bash
cd app
cp .env.example .env
# Point at your API. Physical devices cannot use localhost.
# Android emulator: http://10.0.2.2:8000/api/v1
# iOS simulator:     http://localhost:8000/api/v1
# Device:            http://<your-lan-ip>:8000/api/v1
```

Install and run a native dev client (required for Razorpay and SecureStore-backed auth in production):

```bash
npm install
npx expo prebuild
npm run ios        # or npm run android
# Metro
npm start
```

Expo Go (`npm run start:go`) can browse catalog UI but **cannot take payments**.

## Store builds

```bash
npx eas login
npx eas build --profile development --platform ios
npx eas build --profile preview --platform android
npx eas build --profile production --platform all
```

Bundle IDs: `com.gocourierservice.app` (override in `app.config.ts` if you already have store listings).

## Auth

Login / signup return a JWT. The app stores it in SecureStore and sends `Authorization: Bearer`. Logout clears the token and calls `POST /auth/logout`.

## Feature map

| Screen | Notes |
| --- | --- |
| Home | Food / Extras tabs, search, banners, campus batch countdown, FAQ |
| Food | Filters, restaurants, dishes |
| Restaurant / product | Wishlist, addons, add to cart |
| Extras | Stores, custom request (photo upload), parcel |
| Cart | Multi-restaurant replace confirm, extras upsell |
| Checkout | Drop point + native Razorpay |
| Profile | Avatar, campus, wishlist, past orders, logout |

Guest browse is public. Cart, checkout, profile, custom request, and parcel require a student account.
