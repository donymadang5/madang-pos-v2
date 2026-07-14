const sendButtons = async (
    sock,
    jid,
    text,
    footer,
    buttons
) => {

    return sock.sendMessage(jid, {
        text,
        footer,
        buttons,
        headerType: 1
    });

};

const sendList = async (
    sock,
    jid,
    text,
    footer,
    buttonText,
    sections
) => {

    return sock.sendMessage(jid, {
        text,
        footer,
        buttonText,
        sections
    });

};

module.exports = {
    sendButtons,
    sendList
};
