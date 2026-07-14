const session = require("../services/sessionService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, nomor) => {

    const state = await session.getSession(jid);

    const product = state.products?.[nomor - 1];

    if (!product) {
        return sock.sendMessage(jid, {
            text: "❌ Produk tidak ditemukan."
        });
    }

    await session.setSession(jid, {
        step: "QTY",
        product
    });

    let text = `📦 *${product.nama}*\n\n`;
    text += `💰 Harga : ${formatRupiah(product.harga)}\n`;
    text += `📦 Stok : ${product.stok}\n\n`;
    text += "Balas jumlah yang ingin dibeli.";

    await sock.sendMessage(jid, {
        text
    });

};
