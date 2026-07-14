const productService = require("../services/productService");
const sessionService = require("../services/sessionService");
const { sendButtons } = require("../utils/ui");

module.exports = async (sock, jid) => {

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
3️⃣ Bantuan
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
                    displayText: "☎ Bantuan"
                },
                type: 1
            }
        ]
    );

};
