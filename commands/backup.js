const path = require("path");

const backupService = require("../services/backupService");

module.exports = async (sock, jid) => {

    try {

        await sock.sendMessage(jid, {
            text: "⏳ Sedang membuat backup database..."
        });

        const file =
            await backupService.createBackup();

        const name =
            path.basename(file);

        await sock.sendMessage(jid, {
            document: {
                url: file
            },
            mimetype: "application/zip",
            fileName: name,
            caption:
`✅ *BACKUP BERHASIL*

Nama File :
${name}

Database berhasil dibackup.

Simpan file ZIP ini sebagai cadangan.`
        });

    } catch (err) {

        console.error(err);

        await sock.sendMessage(jid, {
            text:
`❌ Backup database gagal.

${err.message}`
        });

    }

};
