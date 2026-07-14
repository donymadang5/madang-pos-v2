const config = require("../config/config");
const {
    readJSON,
    writeJSON
} = require("../utils/helper");

async function getCustomers() {
    return await readJSON(config.database.customers, []);
}

async function saveCustomers(data) {
    await writeJSON(config.database.customers, data);
}

async function getCustomer(jid) {
    const customers = await getCustomers();

    return customers.find(c => c.jid === jid);
}

async function saveCustomer(jid) {

    const customers = await getCustomers();

    let customer = customers.find(
        c => c.jid === jid
    );

    if (!customer) {

        customer = {
            jid,
            nama: "",
            phone: "",
            joinAt: new Date().toISOString(),
            lastOrder: null,
            totalOrder: 0,
            totalBelanja: 0,
            poin: 0,
            totalPoin: 0,
            poinTerpakai: 0,
            voucher: []
        };

        customers.push(customer);
    }

    await saveCustomers(customers);

    return customer;
}

async function registerCustomer(jid, nama, phone) {

    const customers = await getCustomers();

    let customer = customers.find(
        c => c.jid === jid
    );

    if (!customer) {

        customer = {
            jid,
            joinAt: new Date().toISOString(),
            lastOrder: null,
            totalOrder: 0,
            totalBelanja: 0,
            poin: 0,
            totalPoin: 0,
            poinTerpakai: 0,
            voucher: []
        };

        customers.push(customer);
    }

    customer.nama = String(nama).trim();
    customer.phone = String(phone).trim();

    await saveCustomers(customers);

    return customer;
}

async function isRegistered(jid) {

    const customer = await getCustomer(jid);

    if (!customer) return false;

    return Boolean(
        customer.nama &&
        customer.phone
    );
}

async function updateCustomerOrder(jid, total) {

    const customers = await getCustomers();

    const customer = customers.find(
        c => c.jid === jid
    );

    if (!customer) return;

    customer.lastOrder = new Date().toISOString();
    customer.totalOrder =
        Number(customer.totalOrder || 0) + 1;
    customer.totalBelanja =
        Number(customer.totalBelanja || 0) + Number(total);

    const poin = Math.floor(Number(total) / 10000);

    customer.poin =
        Number(customer.poin || 0) + poin;

    customer.totalPoin =
        Number(customer.totalPoin || 0) + poin;

    await saveCustomers(customers);
}

async function searchCustomer(keyword) {

    keyword = String(keyword).toLowerCase();

    const customers = await getCustomers();

    return customers.filter(c =>
        String(c.nama || "")
            .toLowerCase()
            .includes(keyword) ||
        String(c.phone || "")
            .toLowerCase()
            .includes(keyword) ||
        String(c.jid || "")
            .toLowerCase()
            .includes(keyword)
    );

}

async function getTopCustomers(limit = 10) {

    const customers = await getCustomers();

    return customers
        .sort(
            (a, b) =>
                Number(b.totalBelanja || 0) -
                Number(a.totalBelanja || 0)
        )
        .slice(0, limit);

}

module.exports = {
    getCustomers,
    saveCustomers,
    getCustomer,
    saveCustomer,
    registerCustomer,
    isRegistered,
    updateCustomerOrder,
    searchCustomer,
    getTopCustomers
};
