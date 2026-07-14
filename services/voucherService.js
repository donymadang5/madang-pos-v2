const config = require("../config/config");
const {
    readJSON,
    writeJSON
} = require("../utils/helper");

async function getVouchers() {
    return await readJSON(config.database.vouchers, []);
}

async function saveVouchers(data) {
    await writeJSON(config.database.vouchers, data);
}

async function getVoucher(kode) {
    const vouchers = await getVouchers();

    return vouchers.find(v =>
        String(v.kode).toLowerCase() ===
        String(kode).toLowerCase()
    );
}

async function createVoucher(voucher) {
    const vouchers = await getVouchers();

    vouchers.push({
        aktif: true,
        dipakai: 0,
        ...voucher
    });

    await saveVouchers(vouchers);
}

async function disableVoucher(kode) {
    const vouchers = await getVouchers();

    const v = vouchers.find(x =>
        x.kode.toLowerCase() ===
        kode.toLowerCase()
    );

    if (!v) return false;

    v.aktif = false;

    await saveVouchers(vouchers);

    return true;
}

async function deleteVoucher(kode) {
    const vouchers = await getVouchers();

    const hasil = vouchers.filter(v =>
        v.kode.toLowerCase() !==
        kode.toLowerCase()
    );

    await saveVouchers(hasil);

    return true;
}

async function useVoucher(kode) {
    const vouchers = await getVouchers();

    const v = vouchers.find(x =>
        x.kode.toLowerCase() ===
        kode.toLowerCase()
    );

    if (!v) return false;

    v.dipakai = Number(v.dipakai || 0) + 1;

    await saveVouchers(vouchers);

    return true;
}

module.exports = {
    getVouchers,
    saveVouchers,
    getVoucher,
    createVoucher,
    disableVoucher,
    deleteVoucher,
    useVoucher
};

async function validateVoucher(kode, items, subtotal) {

    const voucher = await getVoucher(kode);

    if (!voucher) {
        return {
            ok: false,
            message: "Voucher tidak ditemukan."
        };
    }

    if (!voucher.aktif) {
        return {
            ok: false,
            message: "Voucher sudah tidak aktif."
        };
    }

    const today = new Date().toISOString().slice(0, 10);

    if (voucher.mulai && today < voucher.mulai) {
        return {
            ok: false,
            message: "Voucher belum berlaku."
        };
    }

    if (voucher.selesai && today > voucher.selesai) {
        return {
            ok: false,
            message: "Voucher sudah berakhir."
        };
    }

    if (
        voucher.kuota &&
        Number(voucher.dipakai || 0) >= Number(voucher.kuota)
    ) {
        return {
            ok: false,
            message: "Kuota voucher sudah habis."
        };
    }

    if (
        subtotal < Number(voucher.minimal || 0)
    ) {
        return {
            ok: false,
            message:
                "Minimal belanja " +
                voucher.minimal
        };
    }

    if (
        voucher.kategori &&
        voucher.kategori !== "SEMUA"
    ) {

        const cocok = items.some(item =>
            String(item.kategori).toUpperCase() ===
            String(voucher.kategori).toUpperCase()
        );

        if (!cocok) {
            return {
                ok: false,
                message:
                    "Voucher hanya berlaku untuk kategori " +
                    voucher.kategori
            };
        }
    }

    let diskon = 0;

    if (voucher.jenis === "nominal") {
        diskon = Number(voucher.nilai);
    }

    if (voucher.jenis === "persen") {
        diskon =
            subtotal *
            Number(voucher.nilai) /
            100;
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

module.exports.validateVoucher = validateVoucher;


async function addVoucher(voucher) {

    const vouchers = await getVouchers();

    const index = vouchers.findIndex(
        v => String(v.kode).toUpperCase() === String(voucher.kode).toUpperCase()
    );

    if (index >= 0) {
        vouchers[index] = {
            ...vouchers[index],
            ...voucher
        };
    } else {
        vouchers.push(voucher);
    }

    await saveVouchers(vouchers);

    return voucher;
}

async function removeVoucher(kode) {

    const vouchers = await getVouchers();

    const data = vouchers.filter(
        v => String(v.kode).toUpperCase() !== String(kode).toUpperCase()
    );

    await saveVouchers(data);
}

async function setVoucherActive(kode, aktif) {

    const vouchers = await getVouchers();

    const voucher = vouchers.find(
        v => String(v.kode).toUpperCase() === String(kode).toUpperCase()
    );

    if (!voucher) return false;

    voucher.aktif = aktif;

    await saveVouchers(vouchers);

    return true;
}

module.exports.addVoucher = addVoucher;
module.exports.removeVoucher = removeVoucher;
module.exports.setVoucherActive = setVoucherActive;


async function updateVoucher(kode, data) {

    const vouchers = await getVouchers();

    const voucher = vouchers.find(
        v =>
            String(v.kode).toUpperCase() ===
            String(kode).toUpperCase()
    );

    if (!voucher) {
        return false;
    }

    Object.assign(voucher, data);

    await saveVouchers(vouchers);

    return true;

}

module.exports.updateVoucher = updateVoucher;

