const config = require("../config/config");
const { readJSON, updateJSON } = require("../utils/helper");

async function getSessions() {
    return await readJSON(config.database.sessions, {});
}

async function getSession(user) {
    const sessions = await getSessions();
    return sessions[user] || {};
}

async function setSession(user, data) {
    return updateJSON(config.database.sessions, {}, sessions => {
        sessions[user] = {
            ...(sessions[user] || {}),
            ...data
        };
        return sessions[user];
    });
}

async function goto(user, step, data = {}) {
    return setSession(user, {
        step,
        ...data
    });
}

async function setType(user, type) {
    return setSession(user, { type });
}

async function setPage(user, page) {
    return setSession(user, { page });
}

async function clearSession(user) {
    return updateJSON(config.database.sessions, {}, sessions => {
        delete sessions[user];
    });
}

module.exports = {
    getSession,
    setSession,
    goto,
    setType,
    setPage,
    clearSession
};
