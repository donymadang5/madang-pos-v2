const session = require("../../services/sessionService");
const customerService = require("../../services/customerService");

module.exports = async (sock, jid, body, state) => {

    if (state.step === "ADMIN_CUSTOMER_SEARCH") {

        const hasil = await customerService.searchCustomer(body);

        if (hasil.length === 0) {

            await sock.sendMessage(jid, {
                text: "❌ Customer tidak ditemukan."
            });

            return true;
        }

        let text = "🔍 *Hasil Pencarian*\n\n";

        hasil.forEach((c, i) => {
            text += `${i + 1}. ${c.nama || "-"}\n`;
            text += `📱 ${c.jid}\n`;
            text += `🛒 Order : ${c.totalOrder}\n`;
            text += `💰 Belanja : Rp${Number(c.totalBelanja).toLocaleString("id-ID")}\n`;
            text += `🎖 Member : ${c.member}\n\n`;
        });

        await session.setSession(jid, {
            step: "ADMIN_CUSTOMER_HOME"
        });

        await sock.sendMessage(jid, { text });

        return true;
    }

    if (state.step !== "ADMIN_CUSTOMER_HOME") {
        return false;
    }

    switch (body) {

        case "1": {

            const customers = await customerService.getCustomers();

            await sock.sendMessage(jid, {
                text: `👥 *Total Customer*\n\n${customers.length} Customer`
            });

            return true;
        }

        case "2":

            await session.setSession(jid, {
                step: "ADMIN_CUSTOMER_SEARCH"
            });

            await sock.sendMessage(jid, {
                text: "🔍 Kirim nama atau nomor WhatsApp customer."
            });

            return true;

        case "3": {

            const customers = await customerService.getTopCustomers();

            if (customers.length === 0) {

                await sock.sendMessage(jid, {
                    text: "Belum ada customer."
                });

                return true;
            }

            let text = "🏆 *TOP CUSTOMER*\n\n";

            customers.forEach((c, i) => {

                const medal = ["🥇", "🥈", "🥉"][i] || "⭐";

                text += `${medal} ${c.nama || "-"}\n`;
                text += `Rp${Number(c.totalBelanja).toLocaleString("id-ID")}\n`;
                text += `${c.totalOrder} Order\n\n`;

            });

            await sock.sendMessage(jid, { text });

            return true;

        }

        case "4":

            await sock.sendMessage(jid, {
                text: "🚧 Riwayat Customer akan dibuat pada Sprint berikutnya."
            });

            return true;

        case "0":

            await session.setSession(jid, {
                step: "ADMIN_HOME"
            });

            await sock.sendMessage(jid, {
                text:
`📊 *Dashboard Admin*

1️⃣ Verifikasi Pembayaran
2️⃣ Customer Manager
3️⃣ Broadcast
4️⃣ Statistik
5️⃣ Import Excel
6️⃣ Export Excel
7️⃣ Pengaturan`
            });

            return true;
    }

    return true;

};
