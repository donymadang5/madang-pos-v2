const orderService = require("./orderService");
const productService = require("./productService");
const invoiceService = require("./invoiceService");

async function approve(sock, orderId) {

    const order = await orderService.getOrder(orderId);

    if (!order) return false;

    if (order.status === "LUNAS") return true;

    await productService.reduceStock(order.items);

    await orderService.updateStatus(
        orderId,
        "LUNAS"
    );

    const pdf = await invoiceService.generate(order);

    await sock.sendMessage(order.customer,{
        document: require("fs").readFileSync(pdf),
        mimetype:"application/pdf",
        fileName:`${order.id}.pdf`,
        caption:
`✅ Pembayaran telah diverifikasi.

Order : ${order.id}

Status : LUNAS

Terima kasih sudah berbelanja di Madang Vape 🙏`
    });

    return true;

}

module.exports={
    approve
};
