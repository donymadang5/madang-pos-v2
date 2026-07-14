const session = require("../../services/sessionService");
const activity = require("../../services/activityService");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

        await sock.sendMessage(jid, {
            text: "❌ Broadcast dibatalkan."
        });

        return true;
    }

    const image = msg.message?.imageMessage;

    let sukses = 0;
    let gagal = 0;

    // ==========================
    // BROADCAST TEKS
    // ==========================

    if (!image) {

        if (!body.trim()) {
            return true;
        }

        for (const target of state.targets) {

            try {

                await sock.sendMessage(target, {
                    text: body
                });

                sukses++;

            } catch (e) {

                gagal++;

            }

            await sleep(1500);
        }

        await activity.add(
            "BROADCAST",
            `Broadcast teks ke ${state.targets.length} customer`,
            {
                admin: jid,
                sukses,
                gagal
            }
        );

        await session.clearSession(jid);

        await sock.sendMessage(jid, {
            text:
`✅ Broadcast selesai

Berhasil : ${sukses}
Gagal    : ${gagal}
Total    : ${state.targets.length}`
        });

        return true;
    }

    // ==========================
    // BROADCAST GAMBAR
    // ==========================

    const caption = image.caption || "";
    const media = await sock.downloadMediaMessage(msg);

    for (const target of state.targets) {

        try {

            await sock.sendMessage(target, {
                image: media,
                caption
            });

            sukses++;

        } catch (e) {

            gagal++;

        }

        await sleep(1500);
    }

    await activity.add(
        "BROADCAST",
        `Broadcast gambar ke ${state.targets.length} customer`,
        {
            admin: jid,
            sukses,
            gagal
        }
    );

    await session.clearSession(jid);

    await sock.sendMessage(jid, {
        text:
`✅ Broadcast gambar selesai

Berhasil : ${sukses}
Gagal    : ${gagal}
Total    : ${state.targets.length}`
    });

    return true;
};
