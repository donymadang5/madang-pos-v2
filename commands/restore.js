const path = require("path");

const session = require("../services/sessionService");
const backupService = require("../services/backupService");

module.exports = async (sock, jid) => {

    const backups =
        await backupService.getBackupList();

    if (!backups.length) {

        return sock.sendMessage(jid, {
            text:
`❌ Belum ada file backup.`
        });

    }

    let text =
`♻️ *RESTORE DATABASE*

Pilih backup yang ingin direstore.

`;

    backups.forEach((item, index) => {

        text +=
`${index + 1}. ${item.name}\n`;

    });

    text +=
`\nBalas nomor backup.`;

    await session.goto(
        jid,
        "ADMIN_RESTORE_SELECT",
        {
            backups
        }
    );

    return sock.sendMessage(jid, {
        text
    });

};
