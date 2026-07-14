const product = require("../services/productService");
const session = require("../services/sessionService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, index) => {

    const state = await session.getSession(jid);

    const kategori = state.kategori[index - 1];

    if (!kategori) {
        return sock.sendMessage(jid, {
            text: "❌ Kategori tidak ditemukan."
        });
    }

    const products = await product.getByCategory(kategori);

    await session.setSession(jid, {
        step: "PRODUK",
        kategoriDipilih: kategori,
        products
    });

    let text = `📂 *${kategori}*\n\n`;

    products.forEach((p, i) => {
        text += `${i + 1}. ${p.nama}\n`;
        text += `${formatRupiah(p.harga)} | Stok: ${p.stok}\n\n`;
    });

    text += "Balas nomor produk.";

    await sock.sendMessage(jid, { text });

};
