const XLSX = require("xlsx");
const productService = require("./productService");

async function importProducts(filePath) {

    const workbook = XLSX.readFile(filePath);

    const sheet =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

    const rows =
        XLSX.utils.sheet_to_json(
            sheet,
            { defval: "" }
        );

    const products =
        await productService.getProducts();

    let tambah = 0;
    let update = 0;
    let gagal = 0;

    for (const row of rows) {

        try {

            const kode =
                String(
                    row.kode ||
                    row.Kode ||
                    row.KODE
                ).trim();

            if (!kode) {
                gagal++;
                continue;
            }

            let product =
                products.find(
                    p =>
                        String(
                            p.kode || ""
                        ).trim() === kode
                );

            if (product) {

                if (row.nama !== "")
                    product.nama = row.nama;

                if (row.harga !== "")
                    product.harga = Number(row.harga);

                if (row.stok !== "")
                    product.stok = Number(row.stok);

                if (row.kategori !== undefined)
                    product.kategori = row.kategori;

                update++;

            } else {

                products.push({

                    kode,

                    nama:
                        row.nama || "",

                    harga:
                        Number(row.harga || 0),

                    stok:
                        Number(row.stok || 0),

                    kategori:
                        row.kategori || ""

                });

                tambah++;

            }

        } catch (err) {

            console.log(err);

            gagal++;

        }

    }

    await productService.saveProducts(products);

    return {

        total: rows.length,

        tambah,

        update,

        gagal

    };

}

module.exports = {

    importProducts

};
