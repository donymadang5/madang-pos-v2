const config = require("../config/config");
const {
    readJSON,
    writeJSON,
    updateJSON,
    generateOrderId
} = require("../utils/helper");

async function getOrders() {
    return await readJSON(config.database.orders, []);
}

async function saveOrders(data) {
    await writeJSON(config.database.orders, data);
}

async function getOrder(id) {
    const orders = await getOrders();
    return orders.find(o => o.id === id);
}

async function getOrdersByCustomer(customer) {
    const orders = await getOrders();

    return orders
        .filter(o => o.customer === customer)
        .sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
}

async function getHistoryByCustomer(customer) {
    return getOrdersByCustomer(customer);
}

async function createOrder(customer, items, subtotal, option = {}) {
    return updateJSON(config.database.orders, [], orders => {
        const diskon = Number(option.diskon || 0);
        const order = {

        id: generateOrderId(),

        customer,

        phone: String(customer).split("@")[0],

        items,

        subtotal,

        diskon,

        voucher: option.voucher || null,

        total: subtotal - diskon,

        payment: {

            method: option.method || "QRIS",

            status: "MENUNGGU_PEMBAYARAN",

            reference: null,

            paidAt: null

        },

        status: "MENUNGGU_PEMBAYARAN",

        createdAt: new Date().toISOString()

    };

        orders.push(order);
        return order;
    });

}

async function updateOrder(id, data) {
    return updateJSON(config.database.orders, [], orders => {
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return false;

        orders[index] = {
            ...orders[index],
            ...data
        };

        return true;
    });

}

async function updateStatus(id, status) {
    return updateJSON(config.database.orders, [], orders => {
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return false;

        orders[index].status = status;

        if (!orders[index].payment) {
            orders[index].payment = {};
        }

        orders[index].payment.status = status;

        if (status === "LUNAS") {
            orders[index].payment.paidAt = new Date().toISOString();
        }

        return true;
    });

}

async function getTodayOrders() {

    const orders = await getOrders();

    const today =
        new Date().toISOString().slice(0, 10);

    return orders.filter(o =>
        o.createdAt &&
        o.createdAt.slice(0, 10) === today
    );

}

async function getTodayRevenue() {

    const orders = await getTodayOrders();

    return orders
        .filter(o => o.status === "LUNAS")
        .reduce(
            (total, order) =>
                total + Number(order.total || 0),
            0
        );

}

async function getWaitingVerification() {

    const orders = await getOrders();

    return orders.filter(
        o => o.status === "MENUNGGU_VERIFIKASI"
    );

}

async function getOrdersByStatus(status) {

    const orders = await getOrders();

    return orders
        .filter(o => o.status === status)
        .sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

}

async function findOrder(keyword) {

    const orders = await getOrders();

    keyword = String(keyword).toLowerCase();

    return orders.find(o =>
        o.id.toLowerCase().includes(keyword)
    );

}

async function getSummary() {

    const orders = await getOrders();

    return {

        total: orders.length,

        waitingPayment:
            orders.filter(
                o => o.status === "MENUNGGU_PEMBAYARAN"
            ).length,

        waitingVerification:
            orders.filter(
                o => o.status === "MENUNGGU_VERIFIKASI"
            ).length,

        paid:
            orders.filter(
                o => o.status === "LUNAS"
            ).length,

        rejected:
            orders.filter(
                o => o.status === "DITOLAK"
            ).length

    };

}

module.exports = {

    getOrders,
    saveOrders,

    getOrder,
    getOrdersByCustomer,
    getHistoryByCustomer,

    createOrder,
    updateOrder,
    updateStatus,

    getTodayOrders,
    getTodayRevenue,
    getWaitingVerification,

    getOrdersByStatus,
    findOrder,

    getSummary

};
