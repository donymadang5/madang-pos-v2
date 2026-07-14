const commandHandler = require("./commandHandler");
const sessionHandler = require("./sessionHandler");
const adminSessionHandler = require("./adminSessionHandler");

const adminService = require("../services/adminService");

module.exports = async (sock, m) => {

    const msg = m.messages?.[0];

    if (!msg) return;
    if (msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    let body = "";

    if (msg.message?.conversation) {
        body = msg.message.conversation;
    } else if (msg.message?.extendedTextMessage?.text) {
        body = msg.message.extendedTextMessage.text;
    } else if (msg.message?.buttonsResponseMessage?.selectedButtonId) {
        body = msg.message.buttonsResponseMessage.selectedButtonId;
    } else if (msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
        body = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
    }

    if (!body) return;

    body = body.trim();

    // Command lama tetap didukung
    if (body.startsWith("/")) {
        return commandHandler(sock, from, body);
    }

    const text = body.toLowerCase();

    // Trigger customer
    if (text === "haalo" || text === "help") {
        return sessionHandler(sock, from, body);
    }

    // Trigger admin
    if (text === "admin") {

        if (!(await adminService.isAdmin(from))) {
            return;
        }

        return commandHandler(sock, from, "/admin");
    }

    // Session admin
    if (await adminService.isAdmin(from)) {

        const handled = await adminSessionHandler(
            sock,
            from,
            body
        );

        if (handled) {
            return;
        }

    }

    // Session customer
    return sessionHandler(
        sock,
        from,
        body
    );

};
