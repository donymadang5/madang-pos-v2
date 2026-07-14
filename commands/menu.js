module.exports = async (sock, jid) => {

    const text = `
🛍️ *MADANG POS*

Selamat datang di Madang POS.

Silakan pilih menu di bawah ini.

1. 🛒 Belanja Produk
2. 🛍️ Keranjang
3. 📦 Pesanan Saya
4. 📊 Cek Stok
5. 👨‍💼 Admin
6. ❓ Bantuan

Ketik salah satu perintah berikut:

/belanja
/keranjang
/pesanan
/stok
/admin
/help
`;

    await sock.sendMessage(jid, {
        text
    });

};
