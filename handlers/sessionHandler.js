const home = require("../menus/home");
const kategoriMenu = require("../menus/kategori");
const produkMenu = require("../menus/produk");

const session = require("../services/sessionService");
const cart = require("../services/cartService");

const keranjang = require("../commands/keranjang");
const checkout = require("../commands/checkout");
const pesanan = require("../commands/pesanan");

const paymentService = require("../services/paymentService");
const orderService = require("../services/orderService");

const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, body) => {

    const text = body.trim().toLowerCase();

    // ===========================
    // TRIGGER
    // ===========================

    switch (text) {

        case "haalo":
            return home(sock, jid);

        case "help":
            return sock.sendMessage(jid, {
                text:
`📖 *BANTUAN*

Ketik *haalo* untuk mulai berbelanja.

Saat menu tampil cukup balas angka sesuai pilihan.`
            });

    }

    const state = await session.getSession(jid);

    if (!state?.step) {
        return;
    }

    switch (state.step) {

        // ===========================
        // HOME
        // ===========================

        case "HOME":

            switch (text) {

                case "1":
                case "menu_belanja": {

                    let msg = "📂 *Pilih Kategori*\n\n";

                    state.kategori.forEach((k, i) => {
                        msg += `${i + 1}. ${k}\n`;
                    });

                    await session.goto(jid, "KATEGORI", {
                        kategori: state.kategori
                    });

                    return sock.sendMessage(jid, {
                        text: msg
                    });

                }

                case "2":
                case "menu_pesanan":
                    return pesanan(sock, jid);

                case "3":
                case "menu_admin":

                    return sock.sendMessage(jid, {
                        text:
`☎ *Hubungi Admin*

08xxxxxxxxxx`
                    });

                case "0":

                    await session.clearSession(jid);

                    return sock.sendMessage(jid, {
                        text: "👋 Terima kasih. Sampai jumpa."
                    });

            }

            return;

        // ===========================
        // KATEGORI
        // ===========================

        case "KATEGORI": {

            const nomor = Number(text);

            if (isNaN(nomor)) return;

            return kategoriMenu(sock, jid, nomor);

        }

        // ===========================
        // PRODUK
        // ===========================

        case "PRODUK": {

            const nomor = Number(text);

            if (isNaN(nomor)) return;

            return produkMenu(sock, jid, nomor);

        }

        // ===========================
        // QTY
        // ===========================

        case "QTY": {

            const qty = Number(text);

            if (isNaN(qty) || qty <= 0) {

                return sock.sendMessage(jid, {
                    text: "❌ Masukkan jumlah yang valid (angka lebih dari 0)"
                });

            }

            await cart.addItem(jid, state.product, qty);

            const subtotal = qty * state.product.harga;

            await session.goto(jid, "AFTER_CART", {
                product: state.product
            });

            return sock.sendMessage(jid, {
                text:
`✅ Berhasil ditambahkan ke keranjang

📦 ${state.product.nama}
Qty : ${qty}
Subtotal : ${formatRupiah(subtotal)}

━━━━━━━━━━━━━━━

1️⃣ Belanja Lagi
2️⃣ Lihat Keranjang
3️⃣ Checkout`
            });

        }
        // ===========================
        // AFTER CART
        // ===========================

        case "AFTER_CART":

            switch (text) {

                case "1":
                    return home(sock, jid);

                case "2":
                    return keranjang(sock, jid);

                case "3":
                    return checkout(sock, jid);

            }

            return;

        // ===========================
        // WAIT PAYMENT
        // ===========================

        case "WAIT_PAYMENT":

            switch (text) {

                case "1":

                    await paymentService.savePayment({
                        orderId: state.lastOrderId,
                        from: jid,
                        status: "MENUNGGU_VERIFIKASI"
                    });

                    await orderService.updateStatus(
                        state.lastOrderId,
                        "MENUNGGU_VERIFIKASI"
                    );

                    await session.clearSession(jid);

                    return sock.sendMessage(jid, {
                        text:
`✅ Bukti pembayaran diterima.

ID Order : ${state.lastOrderId}

Status : MENUNGGU_VERIFIKASI

Admin akan segera memverifikasi pembayaran Anda.`
                    });

                case "2":

                    await session.clearSession(jid);

                    return sock.sendMessage(jid, {
                        text: "❌ Pembayaran dibatalkan."
                    });

            }

            return;

        default:
            return;

    }

};
