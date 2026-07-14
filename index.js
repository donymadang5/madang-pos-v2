const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const qrcode = require("qrcode-terminal");

const messageHandler = require("./handlers/messageHandler");

async function start() {

    console.log("🚀 Starting Madang POS...");

    const { state, saveCreds } =
        await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "error" }),
        printQRInTerminal: true
    });

    sock.ev.on("connection.update", (update) => {

        const {
            connection,
            qr,
            lastDisconnect
        } = update;

        if (qr) {
            console.log("📱 QR Generated");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ Madang POS Connected");
        }

        if (connection === "close") {

            const reconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            if (reconnect) {
                console.log("🔄 Reconnecting...");
                start();
            }

        }

    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (m) => {

        try {
            await messageHandler(sock, m);
        } catch (e) {
            console.error("❌ Error:", e.message);
        }

    });

}

start().catch(console.error);
