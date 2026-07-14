const customerService = require("../services/customerService");

const {
    formatRupiah
} = require("../utils/helper");

module.exports = async (sock, jid) => {

    const customer = await customerService.getCustomer(jid);

    if (!customer) {

        return sock.sendMessage(jid,{
            text:"❌ Customer tidak ditemukan."
        });

    }

    let nextMember = "-";
    let nextTarget = "-";

    switch(customer.member){

        case "Bronze":
            nextMember = "Silver";
            nextTarget = 2000000;
            break;

        case "Silver":
            nextMember = "Gold";
            nextTarget = 5000000;
            break;

        case "Gold":
            nextMember = "VIP";
            nextTarget = 10000000;
            break;

        default:
            nextMember = "MAX";
            nextTarget = customer.totalBelanja;
            break;

    }

    let text = "";

    text += "🏅 *MEMBER SAYA*\n";
    text += "━━━━━━━━━━━━━━━━━━\n\n";

    text += `Level : ${customer.member}\n`;
    text += `Total Belanja : ${formatRupiah(customer.totalBelanja)}\n\n`;

    if(nextMember !== "MAX"){

        const kurang = Math.max(
            0,
            nextTarget - customer.totalBelanja
        );

        text += `Menuju ${nextMember}\n`;
        text += `${formatRupiah(kurang)} lagi.\n`;

    }else{

        text += "🎉 Anda sudah berada di level tertinggi.\n";

    }

    return sock.sendMessage(jid,{
        text
    });

};
