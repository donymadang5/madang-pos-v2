const voucherService = require("../services/voucherService");

module.exports = async (sock, jid) => {

    const vouchers =
        await voucherService.getCustomerVoucher(jid);

    if (!vouchers.length) {

        return sock.sendMessage(jid,{
            text:
`🎁 *VOUCHER SAYA*

Belum ada voucher aktif.`
        });

    }

    let text = "";

    text += "🎁 *VOUCHER SAYA*\n";
    text += "━━━━━━━━━━━━━━━\n\n";

    vouchers.forEach((v,i)=>{

        text += `${i+1}. ${v.kode}\n`;
        text += `Nominal : Rp${Number(v.nominal).toLocaleString("id-ID")}\n`;

        if(v.expired){

            text += `Expired : ${v.expired}\n`;

        }else{

            text += "Expired : Tidak ada\n";

        }

        text += "\n";

    });

    text += "Gunakan kode voucher saat checkout.";

    return sock.sendMessage(jid,{
        text
    });

};
