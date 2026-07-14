const importExcel = require("../commands/importExcel");
const exportExcel = require("../commands/exportExcel");

const admin = require("../commands/admin");
const dashboard = require("../commands/dashboard");
const adminManager = require("../commands/adminManager");

const cari = require("../commands/cari");
const approve = require("../commands/approve");
const tolak = require("../commands/tolak");

const order = require("../commands/order");
const customer = require("../commands/customer");

const backup = require("../commands/backup");
const restore = require("../commands/restore");
const log = require("../commands/log");
const activity = require("../commands/activity");

const testButton = require("../test-button");

const adminService = require("../services/adminService");

module.exports = async (sock, jid, body) => {

    const args = body.trim().split(/\s+/);

    const command = args.shift().toLowerCase();

    switch (command) {

        case "/testbutton":
            return testButton(sock, jid);

        case "/registeradmin": {

            const admins =
                await adminService.getAdmins();

            if (admins.length > 0) {

                return sock.sendMessage(jid, {
                    text: "❌ Admin sudah terdaftar."
                });

            }

            await adminService.addAdmin(jid);

            return sock.sendMessage(jid, {
                text: "✅ Berhasil menjadi Admin Utama."
            });

        }

        case "/admin":
        case "/dashboard":

        case "/import":
        case "/export":

        case "/backup":
        case "/restore":
        case "/log":
        case "/activity":

        case "/addadmin":
        case "/deladmin":
        case "/listadmin":

        case "/cari":
        case "/approve":
        case "/tolak":

        case "/order":
        case "/customer":

            if (!(await adminService.isAdmin(jid))) {
                return;
            }

            switch (command) {

                case "/admin":
                    return admin(sock, jid, args);

                case "/dashboard":
                    return dashboard(sock, jid);

                case "/import":
                    return importExcel(sock, jid, args);

                case "/export":
                    return exportExcel(sock, jid, args);

                case "/backup":
                    return backup(sock, jid, args);

                case "/restore":
                    return restore(sock, jid, args);

                case "/log":
                    return log(sock, jid);

                case "/activity":
                    return activity(sock, jid);

                case "/addadmin":
                case "/deladmin":
                case "/listadmin":
                    return adminManager(
                        sock,
                        jid,
                        command,
                        args
                    );

                case "/cari":
                    return cari(sock, jid, args);

                case "/approve":
                    return approve(sock, jid, args);

                case "/tolak":
                    return tolak(sock, jid, args);

                case "/order":
                    return order(sock, jid, args);

                case "/customer":
                    return customer(sock, jid, args);

            }

            return;

        default:
            return;

    }

};
