/*

    Game

*/

const Aminol = require("./v0.aminol");
const Arena = require("./v0.arena");
const { UPDATE_FPS } = require("./v0.references");

class Game {
    constructor() {
        // Arena
        const currentArena = new Arena()
        this.arena = currentArena

        // Player
        const playerAminol = new Aminol(this.arena)
        this.arena.addAminol(playerAminol)

        // Opponent
        this.arena.addAminol(
            new Aminol(this.arena)
        )

        // Arena render loop
        setInterval(() => {
            currentArena.renderLife()
        }, 1000 / UPDATE_FPS)
    }
}

module.exports = Game;