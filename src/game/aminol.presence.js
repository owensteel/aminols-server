/*

    Aminol Presence

    The dummy representation of a clone of an Aminol

*/

class AminolPresence {
    constructor(source, energy = 1, x = 0, y = 0, parent = null) {
        if (!source) {
            throw new Error("Aminol Presence must have Aminol source")
        } else {
            this.source = source
        }

        this.energy = energy
        // Absolute position (in blocks,
        // i.e WX = X * AMINOL_NODE_SIZE)
        // Relative to the centre of the
        // Aminol's body (0,0)
        this.x = x
        this.y = y
        // Node tree for dynamic building
        this.parent = parent
    }
    updateLife() {
        // something
    }
    inStaticForm() {
        return {
            energy: this.energy,
            x: this.x,
            y: this.y
        }
    }
}

module.exports = AminolPresence