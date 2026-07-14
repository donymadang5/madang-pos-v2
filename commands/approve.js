const fs = require("fs");

const orderService = require("../services/orderService");
const productService = require("../services/productService");
const invoiceService = require("../services/invoiceService");
const customerService = require("../services/customerService");

module.exports = async (sock, jid, args = []) => {

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

    // Kurangi stok
    await productService.reduceStock(order.items);

    // Update status
    await orderService.updateStatus(
        id,
        "LUNAS"
    );

    // Tambahkan transaksi customer
    await customerService.updateOrder(
        order.customer,
        id,
        order.total
    );

    const customer =
        await customerService.getCustomer(
            order.customer
        );

    const poin =
        Math.floor(
            Number(order.total) / 10000
        );

    // Generate invoice
    const pdf =
        await invoiceService.generate({

            ...order,

            status: "LUNAS"

        });

    let pesan =

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

    // Kirim notifikasi customer
    await sock.sendMessage(
        order.customer,
        {
            text: pesan
        }
    );

    // Kirim invoice
    await sock.sendMessage(
        order.customer,
        {
            document: fs.readFileSync(pdf),
            mimetype: "application/pdf",
            fileName: `${id}.pdf`
        }
    );

    // Notifikasi admin
    await sock.sendMessage(jid, {

        text:

`✅ Order ${id} berhasil di-approve.

⭐ Customer mendapat ${poin} poin.`

    });

};
