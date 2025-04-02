/*

    Aminol

*/

class Aminol {
    constructor() {
        this.id = String(Math.random())

        // An Aminol is an abstract concept,
        // as it does not actually exist.
        // Instead, it is simply the "source"
        // for Presences, which are its clones
        // and visual representation
        this.presences = [
            {
                // Absolute position
                x: 0,
                y: 0,
                // Node tree for dynamic
                // building
                parent: null
            }
        ]

        // Imagine this as the container
        // for all this Aminol's Presences
        // So they all move as one
        this.body = {
            position: {
                x: 0, y: 0
            }
        }
    }
    updateLife() {
        // Update each Presence
    }
}

module.exports = Aminol