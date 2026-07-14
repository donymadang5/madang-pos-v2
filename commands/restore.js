const fs = require("fs");

const backupService = require("../services/backupService");
const activity = require("../services/activityService");

module.exports = async (sock, jid, args = []) => {

    try {

        let file;

        if (args.length) {

            file = args.join(" ");

        } else {

            const backups =
                await backupService.getBackups();

            if (!backups.length) {

                return sock.sendMessage(jid, {

                    text:
"❌ Tidak ada file backup."

                });

            }

            file = backups[0];

        }

        if (!fs.existsSync(file)) {

            return sock.sendMessage(jid, {

                text:
"❌ File backup tidak ditemukan."

            });

        }

        await backupService.restoreBackup(file);

        await activity.addLog(

            "RESTORE",

            jid,

            file.split("/").pop()

        );

        await sock.sendMessage(jid, {

            text:
`✅ Restore berhasil.

📦 ${file.split("/").pop()}

⚠️ Restart bot agar seluruh data dimuat ulang.`

        });

    } catch (err) {

        console.error(err);

        await sock.sendMessage(jid, {

            text:
`❌ Restore gagal.`

        });

    }

};
