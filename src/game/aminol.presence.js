/*

    Aminol Presence

    The dummy representation of a clone of an Aminol

*/

const { ENERGY_NATURAL_DECREASE } = require("./references")

const FLAG_TEST_AUTODIVIDE = false

const CHILD_PRESENCE_OFFSETS_TO_ATTEMPT = [
    // Above
    { x: 0, y: -1 },
    // Right
    { x: 1, y: 0 },
    // Bottom
    { x: 0, y: 1 },
    // Left
    { x: -1, y: 0 }
]

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

        // Division debugging
        if (FLAG_TEST_AUTODIVIDE) {
            setTimeout(() => {
                const divInt = setInterval(() => {
                    if (!this.divide()) {
                        clearInterval(divInt)
                    }
                }, 5000)
            }, Math.random() * 1000)
        }
    }
    updateLife() {
        this.energy -= ENERGY_NATURAL_DECREASE
    }
    divide() {
        // Find next unoccupied position
        let childPresence = null
        const currentPresencesMap = this.source.getPresencesAsMap()
        for (const childOffset of CHILD_PRESENCE_OFFSETS_TO_ATTEMPT) {
            const offsetAsAbsPosition = {
                x: childOffset.x + this.x,
                y: childOffset.y + this.y
            }
            if (
                !currentPresencesMap[offsetAsAbsPosition.x] ||
                !currentPresencesMap[offsetAsAbsPosition.x][offsetAsAbsPosition.y]
            ) {
                childPresence = this.source.addPresence(
                    offsetAsAbsPosition.x, offsetAsAbsPosition.y
                )
                break
            }
        }
        return childPresence
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