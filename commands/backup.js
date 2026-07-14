const fs = require("fs");

const backupService = require("../services/backupService");
const activity = require("../services/activityService");

module.exports = async (sock, jid) => {

    try {

        const file =
            await backupService.createBackup();

        await activity.addLog(

            "BACKUP",

            jid,

            file.split("/").pop()

        );

        await sock.sendMessage(jid, {

            text:
`⏳ Membuat backup database...`

        });

        await sock.sendMessage(jid, {

            document: fs.readFileSync(file),

            mimetype: "application/zip",

            fileName: file.split("/").pop()

        });

        await sock.sendMessage(jid, {

            text:
`✅ Backup berhasil dibuat.

📦 ${file.split("/").pop()}

📝 Activity berhasil disimpan.`

        });

    } catch (err) {

        console.error(err);

        await sock.sendMessage(jid, {

            text:
`❌ Backup gagal dibuat.`

        });

    }

};
