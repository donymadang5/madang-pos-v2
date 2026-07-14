const orderService = require("./orderService");
const customerService = require("./customerService");

async function dashboard() {

    const summary = await orderService.getSummary();
    const todayOrders = await orderService.getTodayOrders();
    const revenue = await orderService.getTodayRevenue();

    const customers = await customerService.getCustomers();

    const today = new Date().toISOString().slice(0, 10);

    const newCustomer = customers.filter(c => {

        if (!c.joinAt) return false;

        return c.joinAt.slice(0,10) === today;

    });

    const topCustomer = [...customers]
        .sort((a,b)=>b.totalBelanja-a.totalBelanja)
        .slice(0,5);

    const productMap = {};

    todayOrders
        .filter(o=>o.status==="LUNAS")
        .forEach(order=>{

            (order.items||[]).forEach(item=>{

                const nama = item.nama || item.name || "-";
                const qty = Number(item.qty || 0);

                productMap[nama] = (productMap[nama] || 0) + qty;

            });

        });

    const topProduct = Object.entries(productMap)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5);

    return {

        revenue,

        totalOrder: todayOrders.length,

        waitingPayment: summary.waitingPayment,

        waitingVerification: summary.waitingVerification,

        paid: summary.paid,

        rejected: summary.rejected,

        customer: customers.length,

        newCustomer: newCustomer.length,

        topCustomer,

        topProduct

    };

}

module.exports = {
    dashboard
};
