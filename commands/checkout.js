const fs = require("fs");

const cartService = require("../services/cartService");
const orderService = require("../services/orderService");
const customerService = require("../services/customerService");
const session = require("../services/sessionService");

const config = require("../config/config");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid) => {

    const cart = await cartService.getCart(jid);

    if (!cart || cart.items.length === 0) {
        return sock.sendMessage(jid, {
            text: "🛒 Keranjang masih kosong."
        });
    }

    let subtotal = 0;

    for (const item of cart.items) {
        subtotal += Number(item.harga) * Number(item.qty);
    }

    // Belum memakai voucher
    const diskon = 0;
    const voucher = null;
    const total = subtotal - diskon;

    try {
        await customerService.saveCustomer(jid);

        // ✅ FIXED - Pass parameter dengan benar sebagai object
        const order = await orderService.createOrder(
            jid,
            cart.items,
            subtotal,
            {
                voucher: voucher,
                diskon: diskon
            }
        );

        await session.goto(jid, "WAIT_PAYMENT", {
            lastOrderId: order.id
        });

        await cartService.clearCart(jid);

        let caption = "";

        caption += "🏪 *MADANG VAPE*\n";
        caption += "━━━━━━━━━━━━━━━━━━\n\n";

        caption += "🧾 *INVOICE*\n\n";
        caption += `Order : ${order.id}\n\n`;

        for (const item of cart.items) {

            caption += `${item.nama}\n`;
            caption += `${item.qty} x ${formatRupiah(item.harga)}\n`;
            caption += `= ${formatRupiah(item.qty * item.harga)}\n\n`;

        }

        caption += "━━━━━━━━━━━━━━━━━━\n";

        caption += `Subtotal : ${formatRupiah(subtotal)}\n`;

        if (diskon > 0) {
            caption += `Diskon : -${formatRupiah(diskon)}\n`;
        }

        caption += `Total : ${formatRupiah(total)}\n\n`;

        caption +=
`Silakan scan QRIS untuk melakukan pembayaran.

1️⃣ Saya Sudah Transfer
2️⃣ Batal`;

        await sock.sendMessage(jid, {
            image: fs.readFileSync(config.public.qris),
            caption
        });

    } catch (error) {
        console.error("Error in checkout:", error);
        return sock.sendMessage(jid, {
            text: "❌ Terjadi kesalahan saat checkout. Silakan coba lagi."
        });
    }

};
