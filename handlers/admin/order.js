const session = require("../../services/sessionService");
const orderService = require("../../services/orderService");
const { formatRupiah } = require("../../utils/helper");

module.exports = async (sock, jid, body, state) => {

    if (state.step === "ADMIN_ORDER_SEARCH") {

        const order = await orderService.getOrder(body.trim());

        await session.goto(jid, "ADMIN_ORDER_HOME");

        if (!order) {

            await sock.sendMessage(jid, {
                text: "❌ Invoice tidak ditemukan."
            });

            return true;
        }

        let text =
`📄 *DETAIL INVOICE*

🆔 ${order.id}

👤 Customer
${order.customer}

💰 Total
${formatRupiah(order.total)}

📌 Status
${order.status}

📅 Tanggal
${order.createdAt}

📦 Item

`;

        order.items.forEach((item, i) => {
            text += `${i + 1}. ${item.nama}\n`;
            text += `${item.qty} x ${formatRupiah(item.harga)}\n\n`;
        });

        await sock.sendMessage(jid, { text });

        return true;
    }

    if (state.step !== "ADMIN_ORDER_HOME") {
        return false;
    }

    switch (body) {

        case "1": {

            const orders = (await orderService.getOrders())
                .filter(o => o.status === "MENUNGGU_PEMBAYARAN");

            if (!orders.length) {
                await sock.sendMessage(jid, {
                    text: "✅ Tidak ada order menunggu pembayaran."
                });
                return true;
            }

            let text = "💰 *MENUNGGU PEMBAYARAN*\n\n";

            orders.forEach((o, i) => {
                text += `${i + 1}. ${o.id}\n`;
                text += `${o.customer}\n`;
                text += `${formatRupiah(o.total)}\n\n`;
            });

            await sock.sendMessage(jid, { text });

            return true;
        }

        case "2": {

            const orders = await orderService.getWaitingVerification();

            if (!orders.length) {
                await sock.sendMessage(jid, {
                    text: "✅ Tidak ada order menunggu verifikasi."
                });
                return true;
            }

            let text = "📋 *MENUNGGU VERIFIKASI*\n\n";

            orders.forEach((o, i) => {
                text += `${i + 1}. ${o.id}\n`;
                text += `${o.customer}\n`;
                text += `${formatRupiah(o.total)}\n\n`;
            });

            await sock.sendMessage(jid, { text });

            return true;
        }

        case "3": {

            const orders = (await orderService.getOrders())
                .filter(o => o.status === "LUNAS");

            if (!orders.length) {
                await sock.sendMessage(jid, {
                    text: "Belum ada order lunas."
                });
                return true;
            }

            let text = "✅ *ORDER LUNAS*\n\n";

            orders.forEach((o, i) => {
                text += `${i + 1}. ${o.id}\n`;
                text += `${formatRupiah(o.total)}\n\n`;
            });

            await sock.sendMessage(jid, { text });

            return true;
        }

        case "4": {

            const orders = await orderService.getTodayOrders();

            const total = orders.reduce(
                (t, o) => t + Number(o.total || 0),
                0
            );

            await sock.sendMessage(jid, {
                text:
`📅 *ORDER HARI INI*

Jumlah Order : ${orders.length}

Omzet :
${formatRupiah(total)}`
            });

            return true;
        }

        case "5":

            await session.goto(jid, "ADMIN_ORDER_SEARCH");

            await sock.sendMessage(jid, {
                text: "🔎 Kirim ID Invoice.\n\nContoh:\nINV202607140001"
            });

            return true;

        case "0":

            await session.goto(jid, "ADMIN_HOME");

            await sock.sendMessage(jid, {
                text:
`📊 *Dashboard Admin*

1️⃣ Verifikasi Pembayaran
2️⃣ Customer Manager
3️⃣ Order Manager
4️⃣ Statistik
5️⃣ Import Excel
6️⃣ Export Excel
7️⃣ Pengaturan`
            });

            return true;
    }

    return false;

};
