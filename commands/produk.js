const productService = require("../services/productService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, args) => {

    if (!args.length) {
        return sock.sendMessage(jid, {
            text: "Contoh:\n/produk 21700blackcell"
        });
    }

    const id = args[0];

    const product = await productService.getProduct(id);

    if (!product) {
        return sock.sendMessage(jid, {
            text: "❌ Produk tidak ditemukan."
        });
    }

    let text = "📦 *Detail Produk*\n\n";
    text += `ID : ${product.id}\n`;
    text += `Nama : ${product.nama}\n`;
    text += `Kategori : ${product.kategori}\n`;
    text += `Harga : ${formatRupiah(product.harga)}\n`;
    text += `Stok : ${product.stok}`;

    return sock.sendMessage(jid, { text });

};
