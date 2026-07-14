const productService = require("../services/productService");
const customerService = require("../services/customerService");
const sessionService = require("../services/sessionService");
const { sendButtons } = require("../utils/ui");

module.exports = async (sock, jid) => {

    const registered = await customerService.isRegistered(jid);

    if (!registered) {

        await sessionService.goto(jid, "REGISTER_NAME");

        return sock.sendMessage(jid, {
            text:
`👋 Selamat datang di *Madang Vape* 👋

Sebelum mulai berbelanja, silakan lakukan registrasi terlebih dahulu.

📝 Balas dengan *Nama Lengkap* Anda.`
        });

    }

    const kategori = await productService.getCategories();

    await sessionService.goto(jid, "HOME", {
        type: "CUSTOMER",
        page: "HOME",
        kategori
    });

    await sendButtons(
        sock,
        jid,
`👋 Selamat datang di *Madang POS*

Silakan pilih menu di bawah ini.

Atau balas angka:

1️⃣ Belanja
2️⃣ Pesanan Saya
3️⃣ Hubungi Admin
0️⃣ Keluar`,
        "🏪 Madang POS",
        [
            {
                buttonId: "MENU_BELANJA",
                buttonText: {
                    displayText: "🛒 Belanja"
                },
                type: 1
            },
            {
                buttonId: "MENU_PESANAN",
                buttonText: {
                    displayText: "📦 Pesanan Saya"
                },
                type: 1
            },
            {
                buttonId: "MENU_ADMIN",
                buttonText: {
                    displayText: "☎ Hubungi Admin"
                },
                type: 1
            }
        ]
    );

};
