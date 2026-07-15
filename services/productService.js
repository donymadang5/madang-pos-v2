const config = require("../config/config");
const { readJSON, writeJSON, updateJSON, withJSONLock } = require("../utils/helper");

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
    return updateJSON(config.database.products, [], products => {
        const quantities = new Map();

        for (const item of items) {
            const qty = Number(item.qty);
            if (!Number.isFinite(qty) || qty <= 0) return false;
            quantities.set(String(item.id), (quantities.get(String(item.id)) || 0) + qty);
        }

        for (const [id, qty] of quantities) {
            const product = products.find(p => String(p.id) === id);
            if (!product || Number(product.stok) < qty) return false;
        }

        for (const [id, qty] of quantities) {
            const product = products.find(p => String(p.id) === id);
            product.stok = Number(product.stok) - qty;
        }

        return true;
    });
}

async function validateStock(items) {
    return withJSONLock(config.database.products, async () => {
        const products = await readJSON(config.database.products, []);
        const quantities = new Map();

        for (const item of items) {
            const qty = Number(item.qty);
            if (!Number.isFinite(qty) || qty <= 0) return false;
            quantities.set(String(item.id), (quantities.get(String(item.id)) || 0) + qty);
        }

        return [...quantities].every(([id, qty]) => {
            const product = products.find(p => String(p.id) === id);
            return product && Number(product.stok) >= qty;
        });
    });
}

module.exports = {
    getProducts,
    getProduct,
    getCategories,
    getByCategory,
    saveProducts,
    reduceStock,
    validateStock
};
