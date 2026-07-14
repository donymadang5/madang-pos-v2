const session = require("../services/sessionService");
const orderService = require("../services/orderService");
const productService = require("../services/productService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock,jid)=>{

    const todayOrders = await orderService.getTodayOrders();
    const waiting = await orderService.getWaitingVerification();
    const omzet = await orderService.getTodayRevenue();
    const products = await productService.getProducts();

    const stokTipis = products.filter(
        p=>Number(p.stok)>0 && Number(p.stok)<=5
    ).length;

    await session.goto(jid,"ADMIN_HOME");

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
2️⃣ Kelola Produk
3️⃣ Data Customer
4️⃣ Broadcast Promo
5️⃣ Statistik
6️⃣ Import Excel
7️⃣ Export Excel
8️⃣ Pengaturan

Balas angka menu.`;

    await sock.sendMessage(jid,{text});

};
