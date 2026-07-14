const statService = require("../services/statService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid) => {

    const data = await statService.dashboard();

    let text = "";

    text += "📊 *MADANG POS*\n";
    text += "━━━━━━━━━━━━━━━━━━\n\n";

    text += `💰 Omzet Hari Ini\n`;
    text += `${formatRupiah(data.revenue)}\n\n`;

    text += `📦 Order Hari Ini : ${data.totalOrder}\n`;
    text += `👥 Total Customer : ${data.customer}\n`;
    text += `🆕 Customer Baru : ${data.newCustomer}\n\n`;

    text += "━━━━━━━━━━━━━━━━━━\n\n";

    text += `🟡 Menunggu Pembayaran : ${data.waitingPayment}\n`;
    text += `🟠 Menunggu Verifikasi : ${data.waitingVerification}\n`;
    text += `🟢 Lunas : ${data.paid}\n`;
    text += `🔴 Ditolak : ${data.rejected}\n`;

    if (data.topCustomer.length) {

        text += "\n━━━━━━━━━━━━━━━━━━\n";
        text += "\n🏆 *Top Customer*\n\n";

        data.topCustomer.forEach((c, i) => {

            text += `${i + 1}. ${c.nama || c.jid}\n`;
            text += `   ${formatRupiah(c.totalBelanja)}\n`;

        });

    }

    if (data.topProduct.length) {

        text += "\n━━━━━━━━━━━━━━━━━━\n";
        text += "\n🏆 *Top Produk Hari Ini*\n\n";

        data.topProduct.forEach((p, i) => {

            text += `${i + 1}. ${p[0]}\n`;
            text += `   Terjual : ${p[1]}\n`;

        });

    }

    await sock.sendMessage(jid, {
        text
    });

};
