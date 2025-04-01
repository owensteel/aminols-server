/*

    Arena

*/

import { arenaEdges3D, scene, stageEdges3D } from "./v0.3d"
import Aminol from "./v0.aminol"
import syncObjects from "./v0.arena.syncObjects";
import { generatedId } from "./v0.utils";

// Collisions

const FLAG_USE_BOUNDARIES = true
function bumpCanvasEdges(aminol) {
    // If there are no nodes, skip
    if (aminol.absolutePresences.length < 1) return;

    const aminolNodesWorld = aminol.absolutePresences.map((nodePos) => {
        return {
            x: nodePos.absolutePos.x + aminol.visualContainer.position.x,
            y: nodePos.absolutePos.y + aminol.visualContainer.position.y
        }
    })

    // Grab stage edges
    const canvasRightX = arenaEdges3D.top.right.x;
    const canvasLeftX = arenaEdges3D.bottom.left.x;
    const canvasTopY = arenaEdges3D.top.right.y;
    const canvasBottomY = arenaEdges3D.bottom.right.y;

    // Find the bounding box of the Aminol
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const pos of aminolNodesWorld) {
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
    }

    // Determine how much we need to shift to keep the bounding box in-bounds
    let shiftX = 0;
    let shiftY = 0;

    // If the right edge is out of bounds, shift left
    if (maxX > canvasRightX) {
        shiftX = canvasRightX - maxX;
    }
    // If the left edge is out of bounds, shift right
    if (minX < canvasLeftX) {
        // Note: if minX is out of bounds in the other direction,
        // you might need to compare which shift is larger, or just apply them in separate steps
        shiftX = canvasLeftX - minX;
    }

    // If the top edge is out of bounds, shift down
    if (maxY > canvasTopY) {
        shiftY = canvasTopY - maxY;
    }
    // If the bottom edge is out of bounds, shift up
    if (minY < canvasBottomY) {
        shiftY = canvasBottomY - minY;
    }

    // Apply one shift to bring the bounding box inside the stage
    aminol.visualContainer.position.x += shiftX;
    aminol.visualContainer.position.y += shiftY;
}

// Model

class Arena {
    constructor() {
        this.id = generatedId()
        this.aminols = []
    }
    addAminol(aminol) {
        if (!(aminol instanceof Aminol)) {
            throw new Error("Aminol required")
        }
        this.aminols.push(aminol)
    }
    renderLife() {
        // Update all Aminols
        for (const aminol of this.aminols) {
            // Rendering
            if (!aminol.hasRendered) {
                scene.add(aminol.visualContainer)
            }

            // Motion
            aminol.updateEffects()

            // Update cell presences
            aminol.updatePresences()

            // Boundary check
            if (FLAG_USE_BOUNDARIES) {
                bumpCanvasEdges(aminol)
            }
        }
        // Check collisions
        for (const aminol of this.aminols) {
            for (const oppAminol of this.aminols) {
                if (aminol.id !== oppAminol.id) {
                    syncObjects(aminol, oppAminol)
                }
            }
        }
    }
    exportToStatic() {
        return {
            id: this.id,
            aminols: this.aminols.map((aminol) => {
                return aminol.exportToStatic()
            })
        }
    }
}

export default Arena