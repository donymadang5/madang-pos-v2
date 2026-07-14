module.exports = async (sock, jid) => {

    const text = `
📖 *Madang POS*

/menu
Menampilkan produk

/beli ID JUMLAH

/checkout ID JUMLAH

/payment IDORDER

/help
`;

    await sock.sendMessage(jid, { text });

};
