const config = require("../config/config");
const { readJSON, writeJSON } = require("../utils/helper");

async function getCarts() {
    try {
        const data = await readJSON(config.database.carts, []);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error reading carts:", error);
        return [];
    }
}

async function getCart(user) {
    const carts = await getCarts();
    return carts.find(c => c.user === user);
}

async function addItem(user, product, qty) {

    if (!user || !product) {
        throw new Error("User atau product tidak valid");
    }

    if (isNaN(qty) || qty <= 0) {
        throw new Error("Qty harus angka positif");
    }

    try {
        const carts = await getCarts();

        let cart = carts.find(c => c.user === user);

        if (!cart) {
            cart = {
                user,
                items: []
            };
            carts.push(cart);
        }

        const old = cart.items.find(i => i.id === product.id);

        if (old) {
            old.qty += qty;
        } else {
            cart.items.push({
                id: product.id,
                nama: product.nama,
                harga: product.harga,
                stok: product.stok,
                kategori: product.kategori,
                qty: qty
            });
        }

        await writeJSON(config.database.carts, carts);

        return cart;

    } catch (error) {
        console.error("Error in addItem:", error);
        throw error;
    }

}

async function clearCart(user) {

    try {
        const carts = await getCarts();

        const index = carts.findIndex(c => c.user === user);

        if (index >= 0) {
            carts.splice(index, 1);
        }

        await writeJSON(config.database.carts, carts);

    } catch (error) {
        console.error("Error in clearCart:", error);
        throw error;
    }

}

module.exports = {
    getCart,
    addItem,
    clearCart
};
