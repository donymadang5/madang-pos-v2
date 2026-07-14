const { readJSON, writeJSON } = require("../utils/helper");

const FILE = "./database/admins.json";

async function getAdmins() {
    return await readJSON(FILE);
}

async function isAdmin(jid) {
    const admins = await getAdmins();
    return admins.includes(jid);
}

async function addAdmin(jid) {
    const admins = await getAdmins();

    if (!admins.includes(jid)) {
        admins.push(jid);
        await writeJSON(FILE, admins);
    }

    return admins;
}

async function removeAdmin(jid) {
    const admins = await getAdmins();

    const hasil = admins.filter(a => a !== jid);

    await writeJSON(FILE, hasil);

    return hasil;
}

module.exports = {
    getAdmins,
    isAdmin,
    addAdmin,
    removeAdmin
};
