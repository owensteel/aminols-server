/*

    SocketManager

    Sends and receives updates about the Game to and
    from the connected players. This means the Game
    itself does not have to process socket connections.

*/

const msgpack = require('msgpack-lite');
const ConnectedPlayer = require('../models/connectedPlayer');
const Main = require('../game/main');

const SOCKET_UPS = 12

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

            // Cache this player
            const socketId = socket.id;
            const thisConnectedPlayer = new ConnectedPlayer(socketId, "1")
            this.connectedPlayers[socketId] = thisConnectedPlayer

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socketId);
                delete this.connectedPlayers[socketId];
            });

            // Update player

            // Constantly update client about Aminol positions
            setInterval(() => {
                for (const aminol of this.game.arena.aminols) {
                    this.io.to(socketId).emit(
                        'updateAminolBodyPosition',
                        {
                            aminolId: aminol.id,
                            position: aminol.body.position
                        }
                    );
                }
            }, 1000 / SOCKET_UPS)
        });
    }
}

module.exports = SocketManager;
