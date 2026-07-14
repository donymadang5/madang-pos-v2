const orderService = require("../services/orderService");
const activity = require("../services/activityService");

module.exports = async (sock, jid, args = []) => {

    if (!args[0]) return;

    const id = args[0];

    const order = await orderService.getOrder(id);

    if (!order) {

        return sock.sendMessage(jid, {
            text: "❌ Order tidak ditemukan."
        });

    }

    if (order.status === "DITOLAK") {

        return sock.sendMessage(jid, {
            text: "Order sudah ditolak."
        });

    }

    await orderService.updateStatus(
        id,
        "DITOLAK"
    );

    await activity.addLog(
        "TOLAK",
        jid,
        `Order ${id}`
    );

    await sock.sendMessage(order.customer, {
        text:
`❌ Pembayaran untuk Order *${id}* ditolak.

Silakan kirim ulang bukti pembayaran atau hubungi admin jika terjadi kesalahan.`
    });

    await sock.sendMessage(jid, {
        text:
`✅ Order ${id} berhasil ditolak.

📝 Activity berhasil disimpan.`
    });

};
