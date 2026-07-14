const fs = require("fs");
const PDFDocument = require("pdfkit");
const { formatRupiah } = require("../utils/helper");

async function generate(order) {

    if (!fs.existsSync("./invoice")) {
        fs.mkdirSync("./invoice", { recursive: true });
    }

    const file = `./invoice/${order.id}.pdf`;

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            margin: 40
        });

        const stream = fs.createWriteStream(file);

        stream.on("finish", () => resolve(file));
        stream.on("error", reject);

        doc.pipe(stream);

        doc.fontSize(20).text("MADANG VAPE", {
            align: "center"
        });

        doc.moveDown();

        doc.fontSize(14);
        doc.text(`Invoice : ${order.id}`);
        doc.text(`Tanggal : ${new Date(order.createdAt).toLocaleString("id-ID")}`);
        doc.text(`Customer : ${order.customer}`);
        doc.text(`Status : ${order.status}`);

        doc.moveDown();
        doc.text("----------------------------------------");

        let total = 0;

        order.items.forEach(item => {

            const subtotal = item.qty * item.harga;
            total += subtotal;

            doc.moveDown(0.5);
            doc.fontSize(12).text(item.nama);
            doc.text(`${item.qty} x ${formatRupiah(item.harga)}`);
            doc.text(formatRupiah(subtotal), {
                align: "right"
            });

        });

        doc.moveDown();
        doc.text("----------------------------------------");

        doc.moveDown();

        doc.fontSize(16).text(
            `TOTAL : ${formatRupiah(total)}`,
            { align: "right" }
        );

        doc.moveDown(2);

        doc.fontSize(12).text(
            "Terima kasih telah berbelanja di Madang Vape.",
            { align: "center" }
        );

        doc.end();

    });

}

module.exports = {
    generate
};
