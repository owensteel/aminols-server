/*

    Aminol

*/

const { Vector3 } = require("three")
const AminolPresence = require("./aminol.presence")
const Arena = require("./arena")
const Main = require("./main")

class Aminol {
    constructor(arena) {
        if (!arena) {
            throw new Error("Aminol must reference Arena")
        }
        this.arena = arena

        this.id = String(Math.random())

        // An Aminol is an abstract concept,
        // as it does not actually exist.
        // Instead, it is simply the "source"
        // for Presences, which are its clones
        // but for visual representation only
        this.presences = [
            new AminolPresence(this, 0, 0)
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
    addPresence(absX, absY) {
        const newPresence = new AminolPresence(this, 1, absX, absY)
        this.presences.push(newPresence)

        // Update clients through SocketManager
        this.arena.game.updateClientsAboutNewPresence(
            this.id, newPresence
        )

        return newPresence
    }
    getPresencesAsMap() {
        const map = {}
        for (const presence of this.presences) {
            if (!(presence.x in map)) {
                map[presence.x] = {}
            }
            map[presence.x][presence.y] = presence
        }
        return map
    }
}

module.exports = Aminol