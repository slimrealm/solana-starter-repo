import bs58 from 'bs58';
//import * as prompt from 'prompt-sync';

export const base58_to_wallet = () => {
    const publicKey = '8h1eVPtEMsmAkdpT4YvgFxrSbKqXzwtb75C2eFuSU4oL';
    //let wallet = bs58:: decode(base58).into_vec().unwrap();
    const wallet = bs58.decode(publicKey);
    console.log("wallet = ", wallet);
};


export const wallet_to_base58 = () => {
    const wallet = [84, 60, 132, 66, 0, 82, 64, 172, 198, 36, 101, 104, 173, 5, 74, 250, 99, 48, 156, 37, 237, 95, 76, 125, 240, 53, 134, 70, 24, 169, 171, 150, 114, 65, 197, 142, 72, 159, 110, 136, 28, 240, 170, 217, 254, 237, 15, 114, 212, 221, 38, 89, 102, 93, 177, 251, 203, 248, 54, 186, 33, 149, 122, 51];
    const base58 = bs58.encode(wallet).toString();
    console.log("base58 = ", base58);
};
