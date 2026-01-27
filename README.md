# Realtime Chess Game

A real-time multiplayer chess application built using React, Node.js, and Socket.IO. The platform supports private room creation using a PIN, real-time move synchronization, configurable timers, and multiple board themes.

---

## Features

* Real-time multiplayer gameplay using Socket.IO
* Create and join private rooms via PIN
* Configurable game timers
* Multiple chessboard themes
* Validated chess moves and game state management
* Modular and scalable frontend and backend architecture

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

## Project Folder Structure

```
checkmatex/
├── public/
│   └── vite.svg
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── roomController.js
│   │   │   └── gameController.js
│   │   ├── services/
│   │   │   ├── roomService.js
│   │   │   ├── timerService.js
│   │   │   └── chessService.js
│   │   ├── sockets/
│   │   │   ├── room.socket.js
│   │   │   ├── game.socket.js
│   │   │   └── timer.socket.js
│   │   ├── utils/
│   │   │   ├── generatePin.js
│   │   │   └── validateMove.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── socket/
│   ├── store/
│   ├── utils/
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

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/realtime-chess-game.git
cd realtime-chess-game
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

The application will be available at `http://localhost:5173`.

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
* AI opponent integration
* Match history and PGN export
* User authentication
* Online matchmaking

---

## Author

Manish Kumar Sah
B.Tech Computer Science and Engineering

---

## License

This project is licensed under the MIT License.
