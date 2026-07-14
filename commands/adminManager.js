const adminService = require("../services/adminService");

module.exports = async (sock, jid, command, args) => {

    switch(command){

        case "/listadmin":{

            const admins = await adminService.getAdmins();

            if(admins.length===0){
                return sock.sendMessage(jid,{
                    text:"Belum ada admin."
                });
            }

            let text="👑 *Daftar Admin*\n\n";

            admins.forEach((a,i)=>{
                text+=`${i+1}. ${a}\n`;
            });

            return sock.sendMessage(jid,{text});

        }

        case "/addadmin":{

            if(!args[0]){
                return sock.sendMessage(jid,{
                    text:"Contoh:\n/addadmin 40914026266821@lid"
                });
            }

            await adminService.addAdmin(args[0]);

            return sock.sendMessage(jid,{
                text:"✅ Admin berhasil ditambahkan."
            });

        }

        case "/deladmin":{

            if(!args[0]){
                return sock.sendMessage(jid,{
                    text:"Contoh:\n/deladmin 40914026266821@lid"
                });
            }

            await adminService.removeAdmin(args[0]);

            return sock.sendMessage(jid,{
                text:"✅ Admin berhasil dihapus."
            });

        }

    }

};
