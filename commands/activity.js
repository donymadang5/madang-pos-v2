const activityService = require("../services/activityService");

module.exports = async (sock, jid) => {

    const logs = await activityService.latest(20);

    if (!logs.length) {
        return sock.sendMessage(jid,{
            text:"📋 Belum ada aktivitas."
        });
    }

    let msg = "📋 *20 Aktivitas Terakhir*\n";
    msg += "━━━━━━━━━━━━━━━━━━\n\n";

    logs.forEach((log,i)=>{

        const waktu = new Date(log.createdAt)
            .toLocaleString("id-ID");

        msg +=
`${i+1}. ${log.type}

${log.message}

🕒 ${waktu}

`;

    });

    await sock.sendMessage(jid,{
        text:msg
    });

};
