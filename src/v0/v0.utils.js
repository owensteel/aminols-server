/*

    Utils

*/

function generatedId() {
    return (String(Math.random()).split(".")[1]).slice(0, 10)
}

module.exports = {
    generatedId
}