const cartService = require("../services/cartService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid) => {

    const cart = await cartService.getCart(jid);

    if (!cart || cart.items.length === 0) {
        return sock.sendMessage(jid, {
            text:
`🏪 MADANG POS
━━━━━━━━━━━━━━━━━━

🛒 Keranjang masih kosong.

Ketik *haalo* untuk mulai belanja.`
        });
    }

    let total = 0;

    let text =
`🏪 MADANG POS
━━━━━━━━━━━━━━━━━━

🛒 *KERANJANG BELANJA*

`;

    cart.items.forEach((item, i) => {

        const subtotal = item.harga * item.qty;

        total += subtotal;

        text +=
`${i + 1}. ${item.nama}
   Qty  : ${item.qty}
   Harga: ${formatRupiah(item.harga)}
   Subtotal: ${formatRupiah(subtotal)}

`;

    });

    text +=
`━━━━━━━━━━━━━━━━━━
💰 Total : ${formatRupiah(total)}

1️⃣ Checkout
2️⃣ Belanja Lagi

Balas angka pilihan.`;

    await sock.sendMessage(jid, { text });

};
