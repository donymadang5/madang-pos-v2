const session = require("../../services/sessionService");
const orderService = require("../../services/orderService");

const approve = require("../../commands/approve");
const tolak = require("../../commands/tolak");

const { formatRupiah } = require("../../utils/helper");

module.exports = async (sock, jid, body, state) => {

    // ============================
    // LIST VERIFIKASI
    // ============================

    if (state.step === "ADMIN_VERIFY_LIST") {

        const nomor = parseInt(body);

        if (isNaN(nomor)) {
            return true;
        }

        const orderId = state.orders[nomor - 1];

        if (!orderId) {

            await sock.sendMessage(jid, {
                text: "❌ Nomor tidak valid."
            });

            return true;
        }

        const order = await orderService.getOrder(orderId);

        if (!order) {

            await sock.sendMessage(jid, {
                text: "❌ Order tidak ditemukan."
            });

            return true;
        }

        let text = "🧾 *Detail Order*\n\n";

        text += `ID : ${order.id}\n`;
        text += `Customer : ${order.customer}\n\n`;

        for (const item of order.items) {
            text += `• ${item.nama}\n`;
            text += `${item.qty} x ${formatRupiah(item.harga)}\n\n`;
        }

        text += "━━━━━━━━━━━━━━━\n";
        text += `Total : ${formatRupiah(order.total)}\n`;
        text += `Status : ${order.status}\n\n`;

        text += "1️⃣ Approve\n";
        text += "2️⃣ Tolak\n";
        text += "0️⃣ Kembali";

        await session.setSession(jid, {
            step: "ADMIN_VERIFY_DETAIL",
            orderId,
            orders: state.orders
        });

        await sock.sendMessage(jid, { text });

        return true;
    }

    // ============================
    // DETAIL VERIFIKASI
    // ============================

    if (state.step === "ADMIN_VERIFY_DETAIL") {

        if (body === "1") {

            await approve(sock, jid, [state.orderId]);

            await session.clearSession(jid);

            return true;
        }

        if (body === "2") {

            await tolak(sock, jid, [state.orderId]);

            await session.clearSession(jid);

            return true;
        }

        if (body === "0") {

            const orders = [];

            for (const id of state.orders) {

                const order = await orderService.getOrder(id);

                if (order) {
                    orders.push(order);
                }

            }

            let text = "🧾 *Menunggu Verifikasi*\n\n";

            orders.forEach((order, i) => {

                text += `${i + 1}. ${order.id}\n`;
                text += `${formatRupiah(order.total)}\n\n`;

            });

            text += "Balas nomor untuk melihat detail pesanan.";

            await session.setSession(jid, {
                step: "ADMIN_VERIFY_LIST",
                orders: state.orders
            });

            await sock.sendMessage(jid, {
                text
            });

            return true;
        }

        return true;
    }

    return false;

};
