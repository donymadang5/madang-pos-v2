const activity = require("../services/activityService");

module.exports = async (sock, jid) => {

    const logs = await activity.getLogs();

    if (!logs.length) {

        return sock.sendMessage(jid, {
            text: "Belum ada activity."
        });

    }

    let text = "📋 *ACTIVITY LOG*\n\n";

    logs.slice(0, 20).forEach((l, i) => {

        text += `${i + 1}. ${l.action}\n`;
        text += `👤 ${l.admin}\n`;
        text += `📝 ${l.detail}\n`;
        text += `🕒 ${new Date(l.time).toLocaleString("id-ID")}\n\n`;

    });

    return sock.sendMessage(jid, { text });

};
