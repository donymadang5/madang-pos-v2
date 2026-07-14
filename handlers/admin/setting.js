const session = require("../../services/sessionService");
const backupService = require("../../services/backupService");

const backup = require("../../commands/backup");
const restore = require("../../commands/restore");
const log = require("../../commands/log");
const admin = require("../../commands/admin");

module.exports = async (sock, jid, body, state) => {

    if (state.step === "ADMIN_SETTING") {

        switch (body) {

            case "1":
                await backup(sock, jid);
                return true;

            case "2":
                await restore(sock, jid);
                return true;

            case "3":
                await log(sock, jid);
                return true;

            case "0":
                return admin(sock, jid);

        }

        return sock.sendMessage(jid, {
            text:
`⚙️ *PENGATURAN*

1️⃣ Backup Database
2️⃣ Restore Database
3️⃣ Activity Log

0️⃣ Kembali`
        });

    }

    if (state.step === "ADMIN_RESTORE_SELECT") {

        const nomor = Number(body);

        if (
            isNaN(nomor) ||
            nomor < 1 ||
            nomor > state.backups.length
        ) {
            return sock.sendMessage(jid, {
                text: "❌ Nomor backup tidak valid."
            });
        }

        const file =
            state.backups[nomor - 1];

        await session.goto(
            jid,
            "ADMIN_RESTORE_CONFIRM",
            {
                file
            }
        );

        return sock.sendMessage(jid, {
            text:
`⚠️ *KONFIRMASI RESTORE*

Backup:
${file.name}

1️⃣ Ya
2️⃣ Batal`
        });

    }

    if (state.step === "ADMIN_RESTORE_CONFIRM") {

        if (body === "2") {
            return admin(sock, jid);
        }

        if (body !== "1") {
            return true;
        }

        try {

            await backupService.restoreBackup(
                state.file.file
            );

            await session.clearSession(jid);

            return sock.sendMessage(jid, {
                text:
`✅ Restore berhasil.

Silakan restart bot agar seluruh perubahan dimuat kembali.`
            });

        } catch (err) {

            console.error(err);

            return sock.sendMessage(jid, {
                text:
`❌ Restore gagal.

${err.message}`
            });

        }

    }

    return false;

};
