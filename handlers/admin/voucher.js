const session = require("../../services/sessionService");
const voucherService = require("../../services/voucherService");
const admin = require("../../commands/admin");

module.exports = async (sock, jid, body, state) => {

    // =========================
    // MENU VOUCHER
    // =========================

    if (state.step === "ADMIN_VOUCHER") {

        switch (body) {

            case "1": {

                const vouchers =
                    await voucherService.getVouchers();

                if (!vouchers.length) {
                    return sock.sendMessage(jid,{
                        text:"Belum ada voucher."
                    });
                }

                let text = "🎁 *DAFTAR VOUCHER*\n\n";

                vouchers.forEach((v,i)=>{

                    text += `${i+1}. ${v.kode}\n`;
                    text += `Status : ${v.aktif ? "AKTIF" : "NONAKTIF"}\n`;
                    text += `Jenis : ${v.jenis}\n`;
                    text += `Nilai : ${v.nilai}\n`;
                    text += `Kategori : ${v.kategori}\n`;
                    text += `Minimal : ${v.minimal}\n`;
                    text += `Kuota : ${v.dipakai||0}/${v.kuota}\n\n`;

                });

                return sock.sendMessage(jid,{text});

            }

            case "2":

                await session.goto(
                    jid,
                    "ADMIN_VOUCHER_ADD"
                );

                return sock.sendMessage(jid,{
text:
`Masukkan data voucher:

KODE|persen|10|SEMUA|100000|100|2026-07-14|2026-12-31

Format:
Kode|Jenis|Nilai|Kategori|Minimal|Kuota|Mulai|Selesai`
                });

            case "3":

                await session.goto(
                    jid,
                    "ADMIN_VOUCHER_STATUS"
                );

                return sock.sendMessage(jid,{
text:
"Masukkan kode voucher yang ingin diaktifkan/nonaktifkan."
                });

            case "4":

                await session.goto(
                    jid,
                    "ADMIN_VOUCHER_DELETE"
                );

                return sock.sendMessage(jid,{
text:
"Masukkan kode voucher yang ingin dihapus."
                });

            case "5":

                await session.goto(
                    jid,
                    "ADMIN_VOUCHER_EDIT"
                );

                return sock.sendMessage(jid,{
text:
"Masukkan kode voucher yang ingin diedit."
                });

            case "6": {

                const vouchers =
                    await voucherService.getVouchers();

                let dipakai = 0;

                vouchers.forEach(v=>{
                    dipakai += Number(v.dipakai||0);
                });

                return sock.sendMessage(jid,{
text:
`📊 *STATISTIK VOUCHER*

Jumlah Voucher : ${vouchers.length}
Total Dipakai : ${dipakai}`
                });

            }

            case "0":

                await session.clearSession(jid);

                return admin(sock,jid);

        }

        return true;

    }

    // =========================
    // TAMBAH
    // =========================

    if (state.step==="ADMIN_VOUCHER_ADD"){

        const data = body.split("|");

        if(data.length<8){

            return sock.sendMessage(jid,{
text:
"Format salah."
            });

        }

        await voucherService.addVoucher({

            kode:data[0].toUpperCase(),
            jenis:data[1].toLowerCase(),
            nilai:Number(data[2]),
            kategori:data[3].toUpperCase(),
            minimal:Number(data[4]),
            kuota:Number(data[5]),
            mulai:data[6],
            selesai:data[7],
            aktif:true,
            dipakai:0

        });

        await session.goto(jid,"ADMIN_VOUCHER");

        return sock.sendMessage(jid,{
text:"✅ Voucher berhasil ditambahkan."
        });

    }

    // =========================
    // AKTIF / NONAKTIF
    // =========================

    if(state.step==="ADMIN_VOUCHER_STATUS"){

        const voucher =
            await voucherService.getVoucher(body);

        if(!voucher){

            return sock.sendMessage(jid,{
                text:"Voucher tidak ditemukan."
            });

        }

        await voucherService.setVoucherActive(
            body,
            !voucher.aktif
        );

        await session.goto(jid,"ADMIN_VOUCHER");

        return sock.sendMessage(jid,{
text:
`✅ Voucher ${voucher.kode}
Status sekarang :
${voucher.aktif ? "NONAKTIF" : "AKTIF"}`
        });

    }

    // =========================
    // HAPUS
    // =========================

    if(state.step==="ADMIN_VOUCHER_DELETE"){

        await voucherService.removeVoucher(body);

        await session.goto(jid,"ADMIN_VOUCHER");

        return sock.sendMessage(jid,{
text:"🗑 Voucher berhasil dihapus."
        });

    }

    // =========================
    // EDIT
    // =========================

    if(state.step==="ADMIN_VOUCHER_EDIT"){

        const voucher =
            await voucherService.getVoucher(body);

        if(!voucher){

            return sock.sendMessage(jid,{
                text:"Voucher tidak ditemukan."
            });

        }

        await session.goto(
            jid,
            "ADMIN_VOUCHER_EDIT_SAVE",
            {
                kode:voucher.kode
            }
        );

        return sock.sendMessage(jid,{
text:
`Masukkan data baru:

persen|15|SEMUA|150000|200|2026-07-14|2026-12-31

Format:
Jenis|Nilai|Kategori|Minimal|Kuota|Mulai|Selesai`
        });

    }

    if(state.step==="ADMIN_VOUCHER_EDIT_SAVE"){

        const data = body.split("|");

        if(data.length<7){

            return sock.sendMessage(jid,{
text:"Format salah."
            });

        }

        await voucherService.updateVoucher(
            state.kode,
            {
                jenis:data[0],
                nilai:Number(data[1]),
                kategori:data[2].toUpperCase(),
                minimal:Number(data[3]),
                kuota:Number(data[4]),
                mulai:data[5],
                selesai:data[6]
            }
        );

        await session.goto(jid,"ADMIN_VOUCHER");

        return sock.sendMessage(jid,{
text:"✅ Voucher berhasil diperbarui."
        });

    }

    return false;

};
