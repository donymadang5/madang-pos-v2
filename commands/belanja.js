const productService = require("../services/productService");
const session = require("../services/sessionService");

module.exports = async (sock, jid) => {

    const products = await productService.getProducts();

    if (!products.length) {
        return sock.sendMessage(jid, {
            text: "📦 Produk belum tersedia."
        });
    }

    const kategori = [
        ...new Set(
            products.map(p => (p.kategori || "-").toLowerCase())
        )
    ].sort();

    session.setState(jid, {
        action: "PILIH_KATEGORI",
        kategori
    });

    let text = "🛍️ *MADANG POS*\n\n";
    text += "Pilih kategori:\n\n";

    kategori.forEach((k, i) => {
        text += `${i + 1}. ${k}\n`;
    });

    text += "\nBalas dengan angka.\n";
    text += "Contoh:\n";
    text += "1";

    await sock.sendMessage(jid, {
        text
    });

};
