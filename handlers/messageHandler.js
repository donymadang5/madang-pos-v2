const commandHandler = require("./commandHandler");
const sessionHandler = require("./sessionHandler");
const adminSessionHandler = require("./adminSessionHandler");
const documentHandler = require("./documentHandler");

const adminService = require("../services/adminService");

module.exports = async (sock, m) => {

    const msg = m.messages?.[0];

    if (!msg) return;
    if (msg.key.fromMe) return;

    // =========================
    // DEBUG WHATSAPP MESSAGE
    // =========================
    console.log("\n================ MESSAGE DEBUG ================");
    console.dir(msg, { depth: null });
    console.log("==============================================\n");

    const from = msg.key.remoteJid;

    // =========================
    // HANDLE DOCUMENT
    // =========================
    if (msg.message?.documentMessage) {

        const handled = await documentHandler(
            sock,
            msg,
            from
        );

        if (handled) return;

    }


    let body = "";

    if (msg.message?.conversation) {
        body = msg.message.conversation;
    } else if (msg.message?.extendedTextMessage?.text) {
        body = msg.message.extendedTextMessage.text;
    } else if (msg.message?.buttonsResponseMessage?.selectedButtonId) {
        body = msg.message.buttonsResponseMessage.selectedButtonId;
    } else if (msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
        body = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
    } else if (msg.message?.imageMessage?.caption) {
    body = msg.message.imageMessage.caption;
}

    if (!body) return;

    body = body.trim();

    // Command
    if (body.startsWith("/")) {
        return commandHandler(sock, from, body);
    }

    const text = body.toLowerCase();

    // Customer
    if (text === "haalo" || text === "help") {
        return sessionHandler(sock, from, body);
    }

    // Admin
    if (text === "admin") {

        if (!(await adminService.isAdmin(from))) {
            return;
        }

        return commandHandler(sock, from, "/admin");
    }

    // Admin Session
    if (await adminService.isAdmin(from)) {

        const handled = await adminSessionHandler(
    sock,
    msg,
    from,
    body
);

        if (handled) return;
    }

    // Customer Session
    return sessionHandler(
        sock,
        from,
        body
    );

};
