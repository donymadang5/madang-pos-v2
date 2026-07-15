const cartService = require("../services/cartService");
const orderService = require("../services/orderService");
const customerService = require("../services/customerService");
const session = require("../services/sessionService");
const productService = require("../services/productService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid) => {
    const cart = await cartService.getCart(jid);

    if (!cart || cart.items.length === 0) {
        return sock.sendMessage(jid, {
            text: "🛒 Keranjang masih kosong."
        });
    }

    let subtotal = 0;

    for (const item of cart.items) {
        subtotal += Number(item.harga) * Number(item.qty);
    }

    const diskon = 0;
    const voucher = null;
    const total = subtotal;

    try {

        const stockAvailable = await productService.validateStock(cart.items);

        if (!stockAvailable) {
            return sock.sendMessage(jid, {
                text: "❌ Stok produk tidak mencukupi. Silakan periksa keranjang Anda."
            });
        }

        await customerService.saveCustomer(jid);

        const order = await orderService.createOrder(
            jid,
            cart.items,
            subtotal,
            {
                voucher,
                diskon
            }
        );

        await session.goto(jid, "WAIT_VOUCHER_OPTION", {
            lastOrderId: order.id,
            subtotal,
            total,
            voucher
        });

        await cartService.clearCart(jid);

        return sock.sendMessage(jid, {
            text:
`🏪 *MADANG VAPE*

Subtotal : ${formatRupiah(subtotal)}

Punya voucher?

1️⃣ Ya
2️⃣ Tidak`
        });

    } catch (err) {

        console.error(err);

        return sock.sendMessage(jid, {
            text: "❌ Terjadi kesalahan saat checkout."
        });

    }

};
