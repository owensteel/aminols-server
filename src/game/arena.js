/*

    Arena

*/

const Aminol = require("./aminol")
const collisionSync = require("./arena.collisions")

class Arena {
    constructor() {
        this.aminols = []
    }
    addAminol(aminol) {
        if (!(aminol instanceof Aminol)) {
            throw new Error("Invalid instance")
        }
        this.aminols.push(aminol)
    }
    renderLife() {
        // Update each Aminol's state
        for (const aminol of this.aminols) {
            aminol.updateLife()
        }
        // Collide them with each other
        for (const aminol1 of this.aminols) {
            for (const aminol2 of this.aminols) {
                if (aminol2.id !== aminol1.id) {
                    collisionSync(aminol1, aminol1)
                }
            }
        }
    }
}

module.exports = Arena