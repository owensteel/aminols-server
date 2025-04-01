const msgpack = require('msgpack-lite');
const ConnectedPlayer = require('../models/connectedPlayer');

class SocketManager {
    constructor(io, gameManager, gameContestManager) {
        this.io = io;
        this.gameManager = gameManager;
        this.gameContestManager = gameContestManager;
        // Map of socketId -> ConnectedPlayer
        this.connectedPlayers = {};
        this.registerSocketEvents();
    }

    registerSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);
            const socketId = socket.id;

            // Check if service is at capacity
            if (Object.keys(this.connectedPlayers).length >= this.gameManager.MAX_CONNECTED_PLAYERS) {
                this.io.to(socketId).emit('server_error', 'service_maxcapacity');
                socket.disconnect();
                return;
            }

            // Handle pool connection
            socket.on('pool_connect', async (data) => {
                console.log(`${socketId} trying to connect to ${data.poolId}...`);
                const connectedPoolId = data.poolId;

                // Initialize game state if it doesn't exist
                if (!(connectedPoolId in this.gameManager.gameStates)) {
                    const lastSavedGameState = await this.gameManager.getLastSavedGameState(connectedPoolId);
                    if (lastSavedGameState) {
                        this.gameManager.gameStates[connectedPoolId] = lastSavedGameState;
                    } else {
                        this.io.to(socketId).emit('server_error', 'pool_noexist');
                        return;
                    }
                }

                // Check Pool capacity
                const playersConnectedToPool = this.gameManager.getPlayersConnectedToPool(this.connectedPlayers, connectedPoolId);
                console.log(`${playersConnectedToPool.length} players connected`);
                if (playersConnectedToPool.length >= this.gameManager.MAX_PLAYERS_IN_POOL) {
                    this.io.to(socketId).emit('server_error', 'pool_maxcapacity');
                }

                // Create a new ConnectedPlayer instance
                const connectedPlayer = new ConnectedPlayer(socketId, connectedPoolId);
                this.connectedPlayers[socketId] = connectedPlayer;
                console.log(`${socketId} connected to ${data.poolId}`);

                // If no host exists, make this player the host
                if (!this.gameManager.gameHosts[connectedPoolId]) {
                    console.log(`${socketId} is hosting ${connectedPoolId}`);
                    this.io.to(socketId).emit('pool_host_init', msgpack.encode(this.gameManager.gameStates[connectedPoolId]));
                    this.gameManager.gameHosts[connectedPoolId] = connectedPlayer;
                    this.gameManager.startGameStateAutosaveLoop(connectedPoolId);
                }
            });

            // Handle host synchronization
            socket.on('pool_host_sync', async (hostGameStateBuffer) => {
                if (!hostGameStateBuffer) return;
                const hostGameState = msgpack.decode(hostGameStateBuffer);
                const hostedPoolId = hostGameState.id;
                if (this.gameManager.gameHosts[hostedPoolId] && socketId === this.gameManager.gameHosts[hostedPoolId].socketId) {
                    // Update persistent state to host's state
                    // Additively update the state with what the
                    // host provides
                    if (hostedPoolId in this.gameManager.gameStates) {
                        // Clone the cached game state before we start editing
                        const cachedGameState = JSON.parse(JSON.stringify(this.gameManager.gameStates[hostedPoolId]));

                        // Introduce state sent from host
                        this.gameManager.gameStates[hostedPoolId] = hostGameState;

                        // Re-add in any static data, that host has not sent, from
                        // our cache clone
                        const orgIDsOnHostHashmap = {}
                        for (const orgOnHost of this.gameManager.gameStates[hostedPoolId].organisms) {
                            const cachedOrg = cachedGameState.organisms.find((o) => {
                                return o.id == orgOnHost.id
                            })
                            if (cachedOrg) {
                                // We want our state here to have the most complete
                                // version of the game state data, so we can send it
                                // to any new clients
                                // DNA is not sent more than once by the host because
                                // it is lengthy, so instead we store and inject it here
                                orgOnHost.dna = cachedOrg.dna
                                // Save in hashmap for quick search in "death spot"
                                orgIDsOnHostHashmap[orgOnHost.id] = orgOnHost.id
                            } else {
                                // Organism is not in cache, so must be new
                                // So add Organism to Contest database
                                this.gameContestManager.addOrganismToGameContest(
                                    orgOnHost,
                                    hostedPoolId,
                                    this.gameManager.gamesAsDBModels[hostedPoolId].server_seconds_elapsed
                                )
                            }
                        }

                        // Detect what organisms have died — i.e, any that we have
                        // in the cache that are missing in the host's state
                        for (const orgInCache of cachedGameState.organisms) {
                            if (!(orgInCache.id in orgIDsOnHostHashmap)) {
                                // Organism in our cache is not in host state, so
                                // it must have died
                                this.gameContestManager.removeOrganismFromGameContest(orgInCache, hostedPoolId)
                            }
                        }

                        // Final check to confirm no DNA has been lost — this throws
                        // a fatal exception because it should never be allowed to
                        // happen (potential user data loss!)
                        const finalGameState = this.gameManager.gameStates[hostedPoolId]
                        if (finalGameState.organisms.length > 0 &&
                            !finalGameState.organisms.every(o => "dna" in o)) {
                            console.log("Game state dump:", finalGameState);
                            throw new Error("FATAL: Server game state has missing DNA — cannot save or send to clients.");
                        }
                    } else {
                        console.log("Host sync stopped: game state is uninitialised on server!");
                        return;
                    }

                    // Send updated state to all players in the pool (except the host)
                    for (const cp of Object.values(this.connectedPlayers)) {
                        if (cp.socketId !== socketId && cp.connectedGameId === hostedPoolId) {
                            // Create a clone / tailored state so no client-cached
                            // data is sent
                            const dataToSend = JSON.parse(JSON.stringify(
                                this.gameManager.gameStates[hostedPoolId]
                            ));
                            for (const orgData of dataToSend.organisms) {
                                if (cp.importedOrganisms.includes(orgData.id)) {
                                    delete orgData["dna"];
                                } else {
                                    cp.importedOrganisms.push(orgData.id);
                                }
                            }
                            this.io.to(cp.socketId).emit('pool_client_update', msgpack.encode(dataToSend));
                        }
                    }
                } else {
                    this.io.to(socketId).emit('pool_host_reset_to_client', true);
                }
            });

            // Handle new organism event
            socket.on('pool_new_organism', (data) => {
                const connectedGameId = data.poolId;
                const newOrganismData = data.organismData
                // Prevent new incoming connections when Pool is at max capacity
                const playersInPool = this.gameManager.getPlayersConnectedToPool(this.connectedPlayers, connectedGameId);
                if (playersInPool.length >= this.gameManager.MAX_PLAYERS_IN_POOL) {
                    this.io.to(socketId).emit('server_error', 'pool_maxcapacity');
                    return;
                }
                // Send organism to host to update active game state
                if (this.gameManager.gameHosts[connectedGameId]) {
                    this.io.to(this.gameManager.gameHosts[connectedGameId].socketId).emit(
                        'pool_host_update',
                        {
                            updateType: "new_organism",
                            newOrganismData: newOrganismData
                        }
                    );
                }
                console.log(`New organism in Pool ${connectedGameId}`);
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socketId);
                if (this.connectedPlayers[socketId]) {
                    const connectedGameId = this.connectedPlayers[socketId].connectedGameId;
                    if (this.gameManager.gameHosts[connectedGameId] &&
                        this.gameManager.gameHosts[connectedGameId].socketId === socketId) {
                        // Disconnecting player was a host, try and find a new host
                        console.log(`Host for ${connectedGameId} disconnected!`);
                        delete this.gameManager.gameHosts[connectedGameId];
                        for (const cp of this.gameManager.getPlayersConnectedToPool(this.connectedPlayers, connectedGameId)) {
                            if (cp.socketId !== socketId) {
                                console.log(`${cp.socketId} is now hosting ${connectedGameId}`);
                                this.io.to(cp.socketId).emit('pool_host_init', msgpack.encode(this.gameManager.gameStates[connectedGameId]));
                                this.gameManager.gameHosts[connectedGameId] = cp;
                                break;
                            }
                        }
                    }
                }
                delete this.connectedPlayers[socketId];
            });
        });
    }
}

module.exports = SocketManager;
