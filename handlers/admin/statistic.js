const session = require("../../services/sessionService");
const orderService = require("../../services/orderService");
const customerService = require("../../services/customerService");

const { formatRupiah } = require("../../utils/helper");

module.exports = async (sock, jid, body, state) => {

    if (state.step !== "ADMIN_STATISTIC_HOME") {
        return false;
    }

    if (body === "0") {

        await session.goto(jid, "ADMIN_HOME");

        await sock.sendMessage(jid,{
text:
`📊 *Dashboard Admin*

1️⃣ Verifikasi Pembayaran
2️⃣ Customer Manager
3️⃣ Order Manager
4️⃣ Statistik
5️⃣ Import Excel
6️⃣ Export Excel
7️⃣ Pengaturan`
        });

        return true;

    }

    const orders = await orderService.getOrders();
    const customers = await customerService.getCustomers();

    const todayOrders = await orderService.getTodayOrders();

    const omzet = todayOrders
        .filter(o => o.status === "LUNAS")
        .reduce((a,b)=>a+Number(b.total),0);

    const lunas = orders.filter(o=>o.status==="LUNAS").length;
    const pending = orders.filter(o=>o.status==="MENUNGGU_PEMBAYARAN").length;
    const verifikasi = orders.filter(o=>o.status==="MENUNGGU_VERIFIKASI").length;

    await sock.sendMessage(jid,{
text:
`📊 *STATISTIK MADANG POS*

👥 Customer
${customers.length}

🧾 Total Order
${orders.length}

💰 Omzet Hari Ini
${formatRupiah(omzet)}

✅ Order Lunas
${lunas}

⌛ Menunggu Pembayaran
${pending}

📋 Menunggu Verifikasi
${verifikasi}

0️⃣ Kembali`
    });

    return true;

};
