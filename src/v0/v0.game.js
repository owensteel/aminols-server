/*

    Game

*/

import { startRenderLoop } from "./v0.3d"
import Aminol from "./v0.aminol";
import Arena from "./v0.arena";
import { UPDATE_FPS } from "./v0.references";

class Game {
    constructor() {
        // 3D render loop
        startRenderLoop()

        // Arena
        const currentArena = new Arena()
        this.arena = currentArena
        window.cA = currentArena

        // Player
        const playerAminol = new Aminol(this.arena)
        this.arena.addAminol(playerAminol)
        window.cAn = playerAminol

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

export default Game