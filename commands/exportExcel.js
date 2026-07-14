const ExcelJS = require("exceljs");
const fs = require("fs");

const productService = require("../services/productService");
const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService");
const activity = require("../services/activityService");

module.exports = async (sock, jid, args = []) => {

    if (!args.length) {

        return sock.sendMessage(jid, {
            text:
`📤 *EXPORT DATA*

Contoh:

/export produk
/export order
/export pembayaran`
        });

    }

    const jenis = args[0].toLowerCase();

    let data = [];
    let file = "";
    let sheet = "";

    switch (jenis) {

        case "produk":

            data = await productService.getProducts();

            file = "./temp_produk.xlsx";

            sheet = "Produk";

            break;

        case "order":

            data = await orderService.getOrders();

            file = "./temp_order.xlsx";

            sheet = "Order";

            break;

        case "pembayaran":

            data = await paymentService.getPayments();

            file = "./temp_pembayaran.xlsx";

            sheet = "Pembayaran";

            break;

        default:

            return sock.sendMessage(jid, {
                text: "❌ Jenis export tidak dikenal."
            });

    }

    const workbook = new ExcelJS.Workbook();

    const worksheet =
        workbook.addWorksheet(sheet);

    if (data.length) {

        worksheet.columns =
            Object.keys(data[0]).map(key => ({

                header: key,

                key: key,

                width: 25

            }));

        data.forEach(item => {

            worksheet.addRow(item);

        });

    }

    await workbook.xlsx.writeFile(file);

    await activity.addLog(

        "EXPORT",

        jid,

        `${jenis} (${data.length} data)`

    );

    await sock.sendMessage(jid, {

        document: fs.readFileSync(file),

        mimetype:
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        fileName:
file.replace("./", "")

    });

    fs.unlinkSync(file);

    await sock.sendMessage(jid, {

        text:
`✅ Export *${jenis}* berhasil.

📦 Total Data : ${data.length}

📝 Activity berhasil disimpan.`

    });

};
