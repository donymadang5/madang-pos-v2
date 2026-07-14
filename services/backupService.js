const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const unzipper = require("unzipper");

const ROOT = path.join(__dirname, "..");
const DATABASE = path.join(ROOT, "database");
const BACKUP = path.join(ROOT, "backup");

function ensureBackup() {
    if (!fs.existsSync(BACKUP)) {
        fs.mkdirSync(BACKUP, {
            recursive: true
        });
    }
}

function getBackupName() {

    const now = new Date();

    const y = now.getFullYear();

    const m = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
        now.getDate()
    ).padStart(2, "0");

    const h = String(
        now.getHours()
    ).padStart(2, "0");

    const i = String(
        now.getMinutes()
    ).padStart(2, "0");

    const s = String(
        now.getSeconds()
    ).padStart(2, "0");

    return `backup-${y}${m}${d}-${h}${i}${s}.zip`;

}

async function createBackup() {

    ensureBackup();

    const file = path.join(
        BACKUP,
        getBackupName()
    );

    return new Promise((resolve, reject) => {

        const output =
            fs.createWriteStream(file);

        const archive =
            archiver("zip", {
                zlib: {
                    level: 9
                }
            });

        output.on("close", () => {
            resolve(file);
        });

        archive.on("error", reject);

        archive.pipe(output);

        archive.directory(
            DATABASE,
            "database"
        );

        if (
            fs.existsSync(
                path.join(
                    ROOT,
                    "config",
                    "config.js"
                )
            )
        ) {
            archive.file(
                path.join(
                    ROOT,
                    "config",
                    "config.js"
                ),
                {
                    name: "config/config.js"
                }
            );
        }

        if (
            fs.existsSync(
                path.join(
                    ROOT,
                    "public",
                    "qris.jpg"
                )
            )
        ) {
            archive.file(
                path.join(
                    ROOT,
                    "public",
                    "qris.jpg"
                ),
                {
                    name: "public/qris.jpg"
                }
            );
        }

        archive.finalize();

    });

}

async function restoreBackup(file) {

    return new Promise((resolve, reject) => {

        fs.createReadStream(file)
            .pipe(
                unzipper.Extract({
                    path: ROOT
                })
            )
            .on("close", resolve)
            .on("error", reject);

    });

}

async function getBackups() {

    ensureBackup();

    return fs.readdirSync(BACKUP)
        .filter(
            file =>
                file.endsWith(".zip")
        )
        .sort()
        .reverse()
        .map(
            file =>
                path.join(
                    BACKUP,
                    file
                )
        );

}

async function latestBackup() {

    const backups =
        await getBackups();

    if (!backups.length) {
        return null;
    }

    return backups[0];

}

async function getBackupList() {

    const backups =
        await getBackups();

    return backups.map(file => ({
        file,
        name: path.basename(file),
        size:
            fs.statSync(file).size,
        time:
            fs.statSync(file).mtime
    }));

}

module.exports = {

    createBackup,

    restoreBackup,

    getBackups,

    latestBackup,

    getBackupList

};

