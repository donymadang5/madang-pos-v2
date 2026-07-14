module.exports = function resolveIntent(input = "") {

    const text = String(input).trim().toLowerCase();

    const map = {

        // CUSTOMER
        "1": "BELANJA",
        "menu_belanja": "BELANJA",

        "2": "PESANAN",
        "menu_pesanan": "PESANAN",

        "3": "BANTUAN",
        "menu_admin": "BANTUAN",

        "0": "KELUAR",

        // ADMIN (persiapan)
        "dashboard": "DASHBOARD",
        "order": "ORDER",
        "customer": "CUSTOMER",
        "broadcast": "BROADCAST",
        "voucher": "VOUCHER",

        // GLOBAL
        "haalo": "HOME",
        "help": "HELP",
        "admin": "ADMIN"

    };

    return map[text] || text.toUpperCase();

};
