const msgpack = require('msgpack-lite');
const ConnectedPlayer = require('../models/connectedPlayer');
const Main = require('../game/main');

class SocketManager {
    constructor(io, game) {
        this.io = io;
        if (game instanceof Main) {
            this.game = game;
        } else {
            throw new Error("Must have valid instance of Game")
        }
        // Map of socketId -> ConnectedPlayer
        this.connectedPlayers = {};
        this.registerSocketEvents();
    }

    registerSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            const socketId = socket.id;
            this.connectedPlayers[socketId] = new ConnectedPlayer(socketId, "1")

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socketId);
                delete this.connectedPlayers[socketId];
            });
        });
    }
}

module.exports = SocketManager;
