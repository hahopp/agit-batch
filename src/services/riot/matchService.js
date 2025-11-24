const {riotBaseApi} = require("../../config/riot");


async function fetchMatchIds(puuid, start, end, page = 0, size = 200) {
    const url = `/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${start}&endTime=${end}&start=${page}&count=${size}`;
    const res = await riotBaseApi.get(url);
    const {data} = res;
    return data;
}

async function fetchAllMatchIds(puuid, start, end) {
    let index = 0;
    let size = 5;
    const result = [];
    while (true) {
        try {
            const data = await fetchMatchIds(puuid, start, end, index, size);
            result.push(...data);

            if (data.length < size)
                break;

            index += size;
        } catch (error) {
            console.log(error);
        }
    }
    return result;
}


async function fetchMatchDetail(matchId) {
    const url = `/lol/match/v5/matches/${matchId}`;
    const res = await riotBaseApi.get(url);
    return res.data;
}

module.exports = {fetchAllMatchIds, fetchMatchDetail};
