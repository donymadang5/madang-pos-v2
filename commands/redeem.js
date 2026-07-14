const customerService = require("../services/customerService");
const voucherService = require("../services/voucherService");

module.exports = async (sock, jid, args = []) => {

    const customer = await customerService.getCustomer(jid);

    if (!customer) {
        return sock.sendMessage(jid, {
            text: "❌ Customer tidak ditemukan."
        });
    }

    if (!args[0]) {
        return sock.sendMessage(jid, {
            text:
`🎁 *REDEEM POIN*

Pilihan:

100 poin = Voucher Rp10.000
200 poin = Voucher Rp25.000
500 poin = Voucher Rp75.000

Contoh:
*/redeem 100*`
        });
    }

    const poin = Number(args[0]);

    const hadiah = {
        100: 10000,
        200: 25000,
        500: 75000
    };

    if (!hadiah[poin]) {
        return sock.sendMessage(jid, {
            text: "❌ Paket redeem tidak tersedia."
        });
    }

    if (customer.poin < poin) {
        return sock.sendMessage(jid, {
            text:
`❌ Poin tidak cukup.

Poin Anda : ${customer.poin}`
        });
    }

    customer.poin -= poin;

    await customerService.saveCustomerData(customer);

    const voucher = await voucherService.createVoucher(
        jid,
        hadiah[poin]
    );

    return sock.sendMessage(jid, {
        text:
`🎉 Redeem berhasil!

Voucher : ${voucher.kode}
Nominal : Rp${hadiah[poin].toLocaleString("id-ID")}

Gunakan saat checkout.`
    });

};
