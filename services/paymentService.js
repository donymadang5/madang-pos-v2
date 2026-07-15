const config = require("../config/config");
const { readJSON, updateJSON } = require("../utils/helper");

async function getPayments() {
    return await readJSON(config.database.payments);
}

async function savePayment(payment) {
    return updateJSON(config.database.payments, [], payments => {
        payments.push({
            ...payment,
            createdAt: new Date().toISOString()
        });

        return payment;
    });
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
