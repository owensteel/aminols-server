/*

    3D elements

    Provides access to Three JS elements and utilities for the 3D world.

*/

const THREE = require('three');
const { OBJLoader } = import('three/addons/loaders/OBJLoader.js');

// Initialize Three.js scene

// Boundaries
const arenaDim = 5000

// Canvas (UI)
const canvasDim = 500
const canvasWidth = canvasDim;
const canvasHeight = canvasDim;

const scene = new THREE.Scene();

// Loads an OBJ model from a URL and returns it as a "scene"
// NOTE: Currently not used anywhere
async function loadModel(objUrl) {
    const loader = new OBJLoader();

    try {
        const obj = await new Promise((resolve, reject) => {
            loader.load(
                objUrl,
                resolve, // Call resolve on successful load
                undefined, // Progress callback
                reject // Call reject on error
            );
        });

        return obj; // Return the loaded OBJ model
    } catch (error) {
        console.error('Error loading OBJ model:', error);
        throw error;
    }
}

// A solution for "bumping" organisms when they have complicated positions
// and rotations
function translateMeshInWorld(mesh, offsetX, offsetY) {
    // Build the offset in world space
    const offsetWorld = new THREE.Vector3(offsetX, offsetY, 0);

    // Transform this world-space offset back into the mesh’s local coordinate space
    // Adding it to mesh.position will move the mesh in world space
    // Extract the mesh’s rotation and scale from its matrixWorld, invert that,
    // and apply it to offsetWorld

    // Make sure matrixWorld is updated
    mesh.updateMatrixWorld(true);

    // Extract rotation+scale from matrixWorld
    const rotScaleMatrix = new THREE.Matrix4().extractRotation(mesh.matrixWorld);
    // Assumes uniform scale

    // Invert to go from world to local direction
    const invRot = new THREE.Matrix4().copy(rotScaleMatrix).invert();

    // Apply inverse to offset
    offsetWorld.applyMatrix4(invRot);

    // Now offsetWorld is the correct local offset to achieve that world shift
    mesh.position.x += offsetWorld.x;
    mesh.position.y += offsetWorld.y;
    mesh.position.z += offsetWorld.z;
}

// Gets the position of a node in the 3D space, factoring in instance's and
// parent's rotations
function convertNodePosIntoWorldPos(nodePos, organismMesh) {
    const nodeClone = {}
    for (const key of Object.keys(nodePos)) {
        nodeClone[key] = nodePos[key]
    }

    // We clone the node because otherwise the X and Y of the original
    // node will be updated to the world X and Y, and we will lose the
    // local positions

    nodeClone.localNode = nodePos

    // Calc real world positions, factoring in mesh position and rotation

    const localVec = new THREE.Vector3(nodePos.x, nodePos.y, 0);
    localVec.applyMatrix4(organismMesh.matrixWorld);

    nodeClone.x = localVec.x
    nodeClone.y = localVec.y

    return nodeClone
}

// For rotating meshes on a 2D axis in 3D space
function rotateMeshToTarget(mesh, nx, ny, targetX, targetY) {
    // 1) localAngle: The angle from the mesh's origin to the node in local space
    const localAngle = Math.atan2(ny, nx);

    // 2) node's current world coords (assuming no prior rotation on mesh)
    //    If the mesh is at mesh.position.x, mesh.position.y:
    const nodeWorldX = mesh.position.x + nx;
    const nodeWorldY = mesh.position.y + ny;

    // 3) angle from the node's world position to the target
    const targetAngle = Math.atan2(targetY - nodeWorldY, targetX - nodeWorldX);

    // 4) the rotation needed so node points at the target
    const deltaTheta = targetAngle - localAngle;

    // Set the mesh's Z rotation in radians
    if (!isNaN(deltaTheta)) {
        mesh.rotation.z = deltaTheta;
    }
}

// Get 3D edges

const canvasEdges3D = {
    top: {
        left: {
            x: -(canvasWidth / 2),
            y: (canvasHeight / 2)
        },
        right: {
            x: (canvasWidth / 2),
            y: (canvasHeight / 2)
        }
    },
    bottom: {
        left: {
            x: -(canvasWidth / 2),
            y: -(canvasHeight / 2)
        },
        right: {
            x: (canvasWidth / 2),
            y: -(canvasHeight / 2)
        }
    }
}

const arenaEdges3D = {
    top: {
        left: {
            x: -(arenaDim / 2),
            y: (arenaDim / 2)
        },
        right: {
            x: (arenaDim / 2),
            y: (arenaDim / 2)
        }
    },
    bottom: {
        left: {
            x: -(arenaDim / 2),
            y: -(arenaDim / 2)
        },
        right: {
            x: (arenaDim / 2),
            y: -(arenaDim / 2)
        }
    }
}

module.exports = {
    scene,
    arenaEdges3D,
    canvasEdges3D,
    loadModel,
    translateMeshInWorld,
    convertNodePosIntoWorldPos,
    rotateMeshToTarget
};
