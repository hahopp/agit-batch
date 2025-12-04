const {connectMongo} = require("../db/mongo");

async function saveDuoStatsBulk(duoStatRows) {
    if (!duoStatRows.length) return;
    const {db} = await connectMongo();

    const bulk = db.collection("duo_stats").initializeUnorderedBulkOp();

    for (const row of duoStatRows) {
        bulk.find({
            userId: row.userId,
            duoId: row.duoId
        })
            .upsert()
            .updateOne({$set: row});
    }

    await bulk.execute();
}

async function saveIndividualStatBulk(monthKey, userStats) {
    if (!userStats.length) return;
    const {db} = await connectMongo();

    const bulk = db.collection("monthly_stats").initializeUnorderedBulkOp();
    for (const stat of userStats) {
        bulk.find({
            monthKey: stat.monthKey,
            userId: stat.userId
        }).upsert()
            .updateOne({$set: stat});
    }
    await bulk.execute();
}

module.exports = {saveDuoStatsBulk, saveIndividualStatBulk};
