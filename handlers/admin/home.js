const session = require("../../services/sessionService");
const orderService = require("../../services/orderService");

const { formatRupiah } = require("../../utils/helper");

module.exports = async (sock, jid, body, state) => {

    if (state.step !== "ADMIN_HOME") {
        return false;
    }

    // 1. Verifikasi Pembayaran
    if (body === "1") {

        const orders = await orderService.getWaitingVerification();

        if (orders.length === 0) {

            await sock.sendMessage(jid,{
                text:"✅ Tidak ada pembayaran yang menunggu verifikasi."
            });

            return true;
        }

        let text = "🧾 *MENUNGGU VERIFIKASI*\n\n";

        orders.forEach((order,i)=>{

            text += `${i+1}. ${order.id}\n`;
            text += `${formatRupiah(order.total)}\n\n`;

        });

        text += "Balas nomor untuk melihat detail pesanan.";

        await session.goto(jid,"ADMIN_VERIFY_LIST",{
            orders:orders.map(o=>o.id)
        });

        await sock.sendMessage(jid,{ text });

        return true;
    }

    // 2. Customer Manager
    if (body === "2") {

        await session.goto(jid,"ADMIN_CUSTOMER_HOME");

        await sock.sendMessage(jid,{
text:
`👥 *CUSTOMER MANAGER*

1️⃣ Total Customer
2️⃣ Cari Customer
3️⃣ Top Customer
4️⃣ Riwayat Customer

0️⃣ Kembali`
        });

        return true;
    }

    // 3. Order Manager
    if (body === "3") {

        await session.goto(jid,"ADMIN_ORDER_HOME");

        await sock.sendMessage(jid,{
text:
`📦 *ORDER MANAGER*

1️⃣ Menunggu Pembayaran
2️⃣ Menunggu Verifikasi
3️⃣ Order Lunas
4️⃣ Order Hari Ini
5️⃣ Cari Invoice

0️⃣ Kembali`
        });

        return true;
    }

    // 4. Statistik
    if (body === "4") {

        await session.goto(jid,"ADMIN_STATISTIC_HOME");

        const statistic = require("./statistic");

        return statistic(sock,jid,"",{
            step:"ADMIN_STATISTIC_HOME"
        });

    }

    // 5. Broadcast
    if (body === "5") {

        await session.goto(jid,"ADMIN_BROADCAST_INPUT");

        await sock.sendMessage(jid,{
text:
`📢 *BROADCAST CUSTOMER*

Silakan kirim pesan yang ingin dikirim ke seluruh customer.

Contoh:

🎉 Promo Hari Ini!
Diskon 20% untuk semua menu.

Kirim teks tersebut sebagai balasan.`
        });

        return true;
    }

    const menus = {

        "6":"📥 Import Excel",
        "7":"📤 Export Excel",
        "8":"⚙️ Pengaturan"

    };

    if (menus[body]) {

        await sock.sendMessage(jid,{
            text:`🚧 ${menus[body]}

Menu ini sedang dalam pengembangan.`
        });

        return true;

    }

    return false;

};
