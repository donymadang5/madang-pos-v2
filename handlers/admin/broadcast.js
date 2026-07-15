const session = require("../../services/sessionService");
const customerService = require("../../services/customerService");
const { downloadImage } = require("../../utils/media");

module.exports = async (sock, msg, jid, body, state) => {

    // =========================
    // MENU BROADCAST
    // =========================

    if (state.step === "ADMIN_BROADCAST_MENU") {

        switch (body) {

            case "1":

    await session.goto(jid, "ADMIN_BROADCAST_MESSAGE", {
        target: "ALL"
    });

    return sock.sendMessage(jid, {
        text:
`👥 *Semua Customer* dipilih.

Sekarang kirim pesan broadcast.

Bisa berupa:
✅ Teks
✅ Foto + Caption
✅ Video + Caption
✅ Dokumen`
    });

                
            case "2":

                await session.goto(jid, "ADMIN_BROADCAST_NEW");

                return sock.sendMessage(jid, {
                    text:
`📅 Customer baru berapa hari?

Contoh:
30`
                });

            case "3":

                await session.goto(jid, "ADMIN_BROADCAST_INACTIVE");

                return sock.sendMessage(jid, {
                    text:
`📅 Customer tidak transaksi berapa hari?

Contoh:
30`
                });

            case "4":

                await session.goto(jid, "ADMIN_BROADCAST_POINT");

                return sock.sendMessage(jid, {
                    text:
`⭐ Minimal poin customer?

Contoh:
100`
                });

            case "5":

                await session.goto(jid, "ADMIN_BROADCAST_MANUAL");

                return sock.sendMessage(jid, {
                    text:
`📱 Masukkan nomor customer.

Satu nomor setiap baris.

Contoh:

081234567890
081345678901`
                });

            case "0":

                await session.goto(jid, "ADMIN_HOME");
                return true;

        }

        return true;

    }

    // =========================
    // CUSTOMER BARU
    // =========================

    if (state.step === "ADMIN_BROADCAST_NEW") {

        const hari = Number(body);

        if (isNaN(hari) || hari <= 0) {

            return sock.sendMessage(jid, {
                text: "❌ Masukkan jumlah hari yang valid."
            });

        }

        await session.goto(jid, "ADMIN_BROADCAST_MESSAGE", {
            target: "BARU",
            hari
        });

        return sock.sendMessage(jid, {
            text: "✅ Sekarang kirim isi broadcast."
        });

    }

    // =========================
    // CUSTOMER TIDAK AKTIF
    // =========================

    if (state.step === "ADMIN_BROADCAST_INACTIVE") {

        const hari = Number(body);

        if (isNaN(hari) || hari <= 0) {

            return sock.sendMessage(jid, {
                text: "❌ Masukkan jumlah hari yang valid."
            });

        }

        await session.goto(jid, "ADMIN_BROADCAST_MESSAGE", {
            target: "INACTIVE",
            hari
        });

        return sock.sendMessage(jid, {
            text: "✅ Sekarang kirim isi broadcast."
        });

    }
    // =========================
    // MEMBER BERDASARKAN POIN
    // =========================

    if (state.step === "ADMIN_BROADCAST_POINT") {

        const poin = Number(body);

        if (isNaN(poin) || poin < 0) {

            return sock.sendMessage(jid, {
                text: "❌ Masukkan minimal poin."
            });

        }

        await session.goto(jid, "ADMIN_BROADCAST_MESSAGE", {
            target: "POINT",
            poin
        });

        return sock.sendMessage(jid, {
            text: "✅ Sekarang kirim isi broadcast."
        });

    }

    // =========================
    // CUSTOMER MANUAL
    // =========================

    if (state.step === "ADMIN_BROADCAST_MANUAL") {

        const nomor = body
            .split("\n")
            .map(v => v.trim())
            .filter(Boolean);

        if (!nomor.length) {

            return sock.sendMessage(jid, {
                text: "❌ Nomor tidak boleh kosong."
            });

        }

        await session.goto(jid, "ADMIN_BROADCAST_MESSAGE", {
            target: "MANUAL",
            nomor
        });

        return sock.sendMessage(jid, {
            text:
`✅ ${nomor.length} nomor diterima.

Sekarang kirim isi broadcast.

Bisa berupa:
✅ Teks
✅ Foto + Caption
✅ Video
✅ Dokumen`
        });

    }

    // =========================
    // INPUT PESAN
    // =========================

    if (state.step === "ADMIN_BROADCAST_MESSAGE") {

    let pesan = body;
    let image = null;

    if (msg?.message?.imageMessage) {
        image = await downloadImage(msg);
        pesan = msg.message.imageMessage.caption || "";
    }

    const customers = await customerService.getCustomers();

        let targets = [];

        switch (state.target) {

            case "ALL":

                targets = customers;

                break;

            case "BARU":

                targets = await customerService.getNewCustomers(
                    state.hari
                );

                break;

            case "INACTIVE":

                targets =
                    await customerService.getInactiveCustomers(
                        state.hari
                    );

                break;

            case "POINT":

                targets =
                    await customerService.getCustomersByPoint(
                        state.poin
                    );

                break;

            case "MANUAL":

                targets = customers.filter(c => {

                    const phone =
                        String(c.phone || "")
                        .replace(/\D/g, "");

                    return state.nomor.some(n =>
                        phone.endsWith(
                            n.replace(/\D/g, "")
                        )
                    );

                });

                break;

        }

        await session.goto(jid, "ADMIN_BROADCAST_CONFIRM", {

    target: state.target,

    hari: state.hari,

    poin: state.poin,

    nomor: state.nomor,

    pesan,

    image,

    total: targets.length

});
        if (image) {

    return sock.sendMessage(jid, {
        image,
        caption:
`📢 *PREVIEW BROADCAST*

👥 Target : ${targets.length} Customer

━━━━━━━━━━━━━━

${pesan}

━━━━━━━━━━━━━━

1️⃣ Kirim

2️⃣ Batal`
    });

}

return sock.sendMessage(jid, {
    text:
`📢 *PREVIEW BROADCAST*

👥 Target : ${targets.length} Customer

━━━━━━━━━━━━━━

${pesan}

━━━━━━━━━━━━━━

1️⃣ Kirim

2️⃣ Batal`
});
}
    // =========================
    // KONFIRMASI BROADCAST
    // =========================

    if (state.step === "ADMIN_BROADCAST_CONFIRM") {

        if (body === "2") {

            await session.goto(jid, "ADMIN_HOME");

            await sock.sendMessage(jid, {
                text: "❌ Broadcast dibatalkan."
            });

            return true;

        }

        if (body !== "1") {

            return sock.sendMessage(jid, {
                text: "Balas *1* untuk kirim atau *2* untuk batal."
            });

        }

        const customers = await customerService.getCustomers();

        let targets = [];

        switch (state.target) {

            case "ALL":

                targets = customers;

                break;

            case "BARU":

                targets = await customerService.getNewCustomers(
                    state.hari
                );

                break;

            case "INACTIVE":

                targets =
                    await customerService.getInactiveCustomers(
                        state.hari
                    );

                break;

            case "POINT":

                targets =
                    await customerService.getCustomersByPoint(
                        state.poin
                    );

                break;

            case "MANUAL":

                targets = customers.filter(c => {

                    const phone = String(c.phone || "")
                        .replace(/\D/g, "");

                    return state.nomor.some(n =>
                        phone.endsWith(
                            n.replace(/\D/g, "")
                        )
                    );

                });

                break;

        }

        let berhasil = 0;
        let gagal = 0;

        await sock.sendMessage(jid, {

            text:
`📤 Mengirim broadcast...

👥 Target : ${targets.length} Customer`

        });

        for (const customer of targets) {

    try {

        if (state.image) {

    const imageBuffer =
        Buffer.isBuffer(state.image)
            ? state.image
            : Buffer.from(state.image.data);

    console.log("Image Buffer:", Buffer.isBuffer(imageBuffer), imageBuffer.length);

    await sock.sendMessage(customer.jid, {
        image: imageBuffer,
        caption: state.pesan || ""
    });
        } else {
            await sock.sendMessage(customer.jid, {
                text: state.pesan
            });

        }

        berhasil++;

    } catch (err) {

    console.log("Broadcast gagal ke:", customer.jid);
    console.log(err);

    gagal++;
}
    await new Promise(resolve =>
        setTimeout(resolve, 1000)
    );

}


        await session.goto(jid, "ADMIN_HOME");

        return sock.sendMessage(jid, {

            text:
`✅ *Broadcast Selesai*

👥 Target   : ${targets.length}

✅ Berhasil : ${berhasil}

❌ Gagal    : ${gagal}`

        });

    }
    // =========================
    // BELUM DITANGANI
    // =========================

    return false;

};
