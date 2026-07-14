const fs = require("fs-extra");

async function readJSON(file, defaultValue = []) {

    await fs.ensureFile(file);

    const text = await fs.readFile(file, "utf8");

    if (!text.trim()) {
        return defaultValue;
    }

    try {
        return JSON.parse(text);
    } catch {
        return defaultValue;
    }

}

async function writeJSON(file, data) {
    await fs.writeFile(
        file,
        JSON.stringify(data, null, 2)
    );
}

function formatRupiah(nominal) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(nominal);
}

function generateOrderId() {

    const now = new Date();

    const tanggal =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const random =
        Math.floor(Math.random() * 90000) + 10000;

    return `ORD${tanggal}-${random}`;

}

module.exports = {
    readJSON,
    writeJSON,
    formatRupiah,
    generateOrderId
};
