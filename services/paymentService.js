const config = require("../config/config");
const { readJSON, writeJSON } = require("../utils/helper");

async function getPayments() {
    return await readJSON(config.database.payments);
}

async function savePayment(payment) {
    const payments = await getPayments();

    payments.push({
        ...payment,
        createdAt: new Date().toISOString()
    });

    await writeJSON(config.database.payments, payments);

    return payment;
}

async function getPayment(orderId) {
    const payments = await getPayments();

    return payments.find(p => p.orderId === orderId);
}

module.exports = {
    getPayments,
    savePayment,
    getPayment
};
