const moment = require("moment-timezone");
const KST = "Asia/Seoul";

// 어제 00:00 ~ 오늘 00:00
function getYesterdayRangeKST() {
    const today = moment().tz(KST).startOf("day");
    const yesterday = today.clone().subtract(1, "day");

    return {
        start: yesterday.unix(),
        end: today.unix(),
    };
}
function getMonthRangeWithMonthKey(monthKey) {
    const start = moment.tz(monthKey, 'YYYY-MM', 'Asia/Seoul').startOf('month');

    // 다음달 1일 00:00
    const end = start.clone().add(1, 'month').startOf('month');

    return {
        start: start.unix(), // unix
        end: end.unix()
    };
}

module.exports = {
    getMonthRangeWithMonthKey
};
