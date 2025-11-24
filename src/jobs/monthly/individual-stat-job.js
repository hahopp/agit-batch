const {getAllUsers} = require("../../services/userService");
const {getMatchesByMonth} = require("../../services/matchStore");
const {saveIndividualStatBulk} = require("../../services/statsService");
const {getMonthRangeWithMonthKey} = require("../../utils/date");

// Initialize a new empty stat object
function initUserStat() {
    return {
        count: 0,
        kills: 0,
        assists: 0,
        deaths: 0,
        win: 0,
        totalDamageDealtToChampions: 0,
        totalDamageTaken: 0,
        totalHeal: 0,
        damageDealtToBuildings: 0,
        nexusKills: 0,
        longestTimeSpentLiving: 0,
        totalMinionsKilled: 0,
        pentaKills: 0,
        quadraKills: 0,
        tripleKills: 0,
        doubleKills: 0,
    };
}

// Accumulate a participant's numbers into a user's stat
function accumulateParticipant(stat, participant) {
    stat.count += 1;
    stat.kills += participant.kills;
    stat.assists += participant.assists;
    stat.deaths += participant.deaths;
    stat.win += participant.win === true ? 1 : 0;
    stat.totalDamageDealtToChampions += participant.totalDamageDealtToChampions;
    stat.totalDamageTaken += participant.totalDamageTaken;
    stat.totalHeal += participant.totalHeal;
    stat.damageDealtToBuildings += participant.damageDealtToBuildings;
    stat.nexusKills += participant.nexusKills;
    stat.longestTimeSpentLiving = stat.longestTimeSpentLiving > participant.longestTimeSpentLiving ?
        stat.longestTimeSpentLiving : participant.longestTimeSpentLiving;
    stat.totalMinionsKilled += participant.totalMinionsKilled;
    stat.pentaKills += participant.pentaKills;
    stat.quadraKills += participant.quadraKills;
    stat.tripleKills += participant.tripleKills;
    stat.doubleKills += participant.doubleKills;
}

// Compute derived/average metrics based on accumulated stat
function computeDerived(stat) {
    const {count} = stat;
    return {
        ...stat,
        averageOfKills: count ? stat.kills / count : 0,
        averageOfDeaths: count ? stat.deaths / count : 0,
        averageOfAssists: count ? stat.assists / count : 0,
        winRate: count ? (stat.win / count) * 100 : 0,
        averageOfDamageDealtToChampions: count ? stat.totalDamageDealtToChampions / count : 0,
        averageOfDamageTaken: count ? stat.totalDamageTaken / count : 0,
        averageOfHeal: count ? stat.totalHeal / count : 0,
        averageOfDamageDealtToBuildings: count ? stat.damageDealtToBuildings / count : 0,
    };
}

module.exports = async function runMonthlyIndividualStatJob(monthKey) {
    console.log(`[JOB] Monthly Individual Count ${monthKey}`);

    // Prepare user lookups
    const users = await getAllUsers();
    const puuids = users.map(u => u.puuid);
    const puuidSet = new Set(puuids);
    const userByPuuid = Object.fromEntries(users.map(u => [u.puuid, u]));

    // Fetch matches for the month
    const {start, end} = getMonthRangeWithMonthKey(monthKey);
    const matches = await getMatchesByMonth(start, end);

    // Aggregate per-user stats
    const userStatMap = {};

    for (const match of matches) {
        const teamMembers = match.info.participants.filter(p => puuidSet.has(p.puuid));
        // Only consider matches where at least 2 tracked users played together
        if (teamMembers.length < 2) continue;

        for (const member of teamMembers) {
            const userStat = (userStatMap[member.puuid] ??= initUserStat());
            accumulateParticipant(userStat, member);
        }
    }

    // Shape userStatRows for persistence
    const userStatRows = Object.entries(userStatMap).map(([puuid, stat]) => {
        const withDerived = computeDerived(stat);
        return {
            monthKey,
            userId: userByPuuid[puuid]._id,
            ...withDerived,
            createdAt: new Date(),
        };
    });

    await saveIndividualStatBulk(monthKey, userStatRows);
};
