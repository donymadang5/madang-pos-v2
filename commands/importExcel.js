const XLSX = require("xlsx");
const fs = require("fs");

const activity = require("../services/activityService");

module.exports = async (sock, jid) => {

    try {

        const file = "./produk.xls";

        if (!fs.existsSync(file)) {

            return sock.sendMessage(jid, {
                text: "❌ File produk.xls tidak ditemukan."
            });

        }

        const workbook = XLSX.readFile(file);

        const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const rows =
            XLSX.utils.sheet_to_json(sheet);

        const products = rows

            .filter(row =>

                row.kode_barang_edit &&

                !String(row.kode_barang_edit)
                    .startsWith("Data Kolom")

            )

            .map(row => ({

                id: String(row.kode_barang_edit),

                nama: row.nama_barang_edit || "",

                harga: Number(
                    row.harga_jual_edit || 0
                ),

                stok: Number(
                    row.stok_edit || 0
                ),

                kategori: row.kategori || "-"

            }));

        fs.writeFileSync(

            "./database/products.json",

            JSON.stringify(
                products,
                null,
                2
            )

        );

        await activity.addLog(

            "IMPORT",

            jid,

            `${products.length} produk`

        );

        await sock.sendMessage(jid, {

            text:
`✅ Import Produk Berhasil

📦 Total Produk : ${products.length}

📝 Activity berhasil disimpan.`

        });

    } catch (err) {

        console.error(err);

        await sock.sendMessage(jid, {

            text:
`❌ Gagal mengimpor file Excel.`

        });

    }

};
