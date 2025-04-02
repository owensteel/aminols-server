/*

    Aminol

*/

const AminolPresence = require("./aminol.presence")

class Aminol {
    constructor() {
        this.id = String(Math.random())

        // An Aminol is an abstract concept,
        // as it does not actually exist.
        // Instead, it is simply the "source"
        // for Presences, which are its clones
        // but for visual representation only
        this.presences = [new AminolPresence()]

        // Imagine this as the container
        // for all this Aminol's Presences
        // So they all move as one
        this.body = {
            position: {
                x: 0, y: 0
            },
            velocity: {
                x: 0, y: 0
            }
        }
    }
    updateLife() {
        // Update each Presence
        for (const presence of this.presences) {
            presence.updateLife()
        }
    }
}

module.exports = Aminol