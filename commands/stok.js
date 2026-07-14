const productService = require("../services/productService");

module.exports = async (sock, jid, args) => {

    const products = await productService.getProducts();

    if (args.length === 0) {

        let text = "📦 *Daftar Stok*\n\n";

        products.slice(0, 30).forEach((p, i) => {
            text += `${i + 1}. ${p.nama}\n`;
            text += `Kode : ${p.id}\n`;
            text += `Stok : ${p.stok}\n\n`;
        });

        if (products.length > 30) {
            text += `...dan ${products.length - 30} produk lainnya.`;
        }

        return sock.sendMessage(jid, { text });
    }

    const keyword = args.join(" ").toLowerCase();

    const product = products.find(p =>
        p.id.toLowerCase().includes(keyword) ||
        p.nama.toLowerCase().includes(keyword)
    );

    if (!product) {
        return sock.sendMessage(jid, {
            text: "❌ Produk tidak ditemukan."
        });
    }

    await sock.sendMessage(jid, {
        text:
`📦 ${product.nama}

Kode : ${product.id}
Harga : Rp${product.harga}
Stok : ${product.stok}`
    });

};
