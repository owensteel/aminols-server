/*

    Aminol

*/

const ENERGY_NATURAL_DECREASE = 0.01 / 1000

class Aminol {
    constructor() {
        this.id = String(Math.random())
        this.energy = 1
    }
    updateLife() {
        this.energy -= ENERGY_NATURAL_DECREASE
    }
}

module.exports = Aminol