/*

    Main

*/

const Arena = require("./arena")
const Aminol = require('./aminol')
const { UPDATE_FPS } = require('./references')

class Main {
    constructor() {
        // Arena
        const currentArena = new Arena(this)
        this.arena = currentArena

        // Test
        const testAminol = new Aminol(this.arena)
        currentArena.addAminol(testAminol)

        const testAminol2 = new Aminol(this.arena)
        currentArena.addAminol(testAminol2)

        // Arena render loop
        setInterval(() => {
            currentArena.renderLife()
        }, 1000 / UPDATE_FPS)
    }
    // Overrides by SocketManager
    updateClientsAboutNewPresence(aminolId, newPresence) { }
}

module.exports = Main;