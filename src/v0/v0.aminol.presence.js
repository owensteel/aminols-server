/*

    Aminol Presence

    The physical representation of an Aminol clone.

*/

const Aminol = require("./v0.aminol");
const { CHILD_NODE_X_OFFSET, CHILD_NODE_Y_OFFSET } = require("./v0.references");
const { generatedId } = require("./v0.utils");

const ENERGY_NATURAL_DECREASE = (0.01 / 10)
const DEFAULT_PRESET_PRESENCE = {
    energy: 1,
    edges: Array(4)
}
const FLAG_TEST_AUTODIVIDE = false

function getRelativePositionOfEdgeNode(edgeOfParent, parentPosition) {
    const result = {
        x: parentPosition.x,
        y: parentPosition.y
    }
    switch (edgeOfParent) {
        case 0:
            // Top
            result.y -= CHILD_NODE_Y_OFFSET
            break;
        case 1:
            // Left
            result.x -= CHILD_NODE_X_OFFSET
            break;
        case 2:
            // Bottom
            result.y += CHILD_NODE_Y_OFFSET
            break;
        case 3:
            // Right
            result.x += CHILD_NODE_X_OFFSET
            break;
        default:
            console.warn("No edge of parent specified")
    }
    return result
}

class AminolPresence {
    constructor(source, preset, parentPresence = null, edgeOfParent = null) {
        if (!(source instanceof Aminol)) {
            throw new Error("Aminol Presence must have Aminol source")
        }
        this.source = source

        // State
        this.presenceIndex = source.absolutePresences.length
        this.id = generatedId()
        this.energy = preset.energy

        // Body
        this.needsRender = false
        this.mesh = this.source.body.mesh.clone(true)
        if (parentPresence) {
            // Add mesh to parent's mesh (helps
            // with relativity)
            parentPresence.mesh.add(this.mesh)
            // Move to correct edge position
            const nodeMeshEdgePos = getRelativePositionOfEdgeNode(
                edgeOfParent,
                this.mesh.position
            )
            this.mesh.position.x = nodeMeshEdgePos.x
            this.mesh.position.y = nodeMeshEdgePos.y
        } else {
            // Add to visualContainer
            this.needsRender = true
        }
        this.absolutePos = { x: 0, y: 0 }

        // Dynamic tree (build from preset)
        this.parentPresence = parentPresence
        this.edgeOfParent = edgeOfParent
        if (!preset) {
            console.warn("No preset input, using default Presence preset")
            preset = DEFAULT_PRESET_PRESENCE
        }
        this.edges = Array(4)
        preset.edges.forEach((edge, edgeIndex) => {
            if (edge) {
                const childPresence = new AminolPresence(
                    this.source,
                    edge,
                    this,
                    edgeIndex
                )
                // Add child as edge of self
                this.edges[edgeIndex] = childPresence
            }
        })

        // Stops all cells doing something at the same
        // time, which is bad for performance
        this.uniqueMicrodelaySecs = (this.presenceIndex / 2)

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
        // Ensure the cache we rely on for
        // checking existing node / Presence
        // positions is  up-to-date
        this.source.updateAbsolutePresences()
        this.source.updatePresencesPositionsTable()

        // Find the index of the next available edge
        const nextFreeEdgeIndex = this.edges.findIndex(
            (edge, edgeIndex) => {
                // Obvious check
                // Firstly, check if this edge already
                // references something

                if (edge) {
                    return false
                }

                // Main check
                // Speculate the position a node of this edge
                // would be in, so we can check whether or not
                // that position has already been taken in the
                // "grid" version of the tree

                const nodeMeshEdgePos = getRelativePositionOfEdgeNode(
                    edgeIndex,
                    this.absolutePos
                )
                const edgeRowInd = Math.ceil(nodeMeshEdgePos.y / CHILD_NODE_Y_OFFSET)
                const edgeColInd = Math.ceil(nodeMeshEdgePos.x / CHILD_NODE_X_OFFSET)

                return (
                    // Is not occupied by any other
                    // node / Presence in the tree
                    (
                        !this.source.presencesPositionsTable[edgeRowInd] ||
                        !this.source.presencesPositionsTable[edgeRowInd][edgeColInd]
                    )
                )
            }
        )
        if (nextFreeEdgeIndex > -1) {
            // Duplicate this node and add it as
            // a child of the available free edge
            const childPresence = new AminolPresence(
                this.source,
                DEFAULT_PRESET_PRESENCE,
                this,
                nextFreeEdgeIndex
            )
            this.edges[nextFreeEdgeIndex] = childPresence

            // Update the cache with the new node
            this.source.updateAbsolutePresences()
            this.source.updatePresencesPositionsTable()
        } else {
            return false
        }
        return true
    }
    exportToStatic() {
        return {
            energy: this.energy,
            edges: this.edges.map(edge => { return edge.exportToStatic() })
        }
    }
}

module.exports = AminolPresence;
