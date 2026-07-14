const config = require("../config/config");
const { readJSON, writeJSON } = require("../utils/helper");

async function getSessions() {
    return await readJSON(config.database.sessions, {});
}

async function getSession(user) {
    const sessions = await getSessions();
    return sessions[user] || {};
}

async function setSession(user, data) {
    const sessions = await getSessions();

    sessions[user] = {
        ...(sessions[user] || {}),
        ...data
    };

    await writeJSON(config.database.sessions, sessions);
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
    const sessions = await getSessions();

    delete sessions[user];

    await writeJSON(config.database.sessions, sessions);
}

module.exports = {
    getSession,
    setSession,
    goto,
    setType,
    setPage,
    clearSession
};
