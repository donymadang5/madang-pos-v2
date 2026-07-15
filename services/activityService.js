const config = require("../config/config");
const {
    readJSON,
    writeJSON,
    updateJSON
} = require("../utils/helper");

async function getActivities() {
    return await readJSON(
        config.database.activity,
        []
    );
}

async function add(type, message, data = {}) {
    return updateJSON(config.database.activity, [], logs => {
        logs.unshift({

        id: Date.now(),

        type,

        message,

        data,

        createdAt: new Date().toISOString()

    });

        if (logs.length > 1000) {
            logs.splice(1000);
        }
    });

}

async function latest(limit = 20) {

    const logs = await getActivities();

    return logs.slice(0, limit);

}

async function clear() {

    await writeJSON(
        config.database.activity,
        []
    );

}

module.exports = {

    add,

    latest,

    clear

};
