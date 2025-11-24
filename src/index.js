const moment = require("moment-timezone");
const runSyncUserProfileJob = require("./jobs/fetch-user-job");
const runSyncMatchJob = require("./jobs/sync-match-job");
const runMonthlyTeammateCountJob = require("./jobs/monthly/teammate-count-job");
const runMonthlyIndividualStatJob = require('./jobs/monthly/individual-stat-job');

async function main() {
    console.log("=== Batch Start ===");
    //const monthKey = moment().tz("Asia/Seoul").format('YYYY-MM');
    const monthKey = '2025-10';

    await runSyncUserProfileJob();
    await runSyncMatchJob(monthKey);
    await runMonthlyTeammateCountJob(monthKey);
    await runMonthlyIndividualStatJob(monthKey);

    console.log("=== Batch Finish ===");
}

main();
