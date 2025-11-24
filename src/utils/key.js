function duoKey(a, b) {
    return JSON.stringify([a, b].sort());
}

function getPlayerFromKey(key) {
    const result = JSON.parse(key);
    return {playerA: result[0], playerB: result[1]}
}

module.exports = {duoKey, getPlayerFromKey};
