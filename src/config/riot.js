const axios = require('axios');
const Bottleneck = require("bottleneck");

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_BASE_URL = "https://asia.api.riotgames.com";
const RIOT_PLATFORM_URL = "https://kr.api.riotgames.com";

const limiter = new Bottleneck({
    minTime: 1000,             // 최소 52.6ms 간격  ≈ 초당 19회
    reservoir: 40,
    reservoirRefreshAmount: 40,
    reservoirRefreshInterval: 60 * 1000 // 60
});

const riotBaseApi = axios.create({
    baseURL: RIOT_BASE_URL,
    headers: {"X-Riot-Token": RIOT_API_KEY}
});

const riotPlatformApi = axios.create({
    baseURL: RIOT_PLATFORM_URL,
    headers: {"X-Riot-Token": RIOT_API_KEY}
});

riotBaseApi.interceptors.request.use(config => {
    return limiter.schedule(() => config);
});

riotPlatformApi.interceptors.response.use(config => {
    return limiter.schedule(() => config);
})

module.exports = {
    riotBaseApi,
    riotPlatformApi,
};