const {getAllUsers} = require("../../services/userService");
const {getMatchesByMonth} = require("../../services/matchStore");
const {saveDuoStatsBulk} = require("../../services/statsService");
const {getMonthRangeWithMonthKey} = require("../../utils/date");

// Initialize duo stat container
function initDuoStat() {
    return {count: 0, win: 0};
}

// Accumulate duo stats for a pair (a with b)
function accumulateDuo(stat, isWin) {
    stat.count += 1;
    stat.win += isWin ? 1 : 0;
}

module.exports = async function runMonthlyTeammateCountJob(monthKey) {
    console.log(`[JOB] Monthly Teammate Count. ${monthKey}`);

    // Prepare user lookups
    const users = await getAllUsers();
    const puuids = users.map(u => u.puuid);
    const puuidSet = new Set(puuids);
    const userByPuuid = Object.fromEntries(users.map(u => [u.puuid, u]));

    // Fetch matches for the month
    const {start, end} = getMonthRangeWithMonthKey(monthKey);
    const matches = await getMatchesByMonth(start, end);

    // Accumulate duo counts per user
    const userStatMap = {};

    for (const match of matches) {
        const teamMembers = match.info.participants.filter(p => puuidSet.has(p.puuid));
        if (teamMembers.length < 2) continue; // need at least two tracked users together

        for (const member of teamMembers) {
            for (const mate of teamMembers) {
                if (member.puuid === mate.puuid) continue; // exclude self-pair

                const userStat = (userStatMap[member.puuid] ??= {duo: {}});
                const duoStat = (userStat.duo[mate.puuid] ??= initDuoStat());

                accumulateDuo(duoStat, member.win === true);
            }
        }
    }

    // Shape duoStatRows for persistence
    const duoStatRows = Object.entries(userStatMap).map(([puuid, stat]) => {
        const userId = userByPuuid[puuid]._id;
        const duoStatsByPuuid = stat.duo || {};

        // convert duo puuid keys to userId keys
        const duo = {};
        Object.entries(duoStatsByPuuid).forEach(([matePuuid, mateStat]) => {
            duo[userByPuuid[matePuuid]._id] = mateStat;
        });

        return {
            monthKey,
            userId,
            duo,
            createdAt: new Date(),
        };
    });

    await saveDuoStatsBulk(duoStatRows);
};
