# 🍃 Smart Campus Waste Management System

A sleek, intuitive, and modern web application built to streamline and monitor campus waste management. The system provides real-time tracking, dynamic insights, AI-simulated waste sorting, algorithmic route optimization for staff, and robust administrative controls. 

---

## ✨ Features

- **📊 View Hub**: Real-time dashboard displaying visual fill-levels for every assigned campus waste bin.
- **🚨 Instant Alerts**: Reactive UI alerts triggered exactly when bins exceed optimal storage limits.
- **🧹 Route Optimization**: Smart algorithm computing absolute fill-status combined with geographic critical zones (e.g. Cafes) to prioritize cleaning schedules efficiently.
- **🧮 Waste Analytics**: Dynamic, beautifully integrated `Chart.js` graphs highlighting historical patterns and real-time Wet vs Dry waste segregation ratios. 
- **♻️ Waste Segregation Guide**: Built-in learning hub to educate users about proper waste classification.
- **🤖 Image-Based Waste AI**: Experimental simulation endpoint that parses uploaded images natively to deduce generic wet/dry classifications based on natural heuristics.
- **🔐 Secure Role Access**: `Administrator` level controls vs `Staff` level scoping via secure Firebase Authentication.
- **👤 Editable User Profiles**: Native support for customizable User Display Names and secure Base-64 Profile Picture encoding integrated natively into Firebase Cloud Firestore!
- **🔧 Admin Controls**: Explicit `Express REST API` handlers (`PATCH`, `DELETE`) permitting Admins to rapidly modify bin tracking telemetry and location routing details dynamically.

---

## 🛠 Tech Stack

### Frontend UI Pipeline
- **HTML5 & Vanilla CSS3** (Custom Grid Layouts & Advanced Glassmorphism Rendering)
- **Vanilla JavaScript (ES6 Modules)** for blazing-fast native script execution.
- **Chart.js** via CDN for live, beautiful interactive charting components.

### Backend Infrastructure
- **Node.js**: Asynchronous JavaScript server runtime.
- **Express.js**: Exposes standardized cross-origin API REST Endpoints. 
- **Google Firebase**: 
  - **Firebase Auth**: Secure Email & Password access controls.
  - **Cloud Firestore**: Advanced, scalable NoSQL document infrastructure mapped directly to realtime WebSockets (`onSnapshot`).
  - **Firebase Admin SDK**: Private, secure bypass routines for Express backend interactions.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and a valid `serviceAccountKey.json` for Firebase Admin. 

### 1. Backend Setup
1. Open up a terminal and navigate into the `backend/` directory.
2. Ensure you have placed your `serviceAccountKey.json` securely into the `backend/` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start up the Express REST Server (runs on port 3000):
   ```bash
   node server.js
   ```

### 2. Frontend Execution
1. Create a terminal inside the `frontend/` directory.
2. Input your Firebase Client SDK configs into `frontend/js/firebase-config.js`.
3. Launch a standalone local HTTP web server (e.g., using `npx serve` on port 8080 natively):
   ```bash
   npx serve . -l 8080
   ```
4. Connect to `http://localhost:8080` in your browser.

---

## 📸 Usage & Testing

- **Data Simulation**: Once logged in, bins will passively and naturally simulate random filling increments iteratively every 5 seconds to accurately reflect physical use.
- **Authentication Roles**: Sign up for an account via the interface. To test Administrative features (Adding, Editing, and Deleting bins natively), navigate physically into your Firestore Database, find your user `uid` inside the `users` collection, and change the `role` property string explicitly to `admin`!

Enjoy your drastically cleaner, smarter campus! 🍃🌿
