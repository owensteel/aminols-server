/*

    Aminol Presence

    The dummy representation of a clone of an Aminol

*/

class AminolPresence {
    constructor() {
        this.energy = 1
        // Absolute position (in blocks,
        // i.e WX = X * AMINOL_NODE_SIZE)
        // Relative to the centre of the
        // Aminol's body (0,0)
        this.x = 0
        this.y = 0
        // Node tree for dynamic building
        this.parent = null
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