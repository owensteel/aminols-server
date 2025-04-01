const { sendContestUpdateNotificationToUser } = require("./Notifications")
const ContestOrganism = require('../models/sequelize/contestOrganism');

class GameContestManager {
    constructor() {
        // TODO
    }
    addOrganismToGameContest(organismData, gameId, serverSecsAtEntry) {
        if (!organismData.creatorId) {
            console.log(`Could not create Contest Entry for Organism ${organismData.id}, no creator ID`)
            return
        }
        ContestOrganism.create({
            organism_id: organismData.id,
            creator_public_id: organismData.creatorId,
            game_id: gameId,
            server_seconds_at_entry: serverSecsAtEntry
        }).then(() => {
            console.log(`Added organism to contest ${gameId}`)
        }).catch((e) => {
            console.error(`Couldn't add organism to contest ${gameId}`, e)
        })
    }
    async removeOrganismFromGameContest(organismData, gameId) {
        const contestEntry = await ContestOrganism.findOne({
            where: {
                organism_id: organismData.id,
                game_id: gameId,
            }
        })
        if (!contestEntry) {
            console.log(`No Contest Entry could be found for Organism ${organismData.id}`)
            return
        }

        // Notify creator

        sendContestUpdateNotificationToUser(
            contestEntry.creator_public_id,
            gameId
        )

        // Remove from Contest Entries DB

        contestEntry.destroy().then(() => {
            console.log(`Removed organism from contest ${gameId}`)
        }).catch((e) => {
            console.error(`Couldn't remove organism from contest ${gameId}`, e)
        })
    }
}

module.exports = GameContestManager;