const productService = require("../services/productService");
const cartService = require("../services/cartService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, args) => {

    if (args.length < 2) {
        return sock.sendMessage(jid, {
            text: "Contoh:\n/beli <kode_produk> <jumlah>"
        });
    }

    const id = args[0];
    const qty = parseInt(args[1]);

    if (isNaN(qty) || qty <= 0) {
        return sock.sendMessage(jid, {
            text: "Jumlah harus berupa angka."
        });
    }

    const product = await productService.getProduct(id);

    if (!product) {
        return sock.sendMessage(jid, {
            text: "Produk tidak ditemukan."
        });
    }

    if (qty > product.stok) {
        return sock.sendMessage(jid, {
            text: `Stok tidak cukup.\nSisa stok: ${product.stok}`
        });
    }

    await cartService.addItem(jid, product, qty);

    await sock.sendMessage(jid, {
        text:
`✅ Ditambahkan ke keranjang

Produk : ${product.nama}
Qty : ${qty}
Subtotal : ${formatRupiah(product.harga * qty)}

Lanjut belanja:
/beli <kode_produk> <qty>

Lihat keranjang:
/keranjang`
    });

};
