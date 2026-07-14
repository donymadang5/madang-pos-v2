const orderService = require("../services/orderService");

module.exports = async (sock, jid, args = []) => {

    // /order
    if (args.length === 0) {

        const summary = await orderService.getSummary();
        const today = await orderService.getTodayOrders();

        let text = "";
        text += "📦 *ORDER CENTER*\n\n";

        text += `🟡 Menunggu Pembayaran : ${summary.waitingPayment}\n`;
        text += `🟠 Menunggu Verifikasi : ${summary.waitingVerification}\n`;
        text += `🟢 Lunas : ${summary.paid}\n`;
        text += `🔴 Ditolak : ${summary.rejected}\n\n`;

        text += `📅 Hari Ini : ${today.length} Order\n\n`;

        text += "*Perintah*\n";
        text += "/order pending\n";
        text += "/order verifikasi\n";
        text += "/order lunas\n";
        text += "/order ditolak\n";
        text += "/order cari <invoice>";

        return sock.sendMessage(jid, { text });
    }

    const action = args[0].toLowerCase();

    const map = {
        pending: "MENUNGGU_PEMBAYARAN",
        verifikasi: "MENUNGGU_VERIFIKASI",
        lunas: "LUNAS",
        ditolak: "DITOLAK"
    };

    if (action === "cari") {

        if (!args[1]) {
            return sock.sendMessage(jid, {
                text: "Contoh:\n/order cari ORD20260714"
            });
        }

        const order = await orderService.findOrder(args[1]);

        if (!order) {
            return sock.sendMessage(jid, {
                text: "❌ Invoice tidak ditemukan."
            });
        }

        let text = "";

        text += "📄 *DETAIL ORDER*\n\n";
        text += `Invoice : ${order.id}\n`;
        text += `Customer : ${order.customer}\n`;
        text += `Status : ${order.status}\n`;
        text += `Total : Rp${Number(order.total).toLocaleString("id-ID")}\n\n`;

        text += "*Item*\n";

        order.items.forEach((item, i) => {
            text += `${i + 1}. ${item.nama}\n`;
            text += `   ${item.qty} x Rp${Number(item.harga).toLocaleString("id-ID")}\n`;
        });

        return sock.sendMessage(jid, { text });
    }

    if (!map[action]) {

        return sock.sendMessage(jid, {
            text: "Kategori tidak dikenal."
        });

    }

    const orders = await orderService.getOrdersByStatus(map[action]);

    if (!orders.length) {

        return sock.sendMessage(jid, {
            text: "Tidak ada data."
        });

    }

    let text = "";

    text += `📦 *${action.toUpperCase()}*\n\n`;

    orders.forEach((o, i) => {

        text += `${i + 1}. ${o.id}\n`;
        text += `${o.customer}\n`;
        text += `Rp${Number(o.total).toLocaleString("id-ID")}\n\n`;

    });

    return sock.sendMessage(jid, { text });

};
