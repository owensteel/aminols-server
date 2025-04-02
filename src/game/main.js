/*

    Main

*/

const Arena = require("./arena")
const Aminol = require('./aminol')
const { UPDATE_FPS } = require('./references')

class Main {
    constructor() {
        // Arena
        const currentArena = new Arena()
        this.arena = currentArena

        // Test
        const testAminol = new Aminol(this.arena)
        currentArena.addAminol(testAminol)

        // Arena render loop
        setInterval(() => {
            currentArena.renderLife()
        }, 1000 / UPDATE_FPS)
    }
}

module.exports = Main;