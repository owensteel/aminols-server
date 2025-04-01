/*

    Aminol

    Holds the DNA and generates the Body for an Aminol.
    It is not a physical object, but rather a STATIC
    controller and "source" for its clones/presences.

*/

import * as THREE from "three"
import AminolPresence from "./v0.aminol.presence"
import Arena from "./v0.arena"
import { createTextTexture, scene } from "./v0.3d"
import { AMINOL_NODE_SIZE, AMINOL_NODE_WIDTH, CHILD_NODE_X_OFFSET, CHILD_NODE_Y_OFFSET } from "./v0.references"
import { generatedId } from "./v0.utils"

// Body

const bodyColor = ["red", "lightgreen", "yellow"]

const faceSprite = createTextTexture(":3")

function generateAminolBodyMesh() {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
            AMINOL_NODE_WIDTH,
            AMINOL_NODE_SIZE
        ),
        new THREE.MeshBasicMaterial(
            {
                color: bodyColor.pop(),
                transparent: true,
                opacity: 1
            }
        )
    )
    const faceSpriteClone = faceSprite.clone()
    faceSpriteClone.position.z = 1
    mesh.add(faceSpriteClone)
    return mesh
}

class AminolBody {
    constructor() {
        this.mesh = generateAminolBodyMesh()
    }
}

// Model

const presencesTestJson = {
    energy: 0.7259999999999998,
    edges: []
}

class Aminol {
    constructor(arena) {
        if (!(arena instanceof Arena)) {
            throw new Error("Arena must be provided")
        }
        this.arena = arena

        // Static
        this.id = generatedId()
        this.dna = []
        // NOTE: Body is for cloning, NOT for rendering!
        // The visualContainer is what renders
        this.body = new AminolBody()

        // Dynamic
        this.hasRendered = false
        this.visualContainer = new THREE.Group()
        this.velocity = {
            x: 0,
            y: 0,
            z: 0
        }
        this.absolutePresences = []
        this.presencesPositionsTable = {}

        // Tree
        this.presences = new AminolPresence(
            this, presencesTestJson
        )
        this.updateAbsolutePresences()
    }
    updateAbsolutePresences() {
        this.absolutePresences = []

        const addPresenceAsAbsolute = (presence) => {
            const localVec = new THREE.Vector3(
                presence.mesh.position.x,
                presence.mesh.position.y,
                0
            );
            if (presence.parentPresence) {
                localVec.applyMatrix4(
                    presence.parentPresence.mesh.matrixWorld
                );
                // Convert from world to just absolute
                presence.absolutePos = {
                    x: localVec.x - this.visualContainer.position.x,
                    y: localVec.y - this.visualContainer.position.y
                }
            } else {
                presence.absolutePos = presence.mesh.position
            }
            this.absolutePresences.push(presence)
        }

        const flattenPresence = (focusedPresence) => {
            if (focusedPresence instanceof AminolPresence) {
                for (const child of focusedPresence.edges) {
                    if (child instanceof AminolPresence) {
                        addPresenceAsAbsolute(child)
                        flattenPresence(child)
                    }
                }
            }
        }
        addPresenceAsAbsolute(this.presences)
        flattenPresence(this.presences)

        return this.absolutePresences
    }
    updatePresencesPositionsTable() {
        this.presencesPositionsTable = {}
        for (const aminolPresence of this.absolutePresences) {
            if (!aminolPresence) {
                continue
            }
            const rowInd = Math.round(aminolPresence.absolutePos.y / CHILD_NODE_Y_OFFSET)
            const colInd = Math.round(aminolPresence.absolutePos.x / CHILD_NODE_X_OFFSET)
            if (!(rowInd in this.presencesPositionsTable)) {
                this.presencesPositionsTable[rowInd] = []
            }
            this.presencesPositionsTable[rowInd][colInd] = aminolPresence
        }
    }
    updatePresences() {
        let presenceIndex = 0
        for (const aminolPresence of this.absolutePresences) {
            if (!aminolPresence) {
                continue
            }

            // Rendering
            if (aminolPresence.needsRender) {
                this.visualContainer.add(aminolPresence.mesh)
                aminolPresence.needsRender = false
            }

            // Living
            aminolPresence.updateLife()
            if (aminolPresence.energy < 0.01) {
                scene.remove(aminolPresence.mesh)
            }

            presenceIndex++
        }
    }
    updateEffects() {
        const effectsMultiplyFactor = this.absolutePresences.length

        // Multiply effects of a single Aminol by the
        // amount of presences it has
        for (let i = 0; i < effectsMultiplyFactor; i++) {
            // Motion
            this.visualContainer.position.add(
                new THREE.Vector3(
                    this.velocity.x,
                    this.velocity.y,
                    0
                )
            );
        }
    }
    exportToStatic() {
        return {
            id: this.id,
            dna: this.dna,
            presences: this.presences.exportToStatic()
        }
    }
}

export default Aminol