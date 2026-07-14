const adminService = require("../services/adminService");

module.exports = async function (jid) {
    return await adminService.isAdmin(jid);
};
