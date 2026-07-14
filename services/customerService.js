const config = require("../config/config");
const { readJSON, writeJSON } = require("../utils/helper");
const orderService = require("./orderService");

async function getCustomers() {
    return await readJSON(config.database.customers, []);
}

async function saveCustomers(customers) {
    await writeJSON(config.database.customers, customers);
}

async function getCustomer(jid) {
    const customers = await getCustomers();
    return customers.find(c => c.jid === jid);
}

async function saveCustomer(jid, nama = "") {

    const customers = await getCustomers();

    let customer = customers.find(c => c.jid === jid);

    if (!customer) {

        customer = {
            jid,
            nama,

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

        await saveCustomers(customers);
    }

    return customer;

}

async function updateOrder(jid, orderId, total) {

    const customers = await getCustomers();

    const customer = customers.find(c => c.jid === jid);

    if (!customer) return;

    customer.lastOrder = new Date().toISOString();

    customer.totalOrder++;

    customer.totalBelanja += Number(total);

    const poin = Math.floor(Number(total) / 10000);

    customer.poin += poin;
    customer.totalPoin += poin;

    await saveCustomers(customers);

}

async function tambahPoin(jid, poin) {

    const customers = await getCustomers();

    const customer = customers.find(c => c.jid === jid);

    if (!customer) return false;

    customer.poin += Number(poin);
    customer.totalPoin += Number(poin);

    await saveCustomers(customers);

    return true;

}

async function kurangiPoin(jid, poin) {

    const customers = await getCustomers();

    const customer = customers.find(c => c.jid === jid);

    if (!customer) return false;

    if (customer.poin < poin)
        return false;

    customer.poin -= Number(poin);

    customer.poinTerpakai += Number(poin);

    await saveCustomers(customers);

    return true;

}

async function addVoucher(jid, voucher) {

    const customers = await getCustomers();

    const customer = customers.find(c => c.jid === jid);

    if (!customer) return false;

    if (!Array.isArray(customer.voucher))
        customer.voucher = [];

    customer.voucher.push(voucher);

    await saveCustomers(customers);

    return true;

}

async function searchCustomer(keyword) {

    const customers = await getCustomers();

    keyword = keyword.toLowerCase();

    return customers.filter(c => {

        const nama = (c.nama || "").toLowerCase();

        return (
            nama.includes(keyword) ||
            c.jid.includes(keyword)
        );

    });

}

async function getTopCustomers(limit = 10) {

    const customers = await getCustomers();

    return [...customers]
        .sort((a,b)=>b.totalBelanja-a.totalBelanja)
        .slice(0,limit);

}

async function getCustomersByPoint(minPoint){

    const customers = await getCustomers();

    return customers.filter(c=>
        (c.poin||0)>=Number(minPoint)
    );

}

async function getNewCustomers(days=7){

    const customers=await getCustomers();

    const limit=
        Date.now()-(days*86400000);

    return customers.filter(c=>
        new Date(c.joinAt).getTime()>=limit
    );

}

async function getInactiveCustomers(days=30){

    const customers=await getCustomers();

    const limit=
        Date.now()-(days*86400000);

    return customers.filter(c=>{

        if(!c.lastOrder)
            return true;

        return new Date(c.lastOrder).getTime()<limit;

    });

}

async function getCustomerDetail(jid){

    const customer=await getCustomer(jid);

    if(!customer) return null;

    const history=
        await orderService.getHistoryByCustomer(jid);

    return{

        ...customer,

        history

    };

}

module.exports={

    getCustomers,
    saveCustomers,

    getCustomer,
    saveCustomer,

    updateOrder,

    tambahPoin,
    kurangiPoin,

    addVoucher,

    searchCustomer,

    getTopCustomers,

    getCustomersByPoint,

    getNewCustomers,

    getInactiveCustomers,

    getCustomerDetail

};
