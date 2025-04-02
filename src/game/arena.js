/*

    Arena

*/

const Aminol = require("./aminol")

class Arena {
    constructor() {
        this.aminols = []
    }
    addAminol(aminol) {
        if (!(aminol instanceof Aminol)) {
            throw new Error("Invalid instance")
        }
        this.aminols.push(aminol)
    }
    renderLife() {
        this.aminols.forEach((aminol) => {
            aminol.updateLife()
        })
    }
}

module.exports = Arena