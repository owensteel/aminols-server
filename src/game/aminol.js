/*

    Aminol

*/

const { Vector3 } = require("three")
const AminolPresence = require("./aminol.presence")

class Aminol {
    constructor() {
        this.id = String(Math.random())

        // An Aminol is an abstract concept,
        // as it does not actually exist.
        // Instead, it is simply the "source"
        // for Presences, which are its clones
        // but for visual representation only
        this.presences = [
            new AminolPresence(1, 0, 0),
            new AminolPresence(1, -1, 0),
            new AminolPresence(1, 1, 0)
        ]

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
    updateEffects() {
        const effectsMultiplyFactor = this.presences.length
        // Multiply effects of a single Aminol by the
        // amount of Presences it has
        for (let i = 0; i < effectsMultiplyFactor; i++) {
            // Motion
            const posAsVec = new Vector3(
                this.body.position.x,
                this.body.position.y,
                0
            )
            posAsVec.add(
                new Vector3(
                    this.body.velocity.x,
                    this.body.velocity.y,
                    0
                )
            );
            this.body.position.x = posAsVec.x
            this.body.position.y = posAsVec.y
        }
    }
}

module.exports = Aminol