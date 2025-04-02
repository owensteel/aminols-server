/*

    Organism (Aminol) syncing

*/

const { AMINOL_NODE_SIZE } = require("./references");

// Mechanics utilities

const overlapRadius = AMINOL_NODE_SIZE * 2
function getOverlappingNodes(organismNodesWorld, opponentNodesWorld) {
    const result = [];

    // Naive O(N*M) check
    for (const orgNodeWorld of organismNodesWorld) {
        if (!orgNodeWorld) {
            console.warn("null orgNodeWorld encountered")
        } else {
            for (const oppNodeWorld of opponentNodesWorld) {
                if (!oppNodeWorld) {
                    console.warn("null oppNodeWorld encountered")
                } else {
                    // AABB overlap check (quick & dirty)
                    if (
                        (orgNodeWorld.x > oppNodeWorld.x - overlapRadius) &&
                        (orgNodeWorld.x < oppNodeWorld.x + overlapRadius) &&
                        (orgNodeWorld.y > oppNodeWorld.y - overlapRadius) &&
                        (orgNodeWorld.y < oppNodeWorld.y + overlapRadius)
                    ) {
                        result.push({
                            orgNodeWorldPos: orgNodeWorld,
                            oppNodeWorldPos: oppNodeWorld
                        });
                    }
                }
            }
        }
    }
    return result;
}

function bumpNodes(organism, opponent, overlappingNodes) {
    for (const pair of overlappingNodes) {
        const orgNode = pair.orgNodeWorldPos;
        const oppNode = pair.oppNodeWorldPos;

        // Distance calculation
        const dx = orgNode.x - oppNode.x;
        const dy = orgNode.y - oppNode.y;
        const distSq = dx * dx + dy * dy;
        const minDistSq = overlapRadius * overlapRadius;

        if (distSq < minDistSq) {
            // They overlap
            const dist = Math.sqrt(distSq);
            const overlap = overlapRadius - dist;

            // Normalized push direction (opp -> org)
            let nx, ny;
            if (dist > 0) {
                nx = dx / dist;
                ny = dy / dist;
            } else {
                // If exactly overlapping, push in a default direction
                nx = 1;
                ny = 1;
            }

            // Factor in velocity influence
            const orgSpeedSq = organism.velocity.x ** 2 + organism.velocity.y ** 2;
            const oppSpeedSq = opponent.velocity.x ** 2 + opponent.velocity.y ** 2;

            let orgSpeed = Math.sqrt(orgSpeedSq);
            let oppSpeed = Math.sqrt(oppSpeedSq);

            const totalSpeed = orgSpeed + oppSpeed;

            let orgPushFactor = 0.5, oppPushFactor = 0.5;
            if (totalSpeed > 0) {
                // The faster object is affected more by the push
                orgPushFactor = oppSpeed / totalSpeed;
                oppPushFactor = orgSpeed / totalSpeed;
            }

            // Apply movement adjustments
            const pushFactor = overlap * 0.25;
            organism.visualContainer.position.x += nx * pushFactor * orgPushFactor;
            organism.visualContainer.position.y += ny * pushFactor * orgPushFactor;

            opponent.visualContainer.position.x -= nx * pushFactor * oppPushFactor;
            opponent.visualContainer.position.y -= ny * pushFactor * oppPushFactor;
        }
    }
}

// "Syncing" two organisms, i.e checking interactions with each other

function collisionSync(organism, opponent) {
    // Check if orgs are ready yet
    if (!organism.presences || !opponent.presences) {
        console.warn("Sync cancelled — node positions (presences) not ready")
        return
    }

    // Get world positions of nodes in the current update
    const organismNodesWorld = organism.presences.map((presence) => {
        return {
            x: presence.x + organism.body.position.x,
            y: presence.y + organism.body.position.y
        }
    })
    const opponentNodesWorld = opponent.presences.map((presence) => {
        return {
            x: presence.x + opponent.body.position.x,
            y: presence.y + opponent.body.position.y
        }
    })

    // Check overlapping nodes for bumping and any block functions
    const overlappingNodes = getOverlappingNodes(organismNodesWorld, opponentNodesWorld);
    if (overlappingNodes.length > 0) {
        // Bump them so that none of these overlapping node pairs remain overlapped
        bumpNodes(organism, opponent, overlappingNodes);
    }
}

module.exports = collisionSync