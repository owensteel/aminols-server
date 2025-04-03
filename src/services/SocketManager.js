/*

    SocketManager

    Sends and receives updates about the Game to and
    from the connected players. This means the Game
    itself does not have to process socket connections.

*/

const msgpack = require('msgpack-lite');
const Main = require('../game/main');

class ConnectedPlayer {
    constructor(socketId) {
        this.socketId = socketId;
    }
}

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

        // Handle connections
        this.io.on('connection', (socket) => {
            // Has to be done this longhand
            // way or this.connectedPlayers
            // won't be initialised for some
            // reason...
            this.handleNewSocketConnections(socket)
        });

        // Allow Game to update clients about specific events
        this.handleUpdatesByGame()
    }

    handleUpdatesByGame() {
        // Update all clients when an Aminol has a new Presence
        this.game.updateClientsAboutNewPresence = (
            aminolId, newPresence
        ) => {
            for (const socketId of Object.keys(this.connectedPlayers)) {
                this.io.to(socketId).emit(
                    'newAminolPresence',
                    {
                        aminolId: aminolId,
                        newPresence: newPresence.inStaticForm()
                    }
                );
            }
        }
    }

    handleNewSocketConnections(socket) {
        console.log('New client connected:', socket.id);

        // Cache this player
        const socketId = socket.id;
        const thisConnectedPlayer = new ConnectedPlayer(socketId)
        this.connectedPlayers[socketId] = thisConnectedPlayer

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socketId);
            delete this.connectedPlayers[socketId];
        });

        // Update client

        // Initialise client's version of Arena
        for (const aminol of this.game.arena.aminols) {
            this.io.to(socketId).emit(
                'initAminol',
                {
                    aminolId: aminol.id,
                    position: aminol.body.position,
                    presences: aminol.presences.map((presence) => {
                        return presence.inStaticForm()
                    })
                }
            );
        }

        // Constantly update client about Aminol positions
        // TODO: Could this be one main loop that updates
        // all players at once?
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
    }
}

module.exports = SocketManager;
