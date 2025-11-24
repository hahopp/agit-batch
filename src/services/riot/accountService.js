const {riotBaseApi } = require("../../config/riot");

async function fetchPuuid(name, tagLine) {
    const url = `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tagLine)}`;
    const res = await riotBaseApi.get(url);
    return res.data.puuid;
}

module.exports = { fetchPuuid };
