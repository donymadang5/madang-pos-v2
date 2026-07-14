const session = require("../../services/sessionService");
const customerService = require("../../services/customerService");

module.exports = async (sock, jid, body, state) => {

    // =========================
    // MENU
    // =========================

    if (state.step === "ADMIN_BROADCAST_MENU") {

        switch (body) {

            case "1":

                await session.goto(jid, "ADMIN_BROADCAST_TEXT", {
                    target: "ALL"
                });

                return sock.sendMessage(jid, {
                    text:
`📢 *Broadcast Semua Customer*

Silakan kirim pesan yang ingin dibroadcast.

Bisa berupa:
✅ Teks
✅ Foto + Caption
✅ Video + Caption
✅ Dokumen`
                });

            case "2":

                await session.goto(jid, "ADMIN_BROADCAST_TEXT", {
                    target: "MEMBER"
                });

                return sock.sendMessage(jid, {
                    text:
`📢 *Broadcast Member*

Silakan kirim pesan.`
                });

            case "3":

                await session.goto(jid, "ADMIN_BROADCAST_TEXT", {
                    target: "BARU"
                });

                return sock.sendMessage(jid, {
                    text:
`📢 *Broadcast Customer Baru*

Silakan kirim pesan.`
                });

            case "4":

                await session.goto(jid, "ADMIN_BROADCAST_TEXT", {
                    target: "INACTIVE"
                });

                return sock.sendMessage(jid, {
                    text:
`📢 *Broadcast Customer Tidak Aktif*

Silakan kirim pesan.`
                });

            case "5":

                await session.goto(jid, "ADMIN_BROADCAST_MANUAL");

                return sock.sendMessage(jid, {
                    text:
`📱 Kirim nomor tujuan.

Contoh:

081234567890
081234567891
081234567892`
                });

            case "0":

                await session.goto(jid, "ADMIN_HOME");

                return true;

        }

    }

    // =========================
    // INPUT PESAN
    // =========================

    if (state.step === "ADMIN_BROADCAST_TEXT") {

        const customers = await customerService.getCustomers();

        let targets = [];

        switch (state.target) {

            case "ALL":

                targets = customers;

                break;

            case "MEMBER":

                targets = customers.filter(c =>
                    Number(c.totalPoin || 0) > 0
                );

                break;

            case "BARU":

                targets = customers.filter(c =>
                    Number(c.totalOrder || 0) <= 1
                );

                break;

            case "INACTIVE":

                const batas = Date.now() - (30 * 86400000);

                targets = customers.filter(c => {

                    if (!c.lastOrder) return true;

                    return new Date(c.lastOrder).getTime() < batas;

                });

                break;

        }

        // =========================
// KONFIRMASI BROADCAST
// =========================

if (state.step === "ADMIN_BROADCAST_CONFIRM") {

    // Batal
    if (body === "2") {

        await session.goto(jid, "ADMIN_HOME");

        await sock.sendMessage(jid, {
            text: "❌ Broadcast dibatalkan."
        });

        return true;

    }

    if (body !== "1") {

        return sock.sendMessage(jid, {
            text: "Balas 1 untuk kirim atau 2 untuk batal."
        });

    }

    const customers = await customerService.getCustomers();

    let targets = [];

    switch (state.target) {

        case "ALL":

            targets = customers;

            break;

        case "MEMBER":

            targets = customers.filter(c =>
                Number(c.totalPoin || 0) > 0
            );

            break;

        case "BARU":

            targets = customers.filter(c =>
                Number(c.totalOrder || 0) <= 1
            );

            break;

        case "INACTIVE": {

            const batas = Date.now() - (30 * 24 * 60 * 60 * 1000);

            targets = customers.filter(c => {

                if (!c.lastOrder) return true;

                return new Date(c.lastOrder).getTime() < batas;

            });

            break;

        }

    }

    let berhasil = 0;
    let gagal = 0;

    await sock.sendMessage(jid, {
        text:
`📤 Mengirim broadcast...

Target : ${targets.length} customer`
    });

    for (const customer of targets) {

        try {

            await sock.sendMessage(customer.jid, {
                text: state.pesan
            });

            berhasil++;

        } catch (e) {

            gagal++;

        }

        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );

    }

    await session.goto(jid, "ADMIN_HOME");

    await sock.sendMessage(jid, {
        text:
`✅ *Broadcast Selesai*

👥 Target   : ${targets.length}

✅ Berhasil : ${berhasil}

❌ Gagal    : ${gagal}`
    });

    return true;

}
