const session = require("../services/sessionService");
const orderService = require("../services/orderService");
const productService = require("../services/productService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid) => {

    const todayOrders = await orderService.getTodayOrders();
    const waiting = await orderService.getWaitingVerification();
    const omzet = await orderService.getTodayRevenue();
    const products = await productService.getProducts();

    const stokTipis = products.filter(
        p => Number(p.stok) > 0 && Number(p.stok) <= 5
    ).length;

    await session.goto(jid, "ADMIN_HOME");

    const text =
`🏪 MADANG POS
━━━━━━━━━━━━━━━━━━

👨‍💼 *ADMIN PANEL*

🛒 Order Hari Ini      : ${todayOrders.length}
💰 Omzet Hari Ini      : ${formatRupiah(omzet)}
💳 Menunggu Verifikasi : ${waiting.length}
📦 Total Produk        : ${products.length}
⚠️ Stok Menipis        : ${stokTipis}

━━━━━━━━━━━━━━━━━━

1️⃣ Verifikasi Pembayaran
2️⃣ Data Customer
3️⃣ Broadcast Promo
4️⃣ Statistik
5️⃣ Import Excel
6️⃣ Export Excel
7️⃣ Pengaturan
8️⃣ Kelola Voucher

Balas angka menu.`;

    await sock.sendMessage(jid, { text });

};
