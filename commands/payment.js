const paymentService = require("../services/paymentService");
const orderService = require("../services/orderService");

module.exports = async (sock, jid, args) => {

    if (args.length < 1) {
        return sock.sendMessage(jid, {
            text: "Contoh:\n/payment ORD20250713-12345"
        });
    }

    const orderId = args[0];

    const order = await orderService.getOrder(orderId);

    if (!order) {
        return sock.sendMessage(jid, {
            text: "❌ Order tidak ditemukan."
        });
    }

    await paymentService.savePayment({
        orderId,
        from: jid,
        status: "MENUNGGU_VERIFIKASI"
    });

    await orderService.updateStatus(
        orderId,
        "MENUNGGU_VERIFIKASI"
    );

    await sock.sendMessage(jid, {
        text:
`✅ Pembayaran berhasil dikirim.

ID Order:
${orderId}

Status:
MENUNGGU_VERIFIKASI

Mohon tunggu admin memverifikasi pembayaran Anda.`
    });

};
