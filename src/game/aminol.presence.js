/*

    Aminol Presence

    The dummy representation of a clone of an Aminol

*/

class AminolPresence {
    constructor() {
        // Absolute position (in blocks)
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
}

module.exports = AminolPresence