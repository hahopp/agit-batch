const { connectMongo } = require("../db/mongo");

async function saveMatch(matchId, detail) {
    const { db } = await connectMongo();
    return db.collection("matches").updateOne(
        { matchId },
        { $set: { matchId, ...detail, updatedAt: new Date() } },
        { upsert: true }
    );
}

async function getMatchesByMonth(start, end) {
    const { db } = await connectMongo();
    return db.collection("matches")
        .find({
            "info.gameCreation": { $gte: start * 1000, $lt: end * 1000 }
        }).toArray();
}

module.exports = { saveMatch, getMatchesByMonth };
