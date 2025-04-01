const Game = require('../models/sequelize/game');

class GameManager {
    constructor() {
        // In-memory game state, keyed by gameId
        this.gameStates = {};
        // Store corresponding DB models
        this.gamesAsDBModels = {};
        // Track the host for each game (gameId -> ConnectedPlayer)
        this.gameHosts = {};
        // Prevent duplicate autosave loops
        this.gameStateAutosaveLoops = {}
        // Time syncing
        this.gameTimeLastSaved = {}

        // Arbitrary limits
        this.MAX_CONNECTED_PLAYERS = 500;
        this.MAX_PLAYERS_IN_POOL = 10;
        this.AUTOSAVE_INTERVAL_SECS = 5;
    }

    async getLastSavedGameState(gameId) {
        console.log(`Loading ${gameId}...`);
        const game = await Game.findOne({
            where: { public_id: gameId }
        });
        this.gamesAsDBModels[gameId] = game;
        if (game && (game.status !== 0) && game.state_data) {
            this.gameTimeLastSaved[gameId] = Date.now()
            return JSON.parse(game.state_data);
        }
        return false;
    }

    async gameStateAutosaveLoop(gameId) {
        console.log(`Autosaving ${gameId}`);
        const game = this.gamesAsDBModels[gameId];
        if (!game) {
            console.error("Autosave failed, absent DB model!");
            return;
        }

        // Update with new state
        const newGameState = this.gameStates[gameId];
        game.state_data = JSON.stringify(newGameState);

        // Update server seconds
        // We increase elapsed server seconds by the autosave interval
        // static instead of measuring from "gameTimeLastSaved",
        // because that stays cached between the end of an autosave
        // loop and the start of another, which would result in the
        // duration of the gap between the two loops being added to
        // server seconds, which was completely counterintuitive
        // Increasing by what we know is the amount of seconds between
        // autosaves is safer and practically the same
        game.server_seconds_elapsed += this.AUTOSAVE_INTERVAL_SECS
        this.gameTimeLastSaved[gameId] = Date.now()

        // Save all
        await game.save();

        // Stop autosave if no host is connected
        if (!this.gameHosts[gameId]) {
            console.log(`Ending autosave loop for ${gameId}`);
            delete this.gameStateAutosaveLoops[gameId]
            return;
        } else {
            setTimeout(() => this.gameStateAutosaveLoop(gameId), 1000 * this.AUTOSAVE_INTERVAL_SECS);
        }
    }

    startGameStateAutosaveLoop(gameId) {
        console.log(`Starting autosave loop for ${gameId}`);
        if (gameId in this.gameStateAutosaveLoops) {
            console.log(`Cancelled — there is an autosave loop for ${gameId} already`)
            return
        }
        this.gameStateAutosaveLoops[gameId] = true
        setTimeout(() => this.gameStateAutosaveLoop(gameId), 1000 * this.AUTOSAVE_INTERVAL_SECS);
    }

    getPlayersConnectedToPool(connectedPlayers, poolId) {
        return Object.values(connectedPlayers).filter(cP => cP.connectedGameId == poolId);
    }
}

module.exports = GameManager;
