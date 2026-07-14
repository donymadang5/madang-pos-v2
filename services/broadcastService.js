const customerService = require("./customerService");

async function delay(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}

async function kirim(sock,list,pesan){

    let sukses=0;
    let gagal=0;

    for(const customer of list){

        try{

            await sock.sendMessage(customer.jid,{
                text:pesan
            });

            sukses++;

        }catch(e){

            gagal++;

        }

        await delay(800);

    }

    return{
        sukses,
        gagal,
        total:list.length
    };

}

async function semua(sock,pesan){

    const list=
        await customerService.getCustomers();

    return kirim(sock,list,pesan);

}

async function member(sock,level,pesan){

    const list=
        await customerService.getCustomersByMember(level);

    return kirim(sock,list,pesan);

}

async function poin(sock,min,pesan){

    const list=
        await customerService.getCustomersByPoint(min);

    return kirim(sock,list,pesan);

}

async function baru(sock,days,pesan){

    const list=
        await customerService.getNewCustomers(days);

    return kirim(sock,list,pesan);

}

async function inactive(sock,days,pesan){

    const list=
        await customerService.getInactiveCustomers(days);

    return kirim(sock,list,pesan);

}

module.exports={

    semua,
    member,
    poin,
    baru,
    inactive

};
