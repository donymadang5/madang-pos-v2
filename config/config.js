const path = require("path");

module.exports = {

    owner: {
        name: "Madang Vape",
        phone: "628xxxxxxxxxx"
    },

    store: {
        name: "MADANG VAPE"
    },

    public: {
        qris: "./public/qris.jpg"
    },

    database: {

        products: path.join(__dirname, "../database/products.json"),

        customers: path.join(__dirname, "../database/customers.json"),

        orders: path.join(__dirname, "../database/orders.json"),

        payments: path.join(__dirname, "../database/payments.json"),

        sessions: path.join(__dirname, "../database/sessions.json"),

        admins: path.join(__dirname, "../database/admins.json"),

        vouchers: path.join(__dirname, "../database/vouchers.json"),

        activity: path.join(__dirname, "../database/activity.json"),

        carts: path.join(__dirname, "../database/carts.json")

    },

    voucher: {

        redeem: {

            100: 10000,

            250: 25000,

            500: 50000

        }

    }

};
