const {riotPlatformApi} = require("../../config/riot");

async function fetchSummonerByPuuid(puuid) {
    const url = `/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const res = await riotPlatformApi.get(url);
    return res.data;
}

module.exports = {fetchSummonerByPuuid};
