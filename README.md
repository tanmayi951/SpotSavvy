# 🚗 SpotSavvy: AI-Powered Smart Parking System

## Overview
SpotSavvy is a full-stack, AI-driven smart parking ecosystem designed to eliminate the frustration of finding parking in crowded cities. It features a robust real-time Node.js backend, a responsive Command Center dashboard for parking administrators, and a sleek, modern mobile application for drivers.

## 🌟 Key Features
- **Real-Time WebSockets:** Live parking spot tracking synced instantly across all interfaces.
- **AI Route Optimization:** Automatically routes drivers to the optimal spot based on live lot capacity and distance.
- **License Plate Recognition (LPR):** Browser-based camera integration for secure gate access and tracking.
- **Integrated UPI Payments:** Secure mock payment gateway to reserve and pay for spots instantly.
- **Premium Aesthetics:** Both frontends feature modern glassmorphism design, vibrant gradients, and smooth micro-animations.

---

## 📂 Project Architecture

### 1. The Backend Core (`/files`)
The brain of the operation. Built with Node.js, Express, and Socket.IO.
- Streams live IoT sensor data simulation to all connected clients.
- Handles reservations, traffic analytics, and billing logic.

### 2. The Command Center Dashboard (`/frontend`)
A comprehensive control panel for parking lot administrators.
- Built with lightweight HTML, CSS, and JS (No heavy frameworks).
- Displays live dynamic city maps, traffic analytics, active reservations, and live security camera feeds.

### 3. The Driver Mobile App (`/mobile-app`)
A modern, vibrant React application built with Vite for drivers.
- Includes user authentication (persistent login), personalized profiles, and vehicle management.
- Features immersive, simulated Turn-by-Turn navigation to AI-recommended parking spots.

---

## 🚀 Getting Started

To experience the full SpotSavvy ecosystem, you need to start the backend and then open the frontends. Follow these steps:

### Step 1: Start the Backend Server (Required)
The backend must be running for the dashboard and mobile app to receive live data.
1. Open a terminal.
2. Run the following commands:
```bash
cd files
npm install
npm start
```
*You should see a message saying the backend is running.*

### Step 2: Open the Command Center (Dashboard)
1. Navigate to the `frontend` folder on your computer.
2. Double-click the `index.html` file to open it in your web browser.
*(Alternatively, right-click it in your code editor and select "Open with Live Server").*

### Step 3: Run the Driver Mobile App
1. Open a **new, separate terminal window**.
2. Run the following commands:
```bash
cd mobile-app
npm install
npm run dev
```
3. Open `http://localhost:5173` in your browser. 
*(Tip: Right-click the page, click "Inspect", and click the "Device Toolbar" icon to view it in mobile phone dimensions for the best experience!)*

---

## 🛠️ Technology Stack
- **Dashboard:** HTML5, CSS3 (Vanilla), JavaScript
- **Mobile App:** React.js (Vite), Lucide-React Icons
- **Backend:** Node.js, Express.js, Socket.IO
