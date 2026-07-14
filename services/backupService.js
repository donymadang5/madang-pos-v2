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

        .filter(f => f.endsWith(".zip"))

        .sort()

        .reverse()

        .map(f => path.join(
            BACKUP,
            f
        ));

}

module.exports = {

    createBackup,

    restoreBackup,

    getBackups

};
