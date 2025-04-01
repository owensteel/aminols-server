// Connected Player model

class ConnectedPlayer {
    constructor(socketId, connectedGameId) {
        this.socketId = socketId;
        this.connectedGameId = connectedGameId;
        this.importedOrganisms = [];
    }
}

module.exports = ConnectedPlayer;
