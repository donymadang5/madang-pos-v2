const customerService = require("../services/customerService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, args = []) => {

    // ==========================
    // /customer
    // ==========================

    if (args.length === 0) {

        const customers = await customerService.getCustomers();
        const baru = await customerService.getNewCustomers();

        let text = "";

        text += "👥 *CUSTOMER CENTER*\n";
        text += "━━━━━━━━━━━━━━━━━━\n\n";

        text += `👤 Total Customer : ${customers.length}\n`;
        text += `🆕 Customer Baru : ${baru.length}\n\n`;

        text += "Perintah:\n";
        text += "/customer top\n";
        text += "/customer baru\n";
        text += "/customer cari <nama>\n";
        text += "/customer <nomor>";

        return sock.sendMessage(jid, {
            text
        });

    }

    // ==========================
    // TOP CUSTOMER
    // ==========================

    const action = args[0].toLowerCase();

    if (action === "top") {

        const top =
            await customerService.getTopCustomers(10);

        let text = "🏆 *TOP CUSTOMER*\n\n";

        top.forEach((c, i) => {

            text += `${i + 1}. ${c.nama || "-"}\n`;
            text += `${c.jid}\n`;
            text += `Belanja : ${formatRupiah(c.totalBelanja)}\n`;
            text += `Poin : ${c.poin || 0}\n\n`;

        });

        return sock.sendMessage(jid, {
            text
        });

    }

    // ==========================
    // CUSTOMER BARU
    // ==========================

    if (action === "baru") {

        const list =
            await customerService.getNewCustomers();

        if (!list.length) {

            return sock.sendMessage(jid, {
                text: "Belum ada customer baru."
            });

        }

        let text = "🆕 *CUSTOMER BARU*\n\n";

        list.forEach((c, i) => {

            text += `${i + 1}. ${c.nama || "-"}\n`;
            text += `${c.jid}\n\n`;

        });

        return sock.sendMessage(jid, {
            text
        });

    }

    // ==========================
    // CARI
    // ==========================

    if (action === "cari") {

        if (!args[1]) {

            return sock.sendMessage(jid, {
                text: "Contoh:\n/customer cari budi"
            });

        }

        const hasil =
            await customerService.searchCustomer(
                args.slice(1).join(" ")
            );

        if (!hasil.length) {

            return sock.sendMessage(jid, {
                text: "Customer tidak ditemukan."
            });

        }

        let text = "🔍 *HASIL PENCARIAN*\n\n";

        hasil.forEach((c, i) => {

            text += `${i + 1}. ${c.nama || "-"}\n`;
            text += `${c.jid}\n`;
            text += `${formatRupiah(c.totalBelanja)}\n\n`;

        });

        return sock.sendMessage(jid, {
            text
        });

    }

    // ==========================
    // DETAIL CUSTOMER
    // ==========================

    const customer =
        await customerService.getCustomerDetail(action);

    if (!customer) {

        return sock.sendMessage(jid, {
            text: "Customer tidak ditemukan."
        });

    }

    let text = "";

    text += "👤 *DETAIL CUSTOMER*\n\n";

    text += `Nama : ${customer.nama || "-"}\n`;
    text += `WA : ${customer.jid}\n`;
    text += `Order : ${customer.totalOrder}\n`;
    text += `Belanja : ${formatRupiah(customer.totalBelanja)}\n`;
    text += `Poin : ${customer.poin || 0}\n\n`;

    text += "📦 *5 Transaksi Terakhir*\n\n";

    if (!customer.history.length) {

        text += "Belum ada transaksi.";

    } else {

        customer.history.slice(0, 5).forEach(o => {

            text += `${o.id}\n`;
            text += `${o.status}\n`;
            text += `${formatRupiah(o.total)}\n\n`;

        });

    }

    return sock.sendMessage(jid, {
        text
    });

};
