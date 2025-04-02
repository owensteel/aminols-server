/*

    SocketManager

    Sends and receives updates about the Game to and
    from the connected players. This means the Game
    itself does not have to process socket connections.

*/

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
        // This helps with caching for individual players, so
        // we can know which players have received what, i.e
        // new players who need to be initialised with all
        // current game data and present players who just need
        // updates.
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
