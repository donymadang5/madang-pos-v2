const productService = require("../services/productService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, args) => {

    const products = await productService.getProducts();

    if (args.length === 0) {

        const kategori = [...new Set(
            products.map(p => (p.kategori || "-").toLowerCase())
        )];

        let text = "📂 *Daftar Kategori*\n\n";

        kategori.forEach((k, i) => {
            text += `${i + 1}. ${k}\n`;
        });

        text += "\nContoh:\n";
        text += "/kategori baterai";

        return sock.sendMessage(jid, {
            text
        });

    }

    const keyword = args.join(" ").toLowerCase();

    const hasil = products.filter(p =>
        (p.kategori || "").toLowerCase() === keyword
    );

    if (!hasil.length) {
        return sock.sendMessage(jid, {
            text: "❌ Kategori tidak ditemukan."
        });
    }

    let text = `📦 *Kategori: ${keyword}*\n\n`;

    hasil.forEach((p, i) => {
        text += `${i + 1}. ${p.nama}\n`;
        text += `Kode : ${p.id}\n`;
        text += `Harga : ${formatRupiah(p.harga)}\n`;
        text += `Stok : ${p.stok}\n\n`;
    });

    text += "━━━━━━━━━━━━━━━\n";
    text += "Untuk membeli:\n";
    text += "/beli KODE JUMLAH";

    await sock.sendMessage(jid, {
        text
    });

};
