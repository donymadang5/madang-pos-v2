module.exports = async (sock, jid) => {

    await sock.sendMessage(jid, {
        text: "🧪 Test Button\n\nKalau tombol muncul berarti siap migrasi.",
        footer: "Madang POS",
        buttons: [
            {
                buttonId: "BTN_OK",
                buttonText: {
                    displayText: "✅ OK"
                },
                type: 1
            },
            {
                buttonId: "BTN_BATAL",
                buttonText: {
                    displayText: "❌ Batal"
                },
                type: 1
            }
        ],
        headerType: 1
    });

};
