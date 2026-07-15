const { readJSON, updateJSON } = require("../utils/helper");

const FILE = "./database/admins.json";

async function getAdmins() {
    return await readJSON(FILE);
}

async function isAdmin(jid) {
    const admins = await getAdmins();
    return admins.includes(jid);
}

async function addAdmin(jid) {
    return updateJSON(FILE, [], admins => {
        if (!admins.includes(jid)) {
            admins.push(jid);
        }
        return admins;
    });
}

async function removeAdmin(jid) {
    return updateJSON(FILE, [], admins => {
        const hasil = admins.filter(a => a !== jid);
        admins.splice(0, admins.length, ...hasil);
        return hasil;
    });
}

module.exports = {
    getAdmins,
    isAdmin,
    addAdmin,
    removeAdmin
};
