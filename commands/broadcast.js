const session = require("../services/sessionService");
const customerService = require("../services/customerService");

module.exports = async (sock, jid, args = []) => {

    if (!args.length) {

        return sock.sendMessage(jid, {
            text:
`📢 *SMART BROADCAST*

Penggunaan:

/broadcast all

/broadcast poin 100

/broadcast baru 30

/broadcast inactive 30`
        });

    }

    let customers = [];

    const target = args[0].toLowerCase();

    switch (target) {

        case "all":

            customers =
                await customerService.getCustomers();

            break;

        case "poin":

            customers =
                await customerService.getCustomersByPoint(
                    Number(args[1] || 0)
                );

            break;

        case "baru":

            customers =
                await customerService.getNewCustomers(
                    Number(args[1] || 30)
                );

            break;

        case "inactive":

            customers =
                await customerService.getInactiveCustomers(
                    Number(args[1] || 30)
                );

            break;

        default:

            return sock.sendMessage(jid, {
                text:
`Target tidak dikenali.

Gunakan:

/broadcast all

/broadcast poin 100

/broadcast baru 30

/broadcast inactive 30`
            });

    }

    if (!customers.length) {

        return sock.sendMessage(jid, {
            text: "Tidak ada customer yang sesuai."
        });

    }

    await session.goto(jid, "ADMIN_BROADCAST", {

        targets: customers.map(c => c.jid)

    });

    return sock.sendMessage(jid, {

        text:
`✅ Target ditemukan : ${customers.length} customer

Silakan kirim:

• Teks

atau

• Foto beserta caption

Ketik *batal* untuk membatalkan.`

    });

};
