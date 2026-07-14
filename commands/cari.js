const productService = require("../services/productService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, args) => {

    if (!args.length) {
        return sock.sendMessage(jid, {
            text: "Contoh:\n/cari oxva"
        });
    }

    const keyword = args.join(" ").toLowerCase();

    const products = await productService.getProducts();

    const hasil = products.filter(p =>
        String(p.nama).toLowerCase().includes(keyword)
    );

    if (!hasil.length) {
        return sock.sendMessage(jid, {
            text: "❌ Produk tidak ditemukan."
        });
    }

    let text = `🔍 *Hasil Pencarian*\n\n`;

    hasil.slice(0, 10).forEach((p, i) => {

        text += `${i + 1}. ${p.nama}\n`;
        text += `💰 ${formatRupiah(p.harga)}\n`;
        text += `📦 Stok : ${p.stok}\n`;
        text += `📂 ${p.kategori}\n\n`;

    });

    if (hasil.length > 10) {
        text += `Menampilkan 10 dari ${hasil.length} produk.`;
    }

    return sock.sendMessage(jid, { text });

};
