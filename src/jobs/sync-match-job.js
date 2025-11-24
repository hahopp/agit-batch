const {getAllUsers} = require("../services/userService");
const {fetchAllMatchIds, fetchMatchDetail} = require("../services/riot/matchService");
const {saveMatch} = require("../services/matchStore");
const {getMonthRangeWithMonthKey} = require("../utils/date");

module.exports = async function runSyncMatchJob(monthKey) {
    const {start, end} = getMonthRangeWithMonthKey(monthKey);
    console.log("[JOB] sink match:", new Date(start*1000), new Date(end*1000));

    const users = await getAllUsers();

    for (const user of users) {
        console.log(`[JOB] Sync Match: ${user.name}, ${user.puuid}`);
        if (!user.puuid) continue;

        const matchIds = await fetchAllMatchIds(user.puuid, start, end);
        console.log(matchIds);
        for (const id of matchIds) {
            const detail = await fetchMatchDetail(id);
            await saveMatch(id, detail);
            console.log(`[JOB] Sync Match for id ${id}`);
        }
    }

    console.log("[JOB] Sync Match Finish");
};
