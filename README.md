# CheckMateX

A real-time multiplayer chess application built using React, Node.js, and Socket.IO. The platform enables synchronized gameplay through private rooms, configurable timers, and AI-based practice powered by Socketfish.

[![Status](https://img.shields.io/badge/Status-Active-brightgreen)]()
[![Maintained](https://img.shields.io/badge/Maintained-Yes-success)]()
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react\&logoColor=white)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js\&logoColor=white)]()
[![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-black?logo=socket.io)]()
[![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css\&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-success)]()

---

## Overview

CheckMateX is designed to deliver a low-latency, real-time chess experience over the web. It supports both multiplayer gameplay and AI-based practice. The system ensures consistent game state synchronization across all connected clients using WebSocket-based communication.

---

## Features

* Real-time multiplayer gameplay using Socket.IO
* Private room creation and joining via secure PIN
* AI-based practice using Socketfish integration
* Configurable timers for competitive matches
* Multiple chessboard themes
* Server-side move validation and game state management
* Scalable and modular architecture

---

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Socket.IO Client
* JavaScript (ES6+)

### Backend

* Node.js
* Express.js
* Socket.IO

---

## Project Structure

```
checkmatex/
├── public/
│   └── logo.png
│
├── server/
│   ├── config/
│   │   └── socket.js
│   │
│   ├── controllers/
│   │   ├── gameController.js
│   │   └── roomController.js
│   │
│   ├── services/
│   │   ├── chessAiService.js
│   │   ├── chessService.js
│   │   ├── roomService.js
│   │   └── timerService.js
│   │
│   ├── sockets/
│   │   ├── game.socket.js
│   │   ├── room.socket.js
│   │   ├── timer.socket.js
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── generatePin.js
│   │   ├── logger.js
│   │   └── validateMove.js
│   │
│   ├── app.js
│   ├── server.js
│   ├── index.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── src/
│   ├── components/
│   │   ├── ChessBoard/
│   │   │   ├── ChessBoard.jsx
│   │   │   ├── BoardTheme.css
│   │   │   └── index.jsx
│   │   │
│   │   ├── Controls/
│   │   │   ├── ThemeSelector.jsx
│   │   │   └── TimeSelector.jsx
│   │   │
│   │   ├── Room/
│   │   ├── Timer/
│   │   │   └── Timer.jsx
│   │   │
│   │   └── UI/
│   │       └── LoadingOverlay.jsx
│   │
│   ├── pages/
│   │   ├── Game.jsx
│   │   ├── Home.jsx
│   │   └── NotFound.jsx
│   │
│   ├── socket/
│   │   └── socket.js
│   │
│   ├── store/
│   │   ├── gameStore.js
│   │   ├── roomStore.js
│   │   └── timerStore.js
│   │
│   ├── utils/
│   │   ├── chessConfig.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── README.md
├── .gitignore
├── eslint.config.js
├── vite.config.js
├── postcss.config.js
├── tailwind.config.js
├── package.json
└── package-lock.json
```

---

## Architecture Overview

The application follows a modular client-server architecture:

* The frontend manages UI rendering, user interactions, and socket communication.
* The backend is responsible for room management, move validation, timer synchronization, and AI computation.
* Socket.IO enables bidirectional communication for real-time updates.
* The system is divided into controllers, services, and socket layers to maintain separation of concerns.
* AI-based gameplay is handled via `chessAiService.js`, integrating Socketfish for move generation.

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/checkmatex.git
cd checkmatex
```

### Install Dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd server
npm install
```

---

## Running the Application

### Start Backend Server

```bash
cd server
npm start
```

### Start Frontend Development Server

```bash
npm run dev
```

Application URL:

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside the `server` directory:

```
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Future Enhancements

* Spectator mode
* Match history with PGN export
* User authentication and player profiles
* Online matchmaking system
* Deployment and scalability improvements

---

## Author

Manish Kumar Sah
B.Tech Computer Science and Engineering
Lovely Professional University

---

## License

This project is licensed under the MIT License.



## ⭐ Support

If this repository adds value to your learning, consider giving it a ⭐ to show your support.
