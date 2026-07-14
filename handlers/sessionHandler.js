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

    if (text === "haalo") {
        return home(sock, jid);
    }

    if (text === "help") {
        return sock.sendMessage(jid, {
            text:
`📖 *BANTUAN*

Ketik *haalo* untuk mulai berbelanja.

Saat menu tampil cukup balas angka sesuai pilihan.`
        });
    }

    const state = await session.getSession(jid);

    if (!state || !state.step) {
        return;
    }

    // ===========================
    // HOME
    // ===========================

    if (state.step === "HOME") {

        if (text === "1" || text === "menu_belanja") {

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

        if (text === "2" || text === "menu_pesanan") {
            return pesanan(sock, jid);
        }

        if (text === "3" || text === "menu_admin") {

            return sock.sendMessage(jid, {
                text:
`☎ *Hubungi Admin*

08xxxxxxxxxx`
            });

        }

        if (text === "0") {

            await session.clearSession(jid);

            return sock.sendMessage(jid, {
                text: "👋 Terima kasih. Sampai jumpa."
            });

        }

        return;

    }

    // ===========================
    // KATEGORI
    // ===========================

    if (state.step === "KATEGORI") {

        const nomor = Number(text);

        if (isNaN(nomor)) return;

        return kategoriMenu(sock, jid, nomor);

    }

    // ===========================
    // PRODUK
    // ===========================

    if (state.step === "PRODUK") {

        const nomor = Number(text);

        if (isNaN(nomor)) return;

        return produkMenu(sock, jid, nomor);

    }

    // ===========================
    // QTY
    // ===========================

    if (state.step === "QTY") {

        const qty = Number(text);

        if (isNaN(qty) || qty <= 0) {
            return sock.sendMessage(jid, {
                text: "❌ Masukkan jumlah yang valid (angka lebih dari 0)"
            });
        }

        try {
            // Tambahkan item ke keranjang
            await cart.addItem(jid, state.product, qty);

            const subtotal = qty * state.product.harga;

            // Update session ke AFTER_CART
            await session.goto(jid, "AFTER_CART", {
                product: state.product
            });

            // Kirim pesan respons
            await sock.sendMessage(jid, {
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

        } catch (error) {
            console.error("Error dalam QTY handler:", error);
            return sock.sendMessage(jid, {
                text: "❌ Terjadi kesalahan. Silakan coba lagi."
            });
        }

        return;

    }

    // ===========================
    // AFTER CART
    // ===========================

    if (state.step === "AFTER_CART") {

        if (text === "1") {
            return home(sock, jid);
        }

        if (text === "2") {
            return keranjang(sock, jid);
        }

        if (text === "3") {
            return checkout(sock, jid);
        }

        return;

    }

    // ===========================
    // WAIT PAYMENT
    // ===========================

    if (state.step === "WAIT_PAYMENT") {

        if (text === "1") {

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

        }

        if (text === "2") {

            await session.clearSession(jid);

            return sock.sendMessage(jid, {
                text: "❌ Pembayaran dibatalkan."
            });

        }

        return;

    }

    return;

};
