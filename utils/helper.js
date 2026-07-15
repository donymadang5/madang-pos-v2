const fs = require("fs-extra");
const path = require("path");

const fileLocks = new Map();

async function withJSONLock(file, operation) {
    const previous = fileLocks.get(file) || Promise.resolve();
    let release;
    const gate = new Promise(resolve => { release = resolve; });

    fileLocks.set(file, previous.then(() => gate));
    await previous;

    try {
        return await operation();
    } finally {
        release();
    }
}

async function atomicWriteJSON(file, data) {
    const directory = path.dirname(file);
    const temporary = path.join(
        directory,
        `.${path.basename(file)}.${process.pid}.${Date.now()}.tmp`
    );

    await fs.ensureDir(directory);
    await fs.writeFile(temporary, JSON.stringify(data, null, 2));
    await fs.rename(temporary, file);
}

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
    return withJSONLock(file, () => atomicWriteJSON(file, data));
}

async function updateJSON(file, defaultValue, update) {
    return withJSONLock(file, async () => {
        const data = await readJSON(file, defaultValue);
        const result = await update(data);
        await atomicWriteJSON(file, data);
        return result;
    });
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
    updateJSON,
    withJSONLock,
    formatRupiah,
    generateOrderId
};
