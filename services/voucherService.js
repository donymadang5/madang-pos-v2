const config = require("../config/config");
const {
    readJSON,
    writeJSON
} = require("../utils/helper");

async function getVouchers() {
    return await readJSON(
        config.database.vouchers,
        []
    );
}

async function saveVouchers(data) {
    await writeJSON(
        config.database.vouchers,
        data
    );
}

async function getVoucher(code) {

    if (!code) return null;

    const vouchers = await getVouchers();

    return vouchers.find(v =>
        String(v.code).toUpperCase() ===
        String(code).toUpperCase()
    );

}

async function validateVoucher(code, subtotal = 0) {

    const voucher = await getVoucher(code);

    if (!voucher) {
        return {
            ok: false,
            message: "Voucher tidak ditemukan."
        };
    }

    if (voucher.status === "USED") {
        return {
            ok: false,
            message: "Voucher sudah digunakan."
        };
    }

    if (voucher.expiredAt) {

        const expired =
            new Date(voucher.expiredAt);

        if (expired < new Date()) {

            return {
                ok: false,
                message: "Voucher sudah kedaluwarsa."
            };

        }

    }

    const minimum =
        Number(voucher.minimum || 0);

    if (subtotal < minimum) {

        return {
            ok: false,
            message:
                `Minimal belanja Rp${minimum}.`
        };

    }

    let diskon = 0;

    switch (voucher.type) {

        case "PERCENT":

            diskon =
                Math.floor(
                    subtotal *
                    Number(voucher.value) / 100
                );

            if (
                voucher.maxDiscount &&
                diskon > voucher.maxDiscount
            ) {
                diskon =
                    Number(voucher.maxDiscount);
            }

            break;

        default:

            diskon =
                Number(voucher.value || 0);

    }

    if (diskon > subtotal) {
        diskon = subtotal;
    }

    return {

        ok: true,

        voucher,

        diskon,

        total: subtotal - diskon

    };

}

async function useVoucher(code, orderId = null) {

    const vouchers =
        await getVouchers();

    const index =
        vouchers.findIndex(v =>
            String(v.code).toUpperCase() ===
            String(code).toUpperCase()
        );

    if (index === -1)
        return false;

    vouchers[index].status = "USED";

    vouchers[index].usedAt =
        new Date().toISOString();

    if (orderId) {
        vouchers[index].orderId =
            orderId;
    }

    await saveVouchers(vouchers);

    return true;

}

async function createVoucher(data) {

    const vouchers =
        await getVouchers();

    vouchers.push({

        code: String(data.code)
            .toUpperCase(),

        type: data.type || "FIXED",

        value: Number(data.value || 0),

        minimum:
            Number(data.minimum || 0),

        maxDiscount:
            Number(data.maxDiscount || 0),

        status: "ACTIVE",

        expiredAt:
            data.expiredAt || null,

        createdAt:
            new Date().toISOString()

    });

    await saveVouchers(vouchers);

}

module.exports = {

    getVouchers,

    getVoucher,

    createVoucher,

    validateVoucher,

    useVoucher,

    saveVouchers

};
