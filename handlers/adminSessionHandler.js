const session = require("../services/sessionService");

const home = require("./admin/home");
const verify = require("./admin/verify");
const customer = require("./admin/customer");
const order = require("./admin/order");
const statistic = require("./admin/statistic");
const broadcast = require("./admin/broadcast");
const setting = require("./admin/setting");
const voucher = require("./admin/voucher");

module.exports = async (sock, msg, jid, body) => {

    const state = await session.getSession(jid);

    if (!state || !state.step) {
        return false;
    }

    if (await home(sock, jid, body, state)) {
        return true;
    }

    if (await verify(sock, jid, body, state)) {
        return true;
    }

    if (await customer(sock, jid, body, state)) {
        return true;
    }

    if (await order(sock, jid, body, state)) {
        return true;
    }

    if (await statistic(sock, jid, body, state)) {
        return true;
    }

    if (await broadcast(sock, msg, jid, body, state)) {
        return true;
    }

    if (await setting(sock, jid, body, state)) {
        return true;
    }

    if (await voucher(sock, jid, body, state)) {
        return true;
    }

    return false;

};
