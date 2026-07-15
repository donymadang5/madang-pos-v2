const config = require("../config/config");
const {
    readJSON,
    writeJSON,
    updateJSON
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
    return updateJSON(config.database.vouchers, [], vouchers => {
        vouchers.push({
            aktif: true,
            dipakai: 0,
            ...voucher
        });
    });
}

async function disableVoucher(kode) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const v = vouchers.find(x => String(x.kode).toLowerCase() === String(kode).toLowerCase());
        if (!v) return false;
        v.aktif = false;
        return true;
    });
}

async function deleteVoucher(kode) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const hasil = vouchers.filter(v => String(v.kode).toLowerCase() !== String(kode).toLowerCase());
        vouchers.splice(0, vouchers.length, ...hasil);
        return true;
    });
}

async function useVoucher(kode) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const v = vouchers.find(x => String(x.kode).toLowerCase() === String(kode).toLowerCase());
        if (!v) return false;

        v.dipakai = Number(v.dipakai || 0) + 1;
        return true;
    });
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

function validateVoucherData(voucher, items, subtotal) {

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

async function validateVoucher(kode, items, subtotal) {
    const voucher = await getVoucher(kode);
    return validateVoucherData(voucher, items, subtotal);
}

async function consumeVoucher(kode, items, subtotal) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const voucher = vouchers.find(v =>
            String(v.kode).toLowerCase() === String(kode).toLowerCase()
        );
        const result = validateVoucherData(voucher, items, subtotal);

        if (!result.ok) return result;

        voucher.dipakai = Number(voucher.dipakai || 0) + 1;
        return result;
    });
}

module.exports.validateVoucher = validateVoucher;
module.exports.consumeVoucher = consumeVoucher;


async function addVoucher(voucher) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const index = vouchers.findIndex(v => String(v.kode).toUpperCase() === String(voucher.kode).toUpperCase());
        if (index >= 0) {
            vouchers[index] = { ...vouchers[index], ...voucher };
        } else {
            vouchers.push(voucher);
        }
        return voucher;
    });
}

async function removeVoucher(kode) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const data = vouchers.filter(v => String(v.kode).toUpperCase() !== String(kode).toUpperCase());
        vouchers.splice(0, vouchers.length, ...data);
    });
}

async function setVoucherActive(kode, aktif) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const voucher = vouchers.find(v => String(v.kode).toUpperCase() === String(kode).toUpperCase());
        if (!voucher) return false;
        voucher.aktif = aktif;
        return true;
    });
}

module.exports.addVoucher = addVoucher;
module.exports.removeVoucher = removeVoucher;
module.exports.setVoucherActive = setVoucherActive;


async function updateVoucher(kode, data) {
    return updateJSON(config.database.vouchers, [], vouchers => {
        const voucher = vouchers.find(v => String(v.kode).toUpperCase() === String(kode).toUpperCase());
        if (!voucher) return false;
        Object.assign(voucher, data);
        return true;
    });

}

module.exports.updateVoucher = updateVoucher;
