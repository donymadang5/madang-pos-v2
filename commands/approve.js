const fs = require("fs");

const orderService = require("../services/orderService");
const productService = require("../services/productService");
const invoiceService = require("../services/invoiceService");
const customerService = require("../services/customerService");

module.exports = async (sock, jid, args = []) => {

    try {

        if (!args[0]) return;

        const id = args[0];

        const order = await orderService.getOrder(id);

        if (!order) {
            return sock.sendMessage(jid, {
                text: "❌ Order tidak ditemukan."
            });
        }

        if (order.status === "LUNAS") {
            return sock.sendMessage(jid, {
                text: "✅ Order sudah lunas."
            });
        }

        const stockReduced =
            await productService.reduceStock(order.items);

        if (!stockReduced) {
            return sock.sendMessage(jid, {
                text: "❌ Stok tidak mencukupi. Order tidak dapat di-approve."
            });
        }

        await orderService.updateStatus(id, "LUNAS");

        await customerService.updateCustomerOrder(
            order.customer,
            order.total
        );

        const customer =
            await customerService.getCustomer(order.customer) || {
                poin: 0
            };

        const poin =
            Math.floor(Number(order.total) / 10000);

        const pdf =
            await invoiceService.generate({
                ...order,
                status: "LUNAS"
            });

        console.log("Invoice:", pdf);

        const pesan =
`✅ Pembayaran berhasil diverifikasi.

━━━━━━━━━━━━━━━━━━

🧾 Order
${id}

✅ Status
LUNAS

⭐ Poin Masuk
+${poin}

⭐ Total Poin
${customer.poin}

━━━━━━━━━━━━━━━━━━

Terima kasih telah berbelanja di *Madang Vape* ❤️

Invoice dikirim di bawah ini.`;

        await sock.sendMessage(order.customer, {
            text: pesan
        });

        if (pdf && fs.existsSync(pdf)) {

            await sock.sendMessage(order.customer, {
                document: fs.readFileSync(pdf),
                mimetype: "application/pdf",
                fileName: `${id}.pdf`
            });

        } else {

            console.log("Invoice tidak ditemukan:", pdf);

        }

        await sock.sendMessage(jid, {
            text:
`✅ Order ${id} berhasil di-approve.

⭐ Customer mendapat ${poin} poin.`
        });

    } catch (err) {

        console.log(err);

        await sock.sendMessage(jid, {
            text: `❌ ${err.message}`
        });

    }

};
