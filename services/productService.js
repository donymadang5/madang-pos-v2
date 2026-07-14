const config = require("../config/config");
const { readJSON, writeJSON } = require("../utils/helper");

async function getProducts() {
    return await readJSON(config.database.products);
}

async function getProduct(id) {
    const products = await getProducts();

    return products.find(
        p => String(p.id).toLowerCase() === String(id).toLowerCase()
    );
}

async function getCategories() {
    const products = await getProducts();

    return [
        ...new Set(
            products
                .filter(p => Number(p.stok) > 0)
                .map(p => p.kategori || "Lainnya")
        )
    ].sort();
}

async function getByCategory(kategori) {
    const products = await getProducts();

    return products.filter(
        p =>
            String(p.kategori).toLowerCase() ===
            String(kategori).toLowerCase() &&
            Number(p.stok) > 0
    );
}

async function saveProducts(products) {
    await writeJSON(config.database.products, products);
}

async function reduceStock(items) {
    const products = await getProducts();

    items.forEach(item => {

        const product = products.find(
            p => p.id === item.id
        );

        if (product) {

            product.stok = Math.max(
                0,
                Number(product.stok) - Number(item.qty)
            );

        }

    });

    await saveProducts(products);
}

module.exports = {
    getProducts,
    getProduct,
    getCategories,
    getByCategory,
    saveProducts,
    reduceStock
};
