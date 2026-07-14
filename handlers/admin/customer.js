const session = require("../../services/sessionService");
const customerService = require("../../services/customerService");

function getPhone(customer) {
    if (customer.phone) return customer.phone;
    if (customer.jid) return String(customer.jid).split("@")[0];
    return "-";
}

module.exports = async (sock, jid, body, state) => {

    if (state.step === "ADMIN_CUSTOMER_SEARCH") {

        const hasil = await customerService.searchCustomer(body);

        if (!hasil.length) {
            await sock.sendMessage(jid, {
                text: "❌ Customer tidak ditemukan."
            });
            return true;
        }

        let text = "🔍 *HASIL PENCARIAN*\n\n";

        hasil.forEach((c, i) => {
            text += `${i + 1}. ${c.nama || "-"}\n`;
            text += `📱 ${getPhone(c)}\n`;
            text += `🛒 ${c.totalOrder} Order\n`;
            text += `💰 Rp${Number(c.totalBelanja).toLocaleString("id-ID")}\n`;
            text += `🎖 ${c.member}\n\n`;
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
                text:
`👥 *TOTAL CUSTOMER*

${customers.length} Customer`
            });

            return true;
        }

        case "2":

            await session.setSession(jid, {
                step: "ADMIN_CUSTOMER_SEARCH"
            });

            await sock.sendMessage(jid, {
                text: "🔍 Kirim nama atau nomor HP customer."
            });

            return true;

        case "3": {

            const customers = await customerService.getTopCustomers();

            if (!customers.length) {
                await sock.sendMessage(jid, {
                    text: "Belum ada customer."
                });
                return true;
            }

            let text = "🏆 *TOP CUSTOMER*\n\n";

            customers.forEach((c, i) => {

                const medal = ["🥇", "🥈", "🥉"][i] || "⭐";

                text += `${medal} ${getPhone(c)}\n`;
                text += `💰 Rp${Number(c.totalBelanja).toLocaleString("id-ID")}\n`;
                text += `🛒 ${c.totalOrder} Order\n\n`;

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

            const admin = require("../../commands/admin");
            await admin(sock, jid);

            return true;

    }

    return true;

};
