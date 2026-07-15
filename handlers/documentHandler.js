const fs = require("fs");
const path = require("path");

const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const session = require("../services/sessionService");
const importExcel = require("../services/importExcelService");

module.exports = async (sock, msg, jid) => {

    const state = await session.getSession(jid);

    if (
        state.step !== "ADMIN_IMPORT_EXCEL"
    ) {
        return false;
    }

    const doc =
        msg.message?.documentMessage;

    if (!doc) {

        await sock.sendMessage(jid, {
            text:
"❌ Silakan kirim file Excel (.xlsx)"
        });

        return true;

    }

    const name =
        String(doc.fileName || "");

    const lower =
        name.toLowerCase();

    if (
        !lower.endsWith(".xlsx") &&
        !lower.endsWith(".xls")
    ) {

        await sock.sendMessage(jid, {
            text:
"❌ File harus berformat .xls atau .xlsx"
        });

        return true;

    }

    await sock.sendMessage(jid, {
        text: "⏳ Mengunduh file..."
    });

    const stream =
        await downloadContentFromMessage(
            doc,
            "document"
        );

    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    const buffer =
        Buffer.concat(chunks);

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const filePath =
        path.join(
            "./temp",
            Date.now() + ".xlsx"
        );

    fs.writeFileSync(
        filePath,
        buffer
    );

    await sock.sendMessage(jid, {
        text: "📖 Membaca Excel..."
    });

    try {

        const hasil =
            await importExcel.importProducts(
                filePath
            );

        fs.unlinkSync(filePath);

        await session.goto(
            jid,
            "ADMIN_HOME"
        );

        await sock.sendMessage(jid, {
            text:
`✅ Import selesai

📄 Total : ${hasil.total}
➕ Tambah : ${hasil.tambah}
♻️ Update : ${hasil.update}
❌ Gagal : ${hasil.gagal}`
        });

    } catch (err) {

        console.log(err);

        await sock.sendMessage(jid, {
            text:
"❌ Gagal membaca file Excel."
        });

    }

    return true;

};
