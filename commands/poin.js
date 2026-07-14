const customerService = require("../services/customerService");
const voucherService = require("../services/voucherService");
const { formatRupiah } = require("../utils/helper");

module.exports = async (sock, jid, args = []) => {

    await customerService.saveCustomer(jid);

    const customer = await customerService.getCustomer(jid);

    if (!args.length) {

        let text = "";

        text += "⭐ *POIN SAYA*\n";
        text += "━━━━━━━━━━━━━━━━━━\n\n";

        text += `Poin Saat Ini : ${customer.poin || 0}\n\n`;

        text += "Tukar Voucher\n\n";

        text += "100 poin = Rp10.000\n";
        text += "250 poin = Rp25.000\n";
        text += "500 poin = Rp50.000\n\n";

        text += "Contoh:\n";
        text += "/poin 100\n";
        text += "/poin 250\n";
        text += "/poin 500";

        return sock.sendMessage(jid, {
            text
        });

    }

    const poin = Number(args[0]);

    let nominal = 0;

    switch (poin) {

        case 100:
            nominal = 10000;
            break;

        case 250:
            nominal = 25000;
            break;

        case 500:
            nominal = 50000;
            break;

        default:

            return sock.sendMessage(jid, {

                text:
`Pilihan voucher:

100 poin
250 poin
500 poin`

            });

    }

    if ((customer.poin || 0) < poin) {

        return sock.sendMessage(jid, {

            text:
`❌ Poin Anda tidak mencukupi.

Poin Anda :
${customer.poin || 0}`

        });

    }

    await customerService.kurangiPoin(
        jid,
        poin
    );

    const voucher =
        await voucherService.createVoucher(
            jid,
            nominal,
            poin
        );

    let text = "";

    text += "🎉 *VOUCHER BERHASIL DIBUAT*\n";
    text += "━━━━━━━━━━━━━━━━━━\n\n";

    text += `🎁 Nominal\n${formatRupiah(nominal)}\n\n`;

    text += `🔑 Kode Voucher\n${voucher.kode}\n\n`;

    text += `⭐ Poin Terpakai\n${poin} poin\n\n`;

    text += `📅 Berlaku Sampai\n`;
    text += new Date(voucher.expiredAt).toLocaleDateString("id-ID");

    text += "\n\n━━━━━━━━━━━━━━━━━━\n\n";

    text +=
"Silakan gunakan *kode voucher* di atas saat checkout produk di *Store Online* maupun *Store Offline*.\n\n";

    text +=
"Voucher hanya dapat digunakan *1 kali* dan akan otomatis hangus setelah digunakan atau melewati masa berlaku.\n\n";

    text +=
"Terima kasih telah berbelanja di *Madang Vape* ❤️";

    return sock.sendMessage(jid, {
        text
    });

};
