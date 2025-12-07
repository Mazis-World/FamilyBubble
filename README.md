# FamilyBubble MVP

This repository contains the full MVP for the FamilyBubble application, including the backend (Firebase), the mobile app (React Native), and the PWA (React).

## Project Structure

- `/backend`: Contains the Firebase project, including Firestore rules and Cloud Functions.
- `/frontend`: Contains the React Native mobile application for iOS and Android.
- `/pwa`: Contains the lightweight React-based Progressive Web App for participants.

## Prerequisites

- Node.js and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project. You can create one at [https://console.firebase.google.com/](https://console.firebase.google.com/).

## Setup and Running

### 1. Backend (Firebase)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    cd functions
    npm install
    cd ..
    ```

3.  **Deploy the Firebase project:**
    You will need to be logged into Firebase (`firebase login`).

    ```bash
    firebase deploy
    ```
    This will deploy the Firestore rules and Cloud Functions.

### 2. Frontend (React Native Mobile App)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the app:**
    ```bash
    expo start
    ```
    This will start the Metro bundler. You can then run the app on an emulator or on your physical device using the Expo Go app.

### 3. PWA (Progressive Web App)

1.  **Navigate to the pwa directory:**
    ```bash
    cd pwa
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the app:**
    ```bash
    npm start
    ```
    This will start the React development server, and you can view the PWA in your browser at `http://localhost:3000`.

## Connecting Frontend to Backend

To connect the frontend applications to your Firebase backend, you will need to create a Firebase configuration file in both the `frontend` and `pwa` projects.

1.  Go to your Firebase project settings.
2.  In the "Your apps" section, create a new Web app.
3.  You will be given a `firebaseConfig` object.

**For the React Native app:**

Create a file named `frontend/firebaseConfig.js` with the following content:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, auth, functions };
```

**For the PWA:**

Create a file named `pwa/src/firebaseConfig.js` with the same content as above.

You will then need to import this configuration in `frontend/FamilyBubble.jsx` and `pwa/src/App.js` and uncomment the Firebase-related code.
