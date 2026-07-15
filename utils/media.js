const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

async function downloadImage(msg) {

    if (!msg?.message?.imageMessage) {
        return null;
    }

    const stream =
        await downloadContentFromMessage(
            msg.message.imageMessage,
            "image"
        );

    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);

}

module.exports = {
    downloadImage
};
