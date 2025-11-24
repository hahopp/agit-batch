const { getAllUsers, updateUserLolInfo } = require("../services/userService");
const { fetchPuuid } = require("../services/riot/accountService");
const { fetchSummonerByPuuid } = require("../services/riot/summonerService");

function tagOf(name, tagline) {
    return `${name}#${tagline}`;
}

module.exports = async function runSyncUserProfileJob() {
    console.log("[JOB] Fetch user Start");

    const users = await getAllUsers();

    for (const user of users) {
        const { _id, name, tagline } = user;
        const tag = tagOf(name, tagline);
        console.log(`fetching user. ${tag}`);

        let { puuid } = user;
        if (!puuid) {
            console.log(`puuid of user ${tag} not exists. start fetch`);
            puuid = await fetchPuuid(name, tagline);
            console.log(`puuid fetched. ${tag}, puuid: ${puuid}`);
        }

        console.log(`fetching summoner ${tag}`);
        const summoner = await fetchSummonerByPuuid(puuid);

        await updateUserLolInfo(_id, {
            puuid,
            profileIconId: summoner.profileIconId,
        });

        console.log(`Updated: ${name}`);
    }

    console.log("[JOB] Fetch user Finish");
};
