const http = require('http');
const socketIo = require('socket.io');

// Import our Express app configuration
const app = require('./config/express');

// Import our service classes
const GameManager = require('./services/GameManager');
const SocketManager = require('./services/SocketManager');
const GameContestManager = require('./services/GameContestManager');

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO with CORS options
const io = socketIo(server, {
    cors: {
        origin: (origin, callback) => {
            // Allowed origins, remote and local
            const allowedOrigins = [
                "https://static.apexenj.com",
                "http://10.0.0.34",
                "http://localhost"
            ];
            console.log("Socket.IO CORS request from", origin);
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling'],
    },
    allowEIO3: true, // For legacy engine.io clients
    pingInterval: 10000,
    pingTimeout: 5000
});

// Instantiate our game managers
const gameManager = new GameManager();
const gameContestManager = new GameContestManager();

// Instantiate our socket manager
new SocketManager(
    io,
    gameManager,
    gameContestManager
);

// Start the server
const PORT = process.env.PORT || 3002;
server.listen(PORT, 'localhost', () => {
    console.log(`Server is running on port ${PORT}`);
});
