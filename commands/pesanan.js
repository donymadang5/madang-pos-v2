const orderService = require("../services/orderService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid) => {

    const orders = await orderService.getOrdersByCustomer(jid);

    if (!orders.length) {
        return sock.sendMessage(jid, {
            text: "📦 Anda belum memiliki pesanan."
        });
    }

    let text = "📦 *Pesanan Saya*\n\n";

    orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((o, i) => {

            const tanggal = new Date(o.createdAt).toLocaleString("id-ID");

            let status = o.status;

            if (status === "LUNAS") status = "✅ LUNAS";
            if (status === "MENUNGGU_VERIFIKASI")
                status = "🟡 MENUNGGU_VERIFIKASI";
            if (status === "MENUNGGU_PEMBAYARAN")
                status = "🔴 MENUNGGU_PEMBAYARAN";

            text += `${i + 1}. ${o.id}\n`;
            text += `Status : ${status}\n`;
            text += `Total  : ${formatRupiah(o.total)}\n`;
            text += `Tanggal: ${tanggal}\n\n`;

        });

    return sock.sendMessage(jid, { text });

};
