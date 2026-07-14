const session = require("../../services/sessionService");

module.exports = async (sock, msg, jid, state) => {

    if (state.step !== "ADMIN_BROADCAST") {
        return false;
    }

    const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

    if (body.toLowerCase() === "batal") {

        await session.clearSession(jid);

        await sock.sendMessage(jid,{
            text:"❌ Broadcast dibatalkan."
        });

        return true;
    }

    const image =
        msg.message?.imageMessage;

    // ==========================
    // BROADCAST TEKS
    // ==========================

    if (!image) {

        if (!body.trim()) {
            return true;
        }

        let sukses = 0;

        for (const target of state.targets) {

            try {

                await sock.sendMessage(target,{
                    text:body
                });

                sukses++;

            } catch (e) {}

        }

        await session.clearSession(jid);

        await sock.sendMessage(jid,{
            text:`✅ Broadcast selesai.\n\nBerhasil : ${sukses}/${state.targets.length}`
        });

        return true;

    }

    // ==========================
    // BROADCAST GAMBAR
    // ==========================

    const caption = image.caption || "";

    let sukses = 0;

    for (const target of state.targets) {

        try {

            await sock.sendMessage(target,{

                image:{
                    url: await sock.downloadMediaMessage(msg)
                },

                caption

            });

            sukses++;

        } catch(e){}

    }

    await session.clearSession(jid);

    await sock.sendMessage(jid,{
        text:`✅ Broadcast gambar selesai.\n\nBerhasil : ${sukses}/${state.targets.length}`
    });

    return true;

};
