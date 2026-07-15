const fs = require("fs");

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

const voucherService = require("../services/voucherService");
const config = require("../config/config");

const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, body) => {

    const text = body.trim().toLowerCase();

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

    if (!state?.step) return;

    switch (state.step) {
case "REGISTER_NAME": {

    const input = body.trim();

    if (!input.includes("-")) {

        return sock.sendMessage(jid, {
            text:
`❌ Format salah.

Kirim dengan format:

Nama-081234567890

Contoh:
Dony-081234567890`
        });

    }

    const [nama, nomor] = input.split("-");

    if (!nama || nama.trim().length < 3) {

        return sock.sendMessage(jid, {
            text: "❌ Nama minimal 3 karakter."
        });

    }

    let phone = nomor.replace(/\D/g, "");

    if (phone.startsWith("62")) {
        phone = "0" + phone.slice(2);
    }

    if (!/^08\d{8,13}$/.test(phone)) {

        return sock.sendMessage(jid, {
            text: "❌ Nomor WhatsApp tidak valid."
        });

    }

    const customerService = require("../services/customerService");

    await customerService.registerCustomer(
        jid,
        nama.trim(),
        phone
    );

    return home(sock, jid);

}
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

        case "KATEGORI": {

            const nomor = Number(text);

            if (isNaN(nomor)) return;

            return kategoriMenu(sock, jid, nomor);

        }

        case "PRODUK": {

            const nomor = Number(text);

            if (isNaN(nomor)) return;

            return produkMenu(sock, jid, nomor);

        }

        case "QTY": {

            const qty = Number(text);

            if (isNaN(qty) || qty <= 0) {

                return sock.sendMessage(jid, {
                    text: "❌ Masukkan jumlah yang valid."
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

        case "AFTER_CART":

            switch (text) {

                case "1":
                    return home(sock, jid);

                case "2":
                    return keranjang(sock, jid);

                case "3":
                    return checkout(sock, jid);

            }

            return;        case "WAIT_VOUCHER_OPTION":

            if (text === "1") {

                await session.goto(jid, "WAIT_VOUCHER_CODE", {
                    lastOrderId: state.lastOrderId,
                    subtotal: state.subtotal,
                    total: state.total
                });

                return sock.sendMessage(jid, {
                    text: "🎁 Masukkan kode voucher."
                });

            }

            if (text === "2") {

                const order = await orderService.getOrder(
                    state.lastOrderId
                );

                let caption = "";

                caption += "🏪 *MADANG VAPE*\n";
                caption += "━━━━━━━━━━━━━━━━━━\n\n";
                caption += "🧾 *INVOICE*\n\n";
                caption += `ID Order : ${order.id}\n`;
                caption += "Status   : MENUNGGU PEMBAYARAN\n\n";

                for (const item of order.items) {

                    caption += `${item.nama}\n`;
                    caption += `${item.qty} x ${formatRupiah(item.harga)}\n`;
                    caption += `= ${formatRupiah(item.qty * item.harga)}\n\n`;

                }

                caption += "━━━━━━━━━━━━━━━━━━\n";
                caption += `Subtotal : ${formatRupiah(state.subtotal)}\n`;
                caption += `TOTAL    : ${formatRupiah(state.total)}\n\n`;
                caption += "Silakan scan QRIS di bawah.\n\n";
                caption += "1️⃣ Saya Sudah Transfer\n";
                caption += "2️⃣ Batal";

                await session.goto(jid, "WAIT_PAYMENT", {
                    lastOrderId: state.lastOrderId
                });

                return sock.sendMessage(jid, {
                    image: fs.readFileSync(config.public.qris),
                    caption
                });

            }

            return;

        case "WAIT_VOUCHER_CODE": {

            const order = await orderService.getOrder(
                state.lastOrderId
            );

            const result = await voucherService.consumeVoucher(
                text.toUpperCase(),
                order.items,
                state.subtotal
            );

            if (!result.ok) {

                return sock.sendMessage(jid, {
                    text: "❌ " + result.message
                });

            }

            await orderService.updateOrder(order.id, {
                voucher: result.voucher.kode,
                diskon: result.diskon,
                total: result.total
            });

            let caption = "";

            caption += "🏪 *MADANG VAPE*\n";
            caption += "━━━━━━━━━━━━━━━━━━\n\n";
            caption += "🧾 *INVOICE*\n\n";
            caption += `ID Order : ${order.id}\n`;
            caption += "Status   : MENUNGGU PEMBAYARAN\n\n";

            for (const item of order.items) {

                caption += `${item.nama}\n`;
                caption += `${item.qty} x ${formatRupiah(item.harga)}\n`;
                caption += `= ${formatRupiah(item.qty * item.harga)}\n\n`;

            }

            caption += "━━━━━━━━━━━━━━━━━━\n";
            caption += `Subtotal : ${formatRupiah(state.subtotal)}\n`;
            caption += `Diskon   : -${formatRupiah(result.diskon)}\n`;
            caption += `TOTAL    : ${formatRupiah(result.total)}\n\n`;
            caption += "Silakan scan QRIS di bawah.\n\n";
            caption += "1️⃣ Saya Sudah Transfer\n";
            caption += "2️⃣ Batal";

            await session.goto(jid, "WAIT_PAYMENT", {
                lastOrderId: order.id
            });

            return sock.sendMessage(jid, {
                image: fs.readFileSync(config.public.qris),
                caption
            });

        }

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
