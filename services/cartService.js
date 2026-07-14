const config = require("../config/config");
const { readJSON, writeJSON } = require("../utils/helper");

async function getCarts() {
    return await readJSON(config.database.carts);
}

async function getCart(user) {
    const carts = await getCarts();
    return carts.find(c => c.user === user);
}

async function addItem(user, product, qty) {

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

}

async function clearCart(user) {

    const carts = await getCarts();

    const index = carts.findIndex(c => c.user === user);

    if (index >= 0) {
        carts.splice(index, 1);
    }

    await writeJSON(config.database.carts, carts);

}

module.exports = {
    getCart,
    addItem,
    clearCart
};
